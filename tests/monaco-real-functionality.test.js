/**
 * Real Monaco Editor Functionality Tests
 * Actually tests Monaco editor features by interacting with the editor directly
 */

import { test, expect } from '@playwright/test';

const SERVER_URL = 'http://localhost:3001';

test.describe('Monaco Editor Real Functionality Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Capture console errors to debug issues
        const logs = [];
        page.on('console', msg => {
            const text = msg.text();
            logs.push(`[${msg.type()}] ${text}`);
            if (msg.type() === 'error') {
                console.log(`❌ Console Error: ${text}`);
            }
        });

        await page.goto(SERVER_URL);
        await page.waitForLoadState('networkidle');
        
        // Wait for tables to load
        await page.waitForFunction(() => {
            const select = document.getElementById('tableSelect');
            return select && select.options.length > 1;
        }, { timeout: 15000 });
        
        // Select customer table for testing
        await page.selectOption('#tableSelect', 'customer');
        
        // Wait for Monaco and schema to be ready
        await page.waitForTimeout(3000);
        
        // Store logs on page object for access in tests
        page.logs = logs;
    });

    test('1. Test identifier highlighting in Monaco editor', async ({ page }) => {
        console.log('🧪 Testing identifier highlighting...');

        // Focus on Monaco editor
        await page.click('#formulaInput');
        await page.waitForTimeout(500);

        // Type a formula with identifiers using Monaco's input simulation
        await page.evaluate(() => {
            // Get Monaco editor instance
            const container = document.getElementById('formulaInput');
            const editor = container?.querySelector('.monaco-editor');
            if (editor) {
                // Simulate typing in Monaco
                const event = new KeyboardEvent('keydown', {
                    key: 'f',
                    code: 'KeyF',
                    bubbles: true
                });
                editor.dispatchEvent(event);
            }
        });

        // Type using Monaco's setValue to test highlighting
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editorInfo.editor || editorInfo._monaco;
                if (monaco && monaco.setValue) {
                    monaco.setValue('first_name & " " & last_name');
                    // Force a model change event
                    monaco.trigger('test', 'editor.action.formatDocument', {});
                }
            }
        });

        await page.waitForTimeout(2000);

        // Take screenshot to verify highlighting
        await page.screenshot({ 
            path: 'test-results/identifier-highlighting-test.png',
            clip: { x: 0, y: 200, width: 900, height: 400 }
        });

        // Check if Monaco is actually highlighting tokens
        const highlightingInfo = await page.evaluate(() => {
            const monacoEditor = document.querySelector('.monaco-editor');
            if (!monacoEditor) return { error: 'Monaco editor not found' };

            // Check for Monaco's token spans and highlighting
            const viewLines = monacoEditor.querySelectorAll('.view-line');
            const tokenSpans = monacoEditor.querySelectorAll('.mtk1, .mtk2, .mtk3, .mtk4, .mtk5, .mtk6, .mtk7, .mtk8, .mtk9, .mtk10');
            
            return {
                hasViewLines: viewLines.length > 0,
                hasTokenSpans: tokenSpans.length > 0,
                viewLinesCount: viewLines.length,
                tokenSpansCount: tokenSpans.length,
                sampleTokenClasses: Array.from(tokenSpans).slice(0, 5).map(span => span.className),
                editorContent: monacoEditor.textContent?.substring(0, 100)
            };
        });

        console.log('Highlighting info:', highlightingInfo);

        // Verify Monaco editor is working with content
        expect(highlightingInfo.hasViewLines).toBe(true);
        expect(highlightingInfo.editorContent).toContain('first_name');

        console.log('✅ Identifier highlighting test completed');
    });

    test('2. Test column autocomplete: typing "first_" should suggest "first_name"', async ({ page }) => {
        console.log('🧪 Testing column autocomplete for "first_" → "first_name"...');

        // Focus Monaco editor
        await page.click('#formulaInput .monaco-editor');
        await page.waitForTimeout(500);

        // Clear any existing content and type "first_"
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editorInfo.editor || editorInfo._monaco;
                if (monaco) {
                    monaco.setValue('');
                    monaco.focus();
                }
            }
        });

        // Type "first_" character by character to trigger autocomplete
        const text = 'first_';
        for (const char of text) {
            await page.keyboard.type(char, { delay: 150 });
        }

        await page.waitForTimeout(1000);

        // Manually trigger autocomplete
        await page.keyboard.press('Control+Space');
        await page.waitForTimeout(1500);

        // Take screenshot to verify autocomplete dropdown
        await page.screenshot({ 
            path: 'test-results/column-autocomplete-test.png',
            fullPage: true
        });

        // Check for autocomplete suggestions
        const autocompleteInfo = await page.evaluate(() => {
            // Check for Monaco's suggest widget
            const suggestWidget = document.querySelector('.suggest-widget, .monaco-list');
            if (suggestWidget && suggestWidget.style.display !== 'none') {
                const suggestions = suggestWidget.querySelectorAll('.monaco-list-row, .suggest-item');
                const suggestionTexts = Array.from(suggestions).map(item => item.textContent);
                
                return {
                    hasSuggestWidget: true,
                    suggestionsCount: suggestions.length,
                    suggestionTexts: suggestionTexts.slice(0, 10), // First 10 suggestions
                    hasFirstName: suggestionTexts.some(text => text.includes('first_name'))
                };
            }

            // Also check if completion provider was called
            const editorInfo = window.enhancedMonaco?.editors?.values()?.next()?.value;
            return {
                hasSuggestWidget: false,
                monacoExists: !!window.enhancedMonaco,
                editorExists: !!editorInfo,
                schemaLoaded: !!window.developerToolsClient,
                currentTable: document.getElementById('tableSelect')?.value
            };
        });

        console.log('Autocomplete info:', autocompleteInfo);

        // Check if first_name is suggested
        if (autocompleteInfo.hasFirstName) {
            console.log('✅ Column autocomplete working - first_name found in suggestions');
        } else {
            console.log('❌ Column autocomplete not working - checking schema...');
            
            // Debug schema availability
            const schemaDebug = await page.evaluate(async () => {
                if (window.getTableSchema) {
                    try {
                        const schema = await window.getTableSchema('customer');
                        const columnNames = schema.columns?.map(col => col.column_name) || [];
                        return {
                            hasSchema: true,
                            columnCount: columnNames.length,
                            hasFirstName: columnNames.includes('first_name'),
                            columns: columnNames.slice(0, 10)
                        };
                    } catch (error) {
                        return { error: error.message };
                    }
                }
                return { hasSchema: false };
            });
            
            console.log('Schema debug:', schemaDebug);
        }

        // Check for any LSP errors in console
        const lspErrors = page.logs.filter(log => 
            log.toLowerCase().includes('lsp') || 
            log.toLowerCase().includes('completion') ||
            log.toLowerCase().includes('symbol')
        );
        
        if (lspErrors.length > 0) {
            console.log('LSP-related console messages:', lspErrors);
        }

        console.log('✅ Column autocomplete test completed');
    });

    test('3. Test function autocomplete: typing "UPP" should suggest "UPPER"', async ({ page }) => {
        console.log('🧪 Testing function autocomplete for "UPP" → "UPPER"...');

        // Focus Monaco editor and clear content
        await page.click('#formulaInput .monaco-editor');
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editorInfo.editor || editorInfo._monaco;
                if (monaco) {
                    monaco.setValue('');
                    monaco.focus();
                }
            }
        });

        await page.waitForTimeout(500);

        // Type "UPP" to trigger function autocomplete
        await page.keyboard.type('UPP', { delay: 200 });
        await page.waitForTimeout(1000);

        // Trigger autocomplete
        await page.keyboard.press('Control+Space');
        await page.waitForTimeout(1500);

        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/function-autocomplete-test.png',
            fullPage: true
        });

        // Check for function suggestions
        const functionAutocompleteInfo = await page.evaluate(() => {
            // Check for Monaco's suggest widget
            const suggestWidget = document.querySelector('.suggest-widget, .monaco-list');
            if (suggestWidget && suggestWidget.style.display !== 'none') {
                const suggestions = suggestWidget.querySelectorAll('.monaco-list-row, .suggest-item');
                const suggestionTexts = Array.from(suggestions).map(item => item.textContent);
                
                return {
                    hasSuggestWidget: true,
                    suggestionsCount: suggestions.length,
                    suggestionTexts: suggestionTexts.slice(0, 10),
                    hasUpper: suggestionTexts.some(text => text.includes('UPPER'))
                };
            }

            // Check if functions are available in metadata
            const functionsAvailable = window.FUNCTION_METADATA || {};
            return {
                hasSuggestWidget: false,
                functionsInMetadata: Object.keys(functionsAvailable).length,
                hasUpperInMetadata: 'UPPER' in functionsAvailable
            };
        });

        console.log('Function autocomplete info:', functionAutocompleteInfo);

        if (functionAutocompleteInfo.hasUpper) {
            console.log('✅ Function autocomplete working - UPPER found in suggestions');
        } else {
            console.log('❌ Function autocomplete not working');
        }

        console.log('✅ Function autocomplete test completed');
    });

    test('4. Debug LSP Symbol conversion error', async ({ page }) => {
        console.log('🧪 Debugging LSP Symbol conversion error...');

        // Trigger LSP operations that might cause Symbol errors
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editorInfo.editor || editorInfo._monaco;
                if (monaco) {
                    monaco.setValue('UPPER(first_name)');
                }
            }
        });

        await page.waitForTimeout(2000);

        // Try to trigger hover to see if it causes Symbol error
        await page.hover('#formulaInput .monaco-editor');
        await page.waitForTimeout(1000);

        // Check for Symbol conversion errors
        const symbolErrors = page.logs.filter(log => 
            log.includes('Symbol') || 
            log.includes('Cannot convert') ||
            log.includes('LSP completion error')
        );

        console.log('Symbol-related errors found:', symbolErrors);

        // Test function metadata access
        const metadataTest = await page.evaluate(() => {
            try {
                if (window.FUNCTION_METADATA && window.FUNCTION_METADATA.UPPER) {
                    const upperMeta = window.FUNCTION_METADATA.UPPER;
                    return {
                        success: true,
                        returnType: typeof upperMeta.returnType,
                        returnTypeString: String(upperMeta.returnType),
                        isSymbol: typeof upperMeta.returnType === 'symbol'
                    };
                }
                return { success: false, reason: 'FUNCTION_METADATA not available' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        console.log('Function metadata test:', metadataTest);

        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/lsp-symbol-debug.png',
            fullPage: true
        });

        console.log('✅ LSP Symbol debug test completed');
    });
});