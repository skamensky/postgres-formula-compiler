/**
 * Report Builder - Modular formula compilation and execution system
 * Extracted from exec-formula for reuse in web applications
 */

import { evaluateFormula, generateSQL } from './index.js';
import { createDatabaseClient } from '../web/db-client.js';
import {
  getColumnListsForTables,
  getAllRelationships,
  getInverseRelationshipsForTables
} from '../web/db-introspection.js';

/**
 * Extract table name from formula file path
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
  const pathParts2 = filePath.split('/');
  const dir = pathParts2[pathParts2.length - 2]; // Parent directory
  return dir === '.' ? 'submission' : dir; // Default to submission
}

/**
 * Generate field name from formula file path or explicit name
 * @param {string} filePath - Path to formula file
 * @param {string} [customName] - Optional custom field name
 * @returns {string} Field name
 */
export function generateFieldName(filePath, customName = null) {
  if (customName) {
    return customName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  }
  
  const fileName = filePath.split('/').pop().replace('.formula', '');
  return fileName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

/**
 * Build compilation context for a table with relationship support
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
 * Compile multiple formulas for the same table
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
 * Analyze compilation results for optimization metrics
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
 * Build a report from multiple formulas
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
 * Get example formulas for a table (helper function)
 * @param {string} tableName - Table name
 * @param {Array} [selectedExamples] - Optional array of specific example names to include
 * @returns {Array} Array of formula objects from examples
 */
export function getExampleFormulas(tableName, selectedExamples = null) {
  // This would read from the examples directory
  // For now, return a placeholder structure that matches what the build system creates
  const exampleMap = {
    customer: [
      { fieldName: 'budget_analysis', content: 'IF(budget_max > 0, CONCAT("$", STRING(budget_min), " - $", STRING(budget_max)), "Budget not specified")', path: 'examples/table/customer/budget_analysis.formula' },
      { fieldName: 'contact_card', content: 'CONCAT(first_name, " ", last_name, " (", email, ")")', path: 'examples/table/customer/contact_card.formula' },
      { fieldName: 'lead_score', content: 'IF(budget_max > 500000, 90, IF(budget_max > 200000, 70, IF(budget_max > 0, 50, 20)))', path: 'examples/table/customer/lead_score.formula' }
    ],
    listing: [
      { fieldName: 'market_analysis', content: 'CONCAT("$", STRING(price), " in ", city, " (", STRING(bedrooms), "BR/", STRING(bathrooms), "BA)")', path: 'examples/table/listing/market_analysis.formula' },
      { fieldName: 'price_per_sqft', content: 'IF(square_feet > 0, ROUND(price / square_feet, 2), 0)', path: 'examples/table/listing/price_per_sqft.formula' },
      { fieldName: 'luxury_indicator', content: 'IF(price > 1000000, "Luxury", IF(price > 500000, "Premium", "Standard"))', path: 'examples/table/listing/luxury_indicator.formula' }
    ],
    opportunity: [
      { fieldName: 'deal_summary', content: 'CONCAT("Deal for ", customer_id_rel.first_name, " - ", listing_id_rel.address)', path: 'examples/table/opportunity/deal_summary.formula' },
      { fieldName: 'commission_projection', content: 'listing_id_rel.price * 0.06', path: 'examples/table/opportunity/commission_projection.formula' },
      { fieldName: 'pipeline_status', content: 'IF(closed_date IS NULL, "Active", "Closed")', path: 'examples/table/opportunity/pipeline_status.formula' }
    ]
  };
  
  const allExamples = exampleMap[tableName] || [];
  
  if (selectedExamples && selectedExamples.length > 0) {
    return allExamples.filter(example => selectedExamples.includes(example.fieldName));
  }
  
  return allExamples;
}

/**
 * Format report results for different output types
 * @param {Object} reportResult - Result from buildReport
 * @param {string} format - Output format: 'json', 'html', 'markdown', 'console'
 * @returns {string} Formatted output
 */
export function formatReport(reportResult, format = 'json') {
  const { metadata, results, sql, performance } = reportResult;
  
  switch (format) {
    case 'json':
      return JSON.stringify(reportResult, null, 2);
      
    case 'html':
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report: ${metadata.tableName}</title>
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
        <h1>📊 Report: ${metadata.tableName}</h1>
        <p><strong>Formulas:</strong> ${metadata.formulaCount}</p>
        <p><strong>Results:</strong> ${results.length} rows</p>
        <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
    </div>

    <div class="section">
        <h2>📄 Formulas</h2>
        ${metadata.formulas.map((formula, i) => `
        <div class="formula">
            <strong>${i + 1}. ${formula.fieldName}</strong><br>
            <code>${formula.content}</code>
        </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>📈 Performance</h2>
        <div class="metric"><strong>Join Intents:</strong> ${performance.deduplicationSavings.joinIntents}</div>
        <div class="metric"><strong>Actual JOINs:</strong> ${performance.actualJoins}</div>
        <div class="metric"><strong>Subqueries:</strong> ${performance.deduplicationSavings.subqueries}</div>
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
                ${results.slice(0, 10).map(row => `
                <tr>
                    ${Object.keys(row).map(key => `<td>${row[key] === null ? '<span class="null">NULL</span>' : row[key]}</td>`).join('')}
                </tr>
                `).join('')}
            </tbody>
        </table>
        ${results.length > 10 ? `<p><em>Showing first 10 of ${results.length} rows</em></p>` : ''}
        `}
    </div>
</body>
</html>`;
      
    case 'markdown':
      return `# 📊 Report: ${metadata.tableName}

## 📋 Summary
- **Formulas:** ${metadata.formulaCount}
- **Results:** ${results.length} rows
- **Generated:** ${new Date().toISOString()}

## 📄 Formulas

${metadata.formulas.map((formula, i) => `### ${i + 1}. ${formula.fieldName}
\`\`\`
${formula.content}
\`\`\`
`).join('\n')}

## 📈 Performance

| Metric | Value |
|--------|-------|
| Join Intents | ${performance.deduplicationSavings.joinIntents} |
| Actual JOINs | ${performance.actualJoins} |
| Subqueries | ${performance.deduplicationSavings.subqueries} |

## 📝 Generated SQL

\`\`\`sql
${sql.query}
\`\`\`

## 📊 Results

${results.length === 0 ? 'No results found' : `
| ${Object.keys(results[0]).join(' | ')} |
| ${Object.keys(results[0]).map(() => '---').join(' | ')} |
${results.slice(0, 10).map(row => `| ${Object.keys(row).map(key => row[key] === null ? '*NULL*' : row[key]).join(' | ')} |`).join('\n')}
${results.length > 10 ? `\n*Showing first 10 of ${results.length} rows*` : ''}
`}`;
      
    case 'console':
      let output = `📊 Report: ${metadata.tableName}\n`;
      output += `${'='.repeat(50)}\n`;
      output += `Formulas: ${metadata.formulaCount}\n`;
      output += `Results: ${results.length} rows\n\n`;
      
      output += `📄 Formulas:\n`;
      metadata.formulas.forEach((formula, i) => {
        output += `  ${i + 1}. ${formula.fieldName}: ${formula.content}\n`;
      });
      
      output += `\n📈 Performance:\n`;
      output += `  Join Intents: ${performance.deduplicationSavings.joinIntents}\n`;
      output += `  Actual JOINs: ${performance.actualJoins}\n`;
      output += `  Subqueries: ${performance.deduplicationSavings.subqueries}\n`;
      
      output += `\n📊 Results (first 5):\n`;
      if (results.length > 0) {
        results.slice(0, 5).forEach((row, i) => {
          output += `  Row ${i + 1}:\n`;
          Object.keys(row).forEach(key => {
            output += `    ${key}: ${row[key] || 'NULL'}\n`;
          });
        });
      } else {
        output += '  No results found\n';
      }
      
      return output;
      
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}