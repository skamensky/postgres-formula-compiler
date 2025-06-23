import { chromium } from 'playwright';

async function testLiveExecution() {
    console.log('⚡ Testing live formula execution...');
    
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
        
        // Test elements
        const formulaInput = page.locator('#formulaInput');
        const tableSelect = page.locator('#tableSelect');
        const toggleBtn = page.locator('#toggleLiveBtn');
        const statusIndicator = page.locator('#statusIndicator');
        const errorDisplay = page.locator('#formulaError');
        const executeBtn = page.locator('#executeBtn');
        
        // Test 1: Check initial state
        console.log('\n🔍 Test 1: Initial state...');
        const initialToggleText = await toggleBtn.textContent();
        const executeBtnVisible = await executeBtn.isVisible();
        const initialStatus = await statusIndicator.textContent();
        
        console.log(`Toggle button: ${initialToggleText}`);
        console.log(`Execute button visible: ${executeBtnVisible}`);
        console.log(`Initial status: ${initialStatus}`);
        
        const liveMode = initialToggleText.includes('ON');
        const expectedExecuteVisibility = !liveMode;
        
        // Test 2: Set up table
        console.log('\n📋 Test 2: Setting up table...');
        await tableSelect.selectOption('listing');
        await page.waitForTimeout(500);
        
        // Test 3: Test live execution with valid formula
        console.log('\n✅ Test 3: Valid formula execution...');
        await formulaInput.clear();
        await formulaInput.type('listing_price > 300000');
        
        // Wait for debounce and execution
        await page.waitForTimeout(1500);
        
        const statusAfterValid = await statusIndicator.textContent();
        const errorVisibleAfterValid = await errorDisplay.isVisible();
        const resultsVisible = await page.locator('#formulaResults').isVisible();
        
        console.log(`Status after valid formula: ${statusAfterValid}`);
        console.log(`Error visible: ${errorVisibleAfterValid}`);
        console.log(`Results visible: ${resultsVisible}`);
        
        // Test 4: Test invalid formula
        console.log('\n❌ Test 4: Invalid formula handling...');
        await formulaInput.clear();
        await formulaInput.type('INVALID_SYNTAX(');
        
        // Wait for validation
        await page.waitForTimeout(1500);
        
        const statusAfterInvalid = await statusIndicator.textContent();
        const errorVisibleAfterInvalid = await errorDisplay.isVisible();
        let errorMessage = '';
        if (errorVisibleAfterInvalid) {
            errorMessage = await errorDisplay.textContent();
        }
        
        console.log(`Status after invalid formula: ${statusAfterInvalid}`);
        console.log(`Error visible: ${errorVisibleAfterInvalid}`);
        console.log(`Error message: ${errorMessage}`);
        
        // Test 5: Toggle to manual mode
        console.log('\n🔄 Test 5: Toggle to manual mode...');
        
        // First dismiss any open autocomplete dropdown
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
        
        await toggleBtn.click();
        await page.waitForTimeout(500);
        
        const toggleTextAfter = await toggleBtn.textContent();
        const executeBtnVisibleAfter = await executeBtn.isVisible();
        const statusAfterToggle = await statusIndicator.textContent();
        
        console.log(`Toggle text after click: ${toggleTextAfter}`);
        console.log(`Execute button visible after toggle: ${executeBtnVisibleAfter}`);
        console.log(`Status after toggle: ${statusAfterToggle}`);
        
        // Test 6: Manual execution
        console.log('\n🖱️  Test 6: Manual execution...');
        await formulaInput.clear();
        await formulaInput.type('listing_price + 1000');
        await page.waitForTimeout(1000); // Should not auto-execute in manual mode
        
        const statusBeforeManual = await statusIndicator.textContent();
        console.log(`Status before manual execution: ${statusBeforeManual}`);
        
        await executeBtn.click();
        await page.waitForTimeout(1000);
        
        const statusAfterManual = await statusIndicator.textContent();
        const resultsAfterManual = await page.locator('#formulaResults').isVisible();
        
        console.log(`Status after manual execution: ${statusAfterManual}`);
        console.log(`Results visible after manual: ${resultsAfterManual}`);
        
        // Test 7: Toggle back to live mode
        console.log('\n🔄 Test 7: Toggle back to live mode...');
        await toggleBtn.click();
        await page.waitForTimeout(500);
        
        const finalToggleText = await toggleBtn.textContent();
        const finalExecuteBtnVisible = await executeBtn.isVisible();
        
        console.log(`Final toggle text: ${finalToggleText}`);
        console.log(`Final execute button visible: ${finalExecuteBtnVisible}`);
        
        // Test 8: Test Enter key behavior
        console.log('\n⌨️  Test 8: Enter key behavior...');
        await formulaInput.clear();
        await formulaInput.type('listing_price');
        await formulaInput.press('Enter');
        await page.waitForTimeout(1000);
        
        const statusAfterEnter = await statusIndicator.textContent();
        console.log(`Status after Enter: ${statusAfterEnter}`);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/live-execution-test.png',
            fullPage: true 
        });
        
        // Summary
        const tests = [
            { name: 'Initial State', passed: liveMode && !executeBtnVisible },
            { name: 'Valid Formula', passed: statusAfterValid.includes('Success') && resultsVisible },
            { name: 'Invalid Formula', passed: statusAfterInvalid.includes('Invalid') && errorVisibleAfterInvalid },
            { name: 'Toggle to Manual', passed: toggleTextAfter.includes('OFF') && executeBtnVisibleAfter },
            { name: 'Manual Execution', passed: resultsAfterManual },
            { name: 'Toggle to Live', passed: finalToggleText.includes('ON') && !finalExecuteBtnVisible }
        ];
        
        const passed = tests.filter(t => t.passed).length;
        const total = tests.length;
        
        console.log('\n📊 Live Execution Test Results:');
        tests.forEach(test => {
            console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}`);
        });
        console.log(`\n🏆 Overall Score: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
        
        if (passed === total) {
            console.log('🎉 ALL LIVE EXECUTION FEATURES WORKING!');
        }
        
        return {
            success: passed === total,
            score: `${passed}/${total}`,
            details: tests
        };
        
    } catch (error) {
        console.error('❌ Live execution test failed:', error.message);
        
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/live-execution-error.png',
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

export { testLiveExecution };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testLiveExecution().catch(process.exit.bind(process, 1));
}