import { chromium } from 'playwright';

(async () => {
  console.log('🎯 Final Relationship Navigation Test...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  // Test typing in the actual interface
  try {
    await page.click('#formulaInput .monaco-editor');
    await page.keyboard.type('assigned_rep_id_rel.');
    
    // Wait for autocomplete
    await page.waitForTimeout(2000);
    
    // Get suggestions
    const suggestions = await page.$$eval('.monaco-editor .suggest-widget .monaco-list-row', rows => 
      rows.map(row => {
        const labelEl = row.querySelector('.monaco-icon-label .monaco-icon-label-container .monaco-icon-name-container .label-name');
        return labelEl ? labelEl.textContent.trim() : row.textContent.trim();
      })
    );
    
    console.log('\n🎯 FINAL TEST RESULTS:');
    console.log('📋 Autocomplete suggestions:', suggestions);
    
    // Check for rep table fields specifically
    const repFields = ['name', 'region', 'license_number', 'phone_number', 'hire_date'];
    const hasRepFields = suggestions.some(s => repFields.includes(s.toLowerCase()));
    
    // Check for customer table fields (which shouldn't be there)
    const customerFields = ['address', 'budget_max', 'budget_min', 'city'];
    const hasCustomerFields = suggestions.some(s => customerFields.includes(s.toLowerCase()));
    
    if (hasRepFields && !hasCustomerFields) {
      console.log('✅ SUCCESS: Relationship navigation is working correctly!');
      console.log('✅ Showing rep table fields:', suggestions.filter(s => repFields.includes(s.toLowerCase())));
    } else if (hasCustomerFields) {
      console.log('❌ ISSUE: Still showing customer table fields instead of rep fields');
      console.log('❌ Customer fields found:', suggestions.filter(s => customerFields.includes(s.toLowerCase())));
    } else {
      console.log('⚠️  UNCLEAR: No clear rep or customer fields found');
      console.log('All suggestions:', suggestions);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  await browser.close();
})(); 