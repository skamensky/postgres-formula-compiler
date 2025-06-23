#!/usr/bin/env node

/**
 * Frontend Build Script
 * Copies all compiler and tooling files to web/public/modules for browser use
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const sourceDir = join(projectRoot, 'src');
const toolingDir = join(projectRoot, 'tooling');
const webDir = join(projectRoot, 'web', 'public');
const modulesDir = join(webDir, 'modules');

/**
 * Create directory structure
 */
function createDirectories() {
    console.log('📁 Creating module directories...');
    
    mkdirSync(join(modulesDir, 'compiler'), { recursive: true });
    mkdirSync(join(modulesDir, 'tooling'), { recursive: true });
    mkdirSync(join(modulesDir, 'shared'), { recursive: true });
}

/**
 * Copy and transform JavaScript files for browser use
 */
function copyJavaScriptFiles(sourceFile, targetFile) {
    console.log(`   ${sourceFile} → ${targetFile}`);
    
    let content = readFileSync(sourceFile, 'utf8');
    
    // Transform import paths for browser use
    // src/ files importing from src/ → ./
    // tooling/ files importing from ../src/ → ../compiler/
    // Add .js extensions where missing
    
    content = content.replace(/^import\s+(.+?)\s+from\s+['"]([^'"]+)['"];?$/gm, (match, imports, path) => {
        let newPath = path;
        
        // Handle relative imports
        if (path.startsWith('./')) {
            // Same directory imports - keep as is but ensure .js extension
            if (!path.endsWith('.js')) {
                newPath = path + '.js';
            }
        } else if (path.startsWith('../src/')) {
            // Tooling files importing from src → change to ../compiler/
            newPath = path.replace('../src/', '../compiler/');
            if (!newPath.endsWith('.js')) {
                newPath = newPath + '.js';
            }
        } else if (!path.startsWith('../') && !path.startsWith('/')) {
            // Relative imports without ./ prefix
            newPath = './' + path;
            if (!newPath.endsWith('.js')) {
                newPath = newPath + '.js';
            }
        }
        
        return `import ${imports} from '${newPath}';`;
    });
    
    // Transform export statements to ensure they work in browser
    content = content.replace(/^export\s+\{([^}]+)\}\s*;?\s*$/gm, (match, exports) => {
        return `export { ${exports} };`;
    });
    
    writeFileSync(targetFile, content);
}

/**
 * Copy all files from source directory to target directory
 */
function copyDirectory(sourceDir, targetDir, transformJs = true) {
    const items = readdirSync(sourceDir);
    
    for (const item of items) {
        const sourcePath = join(sourceDir, item);
        const targetPath = join(targetDir, item);
        const stat = statSync(sourcePath);
        
        if (stat.isDirectory()) {
            mkdirSync(targetPath, { recursive: true });
            copyDirectory(sourcePath, targetPath, transformJs);
        } else if (stat.isFile()) {
            if (extname(item) === '.js' && transformJs) {
                copyJavaScriptFiles(sourcePath, targetPath);
            } else {
                // Copy non-JS files as-is
                const content = readFileSync(sourcePath);
                writeFileSync(targetPath, content);
            }
        }
    }
}

/**
 * Create shared database files for browser use
 */
