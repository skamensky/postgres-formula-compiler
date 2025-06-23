import { chromium } from 'playwright';
import fs from 'fs';

async function testSchemaTabInitialLoad() {
    console.log('🗂️  Testing schema tab initial load issue...');
    
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
        throw error;
    });
    
    try {
        console.log('📖 Loading webapp...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for initialization...');
        await page.waitForTimeout(6000);
        
        // Step 1: Verify a table is auto-selected in compiler tab
        const tableSelect = page.locator('#tableSelect');
        const initialTable = await tableSelect.inputValue();
        console.log(`📋 Initial table selected: ${initialTable}`);
        
        if (!initialTable) {
            throw new Error('No table auto-selected on load');
        }
        
        // Step 2: Click schema tab WITHOUT changing table selection
        console.log('🗂️  Clicking schema tab directly (without changing table)...');
        await page.locator('[data-tab="schema"]').click();
        await page.waitForTimeout(1000);
        
        // Step 3: Check schema table selector value
        const schemaTableSelect = page.locator('#schemaTableSelect');
        const schemaSelectedTable = await schemaTableSelect.inputValue();
        console.log(`📋 Schema table selector value: "${schemaSelectedTable}"`);
        
        // Step 4: Check schema details content immediately
        const schemaDetails = page.locator('#schemaDetails');
        let detailsText = await schemaDetails.textContent();
        console.log(`📋 Initial schema details length: ${detailsText?.length || 0} characters`);
        console.log(`📋 Schema details preview: "${detailsText?.substring(0, 100)}..."`);
        
        const isStillPlaceholder = detailsText?.includes('Select a table to view');
        console.log(`📋 Still showing placeholder: ${isStillPlaceholder ? '❌ Yes' : '✅ No'}`);
        
        // Step 5: Wait a bit more to see if content loads delayed
        console.log('⏳ Waiting 3 more seconds to see if schema loads...');
        await page.waitForTimeout(3000);
        
        detailsText = await schemaDetails.textContent();
        console.log(`📋 After waiting - schema details length: ${detailsText?.length || 0} characters`);
        
        const stillPlaceholderAfterWait = detailsText?.includes('Select a table to view');
        console.log(`📋 Still placeholder after wait: ${stillPlaceholderAfterWait ? '❌ Yes' : '✅ No'}`);
        
        // Step 6: Test the fix - manually trigger schema loading if table is selected
        if (schemaSelectedTable && stillPlaceholderAfterWait) {
            console.log('🔧 Manually triggering schema load for selected table...');
            
            // Change to a different table and back to trigger the change event
            await schemaTableSelect.selectOption('');
            await page.waitForTimeout(500);
            await schemaTableSelect.selectOption(schemaSelectedTable);
            await page.waitForTimeout(2000);
            
            detailsText = await schemaDetails.textContent();
            console.log(`📋 After manual trigger - schema details length: ${detailsText?.length || 0} characters`);
            
            const fixedAfterManualTrigger = !detailsText?.includes('Select a table to view') && detailsText?.length > 200;
            console.log(`✅ Schema loaded after manual trigger: ${fixedAfterManualTrigger ? '✅ Yes' : '❌ No'}`);
        }
        
        // Take screenshot
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/schema-initial-load-test.png',
            fullPage: true 
        });
        console.log('📸 Screenshot saved: tests/playwright/screenshots/schema-initial-load-test.png');
        
        // Determine if test passed
        const testPassed = !stillPlaceholderAfterWait;
        
        if (testPassed) {
            console.log('✅ Schema tab initial load test PASSED!');
        } else {
            console.log('❌ Schema tab initial load test FAILED - reproducing the issue');
        }
        
        return {
            success: testPassed,
            initialTable: initialTable,
            schemaSelectedTable: schemaSelectedTable,
            detailsLength: detailsText?.length || 0,
            isPlaceholder: stillPlaceholderAfterWait
        };
        
    } catch (error) {
        console.error('❌ Schema initial load test failed:', error.message);
        
        // Save debug info
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/schema-initial-load-error.png',
            fullPage: true 
        });
        
        const html = await page.content();
        fs.writeFileSync('tests/playwright/debug/schema-initial-load-error.html', html);
        
        throw error;
    } finally {
        await browser.close();
    }
}

export { testSchemaTabInitialLoad };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testSchemaTabInitialLoad().catch(process.exit.bind(process, 1));
}