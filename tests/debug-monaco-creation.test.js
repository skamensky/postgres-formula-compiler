/**
 * Debug Monaco Editor Creation
 * Specific test to understand why Monaco editor isn't being created
 */

import { test, expect } from '@playwright/test';

const SERVER_URL = 'http://localhost:3001';

test.describe('Debug Monaco Editor Creation', () => {
    test('Debug Monaco editor creation process', async ({ page }) => {
        console.log('🧪 Debugging Monaco editor creation...');

        const logs = [];
        page.on('console', msg => {
            logs.push(`[${msg.type()}] ${msg.text()}`);
        });

        // Navigate and wait
        await page.goto(SERVER_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/debug-monaco-creation.png',
            fullPage: true
        });

        // Check Monaco integration state
        const monacoState = await page.evaluate(() => {
            const state = {
                enhancedMonaco: !!window.enhancedMonaco,
                isInitialized: window.enhancedMonaco?.isInitialized,
                editorsCount: window.enhancedMonaco?.editors?.size || 0,
                formulaInputExists: !!document.getElementById('formulaInput'),
                formulaInputType: null,
                formulaInputClasses: null,
                createEditorExists: false
            };
            
            const formulaInput = document.getElementById('formulaInput');
            if (formulaInput) {
                state.formulaInputType = formulaInput.tagName;
                state.formulaInputClasses = formulaInput.className;
            }
            
            if (window.enhancedMonaco) {
                state.createEditorExists = typeof window.enhancedMonaco.createEditor === 'function';
            }
            
            return state;
        });
        
        console.log('Monaco state:', monacoState);

        // Try to manually create Monaco editor
        const creationResult = await page.evaluate(() => {
            if (window.enhancedMonaco && window.enhancedMonaco.createEditor) {
                try {
                    const result = window.enhancedMonaco.createEditor('formulaInput');
                    return {
                        success: !!result,
                        result: typeof result,
                        error: null,
                        editorsAfter: window.enhancedMonaco.editors.size
                    };
                } catch (error) {
                    return {
                        success: false,
                        result: null,
                        error: error.message,
                        editorsAfter: window.enhancedMonaco.editors.size
                    };
                }
            }
            return { success: false, error: 'enhancedMonaco.createEditor not available' };
        });
        
        console.log('Manual creation result:', creationResult);

        // Check if Monaco is trying to create editor automatically
        const automaticCreation = await page.evaluate(() => {
            // Look for any evidence that Monaco tried to create an editor
            const container = document.getElementById('formulaInput');
            if (container) {
                const hasMonacoElements = container.querySelector('.monaco-editor');
                const hasChildren = container.children.length > 0;
                
                return {
                    hasMonacoElements: !!hasMonacoElements,
                    hasChildren,
                    innerHTML: container.innerHTML.substring(0, 200),
                    childrenCount: container.children.length
                };
            }
            return { error: 'formulaInput not found' };
        });
        
        console.log('Automatic creation check:', automaticCreation);

        // Try clicking on formula input to see if that triggers creation
        if (monacoState.formulaInputExists) {
            console.log('Trying to click on formula input...');
            await page.click('#formulaInput');
            await page.waitForTimeout(1000);
            
            const afterClick = await page.evaluate(() => {
                const container = document.getElementById('formulaInput');
                return {
                    editorsCount: window.enhancedMonaco?.editors?.size || 0,
                    hasMonacoElements: !!container?.querySelector('.monaco-editor'),
                    childrenCount: container?.children.length || 0
                };
            });
            
            console.log('After clicking:', afterClick);
        }

        // Check for any error logs related to Monaco
        const monacoLogs = logs.filter(log => 
            log.toLowerCase().includes('monaco') || 
            log.toLowerCase().includes('editor') ||
            log.toLowerCase().includes('enhanced')
        );
        
        console.log('Monaco-related logs:');
        monacoLogs.forEach(log => console.log(log));

        console.log('✅ Monaco creation debug completed');
    });
});