#!/usr/bin/env node

/**
 * Interactive Formula Web Server
 * Provides a web interface for testing and demonstrating formula compilation
 */

import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { evaluateFormula, generateSQL } from '../formula-compiler.js';
import { createDatabaseClient } from './db-client.js';
import {
  getTableNames,
  getColumnListsForTables,
  getAllRelationships,
  getInverseRelationshipsForTables,
  mapPostgresType
} from './db-introspection.js';
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

// Get available tables from database introspection
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await getTableNames(dbClient);
    res.json({ tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Get table schema
app.get('/api/tables/:tableName/schema', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Get columns using introspection
    const columnLists = await getColumnListsForTables([tableName], dbClient);
    const columns = Object.entries(columnLists[tableName] || {}).map(([name, type]) => ({
      column_name: name,
      data_type: type
    }));
    
    // Get relationships using introspection  
    const allRelationships = await getAllRelationships(dbClient);
    const relationships = allRelationships
      .filter(rel => rel.fromTable === tableName)
      .map(rel => ({
        col_name: rel.joinColumn,
        target_table_name: rel.toTable
      }));
    
    res.json({
      columns: columns,
      relationships: relationships
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
    
    // Get column lists for all tables using introspection
    const allTableNames = await getTableNames(dbClient);
    const columnLists = await getColumnListsForTables(allTableNames, dbClient);
    
    // Get all relationships using introspection
    const allRelationships = await getAllRelationships(dbClient);
    
    // Get inverse relationships
    const allInverseRelationships = await getInverseRelationshipsForTables([tableName], dbClient);
    const inverseRelationshipInfo = allInverseRelationships[tableName] || {};
    
    // Build table infos
    const tableInfos = Object.keys(columnLists).map(name => ({
      tableName: name,
      columnList: columnLists[name]
    }));
    
    // Build old-style relationshipInfo for backward compatibility
    const relationshipInfo = {};
    const directRelationships = allRelationships.filter(rel => rel.fromTable === tableName);
    for (const rel of directRelationships) {
      const targetTable = tableInfos.find(t => t.tableName === rel.toTable);
      if (targetTable) {
        relationshipInfo[rel.name] = {
          joinColumn: rel.joinColumn,
          columnList: targetTable.columnList
        };
      }
    }
    
    // Build context matching exec-formula format
    const context = {
      tableName: tableName,
      // NEW flat structure
      tableInfos: tableInfos,
      relationshipInfos: allRelationships,
      // OLD structure for backward compatibility
      columnList: columnLists[tableName],
      relationshipInfo: relationshipInfo,
      inverseRelationshipInfo: inverseRelationshipInfo,
      // Multi-level aggregate support
      allInverseRelationships: allInverseRelationships
    };
    
    // Compile formula
    let compilation;
    try {
      compilation = evaluateFormula(formula, context);
    } catch (error) {
      return res.json({
        success: false,
        error: error.message || error.toString(),
        formula: formula
      });
    }
    
    if (compilation.error) {
      return res.json({
        success: false,
        error: compilation.error,
        formula: formula
      });
    }
    
    // Generate SQL using the new format (match exec-formula structure)
    const results = { formula_result: compilation };
    let sqlResult;
    try {
      sqlResult = generateSQL(results, tableName);
    } catch (error) {
      return res.json({
        success: false,
        error: error.message || error.toString(),
        formula: formula
      });
    }
    
    // Execute SQL
    const result = await dbClient.query(sqlResult.sql);
    
    res.json({
      success: true,
      formula: formula,
      compiledExpression: compilation.expression,
      sql: sqlResult.sql,
      results: result.rows,
      metadata: {
        joinCount: compilation.joinIntents.length,
        aggregateCount: compilation.aggregateIntents.length
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