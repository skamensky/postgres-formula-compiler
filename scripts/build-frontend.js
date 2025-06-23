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
    // Note: shared/ is now source code, not auto-generated
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
    
    console.log('📄 Shared modules (db-client.js, browser-api.js, seed.sql) are source files');
    
    console.log('\n✅ Frontend build complete!');
    console.log('📁 Modules available at: web/public/modules/');
    console.log('🚀 Ready for client-side compilation!\n');
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    buildFrontend();
}