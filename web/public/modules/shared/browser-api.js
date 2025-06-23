/**
 * Browser API Interface
 * Replaces server API calls with direct module usage
 */

import { evaluateFormula, generateSQL } from '../compiler/index.js';
import { createDeveloperTools } from '../tooling/developer-tools.js';
import { initializeBrowserDatabase } from './db-client.js';
import {
    getTableNames,
    getColumnListsForTables,
    getAllRelationships,
    getInverseRelationshipsForTables
} from '../compiler/relationship-compiler.js';

let dbClient = null;
let developerTools = null;
let currentSchema = null;

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
        
        // Build relationship context
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
        
        // Build table infos
        const tableInfos = [{
            tableName: tableName,
            columnList: columnLists[tableName]
        }];
        
        for (const rel of directRels) {
            if (columnLists[rel.toTable]) {
                tableInfos.push({
                    tableName: rel.toTable,
                    columnList: columnLists[rel.toTable]
                });
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
