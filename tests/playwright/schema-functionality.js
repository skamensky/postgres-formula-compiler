import { chromium } from 'playwright';
import fs from 'fs';

async function testSchemaFunctionality() {
    console.log('🗂️  Starting schema functionality test...');
    
    const browser = await chromium.launch({ 
        headless: true,
        slowMo: 500  // Slower for better debugging
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Listen for console messages - especially errors
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        console.log(`🖥️  [${type.toUpperCase()}] ${text}`);
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        console.error('❌ Page Error:', error.message);
        console.error('   Stack:', error.stack);
    });
    
    // Listen for failed requests
    page.on('requestfailed', request => {
        console.error('❌ Request Failed:', request.url());
        console.error('   Failure:', request.failure()?.errorText);
    });
    
    try {
        console.log('📖 Loading webapp...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for full initialization...');
        await page.waitForTimeout(6000);
        
        // Step 1: Check if schema tab exists
        console.log('🔍 Checking for schema tab...');
        const schemaTab = page.locator('[data-tab="schema"]');
        const schemaTabExists = await schemaTab.count() > 0;
        console.log(`📋 Schema tab exists: ${schemaTabExists ? '✅ Yes' : '❌ No'}`);
        
        if (!schemaTabExists) {
            throw new Error('Schema tab not found!');
        }
        
        // Step 2: Click the schema tab
        console.log('🖱️  Clicking schema tab...');
        await schemaTab.click();
        await page.waitForTimeout(1000);
        
        // Step 3: Check if schema tab content is visible
        const schemaContent = page.locator('#schema');
        const schemaVisible = await schemaContent.isVisible();
        console.log(`👁️  Schema content visible: ${schemaVisible ? '✅ Yes' : '❌ No'}`);
        
        // Step 4: Check if schema table selector exists
        const schemaTableSelect = page.locator('#schemaTableSelect');
        const selectorExists = await schemaTableSelect.count() > 0;
        console.log(`🗃️  Schema table selector exists: ${selectorExists ? '✅ Yes' : '❌ No'}`);
        
        if (!selectorExists) {
            throw new Error('Schema table selector (#schemaTableSelect) not found!');
        }
        
        // Step 5: Check options in schema table selector
        const options = await schemaTableSelect.locator('option').count();
        console.log(`📊 Schema table selector options: ${options}`);
        
        if (options < 2) {
            console.warn('⚠️  Schema table selector has insufficient options');
        }
        
        // Step 6: Try selecting a table
        if (options > 1) {
            console.log('🗃️  Selecting first table...');
            await schemaTableSelect.selectOption({ index: 1 });
            await page.waitForTimeout(2000);
            
            // Check if schema details appeared
            const schemaDetails = page.locator('#schemaDetails');
            const detailsText = await schemaDetails.textContent();
            console.log(`📋 Schema details content: "${detailsText?.substring(0, 100)}..."`);
            
            // Check if it's still showing loading/placeholder
            if (detailsText?.includes('Select a table to view')) {
                console.error('❌ Schema details still showing placeholder text');
                console.error('   This indicates the table selection is not working');
                throw new Error('Schema table selection is not triggering content update');
            }
            
            // Check for specific schema elements
            const hasColumns = detailsText?.includes('column') || detailsText?.includes('Column');
            const hasRelationships = detailsText?.includes('relationship') || detailsText?.includes('Relationship');
            
            console.log(`📊 Schema shows columns: ${hasColumns ? '✅ Yes' : '❌ No'}`);
            console.log(`🔗 Schema shows relationships: ${hasRelationships ? '✅ Yes' : '❌ No'}`);
            
            if (!hasColumns && !hasRelationships) {
                console.error('❌ Schema details do not contain expected content');
                throw new Error('Schema content is not being populated correctly');
            }
        }
        
        console.log('✅ Schema functionality test completed');
        return true;
        
    } catch (error) {
        console.error('❌ Schema functionality test failed:', error.message);
        
        // Take a screenshot of the current state
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/schema-functionality-error.png',
            fullPage: true 
        });
        console.log('📸 Error screenshot saved to: tests/playwright/screenshots/schema-functionality-error.png');
        
        // Get current HTML for debugging
        const html = await page.content();
        fs.writeFileSync('tests/playwright/debug/schema-page-html.html', html);
        console.log('📄 Page HTML saved to: tests/playwright/debug/schema-page-html.html');
        
        throw error;
    } finally {
        await browser.close();
    }
}

export { testSchemaFunctionality };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testSchemaFunctionality().catch(process.exit.bind(process, 1));
}