function createSharedFiles() {
    console.log('📊 Creating shared database files...');
    
    // Copy seed data
    const seedSqlPath = join(projectRoot, 'seed.sql');
    const targetSeedPath = join(modulesDir, 'shared', 'seed.sql');
    
    if (readFileSync(seedSqlPath)) {
        const seedContent = readFileSync(seedSqlPath, 'utf8');
        writeFileSync(targetSeedPath, seedContent);
        console.log(`   seed.sql → modules/shared/seed.sql`);
    }
    
    // Create database client for browser
    const dbClientContent = `/**
 * Browser Database Client
 * Initializes PGlite with seed data
 */

import { PGlite } from 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.min.js';

let dbInstance = null;

/**
 * Create database client (PGlite in browser)
 */
export function createDatabaseClient() {
    if (dbInstance) {
        return dbInstance;
    }
    
    console.log('🔌 Initializing PGlite database in browser...');
    
    dbInstance = new PGlite();
    
    return {
        async connect() {
            // PGlite doesn't need explicit connection
            console.log('✅ PGlite database ready');
        },
        
        async query(sql, params = []) {
            try {
                const result = await dbInstance.query(sql, params);
                return result;
            } catch (error) {
                console.error('Database query error:', error);
                throw error;
            }
        },
        
        async close() {
            // PGlite cleanup if needed
            console.log('🔌 PGlite database closed');
        }
    };
}

/**
 * Initialize database with seed data
 */
export async function initializeBrowserDatabase() {
    const client = createDatabaseClient();
    await client.connect();
    
    try {
        // Load and execute seed data
        const response = await fetch('./modules/shared/seed.sql');
        const seedSql = await response.text();
        
        // Split into individual statements and execute
        const statements = seedSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        console.log(\`📊 Executing \${statements.length} seed statements...\`);
        
        for (const statement of statements) {
            await client.query(statement + ';');
        }
        
        console.log('✅ Database initialized with seed data');
        return client;
        
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}

export { dbInstance };
`;
    
    writeFileSync(join(modulesDir, 'shared', 'db-client.js'), dbClientContent);
    console.log(`   Created modules/shared/db-client.js`);
    
    // Create main API interface for browser
    const browserApiContent = `/**
 * Browser API Interface
 * Replaces server API calls with direct module usage
 */

import { evaluateFormula, generateSQL } from '../compiler/index.js';
import { createDeveloperTools } from '../tooling/developer-tools.js';
import { createDatabaseClient } from './db-client.js';
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
 * Initialize browser API
 */
export async function initializeBrowserAPI() {
    // Import and initialize database
    const { initializeBrowserDatabase } = await import('./db-client.js');
    dbClient = await initializeBrowserDatabase();
    
    // Initialize developer tools
    developerTools = createDeveloperTools('default');
    
    console.log('🚀 Browser API initialized');
    return { dbClient, developerTools };
}

/**
 * Execute formula (replaces /api/execute)
 */
export async function executeFormula(formula, tableName) {
    try {
        if (!dbClient) {
            throw new Error('Database not initialized');
        }
        
        // Get context (same logic as server)
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
        
        // Execute SQL
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
        return {
            success: false,
            error: error.message,
            formula: formula
        };
    }
}

/**
 * Get tables (replaces /api/tables)
 */
export async function getTables() {
    const tables = await getTableNames(dbClient);
    return { tables };
}

/**
 * Get table schema (replaces /api/tables/:tableName/schema)
 */
export async function getTableSchema(tableName) {
    const columnLists = await getColumnListsForTables([tableName], dbClient);
    const columns = Object.entries(columnLists[tableName] || {}).map(([name, type]) => ({
        column_name: name,
        data_type: type
    }));
    
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
            relationship_name: \`\${rel.fromTable}_\${rel.joinColumn}\`,
            type: 'reverse'
        }));
    
    return {
        columns: columns,
        directRelationships: directRelationships,
        reverseRelationships: reverseRelationships,
        relationships: directRelationships.map(rel => ({
            col_name: rel.col_name,
            target_table_name: rel.target_table_name
        }))
    };
}

/**
 * Validate formula (replaces /api/validate)
 */
export async function validateFormula(formula, tableName) {
    try {
        // Get context for validation
        const allTableNames = await getTableNames(dbClient);
        const columnLists = await getColumnListsForTables(allTableNames, dbClient);
        const allRelationships = await getAllRelationships(dbClient);
        
        // Build context (simplified)
        const context = {
            tableName: tableName,
            columnList: columnLists[tableName],
            relationshipInfos: allRelationships
        };
        
        // Try to compile
        const compilation = evaluateFormula(formula, context);
        return { valid: true, compilation: compilation };
        
    } catch (error) {
        return { valid: false, error: error.message || error.toString() };
    }
}

/**
 * Get developer tools (replaces /api/developer-tools loading)
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
        developerTools.updateSchema(schema);
    }
}

export { dbClient, developerTools };
`;
    
    writeFileSync(join(modulesDir, 'shared', 'browser-api.js'), browserApiContent);
    console.log(`   Created modules/shared/browser-api.js`);
}

/**
 * Update .gitignore
 */
function updateGitignore() {
    const gitignorePath = join(projectRoot, '.gitignore');
    let gitignoreContent = '';
    
    try {
        gitignoreContent = readFileSync(gitignorePath, 'utf8');
    } catch (error) {
        // File doesn't exist, create it
    }
    
    if (!gitignoreContent.includes('web/public/modules')) {
        gitignoreContent += '\n# Auto-generated frontend modules\nweb/public/modules/\n';
        writeFileSync(gitignorePath, gitignoreContent);
        console.log('📝 Updated .gitignore');
    }
}

/**
 * Main build function
 */
export function buildFrontend() {
    console.log('🏗️  Building frontend modules...\n');
    
    createDirectories();
    
    console.log('📦 Copying compiler files...');
    copyDirectory(sourceDir, join(modulesDir, 'compiler'));
    
    console.log('🔧 Copying tooling files...');
    copyDirectory(toolingDir, join(modulesDir, 'tooling'));
    
    createSharedFiles();
    updateGitignore();
    
    console.log('\n✅ Frontend build complete!');
    console.log('📁 Modules available at: web/public/modules/');
    console.log('🚀 Ready for client-side compilation!\n');
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    buildFrontend();
}