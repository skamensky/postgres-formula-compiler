/**
 * Basic Monaco Editor Debug Test
 * Simple test to verify Monaco editor is working
 */

import { test, expect } from '@playwright/test';

const SERVER_URL = 'http://localhost:3001';

test.describe('Monaco Editor Basic Debug', () => {
    test('1. Monaco editor initializes and tables load', async ({ page }) => {
        console.log('🧪 Testing basic Monaco initialization...');

        // Navigate to the application
        await page.goto(SERVER_URL);
        
        // Wait for the page to fully load
        await page.waitForLoadState('networkidle');
        
        // Take initial screenshot
        await page.screenshot({ 
            path: 'test-results/debug-initial-load.png',
            fullPage: true
        });

        // Check if table select exists and gets populated
        const tableSelect = page.locator('#tableSelect');
        await expect(tableSelect).toBeVisible();
        
        // Wait for tables to load (up to 10 seconds)
        await page.waitForFunction(() => {
            const select = document.getElementById('tableSelect');
            return select && select.options.length > 1 && select.options[1].value !== '';
        }, { timeout: 10000 });
        
        // Check available table options
        const tableOptions = await page.evaluate(() => {
            const select = document.getElementById('tableSelect');
            const options = [];
            for (let i = 0; i < select.options.length; i++) {
                options.push({
                    value: select.options[i].value,
                    text: select.options[i].text
                });
            }
            return options;
        });
        
        console.log('Available table options:', tableOptions);
        
        // Select the first available table
        const firstTable = tableOptions.find(opt => opt.value && opt.value !== '');
        if (firstTable) {
            await page.selectOption('#tableSelect', firstTable.value);
            console.log(`Selected table: ${firstTable.value}`);
        }
        
        // Wait for Monaco to initialize
        await page.waitForTimeout(3000);
        
        // Take screenshot after table selection
        await page.screenshot({ 
            path: 'test-results/debug-table-selected.png',
            fullPage: true
        });

        // Check if Monaco editor exists
        const monacoExists = await page.evaluate(() => {
            return !!(window.enhancedMonaco && window.enhancedMonaco.editors);
        });
        
        console.log('Monaco exists:', monacoExists);
        
        if (monacoExists) {
            const editorCount = await page.evaluate(() => {
                return window.enhancedMonaco.editors.size;
            });
            console.log('Editor count:', editorCount);
        }

        // Check if formulaInput container exists
        const formulaInputExists = await page.evaluate(() => {
            return !!document.getElementById('formulaInput');
        });
        
        console.log('Formula input container exists:', formulaInputExists);
        expect(formulaInputExists).toBe(true);

        console.log('✅ Basic initialization test completed');
    });

    test('2. Type in Monaco editor and verify functionality', async ({ page }) => {
        console.log('🧪 Testing Monaco editor typing...');

        await page.goto(SERVER_URL);
        await page.waitForLoadState('networkidle');
        
        // Wait for tables to load and select first one
        await page.waitForFunction(() => {
            const select = document.getElementById('tableSelect');
            return select && select.options.length > 1;
        }, { timeout: 10000 });
        
        const firstTableValue = await page.evaluate(() => {
            const select = document.getElementById('tableSelect');
            for (let i = 1; i < select.options.length; i++) {
                if (select.options[i].value) return select.options[i].value;
            }
            return null;
        });
        
        if (firstTableValue) {
            await page.selectOption('#tableSelect', firstTableValue);
        }
        
        // Wait for Monaco initialization
        await page.waitForTimeout(3000);

        // Try to type in Monaco editor
        const formulaInput = page.locator('#formulaInput');
        await formulaInput.click();
        
        // Type a simple formula
        const testFormula = 'UPPER("test")';
        await page.keyboard.type(testFormula, { delay: 100 });
        
        // Wait for any processing
        await page.waitForTimeout(1000);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/debug-typing-test.png',
            fullPage: true
        });

        // Check if the text was entered
        const editorValue = await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editor = Array.from(window.enhancedMonaco.editors.values())[0];
                return editor.value || editor.editor?.getValue();
            }
            return null;
        });
        
        console.log('Editor value:', editorValue);
        
        if (editorValue) {
            expect(editorValue).toContain('UPPER');
        }

        console.log('✅ Typing test completed');
    });

    test('3. Check syntax highlighting functionality', async ({ page }) => {
        console.log('🧪 Testing syntax highlighting...');

        await page.goto(SERVER_URL);
        await page.waitForLoadState('networkidle');
        
        // Select table and type formula
        await page.waitForFunction(() => {
            const select = document.getElementById('tableSelect');
            return select && select.options.length > 1;
        }, { timeout: 10000 });
        
        const firstTableValue = await page.evaluate(() => {
            const select = document.getElementById('tableSelect');
            for (let i = 1; i < select.options.length; i++) {
                if (select.options[i].value) return select.options[i].value;
            }
            return null;
        });
        
        if (firstTableValue) {
            await page.selectOption('#tableSelect', firstTableValue);
        }
        
        await page.waitForTimeout(3000);
        
        // Type a formula with different token types
        await page.click('#formulaInput');
        await page.keyboard.type('UPPER("hello")', { delay: 100 });
        await page.waitForTimeout(1000);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/debug-syntax-highlighting.png',
            fullPage: true
        });

        // Check for syntax highlighting elements
        const highlightingInfo = await page.evaluate(() => {
            const container = document.querySelector('.syntax-highlight-container');
            if (container) {
                const functions = container.querySelectorAll('.formula-function').length;
                const strings = container.querySelectorAll('.formula-string').length;
                const punctuation = container.querySelectorAll('.formula-punctuation').length;
                return { functions, strings, punctuation, containerExists: true };
            }
            return { containerExists: false };
        });
        
        console.log('Syntax highlighting info:', highlightingInfo);

        console.log('✅ Syntax highlighting test completed');
    });
});