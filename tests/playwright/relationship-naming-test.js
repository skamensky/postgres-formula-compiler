/**
 * Relationship Naming Convention Test
 * 
 * This test verifies that the relationship naming follows the correct convention:
 * {field_name}_rel.{foreign_field_name}
 * 
 * Where field_name is the complete foreign key column name (including _id suffix)
 */

import { chromium } from 'playwright';

async function testRelationshipNaming() {
    console.log('🧪 Relationship Naming Convention Test');
    console.log('=====================================\n');
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Track test results
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function addTest(name, passed, details = '') {
        results.tests.push({ name, passed, details });
        if (passed) {
            results.passed++;
            console.log(`✅ ${name}`);
        } else {
            results.failed++;
            console.log(`❌ ${name}`);
            if (details) console.log(`   ${details}`);
        }
    }
    
    try {
        // Setup
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(5000);
        
        console.log('📋 Test Suite: Relationship Naming Convention');
        console.log('──────────────────────────────────────────\n');
        
        // =================================================================
        // TEST 1: Verify relationship generation follows naming convention
        // =================================================================
        console.log('🔍 Test Group 1: Relationship Generation');
        
        await page.selectOption('#tableSelect', 'customer');
        await page.waitForTimeout(2000);
        
        const relationshipAnalysis = await page.evaluate(async () => {
            const schema = await window.getTableSchema('customer');
            return {
                relationships: schema.directRelationships?.map(r => ({
                    name: r.relationship_name,
                    column: r.col_name,
                    target: r.target_table_name
                })) || []
            };
        });
        
        // Test 1.1: assigned_rep_id generates assigned_rep_id relationship
        const assignedRepRel = relationshipAnalysis.relationships.find(r => r.column === 'assigned_rep_id');
        addTest(
            'assigned_rep_id column generates "assigned_rep_id" relationship',
            assignedRepRel && assignedRepRel.name === 'assigned_rep_id',
            assignedRepRel ? `Found: ${assignedRepRel.name}` : 'Relationship not found'
        );
        
        // Test 1.2: Relationship names match their source columns exactly
        let allNamesMatch = true;
        for (const rel of relationshipAnalysis.relationships) {
            if (rel.name !== rel.column) {
                allNamesMatch = false;
                break;
            }
        }
        addTest(
            'All relationship names match their source column names',
            allNamesMatch,
            allNamesMatch ? '' : 'Some relationships have mismatched names'
        );
        
        // =================================================================
        // TEST 2: Formula execution with correct naming convention
        // =================================================================
        console.log('\n🔍 Test Group 2: Formula Execution');
        
        // Test 2.1: assigned_rep_id_rel.name formula works
        const formulaResult = await page.evaluate(async () => {
            return await window.executeFormula('assigned_rep_id_rel.name', 'customer');
        });
        
        addTest(
            'assigned_rep_id_rel.name formula executes successfully',
            formulaResult.success,
            formulaResult.error || ''
        );
        
        // Test 2.2: Formula returns data
        addTest(
            'Formula returns result data',
            formulaResult.success && formulaResult.results && formulaResult.results.length > 0,
            `Returned ${formulaResult.results?.length || 0} rows`
        );
        
        // Test 2.3: Old naming convention should fail
        const oldFormulaResult = await page.evaluate(async () => {
            return await window.executeFormula('assigned_rep_rel.name', 'customer');
        });
        
        addTest(
            'Old naming convention (assigned_rep_rel) correctly fails',
            !oldFormulaResult.success,
            oldFormulaResult.success ? 'Should have failed but succeeded' : 'Correctly rejected'
        );
        
        // =================================================================
        // TEST 3: Autocomplete suggests correct relationship names
        // =================================================================
        console.log('\n🔍 Test Group 3: Autocomplete Integration');
        
        const formulaInput = await page.$('#formulaInput');
        if (formulaInput) {
            await formulaInput.click();
            await formulaInput.fill('');
            await formulaInput.type('assigned_rep_id');
            await page.waitForTimeout(1500);
            
            const autocompleteTest = await page.evaluate(async () => {
                const suggestions = await window.developerToolsClient.getCompletions(
                    'assigned_rep_id',
                    13, // position after "assigned_rep_id"
                    'customer'
                );
                
                return {
                    hasColumn: suggestions.some(s => s.label === 'assigned_rep_id'),
                    hasRelationship: suggestions.some(s => s.label === 'assigned_rep_id_rel'),
                    suggestedLabels: suggestions.map(s => s.label)
                };
            });
            
            addTest(
                'Autocomplete suggests assigned_rep_id column',
                autocompleteTest.hasColumn,
                ''
            );
            
            addTest(
                'Autocomplete suggests assigned_rep_id_rel relationship',
                autocompleteTest.hasRelationship,
                `Suggestions: ${autocompleteTest.suggestedLabels.join(', ')}`
            );
        }
        
        // =================================================================
        // TEST 4: Multi-level relationships with new naming
        // =================================================================
        console.log('\n🔍 Test Group 4: Multi-Level Relationships');
        
        // Switch to opportunity table for multi-level test
        await page.selectOption('#tableSelect', 'opportunity');
        await page.waitForTimeout(2000);
        
        // Test opportunity table relationships
        const opportunityRelationships = await page.evaluate(async () => {
            const schema = await window.getTableSchema('opportunity');
            return schema.directRelationships?.map(r => ({
                name: r.relationship_name,
                column: r.col_name,
                target: r.target_table_name
            })) || [];
        });
        
        // Test 4.1: Opportunity has customer_id_rel (not customer_rel)
        const customerRel = opportunityRelationships.find(r => r.column === 'customer_id');
        addTest(
            'Opportunity table has customer_id relationship',
            customerRel && customerRel.name === 'customer_id',
            customerRel ? `Found: ${customerRel.name}` : 'customer_id relationship not found'
        );
        
        // Test 4.2: Multi-level formula works with new naming
        const multiLevelResult = await page.evaluate(async () => {
            return await window.executeFormula('customer_id_rel.assigned_rep_id_rel.name', 'opportunity');
        });
        
        addTest(
            'Multi-level formula (customer_id_rel.assigned_rep_id_rel.name) works',
            multiLevelResult.success,
            multiLevelResult.error || ''
        );
        
        // =================================================================
        // TEST 5: Edge cases and validation
        // =================================================================
        console.log('\n🔍 Test Group 5: Edge Cases');
        
        // Test 5.1: Non-existent relationships are properly rejected
        const invalidResult = await page.evaluate(async () => {
            return await window.executeFormula('nonexistent_rel.name', 'customer');
        });
        
        addTest(
            'Invalid relationship names are properly rejected',
            !invalidResult.success && invalidResult.error.includes('Unknown relationship'),
            invalidResult.error || ''
        );
        
        // Test 5.2: Verify all foreign key columns follow the convention
        const allTablesTest = await page.evaluate(async () => {
            const tables = ['customer', 'opportunity', 'listing', 'rep'];
            const issues = [];
            
            for (const tableName of tables) {
                try {
                    const schema = await window.getTableSchema(tableName);
                    for (const rel of schema.directRelationships || []) {
                        // Relationship name should match source column exactly
                        if (rel.relationship_name !== rel.col_name) {
                            issues.push(`${tableName}: ${rel.col_name} → ${rel.relationship_name} (mismatch)`);
                        }
                    }
                } catch (error) {
                    issues.push(`${tableName}: Error loading schema`);
                }
            }
            
            return { issues, success: issues.length === 0 };
        });
        
        addTest(
            'All tables follow consistent naming convention',
            allTablesTest.success,
            allTablesTest.issues.length > 0 ? `Issues: ${allTablesTest.issues.join(', ')}` : ''
        );
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        results.failed++;
        results.tests.push({ 
            name: 'Test suite execution', 
            passed: false, 
            details: error.message 
        });
    } finally {
        await browser.close();
    }
    
    // =================================================================
    // RESULTS SUMMARY
    // =================================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total:  ${results.tests.length}`);
    console.log(`📈 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests.filter(t => !t.passed).forEach(test => {
            console.log(`   • ${test.name}`);
            if (test.details) console.log(`     ${test.details}`);
        });
    }
    
    console.log('\n🎯 Relationship Naming Convention Verified:');
    console.log('   {field_name}_rel.{foreign_field_name}');
    console.log('   Where field_name = complete column name (including _id)');
    
    // Return results instead of exiting (for use in test runners)
    return {
        success: results.failed === 0,
        passed: results.passed,
        failed: results.failed,
        total: results.tests.length,
        score: `${results.passed}/${results.tests.length}`,
        details: results.tests
    };
}

// Self-executing test (only when run directly)
if (import.meta.url === `file://${process.argv[1]}`) {
    testRelationshipNaming()
        .then(result => {
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Test execution failed:', error);
            process.exit(1);
        });
}

export { testRelationshipNaming };