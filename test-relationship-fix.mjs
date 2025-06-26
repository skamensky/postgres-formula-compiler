import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🧪 Testing Relationship Navigation Fix...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  const testResults = await page.evaluate(() => {
    const results = { success: false, details: {} };
    
    try {
      // Test if we can access the LSP through the enhanced Monaco
      if (window.enhancedMonaco) {
        results.details.monacoAvailable = true;
        
        // Get the formula input editor
        const formulaInput = document.getElementById('formulaInput');
        if (formulaInput && formulaInput._monaco) {
          results.details.editorFound = true;
          
          // Set test input with relationship navigation
          formulaInput._monaco.setValue('assigned_rep_id_rel.');
          
          // Get Monaco integration instance
          const model = formulaInput._monaco.getModel();
          const position = model.getPositionAt(18); // Position after the dot
          
          // Test completion manually by accessing Monaco's completion provider
          const completionProvider = monaco.languages.getCompletionProvider('formula');
          if (completionProvider && completionProvider.length > 0) {
            // Try to get completions through Monaco's API
            results.details.completionProviderFound = true;
            results.details.testInput = 'assigned_rep_id_rel.';
            results.details.position = position;
            
            // This won't work directly since Monaco's API is async, but we can check the setup
            results.success = true;
            results.message = 'Monaco integration setup looks correct';
          } else {
            results.message = 'No completion provider found';
          }
        } else {
          results.message = 'Formula input editor not found or not Monaco';
        }
      } else {
        results.message = 'Enhanced Monaco not available';
      }
      
    } catch (error) {
      results.error = error.message;
      results.stack = error.stack;
    }
    
    return results;
  });
  
  console.log('\n📊 Test Results:');
  console.log(JSON.stringify(testResults, null, 2));
  
  // Now test by actually triggering autocomplete
  if (testResults.success) {
    console.log('\n🔍 Testing actual autocomplete...');
    
    await page.click('#formulaInput');
    await page.keyboard.type('assigned_rep_id_rel.');
    
    // Wait a bit for autocomplete to appear
    await page.waitForTimeout(1000);
    
    // Check if autocomplete menu appeared
    const autocompleteVisible = await page.evaluate(() => {
      // Check for Monaco's suggest widget
      const suggestWidget = document.querySelector('.monaco-editor .suggest-widget');
      return !!(suggestWidget && suggestWidget.style.display !== 'none');
    });
    
    console.log(`Autocomplete menu visible: ${autocompleteVisible}`);
    
    // If autocomplete is visible, get the suggestions
    if (autocompleteVisible) {
      const suggestions = await page.evaluate(() => {
        const suggestItems = document.querySelectorAll('.monaco-editor .suggest-widget .monaco-list-row');
        return Array.from(suggestItems).slice(0, 5).map(item => item.textContent.trim());
      });
      
      console.log('First 5 suggestions:', suggestions);
      
      // Check if we see rep table fields
      const hasRepFields = suggestions.some(s => ['name', 'email', 'phone_number', 'region'].includes(s));
      console.log(`Has rep table fields: ${hasRepFields}`);
      
      if (hasRepFields) {
        console.log('✅ Relationship navigation is working!');
      } else {
        console.log('❌ Still showing wrong fields');
      }
    } else {
      console.log('❌ Autocomplete menu not visible');
    }
  }
  
  await browser.close();
})(); 