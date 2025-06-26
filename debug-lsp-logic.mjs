import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🔍 Debugging LSP Logic for Relationship Navigation...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  const debugResult = await page.evaluate(() => {
    // Check which LSP instances are available
    const devToolsLsp = window.developerToolsClient?.lsp;
    const monacoLsp = window.enhancedMonaco?.languageServer;
    
    console.log('🔍 Available LSP instances:');
    console.log('- Developer Tools LSP:', !!devToolsLsp);
    console.log('- Monaco LSP:', !!monacoLsp);
    
    // Use the LSP that has the parseRelationshipNavigation method
    let lsp = null;
    if (devToolsLsp && typeof devToolsLsp.parseRelationshipNavigation === 'function') {
      lsp = devToolsLsp;
      console.log('Using Developer Tools LSP');
    } else if (monacoLsp && typeof monacoLsp.parseRelationshipNavigation === 'function') {
      lsp = monacoLsp;
      console.log('Using Monaco LSP');
    } else {
      console.log('No LSP with parseRelationshipNavigation found');
      
      // Check what methods are available
      if (devToolsLsp) {
        console.log('Developer Tools LSP methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(devToolsLsp)));
      }
      if (monacoLsp) {
        console.log('Monaco LSP methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(monacoLsp)));
      }
      
      return { error: 'No suitable LSP found' };
    }
    
    console.log('🔍 Starting relationship navigation debug...');
    
    const input = 'assigned_rep_id_rel.';
    const position = input.length; // Position at the end after the dot
    const tableName = 'customer';
    
    console.log(`Input: "${input}", Position: ${position}`);
    
    // Step 1: Analyze context
    console.log('Step 1: Analyzing context...');
    const context = lsp.analyzeContext(input, position);
    console.log('Context prefix:', context.prefix);
    console.log('Before cursor:', context.beforeCursor);
    console.log('After cursor:', context.afterCursor);
    console.log('Expecting identifier:', context.expectingIdentifier);
    console.log('Relationship navigation:', context.relationshipNavigation);
    
    // Step 2: Parse relationship navigation manually
    console.log('Step 2: Parsing relationship navigation...');
    const relNav = lsp.parseRelationshipNavigation(context.beforeCursor);
    console.log('Relationship navigation result:', relNav);
    
    // Step 3: Resolve target table
    console.log('Step 3: Resolving target table...');
    const targetTable = relNav ? lsp.resolveTargetTable(relNav, tableName) : null;
    console.log('Target table:', targetTable);
    
    // Step 4: Check the completion condition
    console.log('Step 4: Testing completion logic...');
    const conditionCheck = context.relationshipNavigation && (context.expectingIdentifier || context.relationshipNavigation.hasRelationshipNavigation);
    console.log('Relationship navigation condition met:', conditionCheck);
    
    // Step 5: Test what completions are returned
    console.log('Step 5: Testing completions...');
    const actualCompletions = lsp.getCompletions(input, position, tableName, true);
    console.log('Actual completions count:', actualCompletions.length);
    console.log('Actual completion labels:', actualCompletions.slice(0, 10).map(c => c.label));
    
    return {
      lspSource: lsp === devToolsLsp ? 'developerTools' : 'monaco',
      context: {
        prefix: context.prefix,
        expectingIdentifier: context.expectingIdentifier,
        relationshipNavigation: context.relationshipNavigation
      },
      targetTable,
      conditionCheck,
      actualCompletions: actualCompletions.slice(0, 10).map(c => ({ label: c.label, detail: c.detail }))
    };
  });
  
  console.log('\n📊 Debug Results:');
  console.log(JSON.stringify(debugResult, null, 2));
  
  await browser.close();
})(); 