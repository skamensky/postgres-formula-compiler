import { chromium } from 'playwright';

(async () => {
  console.log('🧪 Manual Web Interface Test...');
  const browser = await chromium.launch({ headless: true }); // Headless for server
  const page = await browser.newPage();
  
  // Add console logging
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  page.on('pageerror', err => console.error(`Page error: ${err.message}`));
  
  try {
    await page.goto('http://localhost:8080/public/');
    console.log('📄 Page loaded');
    
    // Wait for the page to load completely
    await page.waitForTimeout(5000);
    
    // Check if formula input exists
    const formulaInput = await page.$('#formulaInput');
    if (!formulaInput) {
      console.error('❌ Formula input not found');
      return;
    }
    console.log('✅ Formula input found');
    
    // Find and click the Monaco editor within the formula input
    const monacoEditor = await page.$('#formulaInput .monaco-editor');
    if (!monacoEditor) {
      console.error('❌ Monaco editor not found in formula input');
      return;
    }
    console.log('✅ Monaco editor found');
    
    // Click on the editor
    await page.click('#formulaInput .monaco-editor');
    console.log('🖱️ Clicked on Monaco editor');
    
    // Type the relationship navigation
    await page.keyboard.type('assigned_rep_id_rel.');
    console.log('⌨️ Typed "assigned_rep_id_rel."');
    
    // Wait for autocomplete to appear
    await page.waitForTimeout(2000);
    
    // Check if Monaco's suggest widget is visible
    const suggestWidget = await page.$('.monaco-editor .suggest-widget');
    if (suggestWidget) {
      console.log('✅ Autocomplete widget found');
      
      // Check if it's visible
      const isVisible = await page.$eval('.monaco-editor .suggest-widget', el => 
        getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden'
      );
      
      if (isVisible) {
        console.log('✅ Autocomplete widget is visible');
        
        // Get the suggestions
        const suggestions = await page.$$eval('.monaco-editor .suggest-widget .monaco-list-row', rows => 
          rows.map(row => {
            const labelEl = row.querySelector('.monaco-icon-label .monaco-icon-label-container .monaco-icon-name-container .label-name');
            return labelEl ? labelEl.textContent.trim() : row.textContent.trim();
          })
        );
        
        console.log('📋 Suggestions:', suggestions);
        
        // Check if we see rep table fields
        const repFields = ['name', 'email', 'phone_number', 'region', 'license_number'];
        const hasRepFields = suggestions.some(s => repFields.some(rf => s.toLowerCase().includes(rf.toLowerCase())));
        
        if (hasRepFields) {
          console.log('✅ SUCCESS: Rep table fields are showing in autocomplete!');
        } else {
          console.log('❌ ISSUE: Rep table fields are NOT showing. Got:', suggestions);
          console.log('Expected to see:', repFields);
        }
      } else {
        console.log('❌ Autocomplete widget exists but is not visible');
      }
    } else {
      console.log('❌ No autocomplete widget found');
      
      // Try to trigger it manually
      console.log('🔧 Trying to trigger autocomplete manually...');
      await page.keyboard.press('Control+Space');
      await page.waitForTimeout(1000);
      
      const suggestWidget2 = await page.$('.monaco-editor .suggest-widget');
      if (suggestWidget2) {
        console.log('✅ Autocomplete triggered manually');
      } else {
        console.log('❌ Still no autocomplete after manual trigger');
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  await browser.close();
})(); 