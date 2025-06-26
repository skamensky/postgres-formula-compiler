const { chromium } = require('playwright');
const path = require('path');

async function runRelationshipNavigationTest() {
  console.log('🚀 Starting Relationship Navigation Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // Slow down for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the local development server
    console.log('📍 Navigating to http://localhost:3457...');
    await page.goto('http://localhost:3457', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/playwright/screenshots/relationship-nav-01-initial-load.png',
      fullPage: true 
    });
    console.log('📸 Screenshot: Initial page load');
    
    // Look for the table selector and select "customer" table
    console.log('🔍 Looking for table selector...');
    const tableSelector = page.locator('select[id*="table"], select[name*="table"], #tableSelect, .table-select select');
    
    // Try multiple possible selectors
    let tableDropdown = null;
    const possibleSelectors = [
      'select#tableSelect',
      'select[name="table"]', 
      'select[id*="table"]',
      '#schema-tab select',
      '.table-selector select',
      'select'
    ];
    
    for (const selector of possibleSelectors) {
      try {
        tableDropdown = page.locator(selector).first();
        if (await tableDropdown.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found table selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!tableDropdown || !(await tableDropdown.isVisible())) {
      console.log('⚠️ Table selector not found, checking page content...');
      
      // Take screenshot to see what's on the page
      await page.screenshot({ 
        path: 'tests/playwright/screenshots/relationship-nav-02-page-content.png',
        fullPage: true 
      });
      
      // Try to find any select elements
      const allSelects = await page.locator('select').all();
      console.log(`Found ${allSelects.length} select elements`);
      
      for (let i = 0; i < allSelects.length; i++) {
        const select = allSelects[i];
        const options = await select.locator('option').all();
        console.log(`Select ${i}: ${options.length} options`);
        
        for (const option of options) {
          const optionText = await option.textContent();
          console.log(`  - Option: ${optionText}`);
          
          if (optionText && optionText.toLowerCase().includes('customer')) {
            console.log('✅ Found customer option in select', i);
            tableDropdown = select;
            break;
          }
        }
        if (tableDropdown) break;
      }
    }
    
    if (tableDropdown && await tableDropdown.isVisible()) {
      // Select customer table
      console.log('📋 Selecting customer table...');
      await tableDropdown.selectOption({ label: 'customer' });
      await page.waitForTimeout(1000);
      
      // Take screenshot after table selection
      await page.screenshot({ 
        path: 'tests/playwright/screenshots/relationship-nav-03-customer-selected.png',
        fullPage: true 
      });
      console.log('📸 Screenshot: Customer table selected');
    }
    
    // Look for Monaco editor or formula input
    console.log('🔍 Looking for formula editor...');
    let editor = null;
    
    const editorSelectors = [
      '.monaco-editor textarea',
      '.monaco-editor .view-lines',
      'textarea[placeholder*="formula"]',
      'textarea[placeholder*="Formula"]',
      '#formulaInput',
      '.formula-input',
      'textarea'
    ];
    
    for (const selector of editorSelectors) {
      try {
        editor = page.locator(selector).first();
        if (await editor.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found editor: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!editor || !(await editor.isVisible())) {
      console.log('⚠️ Formula editor not found, trying to find any text input...');
      
      // Look for any text inputs
      const allInputs = await page.locator('input[type="text"], textarea').all();
      console.log(`Found ${allInputs.length} text inputs`);
      
      if (allInputs.length > 0) {
        editor = allInputs[0];
        console.log('Using first text input found');
      }
    }
    
    if (editor && await editor.isVisible()) {
      // Test 1: Basic relationship navigation
      console.log('\n🧪 Test 1: Basic relationship navigation');
      console.log('Typing: assigned_rep_id_rel.');
      
      await editor.click();
      await editor.fill('');  // Clear any existing content
      await page.waitForTimeout(500);
      
      // Type the relationship navigation slowly
      await editor.type('assigned_rep_id_rel.', { delay: 200 });
      await page.waitForTimeout(2000);  // Wait for autocomplete
      
      // Take screenshot of autocomplete
      await page.screenshot({ 
        path: 'tests/playwright/screenshots/relationship-nav-04-basic-autocomplete.png',
        fullPage: true 
      });
      console.log('📸 Screenshot: Basic relationship navigation autocomplete');
      
      // Check if autocomplete popup is visible
      const autocompleteSelectors = [
        '.monaco-list-rows',
        '.suggest-widget',
        '.autocomplete-suggestions',
        '.completion-list',
        '[role="listbox"]',
        '.suggestions'
      ];
      
      let autocompleteVisible = false;
      let autocompleteElement = null;
      
      for (const selector of autocompleteSelectors) {
        try {
          autocompleteElement = page.locator(selector);
          if (await autocompleteElement.isVisible({ timeout: 1000 })) {
            autocompleteVisible = true;
            console.log(`✅ Autocomplete visible: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (autocompleteVisible) {
        // Count suggestions
        const suggestions = await autocompleteElement.locator('[role="option"], .completion-item, .list-item').all();
        console.log(`📊 Found ${suggestions.length} autocomplete suggestions`);
        
        // Log first few suggestions
        for (let i = 0; i < Math.min(5, suggestions.length); i++) {
          const suggestionText = await suggestions[i].textContent();
          console.log(`  - Suggestion ${i + 1}: ${suggestionText}`);
        }
      } else {
        console.log('⚠️ No autocomplete popup found');
        
        // Take a screenshot to see what's happening
        await page.screenshot({ 
          path: 'tests/playwright/screenshots/relationship-nav-04-no-autocomplete.png',
          fullPage: true 
        });
      }
      
      // Test 2: Relationship navigation with prefix
      console.log('\n🧪 Test 2: Relationship navigation with prefix');
      console.log('Typing: assigned_rep_id_rel.n');
      
      await editor.fill('');  // Clear
      await page.waitForTimeout(500);
      
      await editor.type('assigned_rep_id_rel.n', { delay: 200 });
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'tests/playwright/screenshots/relationship-nav-05-prefix-autocomplete.png',
        fullPage: true 
      });
      console.log('📸 Screenshot: Relationship navigation with prefix');
      
      // Check for filtered suggestions
      autocompleteVisible = false;
      for (const selector of autocompleteSelectors) {
        try {
          autocompleteElement = page.locator(selector);
          if (await autocompleteElement.isVisible({ timeout: 1000 })) {
            autocompleteVisible = true;
            console.log(`✅ Filtered autocomplete visible: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (autocompleteVisible) {
        const suggestions = await autocompleteElement.locator('[role="option"], .completion-item, .list-item').all();
        console.log(`📊 Found ${suggestions.length} filtered suggestions`);
        
        // Check if "name" field is present
        let nameFieldFound = false;
        for (let i = 0; i < suggestions.length; i++) {
          const suggestionText = await suggestions[i].textContent();
          console.log(`  - Filtered suggestion ${i + 1}: ${suggestionText}`);
          if (suggestionText && suggestionText.toLowerCase().includes('name')) {
            nameFieldFound = true;
          }
        }
        
        if (nameFieldFound) {
          console.log('✅ "name" field found in filtered suggestions');
        } else {
          console.log('❌ "name" field NOT found in filtered suggestions');
        }
      }
      
      // Test 3: Test console functionality for debugging
      console.log('\n🧪 Test 3: Console debugging');
      
      // Execute JavaScript to test LSP methods directly
      const debugResults = await page.evaluate(() => {
        const results = {};
        
        try {
          // Check if LSP is available
          if (window.lsp) {
            results.lspAvailable = true;
            
            // Test parseRelationshipNavigation
            const relNav = window.lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
            results.parseRelationshipNavigation = !!relNav;
            results.relationshipNavigationData = relNav;
            
            // Test resolveTargetTable if schema is available
            if (window.lsp.schema && relNav) {
              const targetTable = window.lsp.resolveTargetTable(relNav, 'customer');
              results.resolveTargetTable = !!targetTable;
              results.targetTable = targetTable;
            }
            
            // Test getRelatedFieldCompletions
            if (window.lsp.schema && relNav) {
              const targetTable = window.lsp.resolveTargetTable(relNav, 'customer');
              if (targetTable) {
                const completions = window.lsp.getRelatedFieldCompletions(targetTable, '', relNav, true);
                results.getRelatedFieldCompletions = completions.length > 0;
                results.completionsCount = completions.length;
                results.sampleCompletions = completions.slice(0, 3).map(c => c.label);
              }
            }
            
            // Check schema
            results.schemaAvailable = !!window.lsp.schema;
            if (window.lsp.schema) {
              results.schemaKeys = Object.keys(window.lsp.schema);
            }
            
          } else {
            results.lspAvailable = false;
          }
        } catch (error) {
          results.error = error.message;
        }
        
        return results;
      });
      
      console.log('\n📊 Debug Results:');
      console.log(JSON.stringify(debugResults, null, 2));
      
      // Final comprehensive screenshot
      await page.screenshot({ 
        path: 'tests/playwright/screenshots/relationship-nav-06-final-state.png',
        fullPage: true 
      });
      console.log('📸 Screenshot: Final test state');
      
      // Summary
      console.log('\n📋 Test Summary:');
      console.log(`✅ LSP Available: ${debugResults.lspAvailable}`);
      console.log(`✅ Schema Available: ${debugResults.schemaAvailable}`);
      console.log(`✅ parseRelationshipNavigation: ${debugResults.parseRelationshipNavigation}`);
      console.log(`✅ resolveTargetTable: ${debugResults.resolveTargetTable}`);
      console.log(`✅ getRelatedFieldCompletions: ${debugResults.getRelatedFieldCompletions}`);
      
      if (debugResults.completionsCount) {
        console.log(`📊 Completions found: ${debugResults.completionsCount}`);
        console.log(`🏷️ Sample completions: ${debugResults.sampleCompletions?.join(', ')}`);
      }
      
      // Determine overall success
      const allMethodsWorking = debugResults.lspAvailable && 
                               debugResults.schemaAvailable &&
                               debugResults.parseRelationshipNavigation && 
                               debugResults.resolveTargetTable && 
                               debugResults.getRelatedFieldCompletions;
                               
      if (allMethodsWorking) {
        console.log('\n🎉 RELATIONSHIP NAVIGATION TEST: PASSED');
      } else {
        console.log('\n❌ RELATIONSHIP NAVIGATION TEST: FAILED');
        
        if (!debugResults.lspAvailable) {
          console.log('   - LSP not available in window');
        }
        if (!debugResults.schemaAvailable) {
          console.log('   - Database schema not loaded');
        }
        if (!debugResults.parseRelationshipNavigation) {
          console.log('   - parseRelationshipNavigation method failed');
        }
        if (!debugResults.resolveTargetTable) {
          console.log('   - resolveTargetTable method failed');
        }
        if (!debugResults.getRelatedFieldCompletions) {
          console.log('   - getRelatedFieldCompletions method failed');
        }
      }
      
    } else {
      console.log('❌ Could not find formula editor to test');
      
      // Take screenshot to see current state
      await page.screenshot({ 
        path: 'tests/playwright/screenshots/relationship-nav-error-no-editor.png',
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'tests/playwright/screenshots/relationship-nav-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the test
runRelationshipNavigationTest().catch(console.error); 