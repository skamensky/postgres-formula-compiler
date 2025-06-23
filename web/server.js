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
  try {
    dbClient = createDatabaseClient();
    await dbClient.connect();
    
    const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '';
    console.log(`🔌 Connected to ${isPostgres ? 'PostgreSQL' : 'PGlite'} database`);
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
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

// Get table schema with reverse relationships
app.get('/api/tables/:tableName/schema', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Get columns using introspection
    const columnLists = await getColumnListsForTables([tableName], dbClient);
    const columns = Object.entries(columnLists[tableName] || {}).map(([name, type]) => ({
      column_name: name,
      data_type: type
    }));
    
    // Get all relationships
    const allRelationships = await getAllRelationships(dbClient);
    
    // Direct relationships (this table -> other tables)
    const directRelationships = allRelationships
      .filter(rel => rel.fromTable === tableName)
      .map(rel => ({
        col_name: rel.joinColumn,
        target_table_name: rel.toTable,
        relationship_name: rel.name,
        type: 'direct'
      }));
    
    // Reverse relationships (other tables -> this table)
    const reverseRelationships = allRelationships
      .filter(rel => rel.toTable === tableName)
      .map(rel => ({
        col_name: rel.joinColumn,
        source_table_name: rel.fromTable,
        relationship_name: `${rel.fromTable}_${rel.joinColumn}`,
        type: 'reverse'
      }));
    
    res.json({
      columns: columns,
      directRelationships: directRelationships,
      reverseRelationships: reverseRelationships,
      // Legacy format for backward compatibility
      relationships: directRelationships.map(rel => ({
        col_name: rel.col_name,
        target_table_name: rel.target_table_name
      }))
    });
  } catch (error) {
    console.error('Error fetching table schema:', error);
    res.status(500).json({ error: 'Failed to fetch table schema' });
  }
});

// Validate formula (for real-time error checking)
app.post('/api/validate', async (req, res) => {
  try {
    const { formula, tableName } = req.body;
    
    if (!formula || !tableName) {
      return res.json({ valid: false, error: 'Formula and table name are required' });
    }
    
    // Get context similar to execute endpoint
    const allTableNames = await getTableNames(dbClient);
    const columnLists = await getColumnListsForTables(allTableNames, dbClient);
    const allRelationships = await getAllRelationships(dbClient);
    
    const allTableNamesForContext = new Set([tableName]);
    const directRels = allRelationships.filter(rel => rel.fromTable === tableName);
    for (const rel of directRels) {
      allTableNamesForContext.add(rel.toTable);
    }
    
    const tablesToLoadInverseRels = new Set([tableName]);
    const directInverseRels = allRelationships.filter(rel => rel.toTable === tableName);
    for (const rel of directInverseRels) {
      tablesToLoadInverseRels.add(rel.fromTable);
    }
    
    const allInverseRelationships = await getInverseRelationshipsForTables([...tablesToLoadInverseRels], dbClient);
    const inverseRelationshipInfo = allInverseRelationships[tableName] || {};
    
    const tableInfos = [
      {
        tableName: tableName,
        columnList: columnLists[tableName]
      }
    ];
    
    for (const rel of directRels) {
      if (columnLists[rel.toTable]) {
        tableInfos.push({
          tableName: rel.toTable,
          columnList: columnLists[rel.toTable]
        });
      }
    }
    
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
    
    const context = {
      tableName: tableName,
      tableInfos: tableInfos,
      relationshipInfos: allRelationships,
      columnList: columnLists[tableName],
      relationshipInfo: relationshipInfo,
      inverseRelationshipInfo: inverseRelationshipInfo,
      allInverseRelationships: allInverseRelationships
    };
    
    // Try to compile formula
    try {
      const compilation = evaluateFormula(formula, context);
      res.json({ valid: true, compilation: compilation });
    } catch (error) {
      res.json({ valid: false, error: error.message || error.toString() });
    }
    
  } catch (error) {
    console.error('Error validating formula:', error);
    res.json({ valid: false, error: 'Validation failed' });
  }
});

