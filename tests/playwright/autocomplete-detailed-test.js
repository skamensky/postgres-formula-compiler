import { chromium } from 'playwright';
import fs from 'fs';

async function testAutocompleteFunctionality() {
    console.log('💭 Testing detailed autocomplete functionality...');
    
    const browser = await chromium.launch({ 
        headless: true,
        slowMo: 300
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        console.log(`🖥️  [${type.toUpperCase()}] ${text}`);
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        console.error('❌ Page Error:', error.message);
    });
    
    try {
        console.log('📖 Loading webapp...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for initialization...');
        await page.waitForTimeout(6000);
        
        const formulaInput = page.locator('#formulaInput');
        
        // Test 1: Function completions
        console.log('\n🔍 Testing function completions...');
        await formulaInput.clear();
        await formulaInput.type('SU');
        await page.waitForTimeout(500);
        
        const autocompleteDropdown = page.locator('.autocomplete-dropdown');
        const hasFunctionAutocomplete = await autocompleteDropdown.count() > 0;
        console.log(`Function autocomplete visible: ${hasFunctionAutocomplete ? '✅ Yes' : '❌ No'}`);
        
        if (hasFunctionAutocomplete) {
            const suggestions = await autocompleteDropdown.locator('.autocomplete-item').count();
            console.log(`Function suggestions: ${suggestions}`);
            
            // Check for function icons
            const functionIcons = await autocompleteDropdown.locator('.completion-icon:has-text("𝑓")').count();
            console.log(`Function icons: ${functionIcons}`);
        }
        
        // Test 2: Field/Column completions  
        console.log('\n📋 Testing field/column completions...');
        await formulaInput.clear();
        await formulaInput.type('pr');  // Should match 'price' column
        await page.waitForTimeout(500);
        
        const hasFieldAutocomplete = await autocompleteDropdown.count() > 0;
        console.log(`Field autocomplete visible: ${hasFieldAutocomplete ? '✅ Yes' : '❌ No'}`);
        
        if (hasFieldAutocomplete) {
            const suggestions = await autocompleteDropdown.locator('.autocomplete-item').count();
            console.log(`Field suggestions: ${suggestions}`);
            
            // Check for field icons
            const fieldIcons = await autocompleteDropdown.locator('.completion-icon:has-text("📄")').count();
            console.log(`Field icons: ${fieldIcons}`);
            
            // Look for specific field names
            const suggestionTexts = await autocompleteDropdown.locator('.completion-label').allTextContents();
            const hasPrice = suggestionTexts.some(text => text.toLowerCase().includes('price'));
            console.log(`Has 'price' field: ${hasPrice ? '✅ Yes' : '❌ No'}`);
            console.log(`Field suggestions: ${suggestionTexts.filter(t => t.toLowerCase().includes('pr')).join(', ')}`);
        }
        
        // Test 3: Relationship completions
        console.log('\n🔗 Testing relationship completions...');
        await formulaInput.clear();
        await formulaInput.type('cu');  // Should match customer relationships
        await page.waitForTimeout(500);
        
        const hasRelAutocomplete = await autocompleteDropdown.count() > 0;
        console.log(`Relationship autocomplete visible: ${hasRelAutocomplete ? '✅ Yes' : '❌ No'}`);
        
        if (hasRelAutocomplete) {
            const suggestions = await autocompleteDropdown.locator('.autocomplete-item').count();
            console.log(`Relationship suggestions: ${suggestions}`);
            
            // Check for relationship icons
            const relIcons = await autocompleteDropdown.locator('.completion-icon:has-text("🔗")').count();
            console.log(`Relationship icons: ${relIcons}`);
            
            // Look for relationship names
            const suggestionTexts = await autocompleteDropdown.locator('.completion-label').allTextContents();
            const hasCustomerRel = suggestionTexts.some(text => text.toLowerCase().includes('customer'));
            console.log(`Has customer relationship: ${hasCustomerRel ? '✅ Yes' : '❌ No'}`);
            console.log(`Relationship suggestions: ${suggestionTexts.filter(t => t.toLowerCase().includes('cu')).join(', ')}`);
        }
        
        // Test 4: Tab completion
        console.log('\n⌨️  Testing Tab completion...');
        await formulaInput.clear();
        await formulaInput.type('pr');
        await page.waitForTimeout(500);
        
        // Press Tab to complete
        await formulaInput.press('Tab');
        await page.waitForTimeout(500);
        
        const completedValue = await formulaInput.inputValue();
        const wasCompleted = completedValue.length > 2 && completedValue !== 'pr';
        console.log(`Tab completion worked: ${wasCompleted ? '✅ Yes' : '❌ No'}`);
        console.log(`Completed to: "${completedValue}"`);
        
        // Test 5: Mixed context (function with field parameter)
        console.log('\n🔀 Testing mixed context (function with field)...');
        await formulaInput.clear();
        await formulaInput.type('SUM(pr');
        await page.waitForTimeout(500);
        
        const hasMixedAutocomplete = await autocompleteDropdown.count() > 0;
        console.log(`Mixed context autocomplete visible: ${hasMixedAutocomplete ? '✅ Yes' : '❌ No'}`);
        
        if (hasMixedAutocomplete) {
            const suggestionTexts = await autocompleteDropdown.locator('.completion-label').allTextContents();
            const hasFieldInFunction = suggestionTexts.some(text => text.toLowerCase().includes('price'));
            console.log(`Has field in function context: ${hasFieldInFunction ? '✅ Yes' : '❌ No'}`);
        }
        
        // Test 6: Check schema availability
        console.log('\n🗂️  Testing schema availability...');
        const schemaAvailable = await page.evaluate(() => {
            return window.developerToolsClient && window.developerToolsClient.currentSchema;
        });
        console.log(`Schema available in client: ${schemaAvailable ? '✅ Yes' : '❌ No'}`);
        
        if (schemaAvailable) {
            const schemaInfo = await page.evaluate(() => {
                const schema = window.developerToolsClient.currentSchema;
                const tableNames = Object.keys(schema.tables || {});
                const customerColumns = schema.tables?.customer?.columns?.length || 0;
                return { tableNames, customerColumns };
            });
            console.log(`Schema tables: ${schemaInfo.tableNames.join(', ')}`);
            console.log(`Customer table columns: ${schemaInfo.customerColumns}`);
        }
        
        // Take screenshot
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/autocomplete-detailed-test.png',
            fullPage: true 
        });
        
        // Summary
        const tests = [
            { name: 'Function Autocomplete', passed: hasFunctionAutocomplete },
            { name: 'Field Autocomplete', passed: hasFieldAutocomplete },
            { name: 'Relationship Autocomplete', passed: hasRelAutocomplete },
            { name: 'Tab Completion', passed: wasCompleted },
            { name: 'Mixed Context', passed: hasMixedAutocomplete },
            { name: 'Schema Available', passed: schemaAvailable }
        ];
        
        const passed = tests.filter(t => t.passed).length;
        const total = tests.length;
        
        console.log('\n📊 Detailed Autocomplete Test Results:');
        tests.forEach(test => {
            console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}`);
        });
        console.log(`\n🏆 Overall Score: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
        
        return {
            success: passed === total,
            score: `${passed}/${total}`,
            details: tests
        };
        
    } catch (error) {
        console.error('❌ Autocomplete detailed test failed:', error.message);
        
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/autocomplete-detailed-error.png',
            fullPage: true 
        });
        
        return {
            success: false,
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

export { testAutocompleteFunctionality };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testAutocompleteFunctionality().catch(process.exit.bind(process, 1));
}