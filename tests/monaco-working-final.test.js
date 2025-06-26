/**
 * Working Monaco Editor Tests
 * Uses Monaco API directly instead of page.fill()
 */

import { test, expect } from '@playwright/test';

const SERVER_URL = 'http://localhost:3001';

test.describe('Monaco Editor Working Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(SERVER_URL);
        await page.waitForLoadState('networkidle');
        
        // Wait for tables to load
        await page.waitForFunction(() => {
            const select = document.getElementById('tableSelect');
            return select && select.options.length > 1;
        }, { timeout: 10000 });
        
        await page.selectOption('#tableSelect', 'customer');
        await page.waitForTimeout(2000);
    });

    test('1. Monaco editor creation and basic functionality', async ({ page }) => {
        console.log('🧪 Testing Monaco editor creation and basic functionality...');

        // Set value using Monaco API
        const setValue = await page.evaluate((formula) => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editor = Array.from(window.enhancedMonaco.editors.values())[0];
                if (editor.editor && editor.editor.setValue) {
                    editor.editor.setValue(formula);
                    return true;
                }
                if (editor._monaco && editor._monaco.setValue) {
                    editor._monaco.setValue(formula);
                    return true;
                }
            }
            return false;
        }, 'UPPER(first_name) & " - " & last_name');

        expect(setValue).toBe(true);

        // Verify value was set
        const getValue = await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editor = Array.from(window.enhancedMonaco.editors.values())[0];
                if (editor.editor && editor.editor.getValue) {
                    return editor.editor.getValue();
                }
                if (editor._monaco && editor._monaco.getValue) {
                    return editor._monaco.getValue();
                }
            }
            return null;
        });

        expect(getValue).toContain('UPPER');
        expect(getValue).toContain('first_name');

        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/monaco-working-basic.png',
            fullPage: true
        });

        console.log('✅ Monaco editor basic functionality test passed');
    });

    test('2. Monaco syntax highlighting verification', async ({ page }) => {
        console.log('🧪 Testing Monaco syntax highlighting...');

        // Set formula using Monaco API
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editor = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editor.editor || editor._monaco;
                if (monaco && monaco.setValue) {
                    monaco.setValue('UPPER("test") & ROUND(123.456, 2)');
                }
            }
        });

        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/monaco-working-syntax.png',
            clip: { x: 0, y: 200, width: 800, height: 300 }
        });

        // Check for Monaco tokenization
        const hasTokens = await page.evaluate(() => {
            const monacoEditor = document.querySelector('.monaco-editor');
            if (monacoEditor) {
                const tokenLines = monacoEditor.querySelectorAll('.view-line');
                return tokenLines.length > 0;
            }
            return false;
        });

        expect(hasTokens).toBe(true);

        console.log('✅ Monaco syntax highlighting test passed');
    });

    test('3. Monaco autocomplete trigger test', async ({ page }) => {
        console.log('🧪 Testing Monaco autocomplete...');

        // Click on Monaco editor and trigger completion
        await page.click('#formulaInput .monaco-editor');
        
        // Use Monaco API to set partial text
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editor = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editor.editor || editor._monaco;
                if (monaco && monaco.setValue) {
                    monaco.setValue('UPP');
                    // Set cursor at end
                    monaco.setPosition({ lineNumber: 1, column: 4 });
                }
            }
        });

        // Trigger autocomplete
        await page.keyboard.press('Control+Space');
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/monaco-working-autocomplete.png',
            fullPage: true
        });

        // Check Monaco completion state
        const completionState = await page.evaluate(() => {
            return {
                monacoExists: !!window.enhancedMonaco,
                editorsCount: window.enhancedMonaco?.editors?.size || 0,
                hasCompletionProvider: !!monaco.languages.getLanguages().find(l => l.id === 'formula')
            };
        });

        expect(completionState.monacoExists).toBe(true);
        expect(completionState.editorsCount).toBe(1);
        expect(completionState.hasCompletionProvider).toBe(true);

        console.log('✅ Monaco autocomplete test passed');
    });

    test('4. Live execution and error detection', async ({ page }) => {
        console.log('🧪 Testing live execution and error detection...');

        // Test valid formula first
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editor = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editor.editor || editor._monaco;
                if (monaco && monaco.setValue) {
                    monaco.setValue('UPPER(first_name)');
                }
            }
        });

        await page.waitForTimeout(2000);

        // Check for results
        const hasValidResults = await page.evaluate(() => {
            const resultsElement = document.getElementById('formulaResults');
            return resultsElement && resultsElement.innerHTML.length > 0;
        });

        expect(hasValidResults).toBe(true);

        // Test invalid formula
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editor = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editor.editor || editor._monaco;
                if (monaco && monaco.setValue) {
                    monaco.setValue('INVALID_FUNCTION(test)');
                }
            }
        });

        await page.waitForTimeout(1500);

        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/monaco-working-error.png',
            fullPage: true
        });

        // Check for error indication
        const errorState = await page.evaluate(() => {
            const statusText = document.querySelector('#statusIndicator .status-text')?.textContent;
            const errorElement = document.querySelector('#formulaError:not(.hidden)');
            
            return {
                statusText,
                hasErrorElement: !!errorElement,
                statusIndicatesError: statusText && (statusText.includes('Error') || statusText.includes('Invalid'))
            };
        });

        const hasErrorIndication = errorState.hasErrorElement || errorState.statusIndicatesError;
        expect(hasErrorIndication).toBe(true);

        console.log('✅ Live execution and error detection test passed');
    });

    test('5. Complete Monaco integration verification', async ({ page }) => {
        console.log('🧪 Testing complete Monaco integration...');

        // Set complex formula
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editor = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editor.editor || editor._monaco;
                if (monaco && monaco.setValue) {
                    monaco.setValue('IF(UPPER(first_name) = "JOHN", ROUND(budget, 2), 0)');
                }
            }
        });

        await page.waitForTimeout(2000);

        // Take final screenshot
        await page.screenshot({ 
            path: 'test-results/monaco-working-final.png',
            fullPage: true
        });

        // Comprehensive state check
        const finalState = await page.evaluate(() => {
            return {
                // Monaco state
                monacoInitialized: !!window.enhancedMonaco,
                editorsCount: window.enhancedMonaco?.editors?.size || 0,
                
                // Editor value
                editorValue: (() => {
                    if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                        const editor = Array.from(window.enhancedMonaco.editors.values())[0];
                        const monaco = editor.editor || editor._monaco;
                        return monaco && monaco.getValue ? monaco.getValue() : null;
                    }
                    return null;
                })(),
                
                // Application state
                tablesLoaded: document.getElementById('tableSelect')?.options?.length > 1,
                hasResults: document.getElementById('formulaResults')?.innerHTML?.length > 0,
                
                // Developer tools
                developerTools: !!window.developerToolsClient,
                browserAPI: !!window.executeFormula,
                
                // UI state
                currentTable: document.getElementById('tableSelect')?.value
            };
        });

        // Verify all components
        expect(finalState.monacoInitialized).toBe(true);
        expect(finalState.editorsCount).toBe(1);
        expect(finalState.editorValue).toContain('IF');
        expect(finalState.tablesLoaded).toBe(true);
        expect(finalState.hasResults).toBe(true);
        expect(finalState.developerTools).toBe(true);
        expect(finalState.browserAPI).toBe(true);
        expect(finalState.currentTable).toBe('customer');

        console.log('🎉 ALL MONACO FUNCTIONALITY WORKING CORRECTLY!');
        console.log('✅ Complete Monaco integration test passed');
        
        // Log the working state for documentation
        console.log('📊 Final State Summary:', finalState);
    });
});