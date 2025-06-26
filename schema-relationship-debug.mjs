import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🔍 Debugging Schema Relationship Structure...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  const schemaDebug = await page.evaluate(() => {
    const debug = {};
    
    try {
      if (window.lsp && window.lsp.schema) {
        // Check customer table structure
        if (window.lsp.schema.customer) {
          debug.customerSchema = {
            columns: window.lsp.schema.customer.columns?.map(c => c.column_name) || [],
            directRelationships: window.lsp.schema.customer.directRelationships || [],
            relationships: window.lsp.schema.customer.relationships || []
          };
        }
        
        // Check rep table structure  
        if (window.lsp.schema.rep) {
          debug.repSchema = {
            columns: window.lsp.schema.rep.columns?.map(c => c.column_name) || []
          };
        }
        
        // Test relationship navigation specifically
        debug.relationshipTests = {};
        
        // Test 1: Parse relationship navigation for assigned_rep_id_rel.
        debug.relationshipTests.parseResult = window.lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
        
        // Test 2: If parsed successfully, try to resolve target table
        if (debug.relationshipTests.parseResult) {
          debug.relationshipTests.targetTable = window.lsp.resolveTargetTable(debug.relationshipTests.parseResult, 'customer');
        }
        
        // Test 3: Check completions for just 'assigned_rep_id_rel.' 
        const completions = window.lsp.getCompletions('assigned_rep_id_rel.', 18, 'customer', true);
        debug.relationshipTests.completions = {
          count: completions.length,
          labels: completions.map(c => c.label),
          firstFiveDetails: completions.slice(0, 5).map(c => ({ label: c.label, detail: c.detail }))
        };
        
        // Test 4: Test the relationship pattern matching
        debug.relationshipTests.regexTest = /([a-zA-Z_][a-zA-Z0-9_]*_rel\.)+$/.test('assigned_rep_id_rel.');
        
        // Test 5: Check what happens with just the column name
        debug.relationshipTests.columnNameTest = window.lsp.parseRelationshipNavigation('assigned_rep_id.');
        
      } else {
        debug.error = 'LSP or schema not available';
      }
      
    } catch (error) {
      debug.error = error.message;
      debug.stack = error.stack;
    }
    
    return debug;
  });
  
  console.log('\n📊 Schema & Relationship Debug Results:');
  console.log(JSON.stringify(schemaDebug, null, 2));
  
  await browser.close();
})();
