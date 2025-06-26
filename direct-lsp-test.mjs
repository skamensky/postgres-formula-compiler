import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🧪 Direct LSP Test...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  const testResults = await page.evaluate(() => {
    const results = {};
    
    try {
      // Access the LSP through Monaco integration
      if (window.enhancedMonaco && typeof window.enhancedMonaco.provideCompletions === 'function') {
        results.monacoLSPAvailable = true;
        
        // Create a mock model and position for testing
        const mockModel = {
          getValue: () => 'assigned_rep_id_rel.',
          getValueInRange: () => 'assigned_rep_id_rel.',
          getWordUntilPosition: () => ({ startColumn: 1, endColumn: 1 })
        };
        
        const mockPosition = { lineNumber: 1, column: 19 };
        
        // Test completion provider directly
        try {
          const completions = window.enhancedMonaco.provideCompletions(mockModel, mockPosition);
          results.completionTest = {
            success: true,
            completionCount: completions?.suggestions?.length || 0,
            suggestions: completions?.suggestions?.slice(0, 5).map(s => s.label) || []
          };
        } catch (error) {
          results.completionTest = {
            success: false,
            error: error.message
          };
        }
      } else {
        results.monacoLSPAvailable = false;
      }
      
      return results;
      
    } catch (error) {
      results.error = error.message;
      results.stack = error.stack;
      return results;
    }
  });
  
  console.log('\n📊 Direct LSP Test Results:');
  console.log(JSON.stringify(testResults, null, 2));
  
  // If the Monaco LSP isn't available, try to access developer tools LSP
  if (!testResults.monacoLSPAvailable) {
    console.log('\n🔧 Testing Developer Tools LSP...');
    
    const devToolsResults = await page.evaluate(() => {
      const results = {};
      
      try {
        if (window.developerToolsClient && window.developerToolsClient.lsp) {
          results.devToolsLSPAvailable = true;
          
          const lsp = window.developerToolsClient.lsp;
          
          // Test relationship navigation parsing
          const parseResult = lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
          results.parseTest = parseResult;
          
          // Test target table resolution
          if (parseResult) {
            const targetTable = lsp.resolveTargetTable(parseResult, 'customer');
            results.targetTableTest = targetTable;
          }
          
          // Test direct completions
          const completions = lsp.getCompletions('assigned_rep_id_rel.', 18, 'customer', true);
          results.completionTest = {
            success: true,
            completionCount: completions.length,
            suggestions: completions.slice(0, 5).map(c => ({ label: c.label, detail: c.detail }))
          };
          
        } else {
          results.devToolsLSPAvailable = false;
        }
        
      } catch (error) {
        results.error = error.message;
      }
      
      return results;
    });
    
    console.log('Developer Tools LSP Results:');
    console.log(JSON.stringify(devToolsResults, null, 2));
  }
  
  await browser.close();
})(); 