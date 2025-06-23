import { chromium } from 'playwright';
import fs from 'fs';

async function testOpportunitySchema() {
    console.log('🎯 Testing opportunity table schema specifically...');
    
    const browser = await chromium.launch({ 
        headless: true,
        slowMo: 300
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
    
    try {
        console.log('📖 Loading webapp...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for initialization...');
        await page.waitForTimeout(6000);
        
        // Click schema tab
        console.log('🗂️  Clicking schema tab...');
        await page.locator('[data-tab="schema"]').click();
        await page.waitForTimeout(1000);
        
        // Select opportunity table
        console.log('🎯 Selecting opportunity table...');
        const schemaTableSelect = page.locator('#schemaTableSelect');
        await schemaTableSelect.selectOption('opportunity');
        await page.waitForTimeout(3000);
        
        // Get schema details content
        const schemaDetails = page.locator('#schemaDetails');
        const detailsText = await schemaDetails.textContent();
        
        console.log(`📋 Schema details length: ${detailsText?.length || 0} characters`);
        
        // Check if relationships are populated and names are not "undefined"
        const hasRelationshipSection = detailsText.includes('Relationships');
        const hasUndefinedNames = detailsText.includes('undefined');
        
        console.log(`🔗 Has relationship section: ${hasRelationshipSection ? '✅ Yes' : '❌ No'}`);
        console.log(`❓ Contains "undefined": ${hasUndefinedNames ? '❌ Yes' : '✅ No'}`);
        
        // Extract relationship names for detailed inspection
        const relationshipItems = await page.locator('.relationship-item strong').allTextContents();
        console.log('🔗 Found relationship names:');
        relationshipItems.forEach((name, index) => {
            console.log(`   ${index + 1}. "${name}"`);
        });
        
        // Validate no relationship name is "undefined"
        const undefinedRelationships = relationshipItems.filter(name => name === 'undefined');
        if (undefinedRelationships.length > 0) {
            throw new Error(`Found ${undefinedRelationships.length} relationships with "undefined" names`);
        }
        
        // Check for expected opportunity relationships
        const expectedRelNames = ['customer', 'listing', 'rep']; // These should exist for opportunity
        const foundExpectedRels = expectedRelNames.filter(expected => 
            relationshipItems.some(name => name.toLowerCase().includes(expected))
        );
        
        console.log(`🎯 Expected relationships found: ${foundExpectedRels.length}/${expectedRelNames.length}`);
        foundExpectedRels.forEach(rel => console.log(`   ✅ ${rel}`));
        
        // Get column count
        const columnItems = await page.locator('.column-item').count();
        console.log(`📊 Columns found: ${columnItems}`);
        
        // Take a specific screenshot
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/opportunity-schema.png',
            fullPage: true 
        });
        console.log('📸 Screenshot saved: tests/playwright/screenshots/opportunity-schema.png');
        
        console.log('✅ Opportunity schema test completed successfully!');
        
        return {
            success: true,
            relationshipCount: relationshipItems.length,
            undefinedCount: undefinedRelationships.length,
            columnCount: columnItems,
            hasRelationships: hasRelationshipSection,
            relationshipNames: relationshipItems
        };
        
    } catch (error) {
        console.error('❌ Opportunity schema test failed:', error.message);
        
        // Save debug info
        await page.screenshot({ 
            path: 'tests/playwright/screenshots/opportunity-schema-error.png',
            fullPage: true 
        });
        
        const html = await page.content();
        fs.writeFileSync('tests/playwright/debug/opportunity-schema-error.html', html);
        
        throw error;
    } finally {
        await browser.close();
    }
}

export { testOpportunitySchema };

// Auto-run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    testOpportunitySchema().catch(process.exit.bind(process, 1));
}