import { chromium } from 'playwright';
import fs from 'fs';

async function testLanguageTooling() {
    console.log('🔧 Testing language tooling (formatter, LSP, highlighter)...');
    
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
        
        // Test data
        const testFormula = 'IF(price > 300000, "Luxury", "Standard")';
        const malformedFormula = 'IF(price > 300000 "Luxury", "Standard"'; // Missing comma
        
        // Step 1: Test syntax highlighting
        console.log('🎨 Testing syntax highlighting...');
        const formulaInput = page.locator('#formulaInput');
        await formulaInput.fill(testFormula);
        await page.waitForTimeout(1000);
        
        // Check if syntax highlighting overlay exists
        const syntaxOverlay = page.locator('.syntax-highlighting-overlay');
        const hasHighlighting = await syntaxOverlay.count() > 0;
        console.log(`🎨 Syntax highlighting present: ${hasHighlighting ? '✅ Yes' : '❌ No'}`);
        
        // Step 2: Test autocomplete
        console.log('💭 Testing autocomplete...');
        await formulaInput.clear();
        await formulaInput.type('IF(pr');
        await page.waitForTimeout(500);
        
        // Check for autocomplete dropdown
        const autocompleteDropdown = page.locator('.autocomplete-dropdown');
        const hasAutocomplete = await autocompleteDropdown.count() > 0;
        console.log(`💭 Autocomplete dropdown present: ${hasAutocomplete ? '✅ Yes' : '❌ No'}`);
        
        if (hasAutocomplete) {
            const suggestions = await autocompleteDropdown.locator('.autocomplete-item').count();
            console.log(`💭 Autocomplete suggestions count: ${suggestions}`);
        }
        
        // Step 3: Test error detection with malformed formula
        console.log('🔍 Testing error detection...');
        await formulaInput.clear();
        await formulaInput.fill(malformedFormula);
        await page.waitForTimeout(1000);
        
        // Check for error indicators
        const errorIndicators = page.locator('.error-indicator');
        const hasErrorDetection = await errorIndicators.count() > 0;
        console.log(`🔍 Error detection present: ${hasErrorDetection ? '✅ Yes' : '❌ No'}`);
        
        // Step 4: Test formatter
        console.log('📐 Testing formatter...');
        await formulaInput.clear();
        const unformattedFormula = 'IF(price>300000,"Luxury","Standard")';
        await formulaInput.fill(unformattedFormula);
        await page.waitForTimeout(500);
        
        // Look for format button
        const formatButton = page.locator('[title*="Format"], .format-btn, .btn-format');
        const hasFormatButton = await formatButton.count() > 0;
        console.log(`📐 Format button present: ${hasFormatButton ? '✅ Yes' : '❌ No'}`);
        
        if (hasFormatButton) {
            await formatButton.first().click();
            await page.waitForTimeout(1000);
            
            const formattedValue = await formulaInput.inputValue();
            const wasFormatted = formattedValue !== unformattedFormula;
            console.log(`📐 Formula was formatted: ${wasFormatted ? '✅ Yes' : '❌ No'}`);
            console.log(`📐 Formatted result: "${formattedValue}"`);
        }
        
        // Step 5: Test hover information
        console.log('ℹ️  Testing hover information...');
        await formulaInput.clear();
        await formulaInput.fill('SUM(price)');
        await page.waitForTimeout(500);
        
        // Try to hover over the SUM function
        await formulaInput.hover();
        await page.waitForTimeout(500);
        
        const hoverTooltip = page.locator('.hover-tooltip, .tooltip');
        const hasHover = await hoverTooltip.count() > 0;
        console.log(`ℹ️  Hover information present: ${hasHover ? '✅ Yes' : '❌ No'}`);
        
        // Step 6: Check developer tools client availability
        console.log('🔧 Testing developer tools client...');
        const devToolsReady = await page.evaluate(() => {
            return window.developerToolsClient && typeof window.developerToolsClient.isReady === 'function';
        });
        console.log(`🔧 Developer tools client available: ${devToolsReady ? '✅ Yes' : '❌ No'}`);
        
        if (devToolsReady) {
            const isReady = await page.evaluate(() => window.developerToolsClient.isReady());
            console.log(`🔧 Developer tools ready: ${isReady ? '✅ Yes' : '❌ No'}`);
            
            // Test direct API calls
            const completionTest = await page.evaluate(async () => {
                try {
                    const completions = await window.developerToolsClient.getCompletions('SU', 2, 'customer');
                    return completions.length > 0;
                } catch (error) {
                    return false;
                }
            });
            console.log(`🔧 API completions working: ${completionTest ? '✅ Yes' : '❌ No'}`);
        }
        
        // Take screenshot for verification
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/language-tooling-test.png',
            fullPage: true 
        });
        console.log('📸 Screenshot saved: tests/playwright/screenshots/language-tooling-test.png');
        
        // Scoring
        const tests = [
            { name: 'Syntax Highlighting', passed: hasHighlighting },
            { name: 'Autocomplete', passed: hasAutocomplete },
            { name: 'Error Detection', passed: hasErrorDetection },
            { name: 'Format Button', passed: hasFormatButton },
            { name: 'Developer Tools Client', passed: devToolsReady }
        ];
        
        const passed = tests.filter(t => t.passed).length;
        const total = tests.length;
        
        console.log('\n📊 Language Tooling Test Results:');
        tests.forEach(test => {
            console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}`);
        });
        console.log(`\n🏆 Overall Score: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
        
        if (passed === total) {
            console.log('🎉 All language tooling features working!');
        } else {
            console.log('⚠️  Some language tooling features need attention');
        }
        
        return {
            success: passed === total,
            score: `${passed}/${total}`,
            details: tests
        };
        
    } catch (error) {
        console.error('❌ Language tooling test failed:', error.message);
        
        // Save debug info
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/language-tooling-error.png',
            fullPage: true 
        });
        
        const html = await page.content();
        fs.writeFileSync('tests/playwright/debug/language-tooling-error.html', html);
        
        return {
            success: false,
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

export { testLanguageTooling };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testLanguageTooling().catch(process.exit.bind(process, 1));
}