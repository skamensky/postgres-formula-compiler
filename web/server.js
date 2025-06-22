#!/usr/bin/env node

/**
 * Interactive Formula Web Server
 * Provides a web interface for testing and demonstrating formula compilation
 */

import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { evaluateFormula, generateSQL } from '../formula-compiler.js';
import { createDatabaseClient } from '../src/db-client.js';
import { readFileSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Database client
let dbClient = null;

// Initialize database connection
async function initializeDatabase() {
  dbClient = createDatabaseClient();
  await dbClient.connect();
  console.log('🔌 Database connected');
}

// Get available tables from metadata
app.get('/api/tables', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT table_name FROM table_info ORDER BY table_name');
    res.json({ tables: result.rows.map(row => row.table_name) });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Get table schema
app.get('/api/tables/:tableName/schema', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Get columns
    const columnsResult = await dbClient.query(`
      SELECT tf.name, tf.data_type
      FROM table_field tf
      JOIN table_info ti ON tf.table_info = ti.id
      WHERE ti.table_name = $1
      ORDER BY tf.name
    `, [tableName]);
    
    // Get relationships
    const relationshipsResult = await dbClient.query(`
      SELECT col_name, target_table_name
      FROM relationship_lookups
      WHERE source_table_name = $1
      ORDER BY col_name
    `, [tableName]);
    
    res.json({
      columns: columnsResult.rows,
      relationships: relationshipsResult.rows
    });
  } catch (error) {
    console.error('Error fetching table schema:', error);
    res.status(500).json({ error: 'Failed to fetch table schema' });
  }
});

// Get sample data from table
app.get('/api/tables/:tableName/data', async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    const result = await dbClient.query(`SELECT * FROM ${tableName} LIMIT $1`, [limit]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

// Execute formula
app.post('/api/execute', async (req, res) => {
  try {
    const { formula, tableName } = req.body;
    
    if (!formula || !tableName) {
      return res.status(400).json({ error: 'Formula and table name are required' });
    }
    
    // Get column lists for all tables in one call
    const allTablesResult = await dbClient.query('SELECT table_name FROM table_info');
    const allTableNames = allTablesResult.rows.map(row => row.table_name);
    
    const columnListsQuery = `
      SELECT ti.table_name, tf.name, tf.data_type
      FROM table_field tf
      JOIN table_info ti ON tf.table_info = ti.id
      WHERE ti.table_name = ANY($1)
      ORDER BY ti.table_name, tf.name
    `;
    
    const columnListsResult = await dbClient.query(columnListsQuery, [allTableNames]);
    
    const columnLists = {};
    for (const tableName of allTableNames) {
      columnLists[tableName] = {};
    }
    
    for (const row of columnListsResult.rows) {
      const jsType = mapPostgresType(row.data_type);
      columnLists[row.table_name][row.name] = jsType;
    }
    
    function mapPostgresType(pgType) {
      if (['numeric', 'integer', 'bigint', 'smallint', 'decimal', 'real', 'double precision'].includes(pgType)) {
        return 'number';
      }
      
      if (['timestamp', 'timestamp with time zone', 'timestamptz', 'date'].includes(pgType)) {
        return 'date';
      }
      
      if (pgType === 'boolean') {
        return 'boolean';
      }
      
      return 'string';
    }
    
    // Get all relationships
    const allRelationshipsResult = await dbClient.query(`
      SELECT source_table_name, col_name, target_table_name
      FROM relationship_lookups
      ORDER BY source_table_name, col_name
    `);
    
    const allRelationships = [];
    for (const row of allRelationshipsResult.rows) {
      const relationshipName = row.col_name.replace(/_id$/, '');
      
      allRelationships.push({
        name: relationshipName,
        fromTable: row.source_table_name,
        toTable: row.target_table_name,
        joinColumn: row.col_name
      });
    }
    
    // Build context
    const context = {
      tableName: tableName,
      columnList: columnLists[tableName],
      tableInfos: Object.keys(columnLists).map(name => ({
        tableName: name,
        columnList: columnLists[name]
      })),
      relationshipInfos: allRelationships
    };
    
    // Compile formula
    const compilation = evaluateFormula(formula, context, dbClient);
    
    if (compilation.error) {
      return res.json({
        success: false,
        error: compilation.error,
        formula: formula
      });
    }
    
    // Generate SQL
    const sql = generateSQL(compilation.expression, compilation.joins, compilation.aggregateJoins || new Map(), tableName);
    
    // Execute SQL
    const result = await dbClient.query(sql);
    
    res.json({
      success: true,
      formula: formula,
      compiledExpression: compilation.expression,
      sql: sql,
      results: result.rows,
      metadata: {
        joinCount: compilation.joins.size,
        aggregateCount: compilation.aggregateJoins ? compilation.aggregateJoins.size : 0
      }
    });
    
  } catch (error) {
    console.error('Error executing formula:', error);
    res.json({
      success: false,
      error: error.message,
      formula: req.body.formula || ''
    });
  }
});

// Get example formulas
app.get('/api/examples', async (req, res) => {
  try {
    const examplesPath = join(__dirname, '..', 'examples', 'table');
    const tables = readdirSync(examplesPath);
    const examples = {};
    
    for (const table of tables) {
      const tablePath = join(examplesPath, table);
      try {
        const formulaFiles = readdirSync(tablePath).filter(file => file.endsWith('.formula'));
        examples[table] = [];
        
        for (const file of formulaFiles.slice(0, 10)) { // Limit to 10 examples per table
          const formulaPath = join(tablePath, file);
          const content = readFileSync(formulaPath, 'utf8').trim();
          const name = file.replace('.formula', '').replace(/_/g, ' ');
          
          examples[table].push({
            name: name,
            formula: content,
            filename: file
          });
        }
      } catch (err) {
        // Skip if not a directory or no access
      }
    }
    
    res.json({ examples });
  } catch (error) {
    console.error('Error loading examples:', error);
    res.status(500).json({ error: 'Failed to load examples' });
  }
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(port, () => {
      console.log(`🚀 Formula Web Server running at http://localhost:${port}`);
      console.log(`📊 Interactive formula testing available`);
      console.log(`🔗 Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server...');
  if (dbClient) {
    await dbClient.close();
  }
  process.exit(0);
});

startServer();