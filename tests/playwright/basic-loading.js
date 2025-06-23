import { chromium } from 'playwright';

async function testBasicLoading() {
    console.log('🚀 Starting basic loading test...');
    
    const browser = await chromium.launch({ 
        headless: true,
        slowMo: 100
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.log(`🖥️  [${type.toUpperCase()}] ${text}`);
        }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        console.error('❌ Page Error:', error.message);
        throw error;
    });
    
    // Listen for failed requests
    page.on('requestfailed', request => {
        console.error('❌ Request Failed:', request.url());
        throw new Error(`Request failed: ${request.url()}`);
    });
    
    try {
        console.log('📖 Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for initialization...');
        await page.waitForTimeout(5000);
        
        // Check page title
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        if (title !== 'Interactive Formula Compiler') {
            throw new Error(`Wrong title: ${title}`);
        }
        
        // Check if main elements exist
        const elements = [
            'h1',
            '#tableSelect',
            '#formulaInput', 
            '#executeBtn',
            '#formulaResults'
        ];
        
        for (const selector of elements) {
            const element = await page.locator(selector).first();
            const exists = await element.count() > 0;
            console.log(`🔍 Element ${selector}: ${exists ? '✅ Found' : '❌ Missing'}`);
            if (!exists) {
                throw new Error(`Missing element: ${selector}`);
            }
        }
        
        // Check for table options
        console.log('🗃️  Checking table loading...');
        const tableSelect = page.locator('#tableSelect');
        await page.waitForTimeout(2000);
        
        const options = await tableSelect.locator('option').count();
        console.log(`📊 Table select options: ${options}`);
        if (options < 2) {
            throw new Error(`Not enough table options: ${options}`);
        }
        
        console.log('✅ Basic loading test passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Basic loading test failed:', error.message);
        await page.screenshot({ path: 'tests/playwright/screenshots/basic-loading-error.png' });
        throw error;
    } finally {
        await browser.close();
    }
}

export { testBasicLoading };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testBasicLoading().catch(process.exit.bind(process, 1));
}