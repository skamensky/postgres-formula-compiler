/**
 * Playwright Test - Debug assigned_rep_rel.name Issue
 * Tests the specific formula that's failing and captures detailed console output
 */

import { chromium } from 'playwright';

async function testAssignedRepFormula() {
    console.log('🚀 Testing assigned_rep_rel.name formula...\n');
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Capture all console messages for debugging
    const consoleMessages = [];
    page.on('console', msg => {
        const message = `[${msg.type()}] ${msg.text()}`;
        consoleMessages.push(message);
        console.log(message);
    });
    
    // Capture any errors
    page.on('pageerror', error => {
        console.error('❌ Page Error:', error.message);
    });
    
    try {
        // Navigate to the application
        console.log('📂 Loading application...');
        await page.goto('http://localhost:3000');
        
        // Wait for application to initialize
        await page.waitForSelector('#formulaInput', { timeout: 10000 });
        console.log('✅ Application loaded');
        
        // Wait a bit for full initialization and check API availability
        await page.waitForTimeout(2000);
        
        const apiStatus = await page.evaluate(() => {
            return {
                executeFormula: typeof window.executeFormula,
                getTableSchema: typeof window.getTableSchema, 
                getTables: typeof window.getTables,
                browserAPI: !!window.browserAPI || !!window.initializeBrowserAPI
            };
        });
        console.log('✅ API Status:', apiStatus);
        
        // Set table to opportunity (assuming that's where assigned_rep relationship exists)
        await page.selectOption('#tableSelect', 'opportunity');
        console.log('✅ Set table to opportunity');
        
        // Test the problematic formula
        console.log('\n🧪 Testing formula: assigned_rep_rel.name');
        
        const result = await page.evaluate(async () => {
            try {
                // Get detailed information about the opportunity table schema
                const schema = await window.getTableSchema('opportunity');
                console.log('🔍 Opportunity table schema:', schema);
                
                // Check what relationships exist
                console.log('🔍 Direct relationships:', schema.directRelationships);
                console.log('🔍 Reverse relationships:', schema.reverseRelationships);
                
                // Try to execute the formula
                const formulaResult = await window.executeFormula('assigned_rep_rel.name', 'opportunity');
                
                return {
                    success: true,
                    schema: schema,
                    formulaResult: formulaResult
                };
                
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    stack: error.stack
                };
            }
        });
        
        console.log('\n📊 Test Results:');
        console.log('='.repeat(50));
        
        if (result.success) {
            console.log('✅ Formula executed successfully!');
            console.log('📋 Schema information:');
            console.log('   Direct relationships:', result.schema.directRelationships?.length || 0);
            console.log('   Reverse relationships:', result.schema.reverseRelationships?.length || 0);
            
            if (result.formulaResult.success) {
                console.log('✅ Formula compilation successful');
                console.log('📝 Generated SQL:', result.formulaResult.sql);
            } else {
                console.log('❌ Formula compilation failed:', result.formulaResult.error);
            }
        } else {
            console.log('❌ Test failed:', result.error);
            if (result.stack) {
                console.log('Stack trace:', result.stack);
            }
        }
        
        // Check specifically for assigned_rep relationship
        console.log('\n🔍 Detailed Relationship Analysis:');
        const relationshipAnalysis = await page.evaluate(() => {
            // Access the compiled schema that was built
            return new Promise(async (resolve) => {
                try {
                    const allTables = await window.getTables();
                    const opportunitySchema = await window.getTableSchema('opportunity');
                    
                    // Look for assigned_rep specifically
                    const assignedRepRelationship = opportunitySchema.directRelationships?.find(
                        rel => rel.relationship_name === 'assigned_rep'
                    );
                    
                    resolve({
                        allTables: allTables.tables,
                        opportunityRelationships: opportunitySchema.directRelationships,
                        assignedRepFound: !!assignedRepRelationship,
                        assignedRepDetails: assignedRepRelationship
                    });
                } catch (error) {
                    resolve({ error: error.message });
                }
            });
        });
        
        console.log('Available tables:', relationshipAnalysis.allTables);
        console.log('Opportunity relationships:', relationshipAnalysis.opportunityRelationships);
        console.log('assigned_rep relationship found:', relationshipAnalysis.assignedRepFound);
        if (relationshipAnalysis.assignedRepDetails) {
            console.log('assigned_rep details:', relationshipAnalysis.assignedRepDetails);
        }
        
        console.log('\n📋 Console Messages Summary:');
        consoleMessages.forEach(msg => {
            if (msg.includes('assigned_rep') || msg.includes('rep') || msg.includes('ERROR') || msg.includes('❌')) {
                console.log(msg);
            }
        });
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testAssignedRepFormula().catch(console.error);