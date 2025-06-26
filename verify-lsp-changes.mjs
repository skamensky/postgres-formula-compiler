import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🔍 Verifying LSP Changes...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  const result = await page.evaluate(() => {
    const lsp = window.developerToolsClient?.lsp;
    if (!lsp) return { error: 'LSP not found' };
    
    // Check if the methods I added exist
    const hasParseRelationshipNavigation = typeof lsp.parseRelationshipNavigation === 'function';
    const hasResolveTargetTable = typeof lsp.resolveTargetTable === 'function';
    const hasGetRelatedFieldCompletions = typeof lsp.getRelatedFieldCompletions === 'function';
    
    console.log('🔍 Method availability:');
    console.log('- parseRelationshipNavigation:', hasParseRelationshipNavigation);
    console.log('- resolveTargetTable:', hasResolveTargetTable);
    console.log('- getRelatedFieldCompletions:', hasGetRelatedFieldCompletions);
    
    if (!hasParseRelationshipNavigation) {
      return { 
        error: 'Changes not loaded - parseRelationshipNavigation missing',
        methodsAvailable: {
          parseRelationshipNavigation: hasParseRelationshipNavigation,
          resolveTargetTable: hasResolveTargetTable,
          getRelatedFieldCompletions: hasGetRelatedFieldCompletions
        }
      };
    }
    
    // Test the updated analyzeContext method
    const input = 'assigned_rep_id_rel.';
    const position = input.length;
    
    console.log('🧪 Testing analyzeContext...');
    const context = lsp.analyzeContext(input, position);
    
    console.log('Context relationship navigation:', context.relationshipNavigation);
    
    if (!context.relationshipNavigation) {
      return {
        error: 'analyzeContext not returning relationship navigation',
        context: {
          prefix: context.prefix,
          expectingIdentifier: context.expectingIdentifier,
          relationshipNavigation: context.relationshipNavigation
        }
      };
    }
    
    // Test parseRelationshipNavigation directly
    console.log('🧪 Testing parseRelationshipNavigation directly...');
    const directParse = lsp.parseRelationshipNavigation(input);
    console.log('Direct parse result:', directParse);
    
    // Test resolveTargetTable
    console.log('🧪 Testing resolveTargetTable...');
    const targetTable = lsp.resolveTargetTable(directParse, 'customer');
    console.log('Target table:', targetTable);
    
    // Test getCompletions with the new logic
    console.log('🧪 Testing getCompletions...');
    const completions = lsp.getCompletions(input, position, 'customer', true);
    console.log('Completions count:', completions.length);
    console.log('Completions:', completions.slice(0, 5).map(c => c.label));
    
    return {
      success: true,
      methodsAvailable: {
        parseRelationshipNavigation: hasParseRelationshipNavigation,
        resolveTargetTable: hasResolveTargetTable,
        getRelatedFieldCompletions: hasGetRelatedFieldCompletions
      },
      context: {
        relationshipNavigation: context.relationshipNavigation
      },
      directParse,
      targetTable,
      completions: completions.slice(0, 5).map(c => ({ label: c.label, detail: c.detail }))
    };
  });
  
  console.log('\n📊 Verification Results:');
  console.log(JSON.stringify(result, null, 2));
  
  await browser.close();
})(); 