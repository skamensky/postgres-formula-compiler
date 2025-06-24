/**
 * Debug Console Errors Test
 * Capture console logs and errors to understand what's happening
 */

import { test, expect } from '@playwright/test';

const SERVER_URL = 'http://localhost:3001';

test.describe('Debug Console Errors', () => {
    test('Capture console logs and errors during app initialization', async ({ page }) => {
        console.log('🧪 Debugging console errors...');

        const logs = [];
        const errors = [];

        // Capture console logs
        page.on('console', msg => {
            const text = msg.text();
            logs.push(`[${msg.type()}] ${text}`);
            console.log(`Console ${msg.type()}: ${text}`);
        });

        // Capture page errors
        page.on('pageerror', err => {
            const error = err.toString();
            errors.push(error);
            console.log(`Page Error: ${error}`);
        });

        // Navigate to the application
        await page.goto(SERVER_URL);
        
        // Wait for the page to fully load
        await page.waitForLoadState('networkidle');
        
        // Wait a bit for initialization
        await page.waitForTimeout(5000);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'test-results/debug-console-state.png',
            fullPage: true
        });

        // Check current state of table select
        const tableSelectState = await page.evaluate(() => {
            const select = document.getElementById('tableSelect');
            if (!select) return { exists: false };
            
            const options = [];
            for (let i = 0; i < select.options.length; i++) {
                options.push({
                    value: select.options[i].value,
                    text: select.options[i].text
                });
            }
            
            return {
                exists: true,
                optionsCount: select.options.length,
                options: options
            };
        });
        
        console.log('Table select state:', tableSelectState);

        // Check if browser API initialized
        const browserApiState = await page.evaluate(() => {
            return {
                initializeBrowserAPI: typeof window.initializeBrowserAPI,
                getTables: typeof window.getTables,
                executeFormula: typeof window.executeFormula,
                enhancedMonaco: !!window.enhancedMonaco,
                developerToolsClient: !!window.developerToolsClient
            };
        });
        
        console.log('Browser API state:', browserApiState);

        // Check for specific initialization errors
        const initErrors = await page.evaluate(() => {
            const errors = [];
            
            // Check if PGlite is available
            if (typeof window.PGlite === 'undefined') {
                errors.push('PGlite not loaded');
            }
            
            // Check if modules are loading
            if (typeof window.initializeBrowserAPI === 'undefined') {
                errors.push('Browser API not loaded');
            }
            
            return errors;
        });
        
        console.log('Initialization errors:', initErrors);
        
        // Print all captured logs and errors
        console.log('\n=== CONSOLE LOGS ===');
        logs.forEach(log => console.log(log));
        
        console.log('\n=== PAGE ERRORS ===');
        errors.forEach(error => console.log(error));

        console.log('✅ Console debug test completed');
    });
});