import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🌐 Opening enhanced diagnostic...');
  await page.goto('http://localhost:8080/public/enhanced-diagnostic.html');
  
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'enhanced-diagnostic.png', fullPage: true });
  console.log('📸 Screenshot saved: enhanced-diagnostic.png');
  
  const results = await page.textContent('#results');
  console.log('\n📊 Enhanced Results:');
  console.log(results);
  
  await browser.close();
})();
