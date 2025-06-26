import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Final Relationship Navigation Test...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Opening application...');
    await page.goto('http://localhost:8080/public/', { waitUntil: 'networkidle' });
    
    // Wait for the application to fully load
    await page.waitForTimeout(3000);
    
    console.log('🧪 Testing Relationship Navigation in Browser Context...');
    
    // Inject and run the test directly in the page
    const testResult = await page.evaluate(async () => {
      const results = {};
      
      try {
        // Wait for LSP to be available
        await new Promise(resolve => {
          const checkLSP = () => {
            if (window.lsp || (typeof FormulaLanguageServer !== 'undefined')) {
              resolve();
            } else {
              setTimeout(checkLSP, 100);
            }
          };
          checkLSP();
        });
        
        let lsp = window.lsp;
        
        // If window.lsp doesn't exist, try to get it from developer tools
        if (!lsp && window.devTools && window.devTools.lsp) {
          lsp = window.devTools.lsp;
        }
        
        // If still no LSP, try to create one from the module
        if (!lsp && typeof FormulaLanguageServer !== 'undefined') {
          // Get schema from browser API if available
          let schema = null;
          if (window.browserAPI && window.browserAPI.getFullSchema) {
            schema = await window.browserAPI.getFullSchema();
          }
          lsp = new FormulaLanguageServer(schema);
        }
        
        if (lsp) {
          results.lspFound = true;
          results.lspSource = window.lsp ? 'window.lsp' : 
                             (window.devTools?.lsp ? 'devTools.lsp' : 'created');
          
          // Test schema
          results.hasSchema = !!lsp.schema;
          if (lsp.schema) {
            results.schemaKeys = Object.keys(lsp.schema);
            
            // Check customer table structure
            if (lsp.schema.customer) {
              results.customerHasDirectRelationships = !!lsp.schema.customer.directRelationships;
              results.customerHasRelationships = !!lsp.schema.customer.relationships;
              
              if (lsp.schema.customer.directRelationships) {
                results.customerDirectRels = lsp.schema.customer.directRelationships.map(r => r.relationship_name);
              }
              if (lsp.schema.customer.relationships) {
                results.customerRels = lsp.schema.customer.relationships.map(r => r.relationship_name);
              }
            }
          }
          
          // Test parseRelationshipNavigation
          const relNav = lsp.parseRelationshipNavigation('assigned_rep_id_rel.');
          results.parseRelationshipNavigation = !!relNav;
          results.relationshipData = relNav;
          
          // Test resolveTargetTable
          if (relNav) {
            const targetTable = lsp.resolveTargetTable(relNav, 'customer');
            results.resolveTargetTable = !!targetTable;
            results.targetTable = targetTable;
            
            // Test getRelatedFieldCompletions
            if (targetTable) {
              const completions = lsp.getRelatedFieldCompletions(targetTable, '', relNav, false);
              results.getRelatedFieldCompletions = completions.length > 0;
              results.completionsCount = completions.length;
              results.sampleCompletions = completions.slice(0, 3).map(c => c.label);
            }
          }
          
          // Test full getCompletions integration
          const fullCompletions = lsp.getCompletions('assigned_rep_id_rel.', 18, 'customer', true);
          results.fullCompletions = fullCompletions.length > 0;
          results.fullCompletionsCount = fullCompletions.length;
          
        } else {
          results.lspFound = false;
        }
        
      } catch (error) {
        results.error = error.message;
        results.stack = error.stack;
      }
      
      return results;
    });
    
    console.log('\n📊 Final Test Results:');
    console.log(JSON.stringify(testResult, null, 2));
    
    // Take final screenshot
    await page.screenshot({ path: 'final-test-result.png', fullPage: true });
    console.log('📸 Screenshot: final-test-result.png');
    
    // Summary
    console.log('\n📋 FINAL SUMMARY:');
    
    if (testResult.lspFound) {
      console.log(`✅ LSP Available: ${testResult.lspSource}`);
      console.log(`✅ Schema Available: ${testResult.hasSchema}`);
      
      if (testResult.hasSchema) {
        console.log(`📊 Schema Tables: ${testResult.schemaKeys?.join(', ')}`);
        
        if (testResult.customerHasDirectRelationships) {
          console.log(`✅ Customer directRelationships: ${testResult.customerDirectRels?.join(', ')}`);
        } else if (testResult.customerHasRelationships) {
          console.log(`⚠️ Customer has relationships: ${testResult.customerRels?.join(', ')}`);
          console.log('   ❌ ISSUE: Schema uses "relationships" but LSP expects "directRelationships"');
        } else {
          console.log('❌ Customer table has no relationship data');
        }
      }
      
      console.log(`✅ parseRelationshipNavigation: ${testResult.parseRelationshipNavigation}`);
      console.log(`✅ resolveTargetTable: ${testResult.resolveTargetTable} → ${testResult.targetTable}`);
      console.log(`✅ getRelatedFieldCompletions: ${testResult.getRelatedFieldCompletions} (${testResult.completionsCount} completions)`);
      console.log(`✅ Full integration: ${testResult.fullCompletions} (${testResult.fullCompletionsCount} completions)`);
      
      if (testResult.sampleCompletions) {
        console.log(`🏷️ Sample completions: ${testResult.sampleCompletions.join(', ')}`);
      }
      
      // Determine overall status
      const allWorking = testResult.parseRelationshipNavigation && 
                        testResult.resolveTargetTable && 
                        testResult.getRelatedFieldCompletions;
                        
      if (allWorking) {
        console.log('\n🎉 RELATIONSHIP NAVIGATION IS WORKING!');
      } else {
        console.log('\n❌ RELATIONSHIP NAVIGATION NEEDS FIXES');
        
        if (!testResult.parseRelationshipNavigation) {
          console.log('   - parseRelationshipNavigation failed');
        }
        if (!testResult.resolveTargetTable) {
          console.log('   - resolveTargetTable failed (likely schema structure issue)');
        }
        if (!testResult.getRelatedFieldCompletions) {
          console.log('   - getRelatedFieldCompletions failed');
        }
      }
      
    } else {
      console.log('❌ LSP not found in browser context');
    }
    
    if (testResult.error) {
      console.log(`❌ Error occurred: ${testResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'final-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
