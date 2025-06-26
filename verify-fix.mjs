import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Verifying Relationship Navigation Fix...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8080/public/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const result = await page.evaluate(async () => {
      // Wait for app to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        // Test with real schema
        if (window.browserAPI && window.browserAPI.getFullSchema) {
          const schema = await window.browserAPI.getFullSchema();
          
          if (schema && schema.customer) {
            const hasDirectRels = !!schema.customer.directRelationships;
            const hasRels = !!schema.customer.relationships;
            
            // Create LSP with real schema
            const { FormulaLanguageServer } = await import('./lsp.js');
            const lsp = new FormulaLanguageServer(schema);
            
            // Test relationship navigation
            const relNav = lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
            const targetTable = relNav ? lsp.resolveTargetTable(relNav, 'customer') : null;
            
            return {
              success: true,
              schemaStructure: {
                hasDirectRelationships: hasDirectRels,
                hasRelationships: hasRels
              },
              relationshipNavigation: {
                parseWorked: !!relNav,
                resolveWorked: !!targetTable,
                targetTable: targetTable
              }
            };
          }
        }
        return { success: false, reason: 'No schema available' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('\n📊 Verification Results:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.relationshipNavigation.resolveWorked) {
      console.log('\n🎉 FIX SUCCESSFUL! Relationship navigation is working!');
    } else {
      console.log('\n❌ Fix needs additional work');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
