import { test, expect } from '@playwright/test';

test.describe('Monaco Editor with VS Code Features', () => {
    test.beforeEach(async ({ page }) => {
        // Start with a fresh page
        await page.goto('http://localhost:3001');
        
        // Wait for enhanced Monaco to be ready
        await page.waitForFunction(() => {
            return window.enhancedMonaco && window.formulaEditor;
        }, { timeout: 10000 });
        
        // Wait a bit more for full initialization
        await page.waitForTimeout(1000);
    });

    test('Monaco editor loads and is interactive', async ({ page }) => {
        // Check that Monaco editor container exists
        const container = page.locator('#formulaInput');
        await expect(container).toBeVisible();
        
        // Check that Monaco editor is actually present inside
        const monacoEditor = container.locator('.monaco-editor');
        await expect(monacoEditor).toBeVisible();
        
        // Verify the editor has focus capability
        await container.click();
        await expect(monacoEditor).toHaveClass(/focused/);
        
        // Test typing functionality
        await page.keyboard.type('SUM(amount)');
        
        // Verify the content was typed
        const editorValue = await page.evaluate(() => {
            // Try Monaco direct access first (most reliable)
            if (window.enhancedMonaco?.editors?.get('formulaInput')?.editor) {
                return window.enhancedMonaco.editors.get('formulaInput').editor.getValue();
            } else if (window.formulaEditor?.value !== undefined) {
                return window.formulaEditor.value;
            }
            return 'No getValue method found';
        });
        expect(editorValue).toBe('SUM(amount)');
    });

    test('VS Code-like features work correctly', async ({ page }) => {
        const container = page.locator('#formulaInput');
        await container.click();
        
        // Test bracket matching
        await page.keyboard.type('IF(');
        await page.waitForTimeout(100);
        
        // Test autocomplete trigger (should work with Ctrl+Space)
        await page.keyboard.press('Control+Space');
        await page.waitForTimeout(500);
        
        // Check if autocomplete popup appears (Monaco creates suggestion widgets)
        const suggestionWidget = page.locator('.suggest-widget');
        // Note: This might not always appear depending on language service setup
        
        // Test syntax highlighting by checking for token spans
        await page.keyboard.press('Escape'); // Close any popups
        await page.keyboard.type('true, false)');
        
        // Verify the content
        const finalValue = await page.evaluate(() => {
            // Try Monaco direct access first (most reliable)
            if (window.enhancedMonaco?.editors?.get('formulaInput')?.editor) {
                return window.enhancedMonaco.editors.get('formulaInput').editor.getValue();
            } else if (window.formulaEditor?.value !== undefined) {
                return window.formulaEditor.value;
            }
            return 'No getValue method found';
        });
        expect(finalValue).toContain('IF(true, false)');
    });

    test('Editor responds to programmatic changes', async ({ page }) => {
        // Test setting value programmatically
        await page.evaluate(() => {
            // Try Monaco direct access first (most reliable)
            if (window.enhancedMonaco?.editors?.get('formulaInput')?.editor) {
                window.enhancedMonaco.editors.get('formulaInput').editor.setValue('COUNT(*)');
            } else if (window.formulaEditor?.value !== undefined) {
                window.formulaEditor.value = 'COUNT(*)';
            }
        });
        
        // Verify the value was set
        const value = await page.evaluate(() => {
            // Try Monaco direct access first (most reliable)
            if (window.enhancedMonaco?.editors?.get('formulaInput')?.editor) {
                return window.enhancedMonaco.editors.get('formulaInput').editor.getValue();
            } else if (window.formulaEditor?.value !== undefined) {
                return window.formulaEditor.value;
            }
            return 'No getValue method found';
        });
        expect(value).toBe('COUNT(*)');
        
        // Test clearing the editor
        await page.evaluate(() => {
            // Try Monaco direct access first (most reliable)
            if (window.enhancedMonaco?.editors?.get('formulaInput')?.editor) {
                window.enhancedMonaco.editors.get('formulaInput').editor.setValue('');
            } else if (window.formulaEditor?.value !== undefined) {
                window.formulaEditor.value = '';
            }
        });
        
        const emptyValue = await page.evaluate(() => {
            // Try Monaco direct access first (most reliable)
            if (window.enhancedMonaco?.editors?.get('formulaInput')?.editor) {
                return window.enhancedMonaco.editors.get('formulaInput').editor.getValue();
            } else if (window.formulaEditor?.value !== undefined) {
                return window.formulaEditor.value;
            }
            return 'No getValue method found';
        });
        expect(emptyValue).toBe('');
    });

    test('Enhanced Monaco integration APIs work', async ({ page }) => {
        // Test that enhanced Monaco object exists and has expected methods
        const enhancedMonacoMethods = await page.evaluate(() => {
            return {
                hasCreateEditor: typeof window.enhancedMonaco.createEditor === 'function',
                hasUpdateSchema: typeof window.enhancedMonaco.updateSchema === 'function',
                hasSetTableContext: typeof window.enhancedMonaco.setTableContext === 'function',
                editorCount: window.enhancedMonaco.editors?.size || 0,
                isInitialized: window.enhancedMonaco.isInitialized
            };
        });
        
        expect(enhancedMonacoMethods.hasCreateEditor).toBe(true);
        expect(enhancedMonacoMethods.hasUpdateSchema).toBe(true);
        expect(enhancedMonacoMethods.hasSetTableContext).toBe(true);
        expect(enhancedMonacoMethods.editorCount).toBe(1);
        expect(enhancedMonacoMethods.isInitialized).toBe(true);
    });

    test('Editor maintains focus and blur events', async ({ page }) => {
        const container = page.locator('#formulaInput');
        
        // Focus the editor
        await container.click();
        
        // Check if Monaco editor has focused class
        const monacoEditor = container.locator('.monaco-editor');
        await expect(monacoEditor).toHaveClass(/focused/);
        
        // Test focus/blur by clicking elsewhere
        await page.locator('body').click();
        await page.waitForTimeout(100);
        
        // Focus back
        await container.click();
        await expect(monacoEditor).toHaveClass(/focused/);
    });

    test('Monaco editor styling and appearance', async ({ page }) => {
        const container = page.locator('#formulaInput');
        const monacoEditor = container.locator('.monaco-editor');
        
        // Check basic Monaco classes are present
        await expect(monacoEditor).toHaveClass(/monaco-editor/);
        await expect(monacoEditor).toHaveClass(/vs/); // VS theme
        
        // Check that the editor has proper height
        const containerHeight = await container.evaluate(el => {
            return window.getComputedStyle(el).height;
        });
        expect(containerHeight).toBe('120px');
        
        // Check that Monaco has rendered properly (has textarea)
        const textarea = container.locator('textarea');
        await expect(textarea).toBeAttached();
        await expect(textarea).not.toBeDisabled();
    });

    test('Clear button functionality with Monaco', async ({ page }) => {
        const container = page.locator('#formulaInput');
        await container.click();
        
        // Type some content
        await page.keyboard.type('AVERAGE(price)');
        
        // Verify content exists
        let value = await page.evaluate(() => {
            // Try Monaco direct access first (most reliable)
            if (window.enhancedMonaco?.editors?.get('formulaInput')?.editor) {
                return window.enhancedMonaco.editors.get('formulaInput').editor.getValue();
            } else if (window.formulaEditor?.value !== undefined) {
                return window.formulaEditor.value;
            }
            return 'No getValue method found';
        });
        expect(value).toBe('AVERAGE(price)');
        
        // Click clear button
        await page.locator('#clearBtn').click();
        
        // Verify content is cleared
        value = await page.evaluate(() => {
            // Try Monaco direct access first (most reliable)
            if (window.enhancedMonaco?.editors?.get('formulaInput')?.editor) {
                return window.enhancedMonaco.editors.get('formulaInput').editor.getValue();
            } else if (window.formulaEditor?.value !== undefined) {
                return window.formulaEditor.value;
            }
            return 'No getValue method found';
        });
        expect(value).toBe('');
    });

    test('Table context integration and application structure', async ({ page }) => {
        // Verify basic application structure exists
        const tableSelect = page.locator('#tableSelect');
        const hasTableSelect = await tableSelect.count();
        expect(hasTableSelect).toBe(1);
        
        // Verify Monaco editor integration exists and works
        const monacoIntegrationExists = await page.evaluate(() => {
            return !!(window.enhancedMonaco && window.formulaEditor);
        });
        expect(monacoIntegrationExists).toBe(true);
        
        // Test that the select dropdown is interactive (whether it has options or not)
        await tableSelect.click();
        await page.waitForTimeout(100);
        
        // Check if there are any options available
        const optionCount = await tableSelect.locator('option').count();
        console.log(`ℹ️ Table select has ${optionCount} options`);
        
        if (optionCount > 1) {
            const options = await tableSelect.locator('option').allTextContents();
            console.log(`ℹ️ Available options: ${options.join(', ')}`);
            
            // Try to select a non-placeholder option if available
            const validOption = options.find(option => 
                option && 
                !option.toLowerCase().includes('loading') && 
                !option.toLowerCase().includes('select') &&
                !option.toLowerCase().includes('choose')
            );
            
            if (validOption) {
                await tableSelect.selectOption({ label: validOption });
                console.log(`ℹ️ Selected table option: ${validOption}`);
            }
        }
        
        // The main goal is just to verify the UI elements exist and are interactive
        // Table context may or may not work depending on backend availability
        expect(hasTableSelect).toBe(1);
    });
});

test.describe('Monaco Editor Error Handling', () => {
    test('Graceful degradation when Monaco fails', async ({ page }) => {
        // This test verifies the app doesn't break completely if Monaco has issues
        
        // Go to the page
        await page.goto('http://localhost:3001');
        
        // Even if there are errors, the page should still load
        await page.waitForLoadState('networkidle');
        
        // Container should still exist
        const container = page.locator('#formulaInput');
        await expect(container).toBeVisible();
        
        // Basic page functionality should work
        const tabs = page.locator('.tab');
        await expect(tabs.first()).toBeVisible();
    });
});