#!/usr/bin/env node

/**
 * Unified Playwright Test Runner
 * Runs all Playwright tests with configurable parallelization for efficiency
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
    // Concurrency level (number of tests to run in parallel)
    // 1 = sequential, 2 = reasonable for most computers, 3+ = high-end only
    maxConcurrency: parseInt(process.env.PLAYWRIGHT_CONCURRENCY) || 2,
    
    // Auto-detect based on system resources (recommended)
    autoDetectConcurrency: true
};

// Test suite configuration - STREAMLINED after cleanup
const TEST_SUITES = [
    {
        name: 'Basic Loading',
        description: 'Tests basic webapp loading and health checks',
        file: 'basic-loading.js',
        timeout: 30000,
        priority: 1 // Higher priority tests run first
    },
    {
        name: 'Schema Functionality', 
        description: 'Tests schema tab loading and table information display',
        file: 'schema-functionality.js',
        timeout: 45000,
        priority: 2
    },
    {
        name: 'Examples Functionality',
        description: 'Tests formula examples loading and execution',
        file: 'examples-functionality.js',
        timeout: 45000,
        priority: 1
    },
    {
        name: 'Autocomplete Final',
        description: 'Tests autocomplete functionality with Tab key support',
        file: 'autocomplete-final-test.js',
        timeout: 45000,
        priority: 1
    },
    {
        name: 'Example Loading',
        description: 'Tests example formula loading into Monaco editor',
        file: 'example-loading-test.js',
        timeout: 45000,
        priority: 2
    },
    {
        name: 'Relationship Navigation',
        description: 'Tests relationship navigation (assigned_rep_id_rel.name)',
        file: 'relationship-navigation-test.js',
        timeout: 45000,
        priority: 1
    },
    {
        name: 'Comprehensive WebApp',
        description: 'Comprehensive end-to-end webapp functionality tests',
        file: 'webapp-comprehensive.js',
        timeout: 90000,
        priority: 1 // Run this important test early
    }
];

class UnifiedTestRunner {
    constructor() {
        this.browser = null;
        this.context = null;
        this.results = [];
        this.screenshots = [];
        this.runningTests = new Set();
        this.concurrency = null; // Will be set in run()
    }

    async determineConcurrency() {
        if (!CONFIG.autoDetectConcurrency) {
            return CONFIG.maxConcurrency;
        }

        // Auto-detect based on available resources
        const os = await import('os');
        const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
        const cpuCores = os.cpus().length;
        
        let recommendedConcurrency;
        
        if (totalMemoryGB >= 32 && cpuCores >= 8) {
            recommendedConcurrency = 3; // Very high-end machine
        } else if (totalMemoryGB >= 16 && cpuCores >= 6) {
            recommendedConcurrency = 2; // High-end machine
        } else if (totalMemoryGB >= 8 && cpuCores >= 4) {
            recommendedConcurrency = 2; // Mid-range machine
        } else {
            recommendedConcurrency = 1; // Conservative for lower resources
        }

        const finalConcurrency = Math.min(recommendedConcurrency, CONFIG.maxConcurrency);
        
        console.log(`🖥️  System: ${totalMemoryGB.toFixed(1)}GB RAM, ${cpuCores} cores`);
        console.log(`⚡ Auto-detected concurrency: ${finalConcurrency} (max: ${CONFIG.maxConcurrency})`);
        
        return finalConcurrency;
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

    async runTestSuite(suite) {
        const testFile = path.join(__dirname, suite.file);
        
        if (!fs.existsSync(testFile)) {
            console.log(`⚠️  Test file not found: ${suite.file}`);
            return { name: suite.name, passed: false, error: 'File not found' };
        }

        const startTime = Date.now();
        console.log(`\n🧪 Starting: ${suite.name} (Priority: ${suite.priority})`);
        console.log(`📄 ${suite.description}`);

        // Run test as separate process for compatibility
        return new Promise(async (resolve) => {
            const { spawn } = await import('child_process');
            const testProcess = spawn('node', [path.join(__dirname, suite.file)], { 
                stdio: this.concurrency === 1 ? 'inherit' : 'pipe' // Only show output if sequential
            });
            
            let output = '';
            if (this.concurrency > 1) {
                // Capture output for parallel execution
                testProcess.stdout?.on('data', (data) => output += data.toString());
                testProcess.stderr?.on('data', (data) => output += data.toString());
            }
            
            // Set timeout
            const timeoutId = setTimeout(() => {
                testProcess.kill('SIGTERM');
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`⏰ ${suite.name} timed out after ${suite.timeout}ms (${duration}s)`);
                resolve({ name: suite.name, passed: false, error: 'Timeout', duration });
            }, suite.timeout);
            
            testProcess.on('close', (code) => {
                clearTimeout(timeoutId);
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                
                if (code === 0) {
                    console.log(`✅ ${suite.name} passed (${duration}s)`);
                    resolve({ name: suite.name, passed: true, duration, output });
                } else {
                    console.log(`❌ ${suite.name} failed (${duration}s, exit code: ${code})`);
                    if (this.concurrency > 1 && output) {
                        console.log(`📄 Output for ${suite.name}:`);
                        console.log(output);
                    }
                    resolve({ name: suite.name, passed: false, error: `Exit code: ${code}`, duration, output });
                }
            });

            testProcess.on('error', (error) => {
                clearTimeout(timeoutId);
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                console.error(`❌ ${suite.name} error (${duration}s):`, error.message);
                resolve({ name: suite.name, passed: false, error: error.message, duration });
            });
        });
    }

    async runTestsInParallel() {
        // Sort tests by priority (higher priority first)
        const sortedTests = [...TEST_SUITES].sort((a, b) => a.priority - b.priority);
        
        const results = [];
        const queue = [...sortedTests];
        const running = [];

        console.log(`🚀 Running tests with concurrency: ${this.concurrency}`);
        console.log(`📋 Test execution order (by priority):`);
        sortedTests.forEach((test, i) => {
            console.log(`   ${i + 1}. ${test.name} (Priority: ${test.priority}, ${test.timeout/1000}s timeout)`);
        });

        while (queue.length > 0 || running.length > 0) {
            // Start new tests up to concurrency limit
            while (running.length < this.concurrency && queue.length > 0) {
                const suite = queue.shift();
                const testPromise = this.runTestSuite(suite);
                running.push({ suite, promise: testPromise });
            }

            // Wait for at least one test to complete
            if (running.length > 0) {
                const completed = await Promise.race(running.map(r => r.promise));
                const completedIndex = running.findIndex(r => r.promise === Promise.resolve(completed));
                
                if (completedIndex >= 0) {
                    results.push(completed);
                    running.splice(completedIndex, 1);
                }
            }
        }

        return results;
    }

    printSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 PLAYWRIGHT TEST SUITE SUMMARY');
        console.log('='.repeat(80));

        const passed = this.results.filter(r => r.passed);
        const failed = this.results.filter(r => !r.passed);
        const totalDuration = this.results.reduce((sum, r) => sum + (parseFloat(r.duration) || 0), 0);

        console.log(`\n✅ PASSED (${passed.length}):`);
        passed.forEach(test => {
            const duration = test.duration ? ` (${test.duration}s)` : '';
            console.log(`   ✅ ${test.name}${duration}`);
        });

        if (failed.length > 0) {
            console.log(`\n❌ FAILED (${failed.length}):`);
            failed.forEach(test => {
                const duration = test.duration ? ` (${test.duration}s)` : '';
                console.log(`   ❌ ${test.name}${duration}`);
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
        console.log(`📊 Total Tests: ${this.results.length}`);
        console.log(`⏱️  Total Duration: ${totalDuration.toFixed(1)}s`);
        console.log(`⚡ Concurrency: ${this.concurrency} parallel tests`);
        console.log('='.repeat(80));

        return failed.length === 0;
    }

    async run() {
        console.log('🚀 Starting Unified Playwright Test Suite');
        console.log('🎯 Running tests with smart parallelization');
        console.log('='.repeat(80));

        // Determine concurrency
        this.concurrency = await this.determineConcurrency();

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

        // Run tests (parallel or sequential based on concurrency)
        if (this.concurrency === 1) {
            // Sequential execution
            for (const suite of TEST_SUITES) {
                const result = await this.runTestSuite(suite);
                this.results.push(result);
            }
        } else {
            // Parallel execution
            this.results = await this.runTestsInParallel();
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