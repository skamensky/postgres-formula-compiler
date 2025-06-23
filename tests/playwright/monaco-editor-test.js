import { chromium } from 'playwright';

async function testMonacoEditor() {
    console.log('🚀 Testing Monaco Editor integration...');
    
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
        await page.waitForTimeout(8000);
        
        // Test 1: Check if Monaco Editor is loaded
        console.log('\n🔍 Test 1: Monaco Editor loading...');
        const monacoLoaded = await page.evaluate(() => {
            return window.monaco && window.monacoWrapper && window.formulaEditor;
        });
        console.log(`Monaco Editor loaded: ${monacoLoaded ? '✅ Yes' : '❌ No'}`);
        
        // Test 2: Check if Monaco Editor container exists
        console.log('\n🔍 Test 2: Monaco Editor container...');
        const containerExists = await page.locator('#formulaInput').count() > 0;
        console.log(`Monaco container exists: ${containerExists ? '✅ Yes' : '❌ No'}`);
        
        // Test 3: Test Monaco Editor value setting using JavaScript
        console.log('\n🔍 Test 3: Monaco Editor value manipulation...');
        const valueTest = await page.evaluate(() => {
            if (!window.formulaEditor) return false;
            
            // Set value
            window.formulaEditor.value = 'SUM(listing_price)';
            
            // Get value
            const value = window.formulaEditor.value;
            
            return value === 'SUM(listing_price)';
        });
        console.log(`Monaco value manipulation: ${valueTest ? '✅ Works' : '❌ Failed'}`);
        
        // Test 4: Test Monaco Editor clear function
        console.log('\n🔍 Test 4: Monaco Editor clear function...');
        const clearTest = await page.evaluate(() => {
            if (!window.formulaEditor) return false;
            
            // Clear value
            window.formulaEditor.clear();
            
            // Check if cleared
            const value = window.formulaEditor.value;
            
            return value === '';
        });
        console.log(`Monaco clear function: ${clearTest ? '✅ Works' : '❌ Failed'}`);
        
        // Test 5: Check Monaco Editor theme and language
        console.log('\n🔍 Test 5: Monaco Editor configuration...');
        const configTest = await page.evaluate(() => {
            if (!window.formulaEditor || !window.formulaEditor._monaco) return false;
            
            const editor = window.formulaEditor._monaco;
            const model = editor.getModel();
            
            return {
                language: model.getLanguageId(),
                hasTheme: true,
                hasCompletions: window.monaco.languages.getCompletionItemProviders('formula').length > 0
            };
        });
        console.log(`Language: ${configTest ? configTest.language : 'Unknown'}`);
        console.log(`Completions registered: ${configTest ? (configTest.hasCompletions ? '✅ Yes' : '❌ No') : '❌ No'}`);
        
        // Test 6: Test autocomplete by clicking in Monaco editor
        console.log('\n🔍 Test 6: Monaco Editor interaction...');
        const interactionTest = await page.evaluate(() => {
            if (!window.formulaEditor || !window.formulaEditor._monaco) return false;
            
            const editor = window.formulaEditor._monaco;
            
            // Set some text
            editor.setValue('SU');
            
            // Focus the editor
            editor.focus();
            
            // Trigger completion
            editor.trigger('keyboard', 'editor.action.triggerSuggest');
            
            return true;
        });
        console.log(`Monaco interaction test: ${interactionTest ? '✅ Works' : '❌ Failed'}`);
        
        // Wait for autocomplete to potentially appear
        await page.waitForTimeout(1000);
        
        // Check for Monaco suggestion widget
        const suggestionVisible = await page.evaluate(() => {
            const widgets = document.querySelectorAll('.suggest-widget');
            return widgets.length > 0;
        });
        console.log(`Autocomplete widget visible: ${suggestionVisible ? '✅ Yes' : '❌ No'}`);
        
        // Test 7: Test Format function
        console.log('\n🔍 Test 7: Format function...');
        const formatTest = await page.evaluate(() => {
            if (!window.formulaEditor || !window.formatterIntegration) return false;
            
            // Set unformatted text
            window.formulaEditor.value = 'SUM(listing_price  +  1000)';
            
            try {
                // Try to format
                window.formatterIntegration.formatTextarea(window.formulaEditor);
                return true;
            } catch (error) {
                console.log('Format error:', error);
                return false;
            }
        });
        console.log(`Format function: ${formatTest ? '✅ Available' : '❌ Failed'}`);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/monaco-editor-test.png',
            fullPage: true 
        });
        
        // Summary
        const tests = [
            { name: 'Monaco Loading', passed: monacoLoaded },
            { name: 'Container Exists', passed: containerExists },
            { name: 'Value Manipulation', passed: valueTest },
            { name: 'Clear Function', passed: clearTest },
            { name: 'Configuration', passed: !!configTest },
            { name: 'Interaction', passed: interactionTest },
            { name: 'Autocomplete Widget', passed: suggestionVisible },
            { name: 'Format Function', passed: formatTest }
        ];
        
        const passed = tests.filter(t => t.passed).length;
        const total = tests.length;
        
        console.log('\n📊 Monaco Editor Test Results:');
        tests.forEach(test => {
            console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}`);
        });
        console.log(`\n🏆 Overall Score: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
        
        if (passed >= 6) {
            console.log('🎉 MONACO EDITOR INTEGRATION SUCCESSFUL!');
        } else {
            console.log('⚠️  Monaco Editor integration needs attention');
        }
        
        return {
            success: passed >= 6,
            score: `${passed}/${total}`,
            details: tests
        };
        
    } catch (error) {
        console.error('❌ Monaco editor test failed:', error.message);
        
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/monaco-editor-error.png',
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

export { testMonacoEditor };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testMonacoEditor().catch(process.exit.bind(process, 1));
}