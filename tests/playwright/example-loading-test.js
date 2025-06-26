/**
 * Playwright Test: Example Loading into Monaco Editor
 * Tests that clicking on examples properly populates the Monaco editor
 */

import { test, expect } from '@playwright/test';

test.describe('Example Loading', () => {
  test.beforeEach(async ({ page }) => {
    // Start with fresh page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForSelector('.tab-content', { timeout: 10000 });
    
    // Wait for enhanced Monaco to be available
    await page.waitForFunction(() => {
      return window.enhancedMonaco !== undefined;
    }, { timeout: 15000 });
    
    console.log('Page loaded and Enhanced Monaco available');
  });

  test('should populate Monaco editor when clicking examples', async ({ page }) => {
    console.log('🧪 Testing example loading into Monaco editor...');
    
    // Step 1: Navigate to Examples tab
    console.log('Step 1: Navigate to Examples tab');
    await page.click('[data-tab="examples"]');
    await page.waitForSelector('#examplesList', { timeout: 5000 });
    
    // Step 2: Wait for examples to load
    console.log('Step 2: Wait for examples to load');
    await page.waitForFunction(() => {
      const examplesList = document.getElementById('examplesList');
      return examplesList && examplesList.innerHTML.includes('example-card');
    }, { timeout: 10000 });
    
    // Step 3: Get the first available example
    console.log('Step 3: Find first example');
    const firstExample = await page.locator('.example-card').first();
    await expect(firstExample).toBeVisible();
    
    // Get example details before clicking
    const exampleDetails = await page.evaluate(() => {
      const firstCard = document.querySelector('.example-card');
      if (!firstCard) return null;
      
      const codeElement = firstCard.querySelector('.example-code');
      const formula = codeElement ? codeElement.textContent.trim() : null;
      
      // Extract table from onclick attribute
      const onclick = firstCard.getAttribute('onclick');
      const tableMatch = onclick ? onclick.match(/'([^']+)',\s*'([^']+)'/) : null;
      const table = tableMatch ? tableMatch[2] : null;
      
      return { formula, table };
    });
    
    console.log('Found example:', exampleDetails);
    expect(exampleDetails).not.toBeNull();
    expect(exampleDetails.formula).toBeTruthy();
    expect(exampleDetails.table).toBeTruthy();
    
    // Step 4: Check Monaco editor before clicking
    console.log('Step 4: Check Monaco editor state before clicking');
    const beforeValue = await page.evaluate(() => {
      try {
        if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
          return window.enhancedMonaco.editors.get('formulaInput').editor.getValue();
        }
        return 'Monaco not available';
      } catch (error) {
        return `Error: ${error.message}`;
      }
    });
    console.log('Monaco editor value before:', beforeValue);
    
    // Step 5: Click the example
    console.log('Step 5: Click the example');
    await firstExample.click();
    
    // Step 6: Wait for tab switch to compiler
    console.log('Step 6: Wait for tab switch');
    await page.waitForSelector('[data-tab="compiler"].active', { timeout: 5000 });
    
    // Step 7: Verify Monaco editor value after clicking
    console.log('Step 7: Check Monaco editor after clicking');
    const afterValue = await page.evaluate(() => {
      try {
        if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
          const editor = window.enhancedMonaco.editors.get('formulaInput').editor;
          return {
            value: editor.getValue(),
            hasEditor: true
          };
        } else if (window.formulaEditor && window.formulaEditor.editor) {
          return {
            value: window.formulaEditor.editor.getValue(),
            hasEditor: true
          };
        } else {
          const textarea = document.getElementById('formulaInput');
          return {
            value: textarea ? textarea.value : 'No input found',
            hasEditor: false
          };
        }
      } catch (error) {
        return {
          value: `Error: ${error.message}`,
          hasEditor: false,
          error: error.toString()
        };
      }
    });
    
    console.log('Monaco editor value after:', afterValue);
    
    // Step 8: Verify the formula was loaded
    console.log('Step 8: Verify formula was loaded');
    expect(afterValue.value).toBe(exampleDetails.formula);
    
    // Step 9: Verify table selection
    console.log('Step 9: Verify table selection');
    const tableSelectValue = await page.inputValue('#tableSelect');
    expect(tableSelectValue).toBe(exampleDetails.table);
    
    // Step 10: Check that Monaco editor is actually available
    console.log('Step 10: Check Monaco editor availability');
    expect(afterValue.hasEditor).toBe(true);
    
    console.log('✅ Example loading test passed!');
  });
  
  test('should debug Monaco editor state during example loading', async ({ page }) => {
    console.log('🔍 Debug test: Monaco editor state');
    
    // Navigate to Examples tab
    await page.click('[data-tab="examples"]');
    await page.waitForSelector('#examplesList', { timeout: 5000 });
    
    // Wait for examples to load
    await page.waitForFunction(() => {
      const examplesList = document.getElementById('examplesList');
      return examplesList && examplesList.innerHTML.includes('example-card');
    }, { timeout: 10000 });
    
    // Debug: Check what Monaco objects are available
    const monacoDebug = await page.evaluate(() => {
      const debug = {
        enhancedMonaco: !!window.enhancedMonaco,
        formulaEditor: !!window.formulaEditor,
        editors: null,
        formulaInputEditor: null
      };
      
      if (window.enhancedMonaco) {
        debug.editors = window.enhancedMonaco.editors ? Object.keys(window.enhancedMonaco.editors._editors || {}) : 'No editors';
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
    
    console.log('Monaco Debug Info:', JSON.stringify(monacoDebug, null, 2));
    
    // Get first example and click it
    const firstExample = await page.locator('.example-card').first();
    await firstExample.click();
    
    // Wait a moment for the action to complete
    await page.waitForTimeout(1000);
    
    // Check console logs for any errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'warn' || msg.type() === 'error') {
        logs.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    
    // Wait a bit more to capture logs
    await page.waitForTimeout(2000);
    
    console.log('Console logs during example loading:');
    logs.forEach(log => console.log(log));
  });
});