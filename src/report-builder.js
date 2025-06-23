/**
 * Report Builder - Modular functions extracted from exec-formula (battle-tested source of truth)
 * These functions are the proven implementations from exec-formula, exported for reuse
 */

import { evaluateFormula, generateSQL } from '../formula-compiler.js';
import { createDatabaseClient } from '../web/db-client.js';
import {
  getColumnListsForTables,
  getAllRelationships,
  getInverseRelationshipsForTables
} from '../web/db-introspection.js';
import { basename, dirname } from 'path';

/**
 * Extract table name from formula file path (from exec-formula)
 * @param {string} filePath - Path to formula file
 * @returns {string} Table name
 */
export function extractTableName(filePath) {
  // Expected structure: examples/table/{table_name}/formula.formula
  const pathParts = filePath.split('/');
  const tableIndex = pathParts.indexOf('table');
  
  if (tableIndex >= 0 && tableIndex + 1 < pathParts.length) {
    return pathParts[tableIndex + 1];
  }
  
  // Fallback: use directory name if not in expected structure
  const dir = dirname(filePath);
  const dirName = basename(dir);
  return dirName === '.' ? 'submission' : dirName; // Default to submission
}

/**
 * Generate field name from formula file path (from exec-formula)
 * @param {string} filePath - Path to formula file
 * @returns {string} Field name
 */
