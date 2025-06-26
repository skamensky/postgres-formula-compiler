import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🧪 Simple Relationship Test...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(3000);
  
  try {
    const result = await page.evaluate(() => {
      // Access LSP
      const lsp = window.developerToolsClient?.lsp;
      if (!lsp) return { error: 'LSP not found' };
      
      // Test basic relationship structure
      const customerSchema = lsp.schema?.customer;
      if (!customerSchema) return { error: 'Customer schema not found' };
      
      const directRels = customerSchema.directRelationships || [];
      const assignedRepRel = directRels.find(r => r.relationship_name === 'assigned_rep_id');
      
      return {
        hasSchema: !!lsp.schema,
        customerDirectRelsCount: directRels.length,
        directRels: directRels.map(r => ({ name: r.relationship_name, target: r.target_table_name })),
        assignedRepRelFound: !!assignedRepRel,
        assignedRepRel: assignedRepRel
      };
    });
    
    console.log('Schema check result:', JSON.stringify(result, null, 2));
    
    if (result.assignedRepRelFound) {
      console.log('✅ assigned_rep_id relationship found');
      
      // Test the actual completion call
      const completionResult = await page.evaluate(() => {
        const lsp = window.developerToolsClient.lsp;
        const completions = lsp.getCompletions('assigned_rep_id_rel.', 18, 'customer', true);
        return {
          count: completions.length,
          first5: completions.slice(0, 5).map(c => ({ label: c.label, detail: c.detail }))
        };
      });
      
      console.log('Completion result:', JSON.stringify(completionResult, null, 2));
      
      if (completionResult.count > 0) {
        console.log('✅ Relationship navigation is working!');
      } else {
        console.log('❌ No completions returned - debugging...');
        
        // Debug step by step
        const debugResult = await page.evaluate(() => {
          const lsp = window.developerToolsClient.lsp;
          
          const parseResult = lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
          const targetTable = parseResult ? lsp.resolveTargetTable(parseResult, 'customer') : null;
          const relationship = lsp.findRelationshipInTable('customer', 'assigned_rep_id');
          
          return {
            parseResult,
            targetTable,
            relationship,
            repSchema: lsp.schema?.rep ? {
              columns: lsp.schema.rep.columns?.length || 0,
              hasColumns: !!lsp.schema.rep.columns
            } : null
          };
        });
        
        console.log('Debug result:', JSON.stringify(debugResult, null, 2));
      }
    } else {
      console.log('❌ assigned_rep_id relationship not found');
      console.log('Available relationships:', result.directRels);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
  
  await browser.close();
})(); 