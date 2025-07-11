import { testSchemaTabInitialLoad } from './schema-tab-initial-load.js';
import { testLanguageTooling } from './language-tooling-test.js';
import { testRelationshipNaming } from './relationship-naming-test.js';

async function runComprehensiveTests() {
    console.log('🧪 Running comprehensive tests for reported issues...\n');
    
    const results = {};
    
    try {
        console.log('=' .repeat(60));
        console.log('TEST 1: Schema Tab Initial Loading');
        console.log('=' .repeat(60));
        
        results.schemaTest = await testSchemaTabInitialLoad();
        
        console.log('\n' + '=' .repeat(60));
        console.log('TEST 2: Language Tooling Integration');  
        console.log('=' .repeat(60));
        
        results.languageTest = await testLanguageTooling();
        
        console.log('\n' + '=' .repeat(60));
        console.log('TEST 3: Relationship Naming Convention');
        console.log('=' .repeat(60));
        
        results.relationshipTest = await testRelationshipNaming();
        
        console.log('\n' + '=' .repeat(60));
        console.log('COMPREHENSIVE TEST SUMMARY');
        console.log('=' .repeat(60));
        
        console.log('\n📋 Schema Tab Initial Load:');
        if (results.schemaTest.success) {
            console.log('  ✅ FIXED - Schema details now load immediately when clicking schema tab');
        } else {
            console.log('  ❌ FAILED - Schema tab still has loading issues');
        }
        
        console.log('\n🔧 Language Tooling:');
        if (results.languageTest.score) {
            console.log(`  📊 Score: ${results.languageTest.score}`);
            results.languageTest.details.forEach(test => {
                console.log(`    ${test.passed ? '✅' : '❌'} ${test.name}`);
            });
        }
        
        console.log('\n🔗 Relationship Naming Convention:');
        if (results.relationshipTest.success) {
            console.log(`  ✅ VERIFIED - All ${results.relationshipTest.total} tests passed`);
            console.log('  📋 Convention: {field_name}_rel.{foreign_field_name}');
            console.log('  ✅ assigned_rep_id_rel.name formula works correctly');
        } else {
            console.log(`  ❌ FAILED - ${results.relationshipTest.failed}/${results.relationshipTest.total} tests failed`);
            console.log('  📊 Score:', results.relationshipTest.score);
        }
        
        const allPassed = results.schemaTest.success && results.languageTest.success && results.relationshipTest.success;
        
        console.log('\n🏆 OVERALL RESULT:');
        if (allPassed) {
            console.log('  🎉 ALL ISSUES RESOLVED!');
        } else {
            console.log('  ⚠️  Some issues remain - see details above');
        }
        
        return {
            success: allPassed,
            schemaFixed: results.schemaTest.success,
            languageToolingScore: results.languageTest.score,
            relationshipNamingFixed: results.relationshipTest.success,
            relationshipScore: results.relationshipTest.score,
            details: results
        };
        
    } catch (error) {
        console.error('❌ Comprehensive test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runComprehensiveTests()
        .then(result => {
            if (result.success) {
                console.log('\n✅ All tests passed!');
                process.exit(0);
            } else {
                console.log('\n❌ Some tests failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Test runner failed:', error);
            process.exit(1);
        });
}

export { runComprehensiveTests };