import { chromium } from 'playwright';
import fs from 'fs';

async function testExamplesFunctionality() {
    console.log('📝 Testing examples functionality...');
    
    const browser = await chromium.launch({ 
        headless: true,
        slowMo: 500
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.log(`🖥️  [${type.toUpperCase()}] ${text}`);
        }
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
        
        // Step 1: Click examples tab
        console.log('📝 Clicking examples tab...');
        await page.locator('[data-tab="examples"]').click();
        await page.waitForTimeout(2000);
        
        // Step 2: Check if examples loaded
        const examplesContent = page.locator('#examples');
        const isVisible = await examplesContent.isVisible();
        console.log(`👁️  Examples content visible: ${isVisible ? '✅ Yes' : '❌ No'}`);
        
        if (!isVisible) {
            throw new Error('Examples tab content not visible');
        }
        
        // Step 3: Check for examples statistics
        const statsElements = await page.locator('.stat-item').count();
        console.log(`📊 Statistics elements found: ${statsElements}`);
        
        if (statsElements < 2) {
            throw new Error('Examples statistics not loaded');
        }
        
        // Step 4: Get statistics text
        const statsText = await page.locator('.examples-stats').textContent();
        console.log(`📊 Statistics: ${statsText}`);
        
        // Step 5: Check for example cards
        const exampleCards = await page.locator('.example-card').count();
        console.log(`🃏 Example cards found: ${exampleCards}`);
        
        if (exampleCards === 0) {
            throw new Error('No example cards found');
        }
        
        // Step 6: Check for table groups in accordion
        const tableGroups = await page.locator('.examples-table-group').count();
        console.log(`📋 Table groups found: ${tableGroups}`);
        
        if (tableGroups === 0) {
            throw new Error('No table groups found in accordion');
        }
        
        // Step 7: Test clicking a table group to expand
        console.log('🖱️  Testing table group expansion...');
        const firstTableHeader = page.locator('.examples-table-header').first();
        await firstTableHeader.click();
        await page.waitForTimeout(1000);
        
        // Check if content expanded
        const expandedContent = await page.locator('.examples-table-content').first().isVisible();
        console.log(`📂 Table group expanded: ${expandedContent ? '✅ Yes' : '❌ No'}`);
        
        // Step 8: Test clicking an example card
        console.log('🃏 Testing example card click...');
        const firstExampleCard = page.locator('.example-card').first();
        
        // Get the example title before clicking
        const exampleTitle = await firstExampleCard.locator('.example-title').textContent();
        console.log(`📝 Clicking example: "${exampleTitle}"`);
        
        await firstExampleCard.click();
        await page.waitForTimeout(3000);
        
        // Step 9: Verify we switched to compiler tab
        const compilerTab = page.locator('#compiler');
        const compilerVisible = await compilerTab.isVisible();
        console.log(`📊 Switched to compiler tab: ${compilerVisible ? '✅ Yes' : '❌ No'}`);
        
        if (!compilerVisible) {
            throw new Error('Did not switch to compiler tab after clicking example');
        }
        
        // Step 10: Check if formula was populated
        const formulaInput = page.locator('#formulaInput');
        const formulaValue = await formulaInput.inputValue();
        console.log(`📝 Formula populated: ${formulaValue.length > 0 ? '✅ Yes' : '❌ No'} (${formulaValue.length} chars)`);
        
        if (formulaValue.length === 0) {
            throw new Error('Formula was not populated in the input');
        }
        
        // Step 11: Check if table was set
        const tableSelect = page.locator('#tableSelect');
        const selectedTable = await tableSelect.inputValue();
        console.log(`📋 Table selected: ${selectedTable}`);
        
        if (!selectedTable) {
            throw new Error('Table was not selected');
        }
        
        // Step 12: Check if formula executed (should see results)
        const resultsArea = page.locator('#formulaResults');
        const resultsText = await resultsArea.textContent();
        console.log(`📊 Results generated: ${resultsText.length > 0 ? '✅ Yes' : '❌ No'} (${resultsText.length} chars)`);
        
        const hasSuccessResult = resultsText.includes('successfully') || resultsText.includes('SELECT');
        console.log(`✅ Formula executed successfully: ${hasSuccessResult ? '✅ Yes' : '❌ No'}`);
        
        // Step 13: Test table filtering in examples
        console.log('🗃️  Testing table filtering...');
        
        // Go back to examples tab
        await page.locator('[data-tab="examples"]').click();
        await page.waitForTimeout(1000);
        
        // Change table selection
        await page.locator('[data-tab="compiler"]').click();
        await page.waitForTimeout(500);
        
        // Select customer table
        await tableSelect.selectOption('customer');
        await page.waitForTimeout(500);
        
        // Go back to examples
        await page.locator('[data-tab="examples"]').click();
        await page.waitForTimeout(2000);
        
        // Check for customer-specific examples section
        const customerSection = await page.locator('h4:has-text("customer Examples")').count();
        console.log(`🎯 Customer examples section found: ${customerSection > 0 ? '✅ Yes' : '❌ No'}`);
        
        // Take screenshots
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/examples-functionality.png',
            fullPage: true 
        });
        console.log('📸 Screenshot saved: tests/playwright/screenshots/examples-functionality.png');
        
        console.log('✅ Examples functionality test completed successfully!');
        
        return {
            success: true,
            exampleCards: exampleCards,
            tableGroups: tableGroups,
            statsElements: statsElements,
            formulaLength: formulaValue.length,
            resultsLength: resultsText.length,
            hasSuccessResult: hasSuccessResult
        };
        
    } catch (error) {
        console.error('❌ Examples functionality test failed:', error.message);
        
        // Save debug info
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/examples-functionality-error.png',
            fullPage: true 
        });
        
        const html = await page.content();
        fs.writeFileSync('tests/playwright/debug/examples-functionality-error.html', html);
        
        throw error;
    } finally {
        await browser.close();
    }
}

export { testExamplesFunctionality };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testExamplesFunctionality().catch(process.exit.bind(process, 1));
}