import { evaluateFormula, generateSQL } from './formula-compiler.js';

/**
 * Example: Hierarchical Semantic IDs and Context Annotation
 * 
 * This example demonstrates the new intent-based compiler architecture that:
 * 1. Generates hierarchical semantic IDs for expressions
 * 2. Uses context annotation to track compilation contexts
 * 3. Separates compilation (intent generation) from SQL optimization
 * 4. Enables cross-formula deduplication and optimization
 */

console.log('=== Hierarchical Semantic IDs and Context Annotation Example ===\n');

// Define the context (database schema information)
const context = {
  tableName: 'submission',
  columnList: {
    id: 'number',
    amount: 'number',
    description: 'string',
    merchant_id: 'number',
    created_at: 'date',
    approved: 'boolean'
  },
  relationshipInfo: {
    merchant: {
      joinColumn: 'merchant_id',
      columnList: {
        id: 'number',
        name: 'string',
        category: 'string',
        commission_rate: 'number'
      }
    }
  },
  inverseRelationshipInfo: {
    rep_links: {
      tableName: 'rep_link',
      joinColumn: 'submission_id',
      columnList: {
        id: 'number',
        submission_id: 'number',
        rep_id: 'number',
        commission_pct: 'number'
      },
      relationshipInfo: {
        rep: {
          joinColumn: 'rep_id',
          columnList: {
            id: 'number',
            name: 'string',
            rate: 'number'
          }
        }
      }
    }
  }
};

// Example 1: Simple Expression with Hierarchical Semantic IDs
console.log('1. Simple Expression with Hierarchical Semantic IDs');
console.log('Formula: amount + 100');

const simpleResult = evaluateFormula('amount + 100', context);
console.log('Root Expression Semantic ID:', simpleResult.expression.semanticId);
console.log('Left Child (amount):', simpleResult.expression.children[0].semanticId);
console.log('Right Child (100):', simpleResult.expression.children[1].semanticId);
console.log('Compilation Context:', simpleResult.expression.compilationContext);
console.log();

// Example 2: Relationship Reference with Context Annotation
console.log('2. Relationship Reference with Context Annotation');
console.log('Formula: merchant_rel.name');

const relationshipResult = evaluateFormula('merchant_rel.name', context);
console.log('Expression Semantic ID:', relationshipResult.expression.semanticId);
console.log('Join Intent Semantic ID:', relationshipResult.joinIntents[0].semanticId);
console.log('Join Context:', relationshipResult.joinIntents[0].compilationContext);
console.log();

// Example 3: Aggregate with Sub-Context
console.log('3. Aggregate Function with Sub-Context');
console.log('Formula: STRING_AGG(rep_links, rep_rel.name, ", ")');

const aggregateResult = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', context);
const aggIntent = aggregateResult.aggregateIntents[0];
console.log('Aggregate Semantic ID:', aggIntent.semanticId);
console.log('Sub-expression Context:', aggIntent.expression.compilationContext);
console.log('Sub-expression Semantic ID:', aggIntent.expression.semanticId);
console.log('Internal Join Context:', aggIntent.internalJoins[0].compilationContext);
console.log();

// Example 4: Complex Nested Expression
console.log('4. Complex Nested Expression with Hierarchical IDs');
console.log('Formula: IF(amount > 100, merchant_rel.name & " (high)", "low")');

const complexResult = evaluateFormula('IF(amount > 100, merchant_rel.name & " (high)", "low")', context);
console.log('Root IF Semantic ID:', complexResult.expression.semanticId);
console.log('Condition Semantic ID:', complexResult.expression.children[0].semanticId);
console.log('True Value Semantic ID:', complexResult.expression.children[1].semanticId);
console.log('False Value Semantic ID:', complexResult.expression.children[2].semanticId);
console.log();

// Example 5: Multiple Formulas with Shared Dependencies
console.log('5. Multiple Formulas Demonstrating Intent Deduplication');

const formulas = {
  merchant_name: 'merchant_rel.name',
  merchant_category: 'merchant_rel.category', 
  total_with_commission: 'amount * merchant_rel.commission_rate',
  rep_summary: 'STRING_AGG(rep_links, rep_rel.name & " (" & STRING(commission_pct) & "%)", ", ")',
  high_value_indicator: 'IF(amount > 1000, "HIGH", "NORMAL")'
};

console.log('Compiling multiple formulas...');
const compilationResults = {};

for (const [fieldName, formula] of Object.entries(formulas)) {
  console.log(`\n${fieldName}: ${formula}`);
  const result = evaluateFormula(formula, context);
  compilationResults[fieldName] = result;
  
  console.log(`  Expression ID: ${result.expression.semanticId}`);
  console.log(`  Join Intents: ${result.joinIntents.length}`);
  console.log(`  Aggregate Intents: ${result.aggregateIntents.length}`);
  
  if (result.joinIntents.length > 0) {
    result.joinIntents.forEach((join, i) => {
      console.log(`    Join ${i+1}: ${join.semanticId}`);
    });
  }
  
  if (result.aggregateIntents.length > 0) {
    result.aggregateIntents.forEach((agg, i) => {
      console.log(`    Aggregate ${i+1}: ${agg.semanticId}`);
    });
  }
}

// Example 6: SQL Generation with Optimization
console.log('\n\n6. Optimized SQL Generation');
console.log('Generating optimized SQL from all compilation results...');

const sqlResult = generateSQL(compilationResults, 'submission');

console.log('\nGenerated SQL:');
console.log(sqlResult.sql);

console.log('\nOptimization Analysis:');
console.log(`- Total formulas: ${Object.keys(formulas).length}`);
console.log(`- Unique joins in SQL: ${(sqlResult.fromClause.match(/LEFT JOIN/g) || []).length}`);
console.log(`- Aggregate subqueries: ${sqlResult.aggregateSubqueries.length}`);
console.log(`- Select expressions: ${sqlResult.selectExpressions.length}`);

// Example 7: Demonstrating Semantic ID Consistency
console.log('\n\n7. Semantic ID Consistency Across Compilations');

const result1 = evaluateFormula('merchant_rel.name', context);
const result2 = evaluateFormula('merchant_rel.category', context);

console.log('Formula 1: merchant_rel.name');
console.log('Formula 2: merchant_rel.category');
console.log('Same join semantic ID?', result1.joinIntents[0].semanticId === result2.joinIntents[0].semanticId);
console.log('Join semantic ID:', result1.joinIntents[0].semanticId);

// Example 8: Context Isolation
console.log('\n\n8. Context Isolation Between Main and Aggregate Contexts');

const mainMerchant = evaluateFormula('merchant_rel.name', context);
const aggWithMerchant = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', context);

console.log('Main context expression:', mainMerchant.expression.compilationContext);
console.log('Aggregate context expression:', aggWithMerchant.aggregateIntents[0].expression.compilationContext);
console.log('Contexts are isolated:', mainMerchant.expression.compilationContext !== aggWithMerchant.aggregateIntents[0].expression.compilationContext);

console.log('\n=== Example Complete ===');
console.log('\nKey Benefits Demonstrated:');
console.log('✓ Hierarchical semantic IDs maintain expression structure');
console.log('✓ Context annotation tracks compilation contexts');
console.log('✓ Intent deduplication enables cross-formula optimization');
console.log('✓ Separation of compilation and SQL generation');
console.log('✓ Semantic consistency across multiple compilations');
console.log('✓ Proper context isolation for aggregates'); 