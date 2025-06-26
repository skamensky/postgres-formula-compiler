import { chromium } from 'playwright';

async function runComprehensiveTest() {
  console.log('🎯 Starting Comprehensive Relationship Navigation Test...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  try {
    // Test 1: Basic functionality verification
    console.log('\n🧪 Test 1: Basic LSP functionality');
    await page.goto('http://localhost:8080/public/debug-integration.html');
    await page.waitForTimeout(2000);
    
    // Check if the test passed
    const results1 = await page.textContent('#results');
    const hasFieldCompletions = results1.includes('Field completions: 3');
    
    if (hasFieldCompletions) {
      console.log('✅ Basic relationship navigation: PASSED');
    } else {
      console.log('❌ Basic relationship navigation: FAILED');
    }
    
    // Test 2: Check the main web interface
    console.log('\n🧪 Test 2: Main web interface');
    await page.goto('http://localhost:8080/public/');
    await page.waitForTimeout(2000);
    
    // Take screenshot of main interface
    await page.screenshot({ path: 'main-interface.png', fullPage: true });
    console.log('📸 Screenshot saved: main-interface.png');
    
    // Test 3: Execute LSP tests directly in browser
    console.log('\n🧪 Test 3: Direct browser LSP test');
    
    const browserTestResults = await page.evaluate(() => {
      const results = {
        lspAvailable: false,
        relationshipNavWorking: false,
        fieldCompletionsCount: 0,
        error: null
      };
      
      try {
        // Check if LSP class is available
        if (typeof FormulaLanguageServer !== 'undefined') {
          results.lspAvailable = true;
          
          // Create mock schema
          const mockSchema = {
            customer: {
              columns: [
                { column_name: 'id', data_type: 'integer' },
                { column_name: 'first_name', data_type: 'text' },
                { column_name: 'assigned_rep_id', data_type: 'integer' }
              ],
              directRelationships: [
                { relationship_name: 'assigned_rep_id', target_table_name: 'rep' }
              ]
            },
            rep: {
              columns: [
                { column_name: 'id', data_type: 'integer' },
                { column_name: 'name', data_type: 'text' },
                { column_name: 'commission_rate', data_type: 'decimal' },
                { column_name: 'hire_date', data_type: 'date' },
                { column_name: 'region', data_type: 'text' }
              ]
            }
          };
          
          // Create LSP instance
          const lsp = new FormulaLanguageServer(mockSchema);
          
          // Test relationship navigation
          const completions = lsp.getCompletions('assigned_rep_id_rel.', 18, 'customer', false);
          const fieldCompletions = completions.filter(c => c.kind === 'field');
          
          results.relationshipNavWorking = fieldCompletions.length > 0;
          results.fieldCompletionsCount = fieldCompletions.length;
          
          // Test specific field presence
          const hasNameField = fieldCompletions.some(c => c.label === 'name');
          const hasCommissionField = fieldCompletions.some(c => c.label === 'commission_rate');
          
          results.hasNameField = hasNameField;
          results.hasCommissionField = hasCommissionField;
          
          // Test prefix filtering
          const prefixCompletions = lsp.getCompletions('assigned_rep_id_rel.n', 19, 'customer', false);
          const prefixFieldCompletions = prefixCompletions.filter(c => c.kind === 'field');
          
          results.prefixFilteringWorks = prefixFieldCompletions.length > 0;
          results.prefixCompletionsCount = prefixFieldCompletions.length;
          
        }
        
      } catch (error) {
        results.error = error.message;
      }
      
      return results;
    });
    
    console.log('\n📊 Browser Test Results:');
    console.log(`✅ LSP Available: ${browserTestResults.lspAvailable}`);
    console.log(`✅ Relationship Navigation Working: ${browserTestResults.relationshipNavWorking}`);
    console.log(`📊 Field Completions Count: ${browserTestResults.fieldCompletionsCount}`);
    console.log(`✅ Has Name Field: ${browserTestResults.hasNameField}`);
    console.log(`✅ Has Commission Field: ${browserTestResults.hasCommissionField}`);
    console.log(`✅ Prefix Filtering Works: ${browserTestResults.prefixFilteringWorks}`);
    console.log(`📊 Prefix Completions Count: ${browserTestResults.prefixCompletionsCount}`);
    
    if (browserTestResults.error) {
      console.log(`❌ Error: ${browserTestResults.error}`);
    }
    
    // Final assessment
    const allTestsPassed = hasFieldCompletions && 
                          browserTestResults.lspAvailable && 
                          browserTestResults.relationshipNavWorking && 
                          browserTestResults.fieldCompletionsCount >= 3 &&
                          browserTestResults.hasNameField &&
                          browserTestResults.prefixFilteringWorks;
    
    console.log('\n🎯 FINAL ASSESSMENT:');
    if (allTestsPassed) {
      console.log('🎉 🎉 RELATIONSHIP NAVIGATION: FULLY WORKING! 🎉 🎉');
      console.log('✅ All core functionality verified');
      console.log('✅ Field completions working');
      console.log('✅ Prefix filtering working');
      console.log('✅ Target table resolution working');
    } else {
      console.log('❌ Some tests failed - relationship navigation needs more work');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

runComprehensiveTest().catch(console.error);