// Execute multiple formulas (report builder)
app.post('/api/execute-multiple', async (req, res) => {
  try {
    const { formulas, tableName } = req.body;
    
    if (!formulas || !Array.isArray(formulas) || formulas.length === 0) {
      return res.status(400).json({ error: 'Formulas array is required' });
    }
    
    if (!tableName) {
      return res.status(400).json({ error: 'Table name is required' });
    }
    
    // Get context (same as single execute)
    const allTableNames = await getTableNames(dbClient);
    const columnLists = await getColumnListsForTables(allTableNames, dbClient);
    const allRelationships = await getAllRelationships(dbClient);
    
    const allTableNamesForContext = new Set([tableName]);
    const directRels = allRelationships.filter(rel => rel.fromTable === tableName);
    for (const rel of directRels) {
      allTableNamesForContext.add(rel.toTable);
    }
    
    const tablesToLoadInverseRels = new Set([tableName]);
    const directInverseRels = allRelationships.filter(rel => rel.toTable === tableName);
    for (const rel of directInverseRels) {
      tablesToLoadInverseRels.add(rel.fromTable);
    }
    
    const allInverseRelationships = await getInverseRelationshipsForTables([...tablesToLoadInverseRels], dbClient);
    const inverseRelationshipInfo = allInverseRelationships[tableName] || {};
    
    const tableInfos = [
      {
        tableName: tableName,
        columnList: columnLists[tableName]
      }
    ];
    
    for (const rel of directRels) {
      if (columnLists[rel.toTable]) {
        tableInfos.push({
          tableName: rel.toTable,
          columnList: columnLists[rel.toTable]
        });
      }
    }
    
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
    
    const context = {
      tableName: tableName,
      tableInfos: tableInfos,
      relationshipInfos: allRelationships,
      columnList: columnLists[tableName],
      relationshipInfo: relationshipInfo,
      inverseRelationshipInfo: inverseRelationshipInfo,
      allInverseRelationships: allInverseRelationships
    };
    
    // Compile all formulas
    const results = {};
    const compilationResults = [];
    
    for (let i = 0; i < formulas.length; i++) {
      const formula = formulas[i];
      const fieldName = formula.name || `formula_${i + 1}`;
      
      try {
        const compilation = evaluateFormula(formula.formula, context);
        results[fieldName] = compilation;
        compilationResults.push({
          name: fieldName,
          formula: formula.formula,
          compilation: compilation,
          success: true
        });
      } catch (error) {
        compilationResults.push({
          name: fieldName,
          formula: formula.formula,
          error: error.message || error.toString(),
          success: false
        });
      }
    }
    
    // Check if any formulas failed
    const failedFormulas = compilationResults.filter(r => !r.success);
    if (failedFormulas.length > 0) {
      return res.json({
        success: false,
        error: 'Some formulas failed to compile',
        failedFormulas: failedFormulas,
        successfulFormulas: compilationResults.filter(r => r.success)
      });
    }
    
    // Generate SQL using the compiled results
    let sqlResult;
    try {
      sqlResult = generateSQL(results, tableName);
    } catch (error) {
      return res.json({
        success: false,
        error: error.message || error.toString(),
        formulas: formulas
      });
    }
    
    // Execute SQL
    const result = await dbClient.query(sqlResult.sql);
    
    res.json({
      success: true,
      formulas: compilationResults,
      sql: sqlResult.sql,
      results: result.rows,
      metadata: {
        totalJoinIntents: Object.values(results).reduce((sum, r) => sum + r.joinIntents.length, 0),
        totalAggregateIntents: Object.values(results).reduce((sum, r) => sum + r.aggregateIntents.length, 0),
        actualJoins: (sqlResult.fromClause.match(/LEFT JOIN/g) || []).length,
        subqueries: sqlResult.aggregateSubqueries.length,
        selectExpressions: sqlResult.selectExpressions.length
      }
    });
    
  } catch (error) {
    console.error('Error executing multiple formulas:', error);
    res.json({
      success: false,
      error: error.message,
      formulas: req.body.formulas || []
    });
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
    
    // Collect all unique table names needed for relationships (like exec-formula does)
    const allTableNamesForContext = new Set([tableName]);
    const directRels = allRelationships.filter(rel => rel.fromTable === tableName);
    for (const rel of directRels) {
      allTableNamesForContext.add(rel.toTable);
    }
    
    // For multi-level aggregates, we need inverse relationships for all tables that could be traversed
    // Start with the main table, then add tables from direct inverse relationships
    const tablesToLoadInverseRels = new Set([tableName]);
    
    // Add tables from direct inverse relationships (these become intermediate tables in multi-level chains)
    const directInverseRels = allRelationships.filter(rel => rel.toTable === tableName);
    for (const rel of directInverseRels) {
      tablesToLoadInverseRels.add(rel.fromTable);
    }
    
    // Get inverse relationships for all these tables in bulk
    const allInverseRelationships = await getInverseRelationshipsForTables([...tablesToLoadInverseRels], dbClient);
    const inverseRelationshipInfo = allInverseRelationships[tableName] || {};
    
    // Build table infos using the same approach as exec-formula
    const tableInfos = [
      {
        tableName: tableName,
        columnList: columnLists[tableName]
      }
    ];
    
    // Add table infos for direct relationships from this table
    for (const rel of directRels) {
      if (columnLists[rel.toTable]) {
        tableInfos.push({
          tableName: rel.toTable,
          columnList: columnLists[rel.toTable]
        });
      }
    }
    
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

// Developer tools endpoint - serves bundled tools to frontend
app.get('/api/developer-tools', async (req, res) => {
  try {
    // Read and bundle the developer tools files
    const srcPath = join(__dirname, '..', 'src');
    const toolingPath = join(__dirname, '..', 'tooling');
    
    // Read all required files from their respective locations
    const files = [
      { path: srcPath, name: 'types-unified.js' },
      { path: srcPath, name: 'lexer.js' },
      { path: srcPath, name: 'parser.js' },
      { path: srcPath, name: 'function-metadata.js' },
      { path: toolingPath, name: 'lsp.js' },
      { path: toolingPath, name: 'syntax-highlighter.js' },
      { path: toolingPath, name: 'formatter.js' },
      { path: toolingPath, name: 'developer-tools.js' }
    ];
    
    let bundledCode = '';
    
    // Add each file with proper module structure
    for (const file of files) {
      const filePath = join(file.path, file.name);
      const content = readFileSync(filePath, 'utf8');
      
      // Remove import statements and add to bundle
      const cleanContent = content
        .replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '')
        .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '');
      
      bundledCode += `\n// === ${file.name} ===\n${cleanContent}\n`;
    }
    
    // Add final exports for the client
    bundledCode += `
// === Final Exports ===
export { 
  createDeveloperTools,
  FormulaDeveloperTools,
  FormulaLanguageServer,
  FormulaSyntaxHighlighter, 
  FormulaFormatter,
  CompletionItemKind,
  DiagnosticSeverity,
  SemanticTokenType,
  DefaultTheme,
  FormattingStyles,
  DefaultFormattingOptions,
  DefaultHighlightCSS
};
`;
    
    res.setHeader('Content-Type', 'application/javascript');
    res.send(bundledCode);
    
  } catch (error) {
    console.error('Error serving developer tools:', error);
    res.status(500).json({ error: 'Failed to load developer tools' });
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

// Get current database info
app.get('/api/database/info', (req, res) => {
  try {
    const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '';
    
    res.json({
      type: isPostgres ? 'postgresql' : 'pglite',
      connectionString: isPostgres ? process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@') : null,
      status: 'connected'
    });
  } catch (error) {
    res.json({
      type: 'unknown',
      status: 'error',
      error: error.message
    });
  }
});

// Test database connection
app.post('/api/database/test', async (req, res) => {
  try {
    const { connectionString } = req.body;
    
    if (!connectionString || connectionString.trim() === '') {
      return res.json({
        success: true,
        type: 'pglite',
        message: 'PGlite connection will be used (in-memory database)'
      });
    }
    
    // Test PostgreSQL connection
    const { Client } = require('pg');
    const testClient = new Client({ connectionString });
    
    try {
      await testClient.connect();
      await testClient.query('SELECT 1');
      await testClient.end();
      
      res.json({
        success: true,
        type: 'postgresql', 
        message: 'PostgreSQL connection successful'
      });
    } catch (error) {
      res.json({
        success: false,
        type: 'postgresql',
        error: error.message
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Switch database connection
app.post('/api/database/switch', async (req, res) => {
  try {
    const { connectionString } = req.body;
    
    // Close current connection if it exists
    if (dbClient && typeof dbClient.close === 'function') {
      try {
        await dbClient.close();
      } catch (err) {
        console.warn('Warning closing previous connection:', err.message);
      }
    }
    
    // Update environment variable
    if (!connectionString || connectionString.trim() === '') {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = connectionString;
    }
    
    // Reinitialize database client
    dbClient = createDatabaseClient();
    await dbClient.connect();
    
    const isPostgres = connectionString && connectionString.trim() !== '';
    
    res.json({
      success: true,
      type: isPostgres ? 'postgresql' : 'pglite',
      message: isPostgres ? 'Switched to PostgreSQL' : 'Switched to PGlite',
      connectionString: isPostgres ? connectionString.replace(/:[^:@]*@/, ':****@') : null
    });
    
  } catch (error) {
    console.error('Error switching database:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
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