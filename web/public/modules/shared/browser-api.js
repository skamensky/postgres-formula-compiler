/**
 * Browser API Interface
 * Replaces server API calls with direct module usage
 */

import { evaluateFormula, generateSQL } from '../compiler/index.js';
import { createDeveloperTools } from '../tooling/developer-tools.js';
import { initializeBrowserDatabase } from './db-client.js';
import { mapPostgresType } from '../compiler/utils.js';

let dbClient = null;
let developerTools = null;
let currentSchema = null;

// =============================================================================
// DATABASE INTROSPECTION FUNCTIONS FOR PGLITE
// =============================================================================

/**
 * Get all table names from the database
 */
async function getTableNames(client) {
    const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `;
    
    const result = await client.query(query);
    return result.rows.map(row => row.table_name);
}

/**
 * Get column information for multiple tables
 */
async function getColumnListsForTables(tableNames, client) {
    if (tableNames.length === 0) {
        return {};
    }
    
    const query = `
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ANY($1)
        ORDER BY table_name, ordinal_position
    `;
    
    const result = await client.query(query, [tableNames]);
    
    const columnLists = {};
    
    // Initialize empty objects for all requested tables
    for (const tableName of tableNames) {
        columnLists[tableName] = {};
    }
    
    // Populate column lists from results
    for (const row of result.rows) {
        columnLists[row.table_name][row.column_name] = mapPostgresType(row.data_type);
    }
    
    console.log(`🔍 [Browser API] Column query returned data for tables:`, Object.keys(columnLists).filter(t => Object.keys(columnLists[t]).length > 0));
    
    // Check if any tables were not found
    for (const tableName of tableNames) {
        if (Object.keys(columnLists[tableName]).length === 0) {
            console.error(`❌ [Browser API] Table '${tableName}' not found in database`);
            console.error(`   Requested tables:`, tableNames);
            console.error(`   Available tables with data:`, Object.keys(columnLists).filter(t => Object.keys(columnLists[t]).length > 0));
            throw new Error(`Table '${tableName}' not found in database`);
        }
    }
    
    return columnLists;
}

/**
 * Get foreign key relationships from the database
 */
async function getAllRelationships(client) {
    const query = `
        SELECT 
            tc.table_name as source_table,
            kcu.column_name as source_column,
            ccu.table_name as target_table,
            ccu.column_name as target_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name
    `;
    
    const result = await client.query(query);
    const relationships = [];
    
    for (const row of result.rows) {
        // Use the full column name as the relationship name (user expects {field_name}_rel.{foreign_field_name})
        const relationshipName = row.source_column;
        
        relationships.push({
            name: relationshipName,
            fromTable: row.source_table,
            toTable: row.target_table,
            joinColumn: row.source_column
        });
    }
    
    return relationships;
}

/**
 * Build inverse relationship info for multiple tables
 */
async function getInverseRelationshipsForTables(tableNames, client) {
    if (tableNames.length === 0) {
        return {};
    }
    
    // Get all relationships where target table is in our list
    const allRelationships = await getAllRelationships(client);
    const inverseRelationships = allRelationships.filter(rel => 
        tableNames.includes(rel.toTable)
    );
    
    // Get column lists for all tables we'll need
    const allTablesNeeded = new Set([
        ...tableNames,
        ...inverseRelationships.map(rel => rel.fromTable),
        ...allRelationships.map(rel => rel.toTable)
    ]);
    
    const columnLists = await getColumnListsForTables([...allTablesNeeded], client);
    
    // Build relationship maps for building nested structures
    const relationshipsByTable = new Map();
    for (const rel of allRelationships) {
        if (!relationshipsByTable.has(rel.fromTable)) {
            relationshipsByTable.set(rel.fromTable, []);
        }
        relationshipsByTable.get(rel.fromTable).push(rel);
    }
    
    // Build inverse relationships for all requested tables
    const result = {};
    for (const tableName of tableNames) {
        result[tableName] = {};
    }
    
    for (const rel of inverseRelationships) {
        const targetTable = rel.toTable;
        const sourceTable = rel.fromTable;
        
        // Use naming pattern: {source_table_name}s_{source_column}
        const relationshipName = `${sourceTable}s_${rel.joinColumn}`;
        
        const sourceColumnList = columnLists[sourceTable];
        const sourceRelationships = relationshipsByTable.get(sourceTable) || [];
        
        // Convert flat relationships to old nested format for backward compatibility
        const nestedRelationshipInfo = {};
        for (const sourceRel of sourceRelationships) {
            const targetColumnList = columnLists[sourceRel.toTable];
            if (targetColumnList) {
                nestedRelationshipInfo[sourceRel.name] = {
                    joinColumn: sourceRel.joinColumn,
                    columnList: targetColumnList
                };
            }
        }
        
        result[targetTable][relationshipName] = {
            tableName: sourceTable,
            columnList: sourceColumnList,
            joinColumn: rel.joinColumn,
            relationshipInfo: nestedRelationshipInfo
        };
    }
    
    return result;
}

/**
 * Initialize browser API with database and developer tools
 */
export async function initializeBrowserAPI() {
    try {
        console.log('🔌 Initializing browser API...');
        
        // Initialize database
        dbClient = await initializeBrowserDatabase();
        
        // Initialize developer tools  
        developerTools = createDeveloperTools('default');
        
        console.log('✅ Browser API initialized successfully');
        return { dbClient, developerTools };
        
    } catch (error) {
        console.error('❌ Browser API initialization failed:', error);
        throw error;
    }
}

/**
 * Execute formula - replaces /api/execute
 */
export async function executeFormula(formula, tableName) {
    try {
        if (!dbClient) {
            throw new Error('Database not initialized');
        }
        
        console.log(`🔧 Executing formula: ${formula}`);
        
        // Use cached schema if available and table matches
        if (!currentSchema || currentSchema.tableName !== tableName) {
            console.log(`📋 Loading schema for table: ${tableName}`);
            
            // Get all table information for relationship support
            const tableNames = await getTableNames(dbClient);
            const tableInfos = [];
            
            for (const table of tableNames) {
                const columns = await getTableColumns(dbClient, table);
                tableInfos.push({
                    tableName: table,
                    columnList: columns
                });
            }
            
            // Create column lists mapping
            const columnLists = {};
            tableInfos.forEach(info => {
                columnLists[info.tableName] = info.columnList;
            });
            
            // Get all relationships for advanced relationship support
            const allRelationships = await getAllRelationships(dbClient);
            const allInverseRelationships = await getInverseRelationshipsForTables(tableNames, dbClient);
            
            // Build relationship mappings for the current table
            const relationshipInfo = {};
            const inverseRelationshipInfo = {};
            
            // Direct relationships (what the current table points to)
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
            
            // Inverse relationships (what points to the current table)
            const inverseRelationships = allInverseRelationships.filter(rel => rel.targetTable === tableName);
            for (const rel of inverseRelationships) {
                const sourceTable = tableInfos.find(t => t.tableName === rel.sourceTable);
                if (sourceTable) {
                    inverseRelationshipInfo[rel.name] = {
                        joinColumn: rel.joinColumn,
                        columnList: sourceTable.columnList
                    };
                }
            }
            
            // Cache the complete schema
            currentSchema = {
                tableName: tableName,
                tableInfos: tableInfos,
                columnLists: columnLists,
                relationshipInfos: allRelationships,
                columnList: columnLists[tableName],
                relationshipInfo: relationshipInfo,
                inverseRelationshipInfo: inverseRelationshipInfo,
                allInverseRelationships: allInverseRelationships
            };
        }

        // Use the cached schema for relationship info
        const directRelationships = currentSchema.relationshipInfos.filter(rel => rel.fromTable === tableName);
        for (const rel of directRelationships) {
            const targetTable = currentSchema.tableInfos.find(t => t.tableName === rel.toTable);
            if (targetTable) {
                relationshipInfo[rel.name] = {
                    joinColumn: rel.joinColumn,
                    columnList: targetTable.columnList
                };
            }
        }
        
        // Build complete context
        const context = {
            tableName: tableName,
            tableInfos: currentSchema.tableInfos,
            relationshipInfos: currentSchema.relationshipInfos,
            columnList: currentSchema.columnLists[tableName],
            relationshipInfo: currentSchema.relationshipInfo,
            inverseRelationshipInfo: currentSchema.inverseRelationshipInfo,
            allInverseRelationships: currentSchema.allInverseRelationships
        };
        
        // Compile formula
        const compilation = evaluateFormula(formula, context);
        
        if (compilation.error) {
            return {
                success: false,
                error: compilation.error,
                formula: formula
            };
        }
        
        // Generate SQL
        const results = { formula_result: compilation };
        const sqlResult = generateSQL(results, tableName);
        
        // Execute SQL in browser database
        const result = await dbClient.query(sqlResult.sql);
        
        return {
            success: true,
            formula: formula,
            compiledExpression: compilation.expression,
            sql: sqlResult.sql,
            results: result.rows,
            metadata: {
                joinCount: compilation.joinIntents.length,
                aggregateCount: compilation.aggregateIntents.length
            }
        };
        
    } catch (error) {
        console.error('Formula execution error:', error);
        return {
            success: false,
            error: error.message || error.toString(),
            formula: formula
        };
    }
}

/**
 * Execute multiple formulas and combine them into a single report
 * @param {Array<{name: string, formula: string}>} formulas - Array of named formulas
 * @param {string} tableName - Base table name
 * @returns {Promise<Object>} Combined execution result
 */
export async function executeMultipleFormulas(formulas, tableName) {
    try {
        if (!dbClient) {
            throw new Error('Database not initialized');
        }
        
        if (!formulas || formulas.length === 0) {
            throw new Error('No formulas provided');
        }
        
        console.log(`🔧 Executing ${formulas.length} formulas for table: ${tableName}`);
        
        // Use cached schema or load if needed
        if (!currentSchema || currentSchema.tableName !== tableName) {
            console.log(`📋 Loading schema for table: ${tableName}`);
            
            // Get all table information for relationship support
            const tableNames = await getTableNames(dbClient);
            const tableInfos = [];
            
            for (const table of tableNames) {
                const columns = await getTableColumns(dbClient, table);
                tableInfos.push({
                    tableName: table,
                    columnList: columns
                });
            }
            
            // Create column lists mapping
            const columnLists = {};
            tableInfos.forEach(info => {
                columnLists[info.tableName] = info.columnList;
            });
            
            // Get all relationships for advanced relationship support
            const allRelationships = await getAllRelationships(dbClient);
            const allInverseRelationships = await getInverseRelationshipsForTables(tableNames, dbClient);
            
            // Build relationship mappings for the current table
            const relationshipInfo = {};
            const inverseRelationshipInfo = {};
            
            // Direct relationships (what the current table points to)
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
            
            // Inverse relationships (what points to the current table)
            const inverseRelationships = allInverseRelationships.filter(rel => rel.targetTable === tableName);
            for (const rel of inverseRelationships) {
                const sourceTable = tableInfos.find(t => t.tableName === rel.sourceTable);
                if (sourceTable) {
                    inverseRelationshipInfo[rel.name] = {
                        joinColumn: rel.joinColumn,
                        columnList: sourceTable.columnList
                    };
                }
            }
            
            // Cache the complete schema
            currentSchema = {
                tableName: tableName,
                tableInfos: tableInfos,
                columnLists: columnLists,
                relationshipInfos: allRelationships,
                columnList: columnLists[tableName],
                relationshipInfo: relationshipInfo,
                inverseRelationshipInfo: inverseRelationshipInfo,
                allInverseRelationships: allInverseRelationships
            };
        }
        
        // Build complete context
        const context = {
            tableName: tableName,
            tableInfos: currentSchema.tableInfos,
            relationshipInfos: currentSchema.relationshipInfos,
            columnList: currentSchema.columnLists[tableName],
            relationshipInfo: currentSchema.relationshipInfo,
            inverseRelationshipInfo: currentSchema.inverseRelationshipInfo,
            allInverseRelationships: currentSchema.allInverseRelationships
        };
        
        // Compile all formulas
        const namedResults = {};
        const compilationResults = [];
        const errors = [];
        
        for (const { name, formula } of formulas) {
            console.log(`📝 Compiling formula '${name}': ${formula}`);
            
            const compilation = evaluateFormula(formula, context);
            
            if (compilation.error) {
                errors.push({
                    name: name,
                    formula: formula,
                    error: compilation.error
                });
            } else {
                // Use the name as the field name, sanitizing it for SQL
                const fieldName = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
                namedResults[fieldName] = compilation;
                compilationResults.push({
                    name: name,
                    fieldName: fieldName,
                    formula: formula,
                    compilation: compilation
                });
            }
        }
        
        // If there are any compilation errors, return them
        if (errors.length > 0) {
            return {
                success: false,
                error: `Formula compilation errors: ${errors.map(e => `${e.name}: ${e.error}`).join('; ')}`,
                formulas: formulas,
                errors: errors
            };
        }
        
        // Generate optimized SQL with deduplication
        console.log(`🔧 Generating optimized SQL for ${Object.keys(namedResults).length} formulas...`);
        const sqlResult = generateSQL(namedResults, tableName);
        
        // Execute the combined SQL
        console.log(`🚀 Executing combined SQL query...`);
        const result = await dbClient.query(sqlResult.sql);
        
        // Calculate metadata for analysis
        const totalJoinIntents = new Set();
        const totalAggregateIntents = new Set();
        
        compilationResults.forEach(compResult => {
            compResult.compilation.joinIntents.forEach(join => totalJoinIntents.add(join.semanticId));
            compResult.compilation.aggregateIntents.forEach(agg => {
                totalAggregateIntents.add(agg.semanticId);
                agg.internalJoins.forEach(join => totalJoinIntents.add(join.semanticId));
            });
        });
        
        return {
            success: true,
            formulas: compilationResults.map(cr => ({
                name: cr.name,
                fieldName: cr.fieldName,
                formula: cr.formula
            })),
            sql: sqlResult.sql,
            results: result.rows,
            metadata: {
                formulaCount: formulas.length,
                totalJoinIntents: totalJoinIntents.size,
                totalAggregateIntents: totalAggregateIntents.size,
                actualJoins: (sqlResult.fromClause.match(/LEFT JOIN/g) || []).length,
                subqueries: sqlResult.aggregateSubqueries.length,
                selectExpressions: sqlResult.selectExpressions.length
            }
        };
        
    } catch (error) {
        console.error('Multi-formula execution error:', error);
        return {
            success: false,
            error: error.message || error.toString(),
            formulas: formulas
        };
    }
}

/**
 * Get available tables - replaces /api/tables
 */
export async function getTables() {
    try {
        if (!dbClient) {
            throw new Error('Database not initialized');
        }
        
        const tables = await getTableNames(dbClient);
        return { tables };
        
    } catch (error) {
        console.error('Get tables error:', error);
        throw error;
    }
}

/**
 * Get table schema - replaces /api/tables/:tableName/schema
 */
export async function getTableSchema(tableName) {
    try {
        if (!dbClient) {
            throw new Error('Database not initialized');
        }
        
        // Get columns
        const columnLists = await getColumnListsForTables([tableName], dbClient);
        const columns = Object.entries(columnLists[tableName] || {}).map(([name, type]) => ({
            column_name: name,
            data_type: type
        }));
        
        // Get relationships
        const allRelationships = await getAllRelationships(dbClient);
        
        const directRelationships = allRelationships
            .filter(rel => rel.fromTable === tableName)
            .map(rel => ({
                col_name: rel.joinColumn,
                target_table_name: rel.toTable,
                relationship_name: rel.name,
                type: 'direct'
            }));
        
        const reverseRelationships = allRelationships
            .filter(rel => rel.toTable === tableName)
            .map(rel => ({
                col_name: rel.joinColumn,
                source_table_name: rel.fromTable,
                relationship_name: `${rel.fromTable}_${rel.joinColumn}`,
                type: 'reverse'
            }));
        
        return {
            columns: columns,
            directRelationships: directRelationships,
            reverseRelationships: reverseRelationships,
            // Legacy format for backward compatibility
            relationships: directRelationships.map(rel => ({
                col_name: rel.col_name,
                target_table_name: rel.target_table_name
            }))
        };
        
    } catch (error) {
        console.error('Get table schema error:', error);
        throw error;
    }
}

/**
 * Validate formula - replaces /api/validate
 */
export async function validateFormula(formula, tableName) {
    try {
        if (!dbClient) {
            throw new Error('Database not initialized');
        }
        
        // Get minimal context for validation
        const allTableNames = await getTableNames(dbClient);
        const columnLists = await getColumnListsForTables(allTableNames, dbClient);
        const allRelationships = await getAllRelationships(dbClient);
        
        // Build simplified context for validation
        const context = {
            tableName: tableName,
            columnList: columnLists[tableName],
            relationshipInfos: allRelationships,
            tableInfos: [{ tableName, columnList: columnLists[tableName] }]
        };
        
        // Try to compile formula
        const compilation = evaluateFormula(formula, context);
        return { valid: true, compilation: compilation };
        
    } catch (error) {
        return { 
            valid: false, 
            error: error.message || error.toString() 
        };
    }
}

/**
 * Get developer tools instance
 */
export function getDeveloperTools() {
    if (!developerTools) {
        developerTools = createDeveloperTools('default', currentSchema);
    }
    return developerTools;
}

/**
 * Update schema for developer tools
 */
export function updateDeveloperToolsSchema(schema) {
    currentSchema = schema;
    if (developerTools) {
        try {
            developerTools.updateSchema(schema);
            console.log('🔧 Developer tools schema updated');
        } catch (error) {
            console.warn('⚠️ Failed to update developer tools schema:', error);
        }
    }
}

// Export instances for direct access if needed
export { dbClient, developerTools };
