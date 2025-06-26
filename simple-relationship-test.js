const { chromium } = require('playwright');

async function testRelationshipNavigation() {
  console.log('🚀 Starting Simple Relationship Navigation Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📍 Navigating to http://localhost:8080/public/');
    await page.goto('http://localhost:8080/public/', { waitUntil: 'networkidle' });
    
    // Take screenshot
    await page.screenshot({ path: 'relationship-test-01.png', fullPage: true });
    console.log('📸 Screenshot saved: relationship-test-01.png');
    
    // Test LSP directly in console
    const result = await page.evaluate(() => {
      const tests = {};
      
      try {
        // Check if LSP is available
        if (typeof FormulaLanguageServer !== 'undefined') {
          tests.lspClassAvailable = true;
          
          // Create LSP instance with mock schema
          const mockSchema = {
            customer: {
              columns: [
                { column_name: 'id', data_type: 'integer' },
                { column_name: 'first_name', data_type: 'text' },
                { column_name: 'assigned_rep_id', data_type: 'integer' }
              ],
              relationships: [
                { relationship_name: 'assigned_rep_id', target_table_name: 'rep' }
              ]
            },
            rep: {
              columns: [
                { column_name: 'id', data_type: 'integer' },
                { column_name: 'name', data_type: 'text' },
                { column_name: 'commission_rate', data_type: 'decimal' }
              ]
            }
          };
          
          const lsp = new FormulaLanguageServer(mockSchema);
          tests.lspInstanceCreated = true;
          
          // Test parseRelationshipNavigation
          const relNav = lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
          tests.parseRelationshipNavigation = !!relNav;
          if (relNav) {
            tests.relationshipChain = relNav.relationshipChain;
          }
          
          // Test resolveTargetTable
          if (relNav) {
            const targetTable = lsp.resolveTargetTable(relNav, 'customer');
            tests.resolveTargetTable = !!targetTable;
            tests.targetTable = targetTable;
          }
          
        } else if (window.lsp) {
          tests.windowLspAvailable = true;
          
          // Test with existing window.lsp
          const relNav = window.lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
          tests.parseRelationshipNavigation = !!relNav;
          
        } else {
          tests.noLspFound = true;
        }
        
      } catch (error) {
        tests.error = error.message;
      }
      
      return tests;
    });
    
    console.log('\n📊 Test Results:');
    console.log(JSON.stringify(result, null, 2));
    
    // Summary
    if (result.lspClassAvailable || result.windowLspAvailable) {
      console.log('\n✅ LSP is available');
      
      if (result.parseRelationshipNavigation) {
        console.log('✅ parseRelationshipNavigation works');
        
        if (result.relationshipChain) {
          console.log(`   - Relationship chain: [${result.relationshipChain.join(', ')}]`);
        }
        
        if (result.resolveTargetTable) {
          console.log(`✅ resolveTargetTable works → ${result.targetTable}`);
        } else {
          console.log('❌ resolveTargetTable failed');
        }
      } else {
        console.log('❌ parseRelationshipNavigation failed');
      }
    } else {
      console.log('❌ LSP not available');
    }
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'relationship-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testRelationshipNavigation().catch(console.error);