export function generateFieldName(filePath) {
  const fileName = basename(filePath, '.formula');
  return fileName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

/**
 * Build compilation context for a table with relationship support (from exec-formula)
 * @param {string} tableName - Target table name
 * @param {Object} client - Database client
 * @returns {Object} Compilation context
 */
export async function buildTableContext(tableName, client) {
  // Get all relationships from database for multi-level support
  const allRelationships = await getAllRelationships(client);
  
  // Collect all unique table names needed for bulkified column loading
  const allTableNames = new Set([tableName]);
  const directRels = allRelationships.filter(rel => rel.fromTable === tableName);
  for (const rel of directRels) {
    allTableNames.add(rel.toTable);
  }
  
  // RECURSIVELY add second-level relationship targets (for multi-level relationships)
  const secondLevelTables = [...allTableNames];
  for (const targetTable of secondLevelTables) {
    if (targetTable !== tableName) { // Skip the original table to avoid cycles
      const secondLevelRels = allRelationships.filter(rel => rel.fromTable === targetTable);
      for (const rel of secondLevelRels) {
        allTableNames.add(rel.toTable);
      }
    }
  }
  
  // Bulkified: Get column lists for all tables in one call
  const allColumnLists = await getColumnListsForTables([...allTableNames], client);
  const columnList = allColumnLists[tableName];
  
  if (!columnList || Object.keys(columnList).length === 0) {
    throw new Error(`Table '${tableName}' not found in database`);
  }
  
  // Build table infos using bulkified results
  const tableInfos = [{
    tableName: tableName,
    columnList: columnList
  }];
  
  // Add table infos for direct relationships from this table
  for (const rel of directRels) {
    if (allColumnLists[rel.toTable]) {
      tableInfos.push({
        tableName: rel.toTable,
        columnList: allColumnLists[rel.toTable]
      });
    } else {
      // Critical error: relationship points to a table we couldn't load
      throw new Error(`Relationship '${rel.name}' from table '${tableName}' points to table '${rel.toTable}', but table '${rel.toTable}' was not found in the database.`);
    }
  }
  
  // For multi-level aggregates, we need inverse relationships for all tables that could be traversed
  const tablesToLoadInverseRels = new Set([tableName]);
  
  // Add tables from direct inverse relationships (these become intermediate tables in multi-level chains)
  const directInverseRels = allRelationships.filter(rel => rel.toTable === tableName);
  for (const rel of directInverseRels) {
    tablesToLoadInverseRels.add(rel.fromTable);
  }
  
  // Get inverse relationships for all these tables in bulk
  const allInverseRelationships = await getInverseRelationshipsForTables([...tablesToLoadInverseRels], client);
  const inverseRelationshipInfo = allInverseRelationships[tableName] || {};
  
  // Build context with BOTH new flat structure AND old structure for backward compatibility
  const context = {
    tableName: tableName,
    // NEW flat structure
    tableInfos: tableInfos,
    relationshipInfos: allRelationships,
    // OLD structure for backward compatibility (needed for aggregates)
    columnList: columnList,
    relationshipInfo: {}, // Will be populated below for backward compatibility
    inverseRelationshipInfo: inverseRelationshipInfo,
    // Multi-level aggregate support: expanded inverse relationships for all intermediate tables
    allInverseRelationships: allInverseRelationships
  };
  
  // Build old-style relationshipInfo for backward compatibility with aggregates
  const directRelationships = allRelationships.filter(rel => rel.fromTable === tableName);
  for (const rel of directRelationships) {
    const targetTable = tableInfos.find(t => t.tableName === rel.toTable);
    if (targetTable) {
      context.relationshipInfo[rel.name] = {
        joinColumn: rel.joinColumn,
        columnList: targetTable.columnList
      };
    }
  }
  
  return {
    context,
    metadata: {
      tableName,
      directRelationships: directRels,
      tableInfos,
      totalTablesLoaded: allTableNames.size
    }
  };
}

/**
 * Compile multiple formulas for the same table (from exec-formula)
 * @param {Array} formulas - Array of {fieldName, content, path?} objects
 * @param {Object} context - Compilation context from buildTableContext
 * @returns {Object} Compilation results with success/failure info
 */
export function compileFormulas(formulas, context) {
  const results = {};
  const compilationResults = [];
  const errors = [];
  
  for (const formula of formulas) {
    try {
      const result = evaluateFormula(formula.content, context);
      results[formula.fieldName] = result;
      compilationResults.push({
        ...formula,
        result: result,
        success: true
      });
    } catch (error) {
      errors.push({
        ...formula,
        error: error.message,
        success: false
      });
      compilationResults.push({
        ...formula,
        error: error,
        success: false
      });
    }
  }
  
  return {
    results,
    compilationResults,
    errors,
    success: errors.length === 0
  };
}

/**
 * Analyze compilation results for optimization metrics (from exec-formula)
 * @param {Array} compilationResults - Results from compileFormulas
 * @returns {Object} Analysis metrics
 */
export function analyzeCompilation(compilationResults) {
  const totalJoinIntents = new Set();
  const totalAggregateIntents = new Set();
  
  const successful = compilationResults.filter(r => r.success);
  
  successful.forEach(formula => {
    if (formula.result) {
      // Collect intents for analysis
      formula.result.joinIntents.forEach(join => totalJoinIntents.add(join.semanticId));
      formula.result.aggregateIntents.forEach(agg => {
        totalAggregateIntents.add(agg.semanticId);
        agg.internalJoins.forEach(join => totalJoinIntents.add(join.semanticId));
      });
    }
  });
  
  return {
    totalFormulas: compilationResults.length,
    successfulFormulas: successful.length,
    failedFormulas: compilationResults.length - successful.length,
    totalJoinIntents: totalJoinIntents.size,
    totalAggregateIntents: totalAggregateIntents.size,
    uniqueJoinIntents: Array.from(totalJoinIntents),
    uniqueAggregateIntents: Array.from(totalAggregateIntents)
  };
}

/**
 * Build a complete report (main wrapper function from exec-formula)
 * @param {Object} options - Report configuration
 * @param {string} options.tableName - Target table name
 * @param {Array} options.formulas - Array of formula objects
 * @param {Object} [options.client] - Optional database client (will create if not provided)
 * @param {number} [options.limit] - Optional result limit
 * @returns {Object} Complete report with data and metadata
 */
export async function buildReport(options) {
  const { tableName, formulas, limit = null } = options;
  let { client } = options;
  let shouldCloseClient = false;
  
  // Validate inputs
  if (!tableName) {
    throw new Error('tableName is required');
  }
  
  if (!formulas || !Array.isArray(formulas) || formulas.length === 0) {
    throw new Error('formulas array is required and must not be empty');
  }
  
  // Validate all formulas have required fields
  for (const formula of formulas) {
    if (!formula.fieldName || !formula.content) {
      throw new Error('Each formula must have fieldName and content properties');
    }
  }
  
  try {
    // Create database client if not provided
    if (!client) {
      client = createDatabaseClient();
      await client.connect();
      shouldCloseClient = true;
    }
    
    // Build compilation context
    const { context, metadata: contextMetadata } = await buildTableContext(tableName, client);
    
    // Compile all formulas
    const compilationResult = compileFormulas(formulas, context);
    
    if (!compilationResult.success) {
      throw new Error(`Formula compilation failed: ${compilationResult.errors.map(e => e.error).join(', ')}`);
    }
    
    // Analyze compilation for optimization metrics
    const analysis = analyzeCompilation(compilationResult.compilationResults);
    
    // Generate optimized SQL with deduplication
    const sqlResult = generateSQL(compilationResult.results, tableName);
    
    // Add LIMIT if specified
    let finalSQL = sqlResult.sql;
    if (limit && limit > 0) {
      finalSQL += ` LIMIT ${limit}`;
    }
    
    // Execute query
    const queryResult = await client.query(finalSQL);
    
    // Close client if we created it
    if (shouldCloseClient) {
      await client.close();
    }
    
    return {
      success: true,
      metadata: {
        tableName,
        formulaCount: formulas.length,
        formulas: formulas.map(f => ({
          fieldName: f.fieldName,
          content: f.content,
          path: f.path || null
        })),
        ...contextMetadata
      },
      compilation: {
        ...compilationResult,
        analysis
      },
      sql: {
        query: finalSQL,
        originalSQL: sqlResult.sql,
        fromClause: sqlResult.fromClause,
        selectExpressions: sqlResult.selectExpressions,
        aggregateSubqueries: sqlResult.aggregateSubqueries
      },
      results: queryResult.rows,
      performance: {
        actualJoins: (sqlResult.fromClause.match(/LEFT JOIN/g) || []).length,
        deduplicationSavings: {
          joinIntents: analysis.totalJoinIntents,
          aggregateIntents: analysis.totalAggregateIntents,
          actualJoins: (sqlResult.fromClause.match(/LEFT JOIN/g) || []).length,
          subqueries: sqlResult.aggregateSubqueries.length
        }
      }
    };
    
  } catch (error) {
    if (shouldCloseClient && client) {
      try {
        await client.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
    throw error;
  }
}

/**
 * Format report output (from exec-formula formatters)
 * @param {Object} report - Result from buildReport
 * @param {string} format - Output format: 'json', 'html', 'markdown', 'console'
 * @returns {string} Formatted output
 */
export function formatReport(report, format = 'console') {
  const formatters = {
    json: {
      format: (data) => {
        return JSON.stringify(data, null, 2);
      }
    },
    
    html: {
      format: (data) => {
        const { metadata, results, sql, compilation } = data;
        const analysis = compilation.analysis;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formula Execution Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        .formula { background: #f9f9f9; padding: 10px; margin: 10px 0; border-left: 4px solid #007cba; }
        .sql { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .sql code { font-family: 'Courier New', monospace; white-space: pre; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric strong { color: #007cba; }
        .null { color: #999; font-style: italic; }
    </style>
</head>
<body>
    <div class="header">
        <h1>� Formula Execution Results</h1>
        <p><strong>Table:</strong> ${metadata.tableName}</p>
        <p><strong>Formulas Processed:</strong> ${metadata.formulaCount}</p>
        <p><strong>Execution Time:</strong> ${new Date().toISOString()}</p>
    </div>

    <div class="section">
        <h2>📄 Formulas</h2>
        ${metadata.formulas.map((formula, i) => `
        <div class="formula">
            <strong>${i + 1}. ${formula.fieldName}</strong><br>
            <code>${formula.content}</code><br>
            <small>Source: ${formula.path}</small>
        </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>📈 Analysis</h2>
        <div class="metric"><strong>Join Intents:</strong> ${analysis.totalJoinIntents}</div>
        <div class="metric"><strong>Aggregate Intents:</strong> ${analysis.totalAggregateIntents}</div>
        <div class="metric"><strong>Actual JOINs:</strong> ${analysis.actualJoins || 0}</div>
        <div class="metric"><strong>Subqueries:</strong> ${analysis.subqueries || 0}</div>
        <div class="metric"><strong>SELECT Expressions:</strong> ${analysis.selectExpressions || 0}</div>
    </div>

    <div class="section">
        <h2>📝 Generated SQL</h2>
        <div class="sql">
            <code>${sql.query.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
        </div>
    </div>

    <div class="section">
        <h2>📊 Results</h2>
        ${results.length === 0 ? '<p>No results found</p>' : `
        <table>
            <thead>
                <tr>
                    ${Object.keys(results[0]).map(key => `<th>${key}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${results.map(row => `
                <tr>
                    ${Object.keys(row).map(key => `<td>${row[key] === null ? '<span class="null">NULL</span>' : row[key]}</td>`).join('')}
                </tr>
                `).join('')}
            </tbody>
        </table>
        `}
    </div>
</body>
</html>`;
      }
    },
    
    markdown: {
      format: (data) => {
        const { metadata, results, sql, compilation } = data;
        const analysis = compilation.analysis;
        
        return `# � Formula Execution Results

## 📋 Metadata
- **Table:** ${metadata.tableName}
- **Formulas Processed:** ${metadata.formulaCount}
- **Execution Time:** ${new Date().toISOString()}

## 📄 Formulas

${metadata.formulas.map((formula, i) => `### ${i + 1}. ${formula.fieldName}
${'```'}
${formula.content}
${'```'}
**Source:** ${formula.path}
`).join('\n')}

## 📈 Analysis

| Metric | Value |
|--------|-------|
| Join Intents | ${analysis.totalJoinIntents} |
| Aggregate Intents | ${analysis.totalAggregateIntents} |
| Actual JOINs | ${analysis.actualJoins || 0} |
| Subqueries | ${analysis.subqueries || 0} |
| SELECT Expressions | ${analysis.selectExpressions || 0} |

## 📝 Generated SQL

${'```'}sql
${sql.query}
${'```'}

## 📊 Results

${results.length === 0 ? 'No results found' : `
| ${Object.keys(results[0]).join(' | ')} |
| ${Object.keys(results[0]).map(() => '---').join(' | ')} |
${results.map(row => `| ${Object.keys(row).map(key => row[key] === null ? '*NULL*' : row[key]).join(' | ')} |`).join('\n')}
`}

---
*Generated by Formula Executor*
`;
      }
    }
  };
  
  if (format === 'console') {
    // For console format, return the data as-is for custom formatting
    return report;
  }
  
  if (!formatters[format]) {
    throw new Error(`Unknown format: ${format}. Available formats: console, json, html, markdown`);
  }
  
  return formatters[format].format(report);
}

/**
 * Get example formulas for a table (helper function)
 * @param {string} tableName - Table name
 * @returns {Array} Array of formula objects from examples
 */
export function getExampleFormulas(tableName) {
  // This would be implemented based on the examples/ directory structure
  // For now, return empty array - can be enhanced later
  return [];
}