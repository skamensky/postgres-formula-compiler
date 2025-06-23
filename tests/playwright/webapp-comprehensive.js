import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

class WebAppTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }

    async setup() {
        console.log('🚀 Setting up comprehensive webapp tests...');
        this.browser = await chromium.launch({ 
            headless: true,
            slowMo: 300
        });
        
        const context = await this.browser.newContext();
        this.page = await context.newPage();
        
        // Listen for console messages
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error') {
                console.log(`🖥️  [${type.toUpperCase()}] ${text}`);
            }
        });
        
        // Listen for page errors
        this.page.on('pageerror', error => {
            console.error('❌ Page Error:', error.message);
            this.results.failed.push(`Page Error: ${error.message}`);
        });
        
        // Listen for failed requests
        this.page.on('requestfailed', request => {
            console.error('❌ Request Failed:', request.url());
            this.results.failed.push(`Request Failed: ${request.url()}`);
        });
        
        console.log('📖 Loading webapp...');
        await this.page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for initialization...');
        await this.page.waitForTimeout(6000);
    }

    async testBasicElements() {
        console.log('\n🧪 Testing basic elements...');
        
        const elements = [
            { selector: 'h1', name: 'Main heading' },
            { selector: '#tableSelect', name: 'Table selector' },
            { selector: '#formulaInput', name: 'Formula input' },
            { selector: '#executeBtn', name: 'Execute button' },
            { selector: '#formulaResults', name: 'Results area' },
            { selector: '[data-tab="compiler"]', name: 'Compiler tab' },
            { selector: '[data-tab="schema"]', name: 'Schema tab' },
            { selector: '[data-tab="examples"]', name: 'Examples tab' }
        ];
        
        for (const element of elements) {
            try {
                const exists = await this.page.locator(element.selector).count() > 0;
                if (exists) {
                    console.log(`✅ ${element.name}: Found`);
                    this.results.passed.push(`${element.name} exists`);
                } else {
                    console.log(`❌ ${element.name}: Missing`);
                    this.results.failed.push(`${element.name} missing`);
                }
            } catch (error) {
                console.log(`❌ ${element.name}: Error - ${error.message}`);
                this.results.failed.push(`${element.name} error: ${error.message}`);
            }
        }
    }

    async testTableLoading() {
        console.log('\n🗃️  Testing table loading...');
        
        try {
            const tableSelect = this.page.locator('#tableSelect');
            const options = await tableSelect.locator('option').count();
            console.log(`📊 Table options found: ${options}`);
            
            if (options >= 2) {
                this.results.passed.push(`Table loading (${options} tables)`);
                
                // Get table names
                for (let i = 1; i < Math.min(options, 5); i++) {
                    const optionText = await tableSelect.locator('option').nth(i).textContent();
                    console.log(`   ${i}. ${optionText}`);
                }
            } else {
                this.results.failed.push('Insufficient table options loaded');
            }
        } catch (error) {
            console.log(`❌ Table loading error: ${error.message}`);
            this.results.failed.push(`Table loading error: ${error.message}`);
        }
    }

    async testSchemaFunctionality() {
        console.log('\n🗂️  Testing schema functionality...');
        
        try {
            // Click schema tab
            const schemaTab = this.page.locator('[data-tab="schema"]');
            await schemaTab.click();
            await this.page.waitForTimeout(1000);
            
            // Check if schema content is visible
            const schemaContent = this.page.locator('#schema');
            const visible = await schemaContent.isVisible();
            console.log(`👁️  Schema tab content visible: ${visible ? '✅ Yes' : '❌ No'}`);
            
            if (!visible) {
                this.results.failed.push('Schema tab content not visible');
                return;
            }
            
            // Check schema table selector
            const schemaTableSelect = this.page.locator('#schemaTableSelect');
            const selectorExists = await schemaTableSelect.count() > 0;
            console.log(`🗃️  Schema table selector: ${selectorExists ? '✅ Found' : '❌ Missing'}`);
            
            if (!selectorExists) {
                this.results.failed.push('Schema table selector missing');
                return;
            }
            
            // Check options in schema selector
            const schemaOptions = await schemaTableSelect.locator('option').count();
            console.log(`📊 Schema selector options: ${schemaOptions}`);
            
            if (schemaOptions < 2) {
                this.results.failed.push('Schema selector has no table options');
                return;
            }
            
            // Try selecting a table
            console.log('🗃️  Selecting table in schema...');
            await schemaTableSelect.selectOption({ index: 1 });
            const selectedTable = await schemaTableSelect.inputValue();
            console.log(`📋 Selected table: ${selectedTable}`);
            
            // Wait and check if schema details updated
            await this.page.waitForTimeout(3000);
            const schemaDetails = this.page.locator('#schemaDetails');
            const detailsText = await schemaDetails.textContent();
            console.log(`📋 Schema details length: ${detailsText?.length || 0} characters`);
            
            // Check if still showing placeholder
            if (detailsText?.includes('Select a table to view')) {
                console.log('❌ Schema still showing placeholder - selection not working');
                this.results.failed.push('Schema table selection not working');
                
                // Debug: Check if change event handler exists
                console.log('🔍 Debugging schema selector...');
                const hasChangeHandler = await this.page.evaluate(() => {
                    const selector = document.getElementById('schemaTableSelect');
                    return selector && selector.onchange !== null;
                });
                console.log(`🔧 Schema selector has change handler: ${hasChangeHandler ? '✅ Yes' : '❌ No'}`);
                
                if (!hasChangeHandler) {
                    this.results.failed.push('Schema selector missing change event handler');
                }
                
            } else if (detailsText?.length > 100) {
                console.log('✅ Schema details populated successfully');
                this.results.passed.push('Schema functionality working');
                
                // Check for expected content
                const hasColumns = detailsText.includes('column') || detailsText.includes('Column');
                const hasRelationships = detailsText.includes('relationship') || detailsText.includes('Relationship');
                console.log(`📊 Contains columns info: ${hasColumns ? '✅ Yes' : '❌ No'}`);
                console.log(`🔗 Contains relationships info: ${hasRelationships ? '✅ Yes' : '❌ No'}`);
                
                if (!hasColumns) this.results.warnings.push('Schema missing column information');
                if (!hasRelationships) this.results.warnings.push('Schema missing relationship information');
                
            } else {
                console.log('⚠️  Schema details updated but content seems insufficient');
                this.results.warnings.push('Schema content insufficient');
            }
            
        } catch (error) {
            console.log(`❌ Schema functionality error: ${error.message}`);
            this.results.failed.push(`Schema functionality error: ${error.message}`);
        }
    }

    async testFormulaExecution() {
        console.log('\n🧮 Testing formula execution...');
        
        try {
            // Go back to compiler tab
            await this.page.locator('[data-tab="compiler"]').click();
            await this.page.waitForTimeout(500);
            
            // Select a table
            const tableSelect = this.page.locator('#tableSelect');
            await tableSelect.selectOption({ index: 1 });
            const selectedTable = await tableSelect.inputValue();
            console.log(`📋 Selected table for formula: ${selectedTable}`);
            
            // Check if we're in live mode and need to toggle to manual mode
            const toggleBtn = this.page.locator('#toggleLiveBtn');
            const executeBtn = this.page.locator('#executeBtn');
            
            const toggleText = await toggleBtn.textContent();
            const executeBtnVisible = await executeBtn.isVisible();
            
            console.log(`🔄 Current mode: ${toggleText}`);
            console.log(`🔘 Execute button visible: ${executeBtnVisible}`);
            
            // If in live mode (execute button not visible), toggle to manual mode
            if (!executeBtnVisible && toggleText.includes('ON')) {
                console.log('🔄 Switching to manual mode for testing...');
                await toggleBtn.click();
                await this.page.waitForTimeout(500);
                
                const newToggleText = await toggleBtn.textContent();
                const newExecuteBtnVisible = await executeBtn.isVisible();
                console.log(`🔄 After toggle: ${newToggleText}, Execute visible: ${newExecuteBtnVisible}`);
                
                if (!newExecuteBtnVisible) {
                    console.log('❌ Failed to switch to manual mode');
                    this.results.failed.push('Could not switch to manual mode');
                    return;
                }
            }
            
            // Enter a simple formula
            const formula = 'UPPER("test")';
            await this.page.fill('#formulaInput', formula);
            console.log(`✏️  Entered formula: ${formula}`);
            
            // Click execute
            await this.page.click('#executeBtn');
            console.log('🖱️  Clicked execute button');
            
            // Wait for result
            await this.page.waitForTimeout(3000);
            
            const results = this.page.locator('#formulaResults');
            const resultText = await results.textContent();
            console.log(`📋 Result length: ${resultText?.length || 0} characters`);
            
            if (resultText?.includes('successfully') || resultText?.includes('TEST')) {
                console.log('✅ Formula executed successfully');
                this.results.passed.push('Formula execution working');
                
                if (resultText.includes('SELECT')) {
                    console.log('✅ SQL generation working');
                    this.results.passed.push('SQL generation working');
                }
            } else if (resultText?.includes('Error')) {
                console.log('❌ Formula execution failed with error');
                console.log(`📋 Error details: ${resultText}`);
                this.results.failed.push('Formula execution failed');
            } else {
                console.log('⚠️  Formula execution result unclear');
                console.log(`📋 Result preview: ${resultText?.substring(0, 200)}...`);
                this.results.warnings.push('Formula execution result unclear');
            }
            
        } catch (error) {
            console.log(`❌ Formula execution error: ${error.message}`);
            this.results.failed.push(`Formula execution error: ${error.message}`);
        }
    }

    async testExamplesTab() {
        console.log('\n📝 Testing examples tab...');
        
        try {
            // Click examples tab
            await this.page.locator('[data-tab="examples"]').click();
            await this.page.waitForTimeout(1000);
            
            const examplesContent = this.page.locator('#examples');
            const visible = await examplesContent.isVisible();
            console.log(`👁️  Examples content visible: ${visible ? '✅ Yes' : '❌ No'}`);
            
            if (visible) {
                const examplesList = this.page.locator('#examplesList');
                const listText = await examplesList.textContent();
                
                if (listText?.includes('Example Formulas') || listText?.length > 50) {
                    console.log('✅ Examples content loaded');
                    this.results.passed.push('Examples tab working');
                } else {
                    console.log('⚠️  Examples content minimal');
                    this.results.warnings.push('Examples content minimal');
                }
            } else {
                this.results.failed.push('Examples tab content not visible');
            }
            
        } catch (error) {
            console.log(`❌ Examples tab error: ${error.message}`);
            this.results.failed.push(`Examples tab error: ${error.message}`);
        }
    }

    async takeScreenshots() {
        console.log('\n📸 Taking screenshots...');
        
        const screenshots = [
            { tab: 'compiler', name: 'compiler-tab' },
            { tab: 'schema', name: 'schema-tab' },
            { tab: 'examples', name: 'examples-tab' }
        ];
        
        for (const shot of screenshots) {
            try {
                await this.page.locator(`[data-tab="${shot.tab}"]`).click();
                await this.page.waitForTimeout(1000);
                
                const filename = `tests/playwright/screenshots/${shot.name}.png`;
                await this.page.screenshot({ path: filename, fullPage: true });
                console.log(`📸 Screenshot saved: ${filename}`);
            } catch (error) {
                console.log(`❌ Screenshot error for ${shot.name}: ${error.message}`);
            }
        }
    }

    async saveDebugInfo() {
        console.log('\n🔍 Saving debug information...');
        
        try {
            // Save HTML
            const html = await this.page.content();
            fs.writeFileSync('tests/playwright/debug/page-html.html', html);
            console.log('📄 Page HTML saved to: tests/playwright/debug/page-html.html');
            
            // Save console logs would require more setup
            
        } catch (error) {
            console.log(`❌ Debug info error: ${error.message}`);
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE TEST SUMMARY');
        console.log('='.repeat(60));
        
        console.log(`\n✅ PASSED (${this.results.passed.length}):`);
        this.results.passed.forEach(item => console.log(`   ✅ ${item}`));
        
        console.log(`\n❌ FAILED (${this.results.failed.length}):`);
        this.results.failed.forEach(item => console.log(`   ❌ ${item}`));
        
        console.log(`\n⚠️  WARNINGS (${this.results.warnings.length}):`);
        this.results.warnings.forEach(item => console.log(`   ⚠️  ${item}`));
        
        console.log(`\nOVERALL: ${this.results.failed.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
        console.log('='.repeat(60));
        
        return this.results.failed.length === 0;
    }
}

async function runComprehensiveTests() {
    const tester = new WebAppTester();
    
    try {
        await tester.setup();
        
        await tester.testBasicElements();
        await tester.testTableLoading();
        await tester.testSchemaFunctionality();
        await tester.testFormulaExecution();
        await tester.testExamplesTab();
        
        await tester.takeScreenshots();
        await tester.saveDebugInfo();
        
        const success = tester.printSummary();
        
        if (!success) {
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
        tester.results.failed.push(`Test suite error: ${error.message}`);
        tester.printSummary();
        process.exit(1);
    } finally {
        await tester.cleanup();
    }
}

export { WebAppTester, runComprehensiveTests };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runComprehensiveTests();
}