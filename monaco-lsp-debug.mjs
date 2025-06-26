import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🔍 Debugging Monaco LSP...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  // Add a function to expose the LSP for debugging
  await page.addScriptTag({
    content: `
      // Expose LSP for debugging
      function exposeLSPForDebug() {
        // Get the Monaco integration
        if (window.enhancedMonaco && window.enhancedMonaco.languageServer) {
          window.debugLSP = window.enhancedMonaco.languageServer;
          return true;
        }
        
        // Try to get it from the module directly
        try {
          const monacoScript = document.querySelector('script[src*="monaco-enhanced-integration"]');
          if (monacoScript) {
            // Access the languageServer from the module
            // This is a bit tricky since it's in module scope
            console.log('Found Monaco script, but languageServer is in module scope');
          }
        } catch (e) {
          console.log('Could not access module scope');
        }
        
        return false;
      }
      
      window.exposeLSPForDebug = exposeLSPForDebug;
    `
  });
  
  const debugResults = await page.evaluate(() => {
    const results = {};
    
    try {
      // First, try to expose the LSP
      const lspExposed = window.exposeLSPForDebug();
      results.lspExposed = lspExposed;
      
      // Check if Monaco is available
      if (window.enhancedMonaco) {
        results.monacoAvailable = true;
        results.monacoInitialized = window.enhancedMonaco.isInitialized;
        
        // Get the formula input editor
        const formulaInput = document.getElementById('formulaInput');
        if (formulaInput) {
          results.formulaInputFound = true;
          
          // Set the value to trigger relationship navigation
          if (formulaInput._monaco) {
            formulaInput._monaco.setValue('assigned_rep_id_rel.');
            
            // Get the model
            const model = formulaInput._monaco.getModel();
            if (model) {
              results.modelAvailable = true;
              
              // Get completions by calling the Monaco provider directly
              const position = { lineNumber: 1, column: 19 }; // Position after the dot
              
              // This is async, but we'll try to get completions
              results.testingCompletions = true;
              results.currentValue = model.getValue();
              results.position = position;
            }
          }
        }
      }
      
      // Try to access developer tools client
      if (window.developerToolsClient) {
        results.developerToolsAvailable = true;
        results.developerToolsReady = window.developerToolsClient.isReady();
      }
      
    } catch (error) {
      results.error = error.message;
      results.stack = error.stack;
    }
    
    return results;
  });
  
  console.log('\n📊 Monaco LSP Debug Results:');
  console.log(JSON.stringify(debugResults, null, 2));
  
  // Now try to get actual completions by interacting with the editor
  if (debugResults.formulaInputFound) {
    console.log('\n🔍 Testing actual completions...');
    
    const completionResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const results = {};
          
          try {
            const formulaInput = document.getElementById('formulaInput');
            if (formulaInput && formulaInput._monaco) {
              const editor = formulaInput._monaco;
              const model = editor.getModel();
              
              // Position cursor at the end of "assigned_rep_id_rel."
              const position = model.getPositionAt(18);
              editor.setPosition(position);
              
              // Trigger completion manually
              editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
              
              // Get completion items (this is tricky since it's async)
              results.positionSet = true;
              results.completionTriggered = true;
              
              // Check if we can get the actual completions through Monaco's internal API
              if (window.monaco && window.monaco.languages) {
                results.monacoLanguagesAvailable = true;
              }
            }
          } catch (error) {
            results.error = error.message;
          }
          
          resolve(results);
        }, 1000);
      });
    });
    
    console.log('Completion trigger results:', JSON.stringify(completionResults, null, 2));
  }
  
  await browser.close();
})();
