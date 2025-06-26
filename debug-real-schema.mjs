import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🔍 Debugging Real Schema and LSP...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(3000);
  
  const debugResults = await page.evaluate(() => {
    const results = {};
    
    try {
      // Check if LSP is available and what schema it has
      if (window.lsp) {
        results.lspAvailable = true;
        results.schemaAvailable = !!window.lsp.schema;
        
        if (window.lsp.schema) {
          results.schemaKeys = Object.keys(window.lsp.schema);
          
          // Check customer table structure
          if (window.lsp.schema.customer) {
            results.customerColumns = window.lsp.schema.customer.columns?.map(c => c.column_name) || [];
            results.customerRelationships = window.lsp.schema.customer.relationships || [];
            results.customerDirectRelationships = window.lsp.schema.customer.directRelationships || [];
          }
          
          // Check rep table structure
          if (window.lsp.schema.rep) {
            results.repColumns = window.lsp.schema.rep.columns?.map(c => c.column_name) || [];
          }
        }
        
        // Test relationship navigation parsing
        const relNav = window.lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
        results.parseRelationshipResult = relNav;
        
        if (relNav) {
          // Test target table resolution
          const targetTable = window.lsp.resolveTargetTable(relNav, 'customer');
          results.targetTable = targetTable;
          
          // Test actual getCompletions call (what the UI uses)
          const completions = window.lsp.getCompletions('assigned_rep_id_rel.', 18, 'customer', true);
          results.completionsCount = completions.length;
          results.completionTypes = {};
          
          completions.forEach(comp => {
            if (!results.completionTypes[comp.kind]) {
              results.completionTypes[comp.kind] = 0;
            }
            results.completionTypes[comp.kind]++;
          });
          
          results.sampleCompletions = completions.slice(0, 5).map(c => ({
            label: c.label,
            kind: c.kind,
            detail: c.detail
          }));
        }
        
      } else {
        results.lspAvailable = false;
      }
      
    } catch (error) {
      results.error = error.message;
      results.stack = error.stack;
    }
    
    return results;
  });
  
  console.log('\n📊 Real Schema Debug Results:');
  console.log(JSON.stringify(debugResults, null, 2));
  
  await browser.close();
})();
