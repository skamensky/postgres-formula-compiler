#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function checkPlaywrightInstalled() {
    try {
        await import('playwright');
        return true;
    } catch (error) {
        return false;
    }
}

async function installPlaywright() {
    console.log('📦 Installing Playwright...');
    
    return new Promise((resolve, reject) => {
        const install = spawn('npm', ['install', 'playwright'], { stdio: 'inherit' });
        
        install.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Playwright installed successfully');
                
                // Install browsers
                console.log('🌐 Installing browser binaries...');
                const installBrowsers = spawn('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit' });
                
                installBrowsers.on('close', (browserCode) => {
                    if (browserCode === 0) {
                        console.log('✅ Chromium browser installed');
                        resolve();
                    } else {
                        reject(new Error(`Browser installation failed with code ${browserCode}`));
                    }
                });
            } else {
                reject(new Error(`Playwright installation failed with code ${code}`));
            }
        });
    });
}

async function runTest(testFile, testName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Running ${testName}...`);
    console.log(`${'='.repeat(60)}`);
    
    return new Promise((resolve) => {
        const test = spawn('node', [testFile], { stdio: 'inherit' });
        
        test.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${testName} passed`);
                resolve({ name: testName, passed: true });
            } else {
                console.log(`❌ ${testName} failed`);
                resolve({ name: testName, passed: false });
            }
        });
    });
}

async function main() {
    console.log('🚀 Starting E2E Test Suite for Formula Compiler WebApp');
    console.log('=' .repeat(60));
    
    // Check if server is running
    console.log('🔍 Checking if server is running...');
    try {
        const response = await fetch('http://localhost:3000/health');
        if (!response.ok) {
            throw new Error('Server not responding correctly');
        }
        const data = await response.json();
        console.log(`✅ Server running: ${data.status} (${data.mode || 'unknown mode'})`);
    } catch (error) {
        console.error('❌ Server not running at http://localhost:3000');
        console.error('   Please start the server with: npm run serve');
        process.exit(1);
    }
    
    // Check and install Playwright if needed
    if (!(await checkPlaywrightInstalled())) {
        await installPlaywright();
    } else {
        console.log('✅ Playwright already installed');
    }
    
    // Create output directories
    ['screenshots', 'debug'].forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`📁 Created directory: ${dirPath}`);
        }
    });
    
    const tests = [
        { file: 'tests/playwright/basic-loading.js', name: 'Basic Loading' },
        { file: 'tests/playwright/schema-functionality.js', name: 'Schema Functionality' },
        { file: 'tests/playwright/opportunity-schema.js', name: 'Opportunity Schema' },
        { file: 'tests/playwright/webapp-comprehensive.js', name: 'Comprehensive Tests' }
    ];
    
    const results = [];
    
    for (const test of tests) {
        if (fs.existsSync(test.file)) {
            const result = await runTest(test.file, test.name);
            results.push(result);
        } else {
            console.log(`⚠️  Test file not found: ${test.file}`);
            results.push({ name: test.name, passed: false });
        }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 E2E TEST SUITE SUMMARY');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r.passed);
    const failed = results.filter(r => !r.passed);
    
    console.log(`\n✅ PASSED (${passed.length}):`);
    passed.forEach(test => console.log(`   ✅ ${test.name}`));
    
    console.log(`\n❌ FAILED (${failed.length}):`);
    failed.forEach(test => console.log(`   ❌ ${test.name}`));
    
    console.log(`\n📊 Screenshots: tests/playwright/screenshots/`);
    console.log(`🔍 Debug files: tests/playwright/debug/`);
    
    const overallResult = failed.length === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED';
    console.log(`\nOVERALL: ${overallResult}`);
    console.log('='.repeat(60));
    
    if (failed.length > 0) {
        process.exit(1);
    }
}

// Polyfill fetch for older Node versions
if (typeof fetch === 'undefined') {
    global.fetch = async (url) => {
        const { default: http } = await import('http');
        return new Promise((resolve, reject) => {
            const req = http.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        json: () => Promise.resolve(JSON.parse(data))
                    });
                });
            });
            req.on('error', reject);
        });
    };
}

main().catch(console.error);