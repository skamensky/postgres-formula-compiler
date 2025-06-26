import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  
  console.log('🔍 Debugging Relationship Resolution...');
  await page.goto('http://localhost:8080/public/');
  await page.waitForTimeout(4000);
  
  const result = await page.evaluate(() => {
    // Access the Monaco LSP (the one actually being used)
    const lsp = window.enhancedMonaco?.languageServer;
    if (!lsp) return { error: 'Monaco LSP not found' };
    
    console.log('🔍 Testing relationship resolution step by step...');
    
    const input = 'assigned_rep_id_rel.';
    const tableName = 'customer';
    
    // Step 1: Check if schema has customer table
    console.log('Step 1: Checking schema...');
    const hasSchema = !!lsp.schema;
    const hasCustomerTable = !!(lsp.schema && lsp.schema.customer);
    
    console.log('Has schema:', hasSchema);
    console.log('Has customer table:', hasCustomerTable);
    
    if (!hasCustomerTable) return { error: 'No customer table in schema' };
    
    // Step 2: Check customer table relationships
    console.log('Step 2: Checking customer relationships...');
    const customerTable = lsp.schema.customer;
    const directRels = customerTable.directRelationships || [];
    const normalRels = customerTable.relationships || [];
    
    console.log('Direct relationships count:', directRels.length);
    console.log('Normal relationships count:', normalRels.length);
    console.log('Direct relationships:', directRels.map(r => ({ name: r.relationship_name, target: r.target_table_name })));
    console.log('Normal relationships:', normalRels.map(r => ({ name: r.relationship_name || r.col_name, target: r.target_table_name })));
    
    // Step 3: Test findRelationshipInTable directly
    console.log('Step 3: Testing findRelationshipInTable...');
    const foundRelationship = lsp.findRelationshipInTable('customer', 'assigned_rep_id');
    console.log('Found relationship:', foundRelationship);
    
    // Step 4: Test parseRelationshipNavigation
    console.log('Step 4: Testing parseRelationshipNavigation...');
    const parseResult = lsp.parseRelationshipNavigation(input);
    console.log('Parse result:', parseResult);
    
    // Step 5: Test resolveTargetTable
    console.log('Step 5: Testing resolveTargetTable...');
    if (parseResult) {
      const targetTable = lsp.resolveTargetTable(parseResult, tableName);
      console.log('Target table:', targetTable);
      
      // If target table resolution failed, debug why
      if (!targetTable) {
        console.log('🔍 Debugging why target table resolution failed...');
        
        for (const relationshipName of parseResult.relationshipChain) {
          console.log(`Looking for relationship "${relationshipName}" in table "${tableName}"`);
          const rel = lsp.findRelationshipInTable(tableName, relationshipName);
          console.log(`Found: `, rel);
          
          if (!rel) {
            console.log(`❌ Relationship "${relationshipName}" not found in table "${tableName}"`);
            console.log('Available relationships:');
            const allRels = lsp.schema[tableName]?.directRelationships || [];
            allRels.forEach(r => {
              console.log(`  - "${r.relationship_name}" → ${r.target_table_name}`);
            });
            break;
          }
        }
      } else {
        console.log('✅ Target table resolved successfully:', targetTable);
      }
    }
    
    return {
      success: true,
      hasSchema,
      hasCustomerTable,
      directRelsCount: directRels.length,
      directRels: directRels.map(r => ({ name: r.relationship_name, target: r.target_table_name })),
      foundRelationship,
      parseResult,
      targetTable: parseResult ? lsp.resolveTargetTable(parseResult, tableName) : null
    };
  });
  
  console.log('\n📊 Debug Results:');
  console.log(JSON.stringify(result, null, 2));
  
  await browser.close();
})(); 