import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🔍 Schema & Relationship Navigation Debug...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  const debugResults = await page.evaluate(() => {
    const results = {};
    
    try {
      // Access the LSP 
      let lsp = null;
      if (window.developerToolsClient && window.developerToolsClient.lsp) {
        lsp = window.developerToolsClient.lsp;
        results.lspSource = 'developerToolsClient';
      } else if (window.enhancedMonaco && window.enhancedMonaco.languageServer) {
        lsp = window.enhancedMonaco.languageServer;
        results.lspSource = 'enhancedMonaco';
      }
      
      if (lsp) {
        results.lspAvailable = true;
        results.hasSchema = !!(lsp.schema);
        
        if (lsp.schema) {
          // Examine customer table schema
          if (lsp.schema.customer) {
            results.customerSchema = {
              hasColumns: !!(lsp.schema.customer.columns),
              columnCount: lsp.schema.customer.columns?.length || 0,
              hasDirectRelationships: !!(lsp.schema.customer.directRelationships),
              hasRelationships: !!(lsp.schema.customer.relationships),
              directRelationshipsCount: lsp.schema.customer.directRelationships?.length || 0,
              relationshipsCount: lsp.schema.customer.relationships?.length || 0
            };
            
            // Show actual relationships
            if (lsp.schema.customer.directRelationships) {
              results.customerDirectRelationships = lsp.schema.customer.directRelationships.map(rel => ({
                relationship_name: rel.relationship_name,
                target_table_name: rel.target_table_name,
                col_name: rel.col_name
              }));
            }
            
            if (lsp.schema.customer.relationships) {
              results.customerRelationships = lsp.schema.customer.relationships.map(rel => ({
                relationship_name: rel.relationship_name || rel.col_name,
                target_table_name: rel.target_table_name,
                col_name: rel.col_name
              }));
            }
          }
          
          // Examine rep table schema
          if (lsp.schema.rep) {
            results.repSchema = {
              hasColumns: !!(lsp.schema.rep.columns),
              columnCount: lsp.schema.rep.columns?.length || 0,
              columnNames: lsp.schema.rep.columns?.map(c => c.column_name) || []
            };
          }
          
          // Test relationship navigation step by step
          results.relationshipTests = {};
          
          // Test 1: Parse relationship navigation
          const parseResult = lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
          results.relationshipTests.parseResult = parseResult;
          
          // Test 2: Resolve target table
          if (parseResult) {
            const targetTable = lsp.resolveTargetTable(parseResult, 'customer');
            results.relationshipTests.targetTable = targetTable;
            
            // Test 3: Find relationship manually
            const relationship = lsp.findRelationshipInTable('customer', 'assigned_rep_id');
            results.relationshipTests.foundRelationship = relationship;
            
            // Test 4: Get related field completions if target table found
            if (targetTable) {
              const relatedFields = lsp.getRelatedFieldCompletions(targetTable, '', parseResult, true);
              results.relationshipTests.relatedFieldsCount = relatedFields.length;
              results.relationshipTests.relatedFields = relatedFields.slice(0, 5).map(f => ({
                label: f.label,
                detail: f.detail
              }));
            }
          }
          
          // Test 5: Try direct getCompletions call
          const completions = lsp.getCompletions('assigned_rep_id_rel.', 18, 'customer', true);
          results.relationshipTests.directCompletionsCount = completions.length;
          results.relationshipTests.directCompletions = completions.slice(0, 5).map(c => ({
            label: c.label,
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
  
  console.log('\n📊 Schema & Relationship Debug Results:');
  console.log(JSON.stringify(debugResults, null, 2));
  
  await browser.close();
})(); 