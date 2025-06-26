import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🌐 Opening http://localhost:8080/public/diagnostic.html');
  await page.goto('http://localhost:8080/public/diagnostic.html');
  
  // Wait for the test to complete
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'diagnostic-test.png', fullPage: true });
  console.log('📸 Screenshot saved: diagnostic-test.png');
  
  // Get final results
  const results = await page.textContent('#results');
  console.log('\n📊 Final Results from Browser:');
  console.log(results);
  
  await browser.close();
})();
