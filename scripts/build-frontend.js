#!/usr/bin/env node

/**
 * Frontend Build Script
 * Copies all compiler and tooling files to web/public/modules for browser use
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
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
    mkdirSync(join(webDir, 'images'), { recursive: true });
    // Note: shared/ is now source code, not auto-generated
}

/**
 * Copy and transform JavaScript files for browser use
 */
function copyJavaScriptFiles(sourceFile, targetFile) {
    console.log(`   ${sourceFile} → ${targetFile}`);
    
    let content = readFileSync(sourceFile, 'utf8');
    
    // Add generation comment at the beginning
    const relativePath = sourceFile.replace(projectRoot + '/', '');
    const generationComment = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated from: ${relativePath}
 * Build script: scripts/build-frontend.js
 * 
 * To make changes, edit the source file and run: npm run build:frontend
 */

`;
    content = generationComment + content;
    
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
 * Copy image assets for the frontend
 */
function copyImageAssets() {
    console.log('🖼️  Copying image assets...');
    
    const imagesSourceDir = join(projectRoot, 'docs', 'images');
    const imagesTargetDir = join(webDir, 'images');
    
    try {
        // Copy favicon
        const faviconSource = join(imagesSourceDir, 'chameleon.ico');
        const faviconTarget = join(webDir, 'favicon.ico'); // Place in root for standard favicon location
        
        if (readFileSync && writeFileSync) {
            const faviconContent = readFileSync(faviconSource);
            writeFileSync(faviconTarget, faviconContent);
            console.log(`   favicon: ${faviconSource} → ${faviconTarget}`);
        }
        
        // Copy background image  
        const bgImageSource = join(imagesSourceDir, 'chameleon-3d.jpg');
        const bgImageTarget = join(imagesTargetDir, 'chameleon-3d.jpg');
        
        const bgImageContent = readFileSync(bgImageSource);
        writeFileSync(bgImageTarget, bgImageContent);
        console.log(`   background: ${bgImageSource} → ${bgImageTarget}`);
        
        console.log('   ✅ Image assets copied successfully');
        
    } catch (error) {
        console.warn(`   ⚠️  Could not copy image assets: ${error.message}`);
    }
}

/**
 * Extract all formula examples from examples/ directory
 */
function extractFormulaExamples() {
    console.log('📝 Extracting formula examples...');
    
    const examplesDir = join(projectRoot, 'examples', 'table');
    const examples = {};
    
    try {
        const tableNames = readdirSync(examplesDir);
        
        for (const tableName of tableNames) {
            const tableDir = join(examplesDir, tableName);
            const stat = statSync(tableDir);
            
            if (stat.isDirectory()) {
                console.log(`   📊 Processing ${tableName} table...`);
                examples[tableName] = [];
                
                const formulaFiles = readdirSync(tableDir)
                    .filter(file => file.endsWith('.formula'));
                
                for (const formulaFile of formulaFiles) {
                    const formulaPath = join(tableDir, formulaFile);
                    const formulaContent = readFileSync(formulaPath, 'utf8').trim();
                    const exampleName = basename(formulaFile, '.formula');
                    
                    // Create a readable title from filename
                    const title = exampleName
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    
                    examples[tableName].push({
                        id: `${tableName}_${exampleName}`,
                        name: exampleName,
                        title: title,
                        tableName: tableName,
                        formula: formulaContent,
                        description: generateExampleDescription(title, formulaContent)
                    });
                }
                
                console.log(`      ✅ Found ${examples[tableName].length} examples`);
            }
        }
        
        // Generate the examples module
        const examplesModule = generateExamplesModule(examples);
        const examplesPath = join(modulesDir, 'shared', 'examples.js');
        writeFileSync(examplesPath, examplesModule);
        
        const totalExamples = Object.values(examples)
            .reduce((total, tableExamples) => total + tableExamples.length, 0);
        
        console.log(`   ✅ Generated examples module with ${totalExamples} examples`);
        return examples;
        
    } catch (error) {
        console.warn(`   ⚠️  Could not extract examples: ${error.message}`);
        // Create empty examples module as fallback
        const emptyModule = generateExamplesModule({});
        const examplesPath = join(modulesDir, 'shared', 'examples.js');
        writeFileSync(examplesPath, emptyModule);
        return {};
    }
}

/**
 * Generate a description for an example based on its title and formula
 */
function generateExampleDescription(title, formula) {
    // Simple heuristics to generate helpful descriptions
    if (formula.includes('COUNT_AGG')) {
        return `${title} using aggregate counting`;
    } else if (formula.includes('SUM_AGG')) {
        return `${title} using aggregate summation`;
    } else if (formula.includes('AVG_AGG')) {
        return `${title} using aggregate averaging`;
    } else if (formula.includes('IF(')) {
        return `${title} with conditional logic`;
    } else if (formula.includes('UPPER') || formula.includes('LOWER')) {
        return `${title} with text formatting`;
    } else if (formula.includes('ROUND')) {
        return `${title} with numeric rounding`;
    } else if (formula.includes('&')) {
        return `${title} with text concatenation`;
    } else if (formula.includes('_rel.')) {
        return `${title} using relationships`;
    } else {
        return `${title} formula example`;
    }
}

/**
 * Generate the examples JavaScript module
 */
function generateExamplesModule(examples) {
    return `/**
 * Formula Examples Module
 * Auto-generated from examples/ directory
 */

// All formula examples organized by table
export const FORMULA_EXAMPLES = ${JSON.stringify(examples, null, 2)};

// Get examples for a specific table
export function getExamplesForTable(tableName) {
    return FORMULA_EXAMPLES[tableName] || [];
}

// Get all examples as a flat array
export function getAllExamples() {
    const allExamples = [];
    for (const tableName in FORMULA_EXAMPLES) {
        allExamples.push(...FORMULA_EXAMPLES[tableName]);
    }
    return allExamples;
}

// Get example by ID
export function getExampleById(id) {
    for (const tableName in FORMULA_EXAMPLES) {
        const example = FORMULA_EXAMPLES[tableName].find(ex => ex.id === id);
        if (example) return example;
    }
    return null;
}

// Get tables that have examples
export function getTablesWithExamples() {
    return Object.keys(FORMULA_EXAMPLES);
}

// Get example statistics
export function getExampleStats() {
    const stats = {
        totalExamples: 0,
        tableCount: 0,
        byTable: {}
    };
    
    for (const tableName in FORMULA_EXAMPLES) {
        const count = FORMULA_EXAMPLES[tableName].length;
        stats.byTable[tableName] = count;
        stats.totalExamples += count;
        stats.tableCount++;
    }
    
    return stats;
}
`;
}

// Note: Shared files (db-client.js, browser-api.js, seed.sql) are now source files
// They live in web/public/modules/shared/ and are maintained manually

// Note: .gitignore is now manually maintained

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
    
    // Special handling for LSP - also copy to web/public/ for direct imports
    console.log('📋 Copying LSP to direct location...');
    const lspSourcePath = join(modulesDir, 'tooling', 'lsp.js');
    const lspDirectPath = join(webDir, 'lsp.js');
    
    // Read the generated LSP file and fix import paths for direct location
    let lspContent = readFileSync(lspSourcePath, 'utf8');
    lspContent = lspContent.replace(/from '\.\.\/compiler\//g, "from './modules/compiler/");
    writeFileSync(lspDirectPath, lspContent);
    console.log(`   ${lspSourcePath} → ${lspDirectPath} (with path fixes)`);
    
    console.log('📄 Shared modules (db-client.js, browser-api.js, seed.sql) are source files');
    
    // Copy image assets
    copyImageAssets();
    
    // Extract formula examples
    const examples = extractFormulaExamples();
    
    console.log('\n✅ Frontend build complete!');
    console.log('📁 Modules available at: web/public/modules/');
    console.log('🚀 Ready for client-side compilation!\n');
    
    // Show examples summary
    const totalExamples = Object.values(examples)
        .reduce((total, tableExamples) => total + tableExamples.length, 0);
    if (totalExamples > 0) {
        console.log(`📝 Extracted ${totalExamples} formula examples across ${Object.keys(examples).length} tables`);
    }
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    buildFrontend();
}