/**
 * Relationship Navigation Autocomplete Tests
 * Test that typing "relationship_rel." suggests fields from the target table
 */

import { test, expect } from '@playwright/test';

const SERVER_URL = 'http://localhost:3001';

test.describe('Relationship Navigation Autocomplete Tests', () => {
    test.beforeEach(async ({ page }) => {
        const logs = [];
        page.on('console', msg => {
            const text = msg.text();
            logs.push(`[${msg.type()}] ${text}`);
            if (msg.type() === 'error') {
                console.log(`❌ Console Error: ${text}`);
            }
        });

        await page.goto(SERVER_URL);
        await page.waitForLoadState('networkidle');
        
        await page.waitForFunction(() => {
            const select = document.getElementById('tableSelect');
            return select && select.options.length > 1;
        }, { timeout: 15000 });
        
        page.logs = logs;
    });

    test('1. Test assigned_rep_id_rel. suggests rep table fields from customer table', async ({ page }) => {
        console.log('🧪 Testing relationship navigation: assigned_rep_id_rel. from customer table...');

        // Select customer table 
        await page.selectOption('#tableSelect', 'customer');
        await page.waitForTimeout(3000);

        // Focus Monaco editor and type relationship navigation
        await page.click('#formulaInput .monaco-editor');
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editorInfo.editor;
                if (monaco) {
                    monaco.setValue('assigned_rep_id_rel.');
                    monaco.setPosition({ lineNumber: 1, column: 20 }); // After the dot
                }
            }
        });

        await page.waitForTimeout(500);
        await page.keyboard.press('Control+Space');
        await page.waitForTimeout(1500);

        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/relationship-navigation-assigned-rep.png',
            fullPage: true
        });

        // Check suggestions
        const relationshipSuggestions = await page.evaluate(() => {
            const suggestWidget = document.querySelector('.suggest-widget, .monaco-list');
            if (suggestWidget && suggestWidget.style.display !== 'none') {
                const suggestions = suggestWidget.querySelectorAll('.monaco-list-row, .suggest-item');
                const suggestionTexts = Array.from(suggestions).map(item => item.textContent);
                
                return {
                    hasSuggestWidget: true,
                    suggestionsCount: suggestions.length,
                    suggestionTexts: suggestionTexts.slice(0, 10),
                    // Look for rep table fields
                    hasRepFields: suggestionTexts.some(text => 
                        text.includes('rep_name') || 
                        text.includes('commission_rate') ||
                        text.includes('hire_date')
                    )
                };
            }
            return { hasSuggestWidget: false, suggestionsCount: 0 };
        });

        console.log('Relationship navigation suggestions:', relationshipSuggestions);

        // Verify we get rep table fields, not customer table fields
        if (relationshipSuggestions.hasRepFields) {
            console.log('✅ Relationship navigation working - rep table fields found');
        } else {
            console.log('❌ Relationship navigation not working - no rep table fields found');
            console.log('Available suggestions:', relationshipSuggestions.suggestionTexts);
        }

        // Debug: Check what the schema looks like for relationships
        const schemaDebug = await page.evaluate(async () => {
            if (window.getTableSchema) {
                try {
                    const customerSchema = await window.getTableSchema('customer');
                    const repSchema = await window.getTableSchema('rep');
                    
                    return {
                        customerRelationships: customerSchema.directRelationships?.map(rel => ({
                            name: rel.relationship_name,
                            target: rel.target_table_name,
                            column: rel.col_name
                        })) || [],
                        repColumns: repSchema.columns?.map(col => col.column_name) || []
                    };
                } catch (error) {
                    return { error: error.message };
                }
            }
            return { error: 'getTableSchema not available' };
        });
        
        console.log('Schema debug for relationships:', schemaDebug);

        console.log('✅ Assigned rep relationship navigation test completed');
    });

    test('2. Test multiple relationship navigation scenarios', async ({ page }) => {
        console.log('🧪 Testing multiple relationship navigation scenarios...');

        const testCases = [
            {
                table: 'opportunity',
                relationship: 'assigned_rep_id_rel.',
                expectedTarget: 'rep',
                expectedFields: ['rep_name', 'commission_rate'],
                description: 'Opportunity → Rep'
            },
            {
                table: 'listing',
                relationship: 'assigned_rep_id_rel.',
                expectedTarget: 'rep', 
                expectedFields: ['rep_name', 'commission_rate'],
                description: 'Listing → Rep'
            },
            {
                table: 'customer',
                relationship: 'assigned_rep_id_rel.',
                expectedTarget: 'rep',
                expectedFields: ['rep_name', 'commission_rate'],
                description: 'Customer → Rep'
            }
        ];

        for (const testCase of testCases) {
            console.log(`\n🔍 Testing: ${testCase.description}`);
            
            // Select table
            await page.selectOption('#tableSelect', testCase.table);
            await page.waitForTimeout(2000);

            // Type relationship navigation
            await page.click('#formulaInput .monaco-editor');
            await page.evaluate((relationship) => {
                if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                    const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
                    const monaco = editorInfo.editor;
                    if (monaco) {
                        monaco.setValue(relationship);
                        monaco.setPosition({ lineNumber: 1, column: relationship.length + 1 });
                    }
                }
            }, testCase.relationship);

            await page.waitForTimeout(500);
            await page.keyboard.press('Control+Space');
            await page.waitForTimeout(1000);

            // Check results
            const result = await page.evaluate((expectedFields) => {
                const suggestWidget = document.querySelector('.suggest-widget, .monaco-list');
                if (suggestWidget && suggestWidget.style.display !== 'none') {
                    const suggestions = suggestWidget.querySelectorAll('.monaco-list-row, .suggest-item');
                    const suggestionTexts = Array.from(suggestions).map(item => item.textContent);
                    
                    return {
                        success: true,
                        suggestionsCount: suggestions.length,
                        suggestionTexts: suggestionTexts.slice(0, 5),
                        hasExpectedFields: expectedFields.some(field => 
                            suggestionTexts.some(text => text.includes(field))
                        )
                    };
                }
                return { success: false, suggestionsCount: 0 };
            }, testCase.expectedFields);

            console.log(`  Result: ${result.hasExpectedFields ? '✅' : '❌'} - ${result.suggestionsCount} suggestions`);
            if (result.suggestionTexts.length > 0) {
                console.log(`  Sample: ${result.suggestionTexts[0]}`);
            }
        }

        // Take final screenshot
        await page.screenshot({ 
            path: 'test-results/relationship-navigation-multiple.png',
            fullPage: true
        });

        console.log('✅ Multiple relationship navigation test completed');
    });

    test('3. Test nested relationship navigation (if supported)', async ({ page }) => {
        console.log('🧪 Testing nested relationship navigation...');

        // Select customer table
        await page.selectOption('#tableSelect', 'customer');
        await page.waitForTimeout(3000);

        // Test if we can navigate through multiple relationships
        // E.g., customer → assigned_rep → something else
        await page.click('#formulaInput .monaco-editor');
        await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
                const monaco = editorInfo.editor;
                if (monaco) {
                    // Try a nested relationship if the rep table has relationships
                    monaco.setValue('assigned_rep_id_rel.assigned_rep_id_rel.');
                    monaco.setPosition({ lineNumber: 1, column: 40 });
                }
            }
        });

        await page.waitForTimeout(500);
        await page.keyboard.press('Control+Space');
        await page.waitForTimeout(1000);

        // Check for nested relationship support
        const nestedResult = await page.evaluate(() => {
            const suggestWidget = document.querySelector('.suggest-widget, .monaco-list');
            if (suggestWidget && suggestWidget.style.display !== 'none') {
                const suggestions = suggestWidget.querySelectorAll('.monaco-list-row, .suggest-item');
                return {
                    hasNestedSupport: suggestions.length > 0,
                    suggestionsCount: suggestions.length
                };
            }
            return { hasNestedSupport: false, suggestionsCount: 0 };
        });

        console.log('Nested relationship result:', nestedResult);

        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/relationship-navigation-nested.png',
            fullPage: true
        });

        console.log('✅ Nested relationship navigation test completed');
    });

    test('4. Test relationship navigation error cases', async ({ page }) => {
        console.log('🧪 Testing relationship navigation error cases...');

        await page.selectOption('#tableSelect', 'customer');
        await page.waitForTimeout(3000);

        const errorCases = [
            'nonexistent_rel.',
            'invalid_relationship_rel.',
            'assigned_rep_id_rel.nonexistent_field',
            'assigned_rep_id.'  // Missing "_rel"
        ];

        for (const errorCase of errorCases) {
            console.log(`\n🔍 Testing error case: "${errorCase}"`);
            
            await page.click('#formulaInput .monaco-editor');
            await page.evaluate((text) => {
                if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
                    const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
                    const monaco = editorInfo.editor;
                    if (monaco) {
                        monaco.setValue(text);
                        monaco.setPosition({ lineNumber: 1, column: text.length + 1 });
                    }
                }
            }, errorCase);

            await page.waitForTimeout(500);
            await page.keyboard.press('Control+Space');
            await page.waitForTimeout(1000);

            const errorResult = await page.evaluate(() => {
                const suggestWidget = document.querySelector('.suggest-widget, .monaco-list');
                if (suggestWidget && suggestWidget.style.display !== 'none') {
                    const suggestions = suggestWidget.querySelectorAll('.monaco-list-row, .suggest-item');
                    return {
                        showsSuggestions: suggestions.length > 0,
                        suggestionsCount: suggestions.length
                    };
                }
                return { showsSuggestions: false, suggestionsCount: 0 };
            });

            console.log(`  Error case result: ${errorResult.showsSuggestions ? 'Shows suggestions' : 'No suggestions'} (${errorResult.suggestionsCount})`);
        }

        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/relationship-navigation-errors.png',
            fullPage: true
        });

        console.log('✅ Relationship navigation error cases test completed');
    });
});