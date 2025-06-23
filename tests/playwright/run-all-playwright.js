#!/usr/bin/env node

/**
 * Unified Playwright Test Runner
 * Runs all Playwright tests with shared browser context for efficiency
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test suite configuration
const TEST_SUITES = [
    {
        name: 'Basic Loading',
        description: 'Tests basic webapp loading and health checks',
        file: 'basic-loading.js',
        timeout: 30000
    },
    {
        name: 'Schema Functionality', 
        description: 'Tests schema tab loading and table information display',
        file: 'schema-functionality.js',
        timeout: 45000
    },
    {
        name: 'Schema Tab Initial Load',
        description: 'Tests initial schema tab loading behavior',
        file: 'schema-tab-initial-load.js', 
        timeout: 30000
    },
    {
        name: 'Opportunity Schema',
        description: 'Tests opportunity table schema display',
        file: 'opportunity-schema.js',
        timeout: 30000
    },
    {
        name: 'Examples Functionality',
        description: 'Tests formula examples loading and execution',
        file: 'examples-functionality.js',
        timeout: 45000
    },
    {
        name: 'Language Tooling',
        description: 'Tests syntax highlighting and developer tools',
        file: 'language-tooling-test.js',
        timeout: 30000
    },
    {
        name: 'Autocomplete Final',
        description: 'Tests autocomplete functionality with Tab key support',
        file: 'autocomplete-final-test.js',
        timeout: 45000
    },
    {
        name: 'Live Execution',
        description: 'Tests live formula execution with error handling',
        file: 'live-execution-test.js',
        timeout: 60000
    },
    {
        name: 'Relationship Naming',
        description: 'Tests relationship naming convention (assigned_rep_id_rel.name)',
        file: 'relationship-naming-test.js',
        timeout: 45000
    },
    {
        name: 'Assigned Rep Debug',
        description: 'Debug tests for assigned rep relationship functionality',
        file: 'assigned-rep-debug.js',
        timeout: 30000
    },
    {
        name: 'Comprehensive WebApp',
        description: 'Comprehensive end-to-end webapp functionality tests',
        file: 'webapp-comprehensive.js',
        timeout: 90000
    }
];

class UnifiedTestRunner {
    constructor() {
        this.browser = null;
        this.context = null;
        this.results = [];
        this.screenshots = [];
    }

    async checkServerHealth() {
        console.log('🔍 Checking server health...');
        try {
            const response = await fetch('http://localhost:3000/health');
            if (!response.ok) {
                throw new Error('Server not responding correctly');
            }
            const data = await response.json();
            console.log(`✅ Server running: ${data.status} (${data.mode || 'unknown mode'})`);
            return true;
        } catch (error) {
            console.error('❌ Server not running at http://localhost:3000');
            console.error('   Please start the server with: npm run serve');
            return false;
        }
    }

    async setupBrowser() {
        console.log('🌐 Setting up shared browser context...');
        
        this.browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            ignoreHTTPSErrors: true
        });

        console.log('✅ Browser context ready');
    }

    async runTestSuite(suite) {
        const testFile = path.join(__dirname, suite.file);
        
        if (!fs.existsSync(testFile)) {
            console.log(`⚠️  Test file not found: ${suite.file}`);
            return { name: suite.name, passed: false, error: 'File not found' };
        }

        console.log(`\n${'='.repeat(80)}`);
        console.log(`🧪 Running: ${suite.name}`);
        console.log(`📄 Description: ${suite.description}`);
        console.log(`📁 File: ${suite.file}`);
        console.log(`⏱️  Timeout: ${suite.timeout}ms`);
        console.log(`${'='.repeat(80)}`);

        // For now, run as separate process since existing tests aren't modular
        // This ensures compatibility while still providing unified management
        return this.runFallbackTest(suite);
    }

    async runFallbackTest(suite) {
        // Run test as separate process for compatibility
        return new Promise(async (resolve) => {
            const { spawn } = await import('child_process');
            const testProcess = spawn('node', [path.join(__dirname, suite.file)], { 
                stdio: 'inherit'
            });
            
            // Set timeout
            const timeoutId = setTimeout(() => {
                testProcess.kill('SIGTERM');
                console.log(`⏰ ${suite.name} timed out after ${suite.timeout}ms`);
                resolve({ name: suite.name, passed: false, error: 'Timeout' });
            }, suite.timeout);
            
            testProcess.on('close', (code) => {
                clearTimeout(timeoutId);
                if (code === 0) {
                    console.log(`✅ ${suite.name} passed`);
                    resolve({ name: suite.name, passed: true });
                } else {
                    console.log(`❌ ${suite.name} failed (exit code: ${code})`);
                    resolve({ name: suite.name, passed: false, error: `Exit code: ${code}` });
                }
            });

            testProcess.on('error', (error) => {
                clearTimeout(timeoutId);
                console.error(`❌ ${suite.name} error:`, error.message);
                resolve({ name: suite.name, passed: false, error: error.message });
            });
        });
    }

    async cleanup() {
        if (this.context) {
            await this.context.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
        console.log('🧹 Browser cleanup completed');
    }

    printSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 PLAYWRIGHT TEST SUITE SUMMARY');
        console.log('='.repeat(80));

        const passed = this.results.filter(r => r.passed);
        const failed = this.results.filter(r => !r.passed);

        console.log(`\n✅ PASSED (${passed.length}):`);
        passed.forEach(test => {
            console.log(`   ✅ ${test.name}`);
        });

        if (failed.length > 0) {
            console.log(`\n❌ FAILED (${failed.length}):`);
            failed.forEach(test => {
                console.log(`   ❌ ${test.name}`);
                if (test.error) {
                    console.log(`      Error: ${test.error}`);
                }
            });
        }

        console.log(`\n📊 Screenshots: Available in tests/playwright/screenshots/`);
        console.log(`🔍 Debug files: Available in tests/playwright/debug/`);

        const successRate = Math.round((passed.length / this.results.length) * 100);
        const overallResult = failed.length === 0 ? 
            `✅ ALL TESTS PASSED (${successRate}%)` : 
            `❌ ${failed.length} TESTS FAILED (${successRate}% success rate)`;
        
        console.log(`\nOVERALL: ${overallResult}`);
        console.log(`� Total Tests: ${this.results.length}`);
        console.log('='.repeat(80));

        return failed.length === 0;
    }

    async run() {
        console.log('🚀 Starting Unified Playwright Test Suite');
        console.log('🎯 Running all Playwright tests with unified management');
        console.log('='.repeat(80));

        // Check server health
        if (!(await this.checkServerHealth())) {
            process.exit(1);
        }

        // Create output directories
        ['screenshots', 'debug'].forEach(dir => {
            const dirPath = path.join(__dirname, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`📁 Created directory: ${dirPath}`);
            }
        });

        // Run all test suites as separate processes for now (ensures compatibility)
        for (const suite of TEST_SUITES) {
            const result = await this.runTestSuite(suite);
            this.results.push(result);
        }

        // Print summary and exit
        const success = this.printSummary();
        process.exit(success ? 0 : 1);
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

// Run the test suite
const runner = new UnifiedTestRunner();
runner.run().catch(console.error);