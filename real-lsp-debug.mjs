import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🔍 Debugging Real LSP Structure...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  const lspDebug = await page.evaluate(() => {
    const debug = {};
    
    try {
      // Check developer tools client
      if (window.developerToolsClient) {
        debug.developerToolsAvailable = true;
        debug.developerToolsReady = window.developerToolsClient.isReady();
        
        // Check if LSP is accessible through developer tools
        if (window.developerToolsClient.lsp) {
          debug.lspAvailable = true;
          debug.lspHasSchema = !!(window.developerToolsClient.lsp.schema);
          
          if (window.developerToolsClient.lsp.schema) {
            // Check customer table
            if (window.developerToolsClient.lsp.schema.customer) {
              debug.customerSchema = {
                hasColumns: !!(window.developerToolsClient.lsp.schema.customer.columns),
                hasDirectRelationships: !!(window.developerToolsClient.lsp.schema.customer.directRelationships),
                directRelationships: window.developerToolsClient.lsp.schema.customer.directRelationships || []
              };
            }
            
            // Check rep table
            if (window.developerToolsClient.lsp.schema.rep) {
              debug.repSchema = {
                hasColumns: !!(window.developerToolsClient.lsp.schema.rep.columns),
                columnCount: window.developerToolsClient.lsp.schema.rep.columns?.length || 0
              };
            }
            
            // Test relationship navigation
            debug.relationshipTests = {};
            
            const lsp = window.developerToolsClient.lsp;
            
            // Test parsing
            debug.relationshipTests.parseResult = lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
            
            // Test target table resolution
            if (debug.relationshipTests.parseResult) {
              debug.relationshipTests.targetTable = lsp.resolveTargetTable(debug.relationshipTests.parseResult, 'customer');
            }
            
            // Test completions
            const completions = lsp.getCompletions('assigned_rep_id_rel.', 18, 'customer', true);
            debug.relationshipTests.completions = {
              count: completions.length,
              firstFive: completions.slice(0, 5).map(c => ({ 
                label: c.label, 
                detail: c.detail,
                kind: c.kind 
              }))
            };
          }
        } else {
          debug.lspAvailable = false;
        }
      } else {
        debug.developerToolsAvailable = false;
      }
      
    } catch (error) {
      debug.error = error.message;
      debug.stack = error.stack;
    }
    
    return debug;
  });
  
  console.log('\n📊 Real LSP Debug Results:');
  console.log(JSON.stringify(lspDebug, null, 2));
  
  await browser.close();
})();
