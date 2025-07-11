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
                    columnList: targetColumnList,
                    tableName: sourceRel.toTable
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
            throw new Error('Database not initialized - call initializeBrowserAPI() first');
        }
        
        // Get context using the same logic as server
        const allTableNames = await getTableNames(dbClient);
        const columnLists = await getColumnListsForTables(allTableNames, dbClient);
        const allRelationships = await getAllRelationships(dbClient);
        
        // Build relationship context - recursively load all relationship targets
        const allTableNamesForContext = new Set([tableName]);
        const directRels = allRelationships.filter(rel => rel.fromTable === tableName);
        
        console.log(`🔍 [Browser API] Direct relationships from ${tableName}:`, directRels.map(r => `${r.name} → ${r.toTable}`));
        
        // Add direct relationship targets
        for (const rel of directRels) {
            allTableNamesForContext.add(rel.toTable);
        }
        
        // RECURSIVELY add second-level relationship targets (for multi-level relationships)
        const secondLevelTables = [...allTableNamesForContext];
        for (const targetTable of secondLevelTables) {
            if (targetTable !== tableName) { // Skip the original table to avoid cycles
                const secondLevelRels = allRelationships.filter(rel => rel.fromTable === targetTable);
                console.log(`🔍 [Browser API] Second-level relationships from ${targetTable}:`, secondLevelRels.map(r => `${r.name} → ${r.toTable}`));
                for (const rel of secondLevelRels) {
                    allTableNamesForContext.add(rel.toTable);
                }
            }
        }
        
        console.log(`🔍 [Browser API] Tables available in database:`, allTableNames);
        console.log(`🔍 [Browser API] Tables needed for context:`, [...allTableNamesForContext]);
        
        const tablesToLoadInverseRels = new Set([tableName]);
        const directInverseRels = allRelationships.filter(rel => rel.toTable === tableName);
        for (const rel of directInverseRels) {
            tablesToLoadInverseRels.add(rel.fromTable);
        }
        
        const allInverseRelationships = await getInverseRelationshipsForTables([...tablesToLoadInverseRels], dbClient);
        const inverseRelationshipInfo = allInverseRelationships[tableName] || {};
        
        // Build table infos for ALL tables in context (including multi-level)
        const tableInfos = [{
            tableName: tableName,
            columnList: columnLists[tableName]
        }];
        
        // Add all tables from the expanded context
        for (const contextTableName of allTableNamesForContext) {
            if (contextTableName !== tableName) { // Skip the main table (already added)
                if (columnLists[contextTableName]) {
                    tableInfos.push({
                        tableName: contextTableName,
                        columnList: columnLists[contextTableName]
                    });
                    console.log(`✅ [Browser API] Loaded table info for ${contextTableName} (${Object.keys(columnLists[contextTableName]).length} columns)`);
                } else {
                    const errorMsg = `❌ Table '${contextTableName}' needed for relationships was not found in the database.`;
                    console.error(errorMsg);
                    console.error(`   Available tables: ${allTableNames.join(', ')}`);
                    console.error(`   Tables with column data: ${Object.keys(columnLists).join(', ')}`);
                    throw new Error(errorMsg);
                }
            }
        }
        
        // Build relationship info for backward compatibility
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
        
        // Build complete context
        const context = {
            tableName: tableName,
            tableInfos: tableInfos,
            relationshipInfos: allRelationships,
            columnList: columnLists[tableName],
            relationshipInfo: relationshipInfo,
            inverseRelationshipInfo: inverseRelationshipInfo,
            allInverseRelationships: allInverseRelationships
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
