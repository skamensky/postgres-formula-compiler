import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🧪 Testing After Relationship Dot...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(3000);
  
  const tests = [
    { input: 'assigned_rep_id_rel', position: 17, description: 'Before the dot' },
    { input: 'assigned_rep_id_rel.', position: 18, description: 'Right after the dot' },
    { input: 'assigned_rep_id_rel.n', position: 19, description: 'After dot with prefix' }
  ];
  
  for (const test of tests) {
    console.log(`\n🔍 Testing: ${test.description}`);
    console.log(`Input: "${test.input}", Position: ${test.position}`);
    
    const result = await page.evaluate((testData) => {
      const lsp = window.developerToolsClient?.lsp;
      if (!lsp) return { error: 'LSP not found' };
      
      // Test the context analysis
      const context = lsp.analyzeContext(testData.input, testData.position);
      
      // Test completions
      const completions = lsp.getCompletions(testData.input, testData.position, 'customer', true);
      
      return {
        context: {
          prefix: context.prefix,
          expectingIdentifier: context.expectingIdentifier,
          relationshipNavigation: context.relationshipNavigation
        },
        completions: {
          count: completions.length,
          first5: completions.slice(0, 5).map(c => ({ 
            label: c.label, 
            detail: c.detail,
            kind: c.kind 
          }))
        }
      };
    }, test);
    
    console.log(JSON.stringify(result, null, 2));
  }
  
  // Test the rep table schema to make sure it has columns
  console.log('\n🔍 Checking rep table schema...');
  const repSchema = await page.evaluate(() => {
    const lsp = window.developerToolsClient?.lsp;
    if (!lsp || !lsp.schema || !lsp.schema.rep) return { error: 'Rep schema not found' };
    
    return {
      columnsCount: lsp.schema.rep.columns?.length || 0,
      columns: lsp.schema.rep.columns?.slice(0, 10).map(c => c.column_name) || []
    };
  });
  
  console.log('Rep schema:', JSON.stringify(repSchema, null, 2));
  
  await browser.close();
})(); 