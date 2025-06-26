import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  await page.goto('http://localhost:8080/public/debug-integration.html');
  
  await page.waitForTimeout(3000);
  
  const results = await page.textContent('#results');
  console.log('\n📊 Debug Results:');
  console.log(results);
  
  await browser.close();
})();
