import { chromium } from 'playwright';
import fs from 'fs';

async function testAutocompleteFinal() {
    console.log('🎯 Final comprehensive autocomplete test...');
    
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
    
    try {
        console.log('📖 Loading webapp...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for initialization...');
        await page.waitForTimeout(6000);
        
        const formulaInput = page.locator('#formulaInput');
        const tableSelect = page.locator('#tableSelect');
        const autocompleteDropdown = page.locator('.autocomplete-dropdown');
        
        // Test 1: Customer table - preferred fields (pr)
        console.log('\n📋 Test 1: Customer table - "pr" fields...');
        await tableSelect.selectOption('customer');
        await page.waitForTimeout(500);
        
        await formulaInput.clear();
        await formulaInput.type('pr');
        await page.waitForTimeout(500);
        
        const customerAutocomplete = await autocompleteDropdown.count() > 0;
        console.log(`Customer "pr" autocomplete: ${customerAutocomplete ? '✅ Yes' : '❌ No'}`);
        
        if (customerAutocomplete) {
            const suggestions = await autocompleteDropdown.locator('.completion-label').allTextContents();
            const hasPreferredBedrooms = suggestions.some(s => s.includes('preferred_bedrooms'));
            const hasPreferredBathrooms = suggestions.some(s => s.includes('preferred_bathrooms'));
            console.log(`  Has preferred_bedrooms: ${hasPreferredBedrooms ? '✅ Yes' : '❌ No'}`);
            console.log(`  Has preferred_bathrooms: ${hasPreferredBathrooms ? '✅ Yes' : '❌ No'}`);
            console.log(`  Customer suggestions: ${suggestions.filter(s => s.toLowerCase().includes('pr')).join(', ')}`);
        }
        
        // Test 2: Listing table - price field (pr)
        console.log('\n🏠 Test 2: Listing table - "pr" fields...');
        await tableSelect.selectOption('listing');
        await page.waitForTimeout(1000); // Wait for table context update
        
        await formulaInput.clear();
        await formulaInput.type('pr');
        await page.waitForTimeout(500);
        
        const listingAutocomplete = await autocompleteDropdown.count() > 0;
        console.log(`Listing "pr" autocomplete: ${listingAutocomplete ? '✅ Yes' : '❌ No'}`);
        
        if (listingAutocomplete) {
            const suggestions = await autocompleteDropdown.locator('.completion-label').allTextContents();
            const hasListingPrice = suggestions.some(s => s.includes('listing_price'));
            const hasPropertyType = suggestions.some(s => s.includes('property_type'));
            console.log(`  Has listing_price: ${hasListingPrice ? '✅ Yes' : '❌ No'}`);
            console.log(`  Has property_type: ${hasPropertyType ? '✅ Yes' : '❌ No'}`);
            console.log(`  Listing suggestions: ${suggestions.filter(s => s.toLowerCase().includes('pr')).join(', ')}`);
        }
        
        // Test 3: Tab completion with listing_price
        console.log('\n⌨️  Test 3: Tab completion...');
        await formulaInput.clear();
        await formulaInput.type('listing_pr');
        await page.waitForTimeout(500);
        
        // Press Tab to complete
        await formulaInput.press('Tab');
        await page.waitForTimeout(500);
        
        const completedValue = await formulaInput.inputValue();
        const tabWorked = completedValue.includes('listing_price');
        console.log(`Tab completion: ${tabWorked ? '✅ Yes' : '❌ No'}`);
        console.log(`Completed to: "${completedValue}"`);
        
        // Test 4: Function completions
        console.log('\n🔍 Test 4: Function completions...');
        await formulaInput.clear();
        await formulaInput.type('SU');
        await page.waitForTimeout(500);
        
        const hasFunctionAutocomplete = await autocompleteDropdown.count() > 0;
        if (hasFunctionAutocomplete) {
            const suggestions = await autocompleteDropdown.locator('.completion-label').allTextContents();
            const hasSUM = suggestions.some(s => s === 'SUM');
            const hasSUBSTR = suggestions.some(s => s === 'SUBSTR');
            console.log(`Function autocomplete: ✅ Yes`);
            console.log(`  Has SUM: ${hasSUM ? '✅ Yes' : '❌ No'}`);
            console.log(`  Has SUBSTR: ${hasSUBSTR ? '✅ Yes' : '❌ No'}`);
            console.log(`  Function suggestions: ${suggestions.filter(s => s.startsWith('SU')).join(', ')}`);
        } else {
            console.log(`Function autocomplete: ❌ No`);
        }
        
        // Test 5: Mixed context - function with field
        console.log('\n🔀 Test 5: Mixed context (SUM with field)...');
        await formulaInput.clear();
        await formulaInput.type('SUM(listing_pr');
        await page.waitForTimeout(500);
        
        const hasMixedAutocomplete = await autocompleteDropdown.count() > 0;
        if (hasMixedAutocomplete) {
            const suggestions = await autocompleteDropdown.locator('.completion-label').allTextContents();
            const hasListingPriceInFunction = suggestions.some(s => s.includes('listing_price'));
            console.log(`Mixed context autocomplete: ✅ Yes`);
            console.log(`  Has listing_price in function: ${hasListingPriceInFunction ? '✅ Yes' : '❌ No'}`);
        } else {
            console.log(`Mixed context autocomplete: ❌ No`);
        }
        
        // Test 6: Relationships 
        console.log('\n🔗 Test 6: Relationship completions...');
        await tableSelect.selectOption('opportunity');
        await page.waitForTimeout(1000);
        
        await formulaInput.clear();
        await formulaInput.type('cu');
        await page.waitForTimeout(500);
        
        const hasRelAutocomplete = await autocompleteDropdown.count() > 0;
        if (hasRelAutocomplete) {
            const suggestions = await autocompleteDropdown.locator('.completion-label').allTextContents();
            const hasCustomerRel = suggestions.some(s => s.includes('customer'));
            console.log(`Relationship autocomplete: ✅ Yes`);
            console.log(`  Has customer relationship: ${hasCustomerRel ? '✅ Yes' : '❌ No'}`);
            console.log(`  Relationship suggestions: ${suggestions.filter(s => s.toLowerCase().includes('cu')).join(', ')}`);
        } else {
            console.log(`Relationship autocomplete: ❌ No`);
        }
        
        // Take screenshot
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/autocomplete-final-test.png',
            fullPage: true 
        });
        
        // Summary
        const tests = [
            { name: 'Customer Fields', passed: customerAutocomplete },
            { name: 'Listing Fields', passed: listingAutocomplete },
            { name: 'Tab Completion', passed: tabWorked },
            { name: 'Function Completions', passed: hasFunctionAutocomplete },
            { name: 'Mixed Context', passed: hasMixedAutocomplete },
            { name: 'Relationships', passed: hasRelAutocomplete }
        ];
        
        const passed = tests.filter(t => t.passed).length;
        const total = tests.length;
        
        console.log('\n📊 Final Autocomplete Test Results:');
        tests.forEach(test => {
            console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}`);
        });
        console.log(`\n🏆 Overall Score: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
        
        if (passed === total) {
            console.log('🎉 ALL AUTOCOMPLETE FEATURES WORKING!');
        }
        
        return {
            success: passed === total,
            score: `${passed}/${total}`,
            details: tests,
            tabCompletion: tabWorked
        };
        
    } catch (error) {
        console.error('❌ Final autocomplete test failed:', error.message);
        
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/autocomplete-final-error.png',
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

export { testAutocompleteFinal };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testAutocompleteFinal().catch(process.exit.bind(process, 1));
}