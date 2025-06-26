import { chromium } from 'playwright';

async function testExampleLoading() {
    console.log('🧪 Starting example loading test...');
    
    const browser = await chromium.launch({ 
        headless: false,  // Set to false so we can see what's happening
        slowMo: 500
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
        console.log('📖 Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for enhanced Monaco to load...');
        await page.waitForFunction(() => {
            return window.enhancedMonaco !== undefined;
        }, { timeout: 15000 });
        
        console.log('✅ Enhanced Monaco loaded');
        
        // Debug: Check Monaco editor state
        const monacoDebug = await page.evaluate(() => {
            const debug = {
                enhancedMonaco: !!window.enhancedMonaco,
                formulaEditor: !!window.formulaEditor,
                editors: null,
                formulaInputEditor: null
            };
            
            if (window.enhancedMonaco) {
                debug.editors = window.enhancedMonaco.editors ? 
                    (window.enhancedMonaco.editors._editors ? Object.keys(window.enhancedMonaco.editors._editors) : 'No _editors') : 'No editors';
                
                if (window.enhancedMonaco.editors && window.enhancedMonaco.editors.get) {
                    try {
                        const editor = window.enhancedMonaco.editors.get('formulaInput');
                        debug.formulaInputEditor = {
                            exists: !!editor,
                            hasEditor: !!(editor && editor.editor),
                            editorType: editor ? typeof editor.editor : 'none',
                            setValue: !!(editor && editor.editor && editor.editor.setValue),
                            getValue: !!(editor && editor.editor && editor.editor.getValue)
                        };
                    } catch (error) {
                        debug.formulaInputEditor = `Error: ${error.message}`;
                    }
                }
            }
            
            return debug;
        });
        
        console.log('🔍 Monaco Debug Info:', JSON.stringify(monacoDebug, null, 2));
        
        // Step 1: Navigate to Examples tab
        console.log('📖 Step 1: Navigate to Examples tab');
        await page.click('[data-tab="examples"]');
        await page.waitForSelector('#examplesList', { timeout: 5000 });
        
        // Step 2: Wait for examples to load
        console.log('⏳ Step 2: Wait for examples to load');
        await page.waitForFunction(() => {
            const examplesList = document.getElementById('examplesList');
            return examplesList && examplesList.innerHTML.includes('example-card');
        }, { timeout: 10000 });
        
        // Step 3: Get the first available example
        console.log('🔍 Step 3: Find first example');
        const firstExample = await page.locator('.example-card').first();
        const isVisible = await firstExample.isVisible();
        console.log(`📋 First example visible: ${isVisible}`);
        
        // Get example details before clicking
        const exampleDetails = await page.evaluate(() => {
            const firstCard = document.querySelector('.example-card');
            if (!firstCard) return null;
            
            const codeElement = firstCard.querySelector('.example-code');
            const formula = codeElement ? codeElement.textContent.trim() : null;
            
            // Extract table from onclick attribute
            const onclick = firstCard.getAttribute('onclick');
            console.log('onclick attribute:', onclick);
            const tableMatch = onclick ? onclick.match(/'([^']+)',\s*'([^']+)'/) : null;
            const table = tableMatch ? tableMatch[2] : null;
            
            return { formula, table, onclick };
        });
        
        console.log('📄 Found example:', exampleDetails);
        
        // Step 4: Check Monaco editor before clicking
        console.log('🔍 Step 4: Check Monaco editor state before clicking');
        const beforeValue = await page.evaluate(() => {
            try {
                if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                    return {
                        value: window.enhancedMonaco.editors.get('formulaInput').editor.getValue(),
                        source: 'enhancedMonaco'
                    };
                } else if (window.formulaEditor && window.formulaEditor.editor) {
                    return {
                        value: window.formulaEditor.editor.getValue(),
                        source: 'formulaEditor'
                    };
                } else {
                    const textarea = document.getElementById('formulaInput');
                    return {
                        value: textarea ? textarea.value : 'No input found',
                        source: 'textarea'
                    };
                }
            } catch (error) {
                return {
                    value: `Error: ${error.message}`,
                    source: 'error'
                };
            }
        });
        console.log('📝 Monaco editor value before:', beforeValue);
        
        // Step 5: Click the example
        console.log('👆 Step 5: Click the example');
        await firstExample.click();
        
        // Step 6: Wait for tab switch to compiler
        console.log('⏳ Step 6: Wait for tab switch');
        await page.waitForSelector('[data-tab="compiler"].active', { timeout: 5000 });
        console.log('✅ Tab switched to compiler');
        
        // Wait a moment for the action to complete
        await page.waitForTimeout(1000);
        
        // Step 7: Verify Monaco editor value after clicking
        console.log('🔍 Step 7: Check Monaco editor after clicking');
        const afterValue = await page.evaluate(() => {
            try {
                if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                    const editor = window.enhancedMonaco.editors.get('formulaInput').editor;
                    return {
                        value: editor.getValue(),
                        hasEditor: true,
                        source: 'enhancedMonaco'
                    };
                } else if (window.formulaEditor && window.formulaEditor.editor) {
                    return {
                        value: window.formulaEditor.editor.getValue(),
                        hasEditor: true,
                        source: 'formulaEditor'
                    };
                } else {
                    const textarea = document.getElementById('formulaInput');
                    return {
                        value: textarea ? textarea.value : 'No input found',
                        hasEditor: false,
                        source: 'textarea'
                    };
                }
            } catch (error) {
                return {
                    value: `Error: ${error.message}`,
                    hasEditor: false,
                    source: 'error',
                    error: error.toString()
                };
            }
        });
        
        console.log('📝 Monaco editor value after:', afterValue);
        
        // Step 8: Check if the formula was loaded correctly
        const formulaMatches = afterValue.value === exampleDetails.formula;
        console.log(`📊 Formula matches: ${formulaMatches}`);
        console.log(`📊 Expected: "${exampleDetails.formula}"`);
        console.log(`📊 Actual: "${afterValue.value}"`);
        
        // Step 9: Verify table selection
        const tableSelectValue = await page.inputValue('#tableSelect');
        const tableMatches = tableSelectValue === exampleDetails.table;
        console.log(`📊 Table matches: ${tableMatches}`);
        console.log(`📊 Expected table: "${exampleDetails.table}"`);
        console.log(`📊 Actual table: "${tableSelectValue}"`);
        
        // Final verification
        if (formulaMatches && tableMatches) {
            console.log('✅ Example loading test PASSED!');
            return true;
        } else {
            console.log('❌ Example loading test FAILED!');
            if (!formulaMatches) console.log('❌ Formula not loaded correctly');
            if (!tableMatches) console.log('❌ Table not selected correctly');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Example loading test failed:', error.message);
        await page.screenshot({ path: 'tests/playwright/screenshots/example-loading-error.png' });
        throw error;
    } finally {
        await page.waitForTimeout(3000); // Keep browser open for a bit to see results
        await browser.close();
    }
}

export { testExampleLoading };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testExampleLoading().catch(process.exit.bind(process, 1));
}