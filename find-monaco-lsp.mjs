import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🔍 Finding Monaco LSP Instance...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  const result = await page.evaluate(() => {
    console.log('🔍 Searching for Monaco LSP...');
    
    // Check various paths for Monaco LSP
    const paths = [
      'window.enhancedMonaco.languageServer',
      'window.enhancedMonaco.lsp', 
      'window.languageServer',
      'window.lsp'
    ];
    
    const found = {};
    
    paths.forEach(path => {
      try {
        const obj = eval(path);
        found[path] = {
          exists: !!obj,
          hasParseRelationshipNavigation: !!(obj && typeof obj.parseRelationshipNavigation === 'function'),
          type: typeof obj
        };
      } catch (e) {
        found[path] = { exists: false, error: e.message };
      }
    });
    
    // Also check if Monaco integration has the languageServer internally
    if (window.enhancedMonaco) {
      console.log('Enhanced Monaco properties:', Object.getOwnPropertyNames(window.enhancedMonaco));
      
      // Check if we can access the internal languageServer
      try {
        // The Monaco integration should have a private languageServer variable
        // Let's see if we can access it through the global scope of the module
        console.log('Checking Monaco integration for internal LSP...');
      } catch (e) {
        console.log('Could not access internal Monaco LSP');
      }
    }
    
    // Test the current LSP's analyzeContext method specifically for relationship navigation
    const devToolsLsp = window.developerToolsClient?.lsp;
    if (devToolsLsp) {
      console.log('Testing analyzeContext with relationship navigation...');
      
      const input = 'assigned_rep_id_rel.';
      const position = input.length;
      
      const context = devToolsLsp.analyzeContext(input, position);
      console.log('Context result:', {
        prefix: context.prefix,
        expectingIdentifier: context.expectingIdentifier,
        relationshipNavigation: context.relationshipNavigation,
        beforeCursor: context.beforeCursor
      });
      
      // The issue might be that analyzeContext doesn't properly parse relationship navigation
      // Let's see if we can call the relationship methods that do exist
      
      // Test if we can manually check for relationship pattern
      const relationshipPattern = /([a-zA-Z_][a-zA-Z0-9_]*_rel\.)+$/;
      const match = context.beforeCursor.match(relationshipPattern);
      
      console.log('Manual relationship pattern match:', !!match);
      if (match) {
        console.log('Match details:', match[0]);
        
        // Try to manually parse the relationship chain
        const chainText = match[0];
        const relationshipParts = chainText.split('.').filter(part => part.length > 0);
        const relationshipChain = relationshipParts.map(part => 
          part.endsWith('_rel') ? part.slice(0, -4) : part
        );
        
        console.log('Parsed relationship chain:', relationshipChain);
        
        // Test findRelationshipInTable which does exist
        if (relationshipChain.length > 0) {
          const relationship = devToolsLsp.findRelationshipInTable('customer', relationshipChain[0]);
          console.log('Found relationship:', relationship);
          
          if (relationship) {
            console.log('Target table should be:', relationship.target_table_name);
            
            // Test getting completions from the target table
            const targetCompletions = devToolsLsp.getColumnCompletions(relationship.target_table_name, '', true);
            console.log('Target table completions count:', targetCompletions.length);
            console.log('Target table completions:', targetCompletions.slice(0, 5).map(c => c.label));
          }
        }
      }
    }
    
    return {
      foundPaths: found,
      testCompleted: true
    };
  });
  
  console.log('\n📊 Results:');
  console.log(JSON.stringify(result, null, 2));
  
  await browser.close();
})(); 