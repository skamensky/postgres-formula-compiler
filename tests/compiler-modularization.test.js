import { evaluateFormula, generateSQL } from '../formula-compiler.js';

// Simple test framework
let passedTests = 0;
let totalTests = 0;

function test(description, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`✓ ${description}`);
    passedTests++;
  } catch (error) {
    console.log(`✗ ${description}`);
    console.log(`  Error: ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toMatch: (pattern) => {
      if (!pattern.test(actual)) {
        throw new Error(`Expected ${actual} to match ${pattern}`);
      }
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${actual.length}`);
      }
    },
    not: {
      toBe: (expected) => {
        if (actual === expected) {
          throw new Error(`Expected ${actual} not to be ${expected}`);
        }
      }
    },
    toBeLessThan: (expected) => {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toThrow: (pattern) => {
      let threw = false;
      let error = null;
      try {
        actual();
      } catch (e) {
        threw = true;
        error = e;
      }
      if (!threw) {
        throw new Error('Expected function to throw');
      }
      if (pattern && !pattern.test(error.message)) {
        throw new Error(`Expected error message to match ${pattern}, got: ${error.message}`);
      }
    }
  };
}

function describe(name, testSuite) {
  console.log(`\n${name}`);
  testSuite();
}

// Test suite
console.log('=== Compiler Modularization with Hierarchical Semantic IDs ===');

const baseContext = {
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

describe('Intent Generation with Hierarchical Semantic IDs', () => {
  test('generates hierarchical semantic IDs for simple expressions', () => {
    const result = evaluateFormula('amount + 100', baseContext);
    
    expect(result.expression.semanticId).toBe('binary_op:+[column:submission.amount@main,number:100@main]@main');
    expect(result.expression.type).toBe('BINARY_OP');
    expect(result.expression.compilationContext).toBe('main');
    expect(result.expression.children).toHaveLength(2);
  });

  test('generates context-annotated semantic IDs for relationship references', () => {
    const result = evaluateFormula('merchant_rel.name', baseContext);
    
    expect(result.expression.semanticId).toBe('relationship_ref:merchant.NAME[direct:submission→merchant[merchant_id]@main]@main');
    expect(result.expression.compilationContext).toBe('main');
    expect(result.joinIntents).toHaveLength(1);
    expect(result.joinIntents[0].semanticId).toBe('direct:submission→merchant[merchant_id]@main');
  });

  test('generates hierarchical IDs for complex nested expressions', () => {
    const result = evaluateFormula('IF(amount > 100, merchant_rel.name & " (high)", "low")', baseContext);
    
    // Root IF function should have hierarchical ID with all child IDs
    expect(result.expression.semanticId).toMatch(/^function:IF\[.*\]@main$/);
    expect(result.expression.children).toHaveLength(3); // condition, true_value, false_value
    
    // Condition should be a comparison
    const condition = result.expression.children[0];
    expect(condition.semanticId).toMatch(/^binary_op:>\[.*\]@main$/);
    
    // True value should be string concatenation
    const trueValue = result.expression.children[1];
    expect(trueValue.semanticId).toMatch(/^binary_op:&\[.*\]@main$/);
  });

  test('generates aggregate context annotations', () => {
    const result = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext);
    
    expect(result.expression.type).toBe('AGGREGATE_FUNCTION');
    expect(result.aggregateIntents).toHaveLength(1);
    
    const aggIntent = result.aggregateIntents[0];
    expect(aggIntent.expression.compilationContext).toBe('agg:submission→rep_link[submission_id]');
    expect(aggIntent.expression.semanticId).toMatch(/@agg:submission→rep_link\[submission_id\]$/);
    
    // Internal joins within aggregate should have aggregate context
    expect(aggIntent.internalJoins).toHaveLength(1);
    expect(aggIntent.internalJoins[0].compilationContext).toBe('agg:submission→rep_link[submission_id]');
  });
});

describe('Intent Deduplication', () => {
  test('deduplicates identical join intents across multiple formulas', () => {
    const result1 = evaluateFormula('merchant_rel.name', baseContext);
    const result2 = evaluateFormula('merchant_rel.category', baseContext);
    
    // Both should have the same join semantic ID
    expect(result1.joinIntents[0].semanticId).toBe(result2.joinIntents[0].semanticId);
    expect(result1.joinIntents[0].semanticId).toBe('direct:submission→merchant[merchant_id]@main');
  });

  test('deduplicates identical aggregate intents with same sub-expressions', () => {
    const result1 = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext);
    const result2 = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext);
    
    // Should have identical aggregate semantic IDs
    expect(result1.aggregateIntents[0].semanticId).toBe(result2.aggregateIntents[0].semanticId);
  });

  test('distinguishes different aggregate expressions with different semantic IDs', () => {
    const result1 = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext);
    const result2 = evaluateFormula('STRING_AGG(rep_links, rep_rel.rate, ", ")', baseContext);
    
    // Should have different aggregate semantic IDs due to different expressions
    expect(result1.aggregateIntents[0].semanticId).not.toBe(result2.aggregateIntents[0].semanticId);
  });
});

describe('SQL Generation with Optimization', () => {
  test('generates optimized SQL for multiple fields with shared joins', () => {
    const namedResults = {
      merchant_name: evaluateFormula('merchant_rel.name', baseContext),
      merchant_category: evaluateFormula('merchant_rel.category', baseContext),
      total_amount: evaluateFormula('amount * 2', baseContext)
    };
    
    const sqlResult = generateSQL(namedResults, 'submission');
    
    // Should have only one join despite multiple fields using merchant
    expect(sqlResult.fromClause).toMatch(/LEFT JOIN merchant t1 ON submission\.merchant_id = t1\.id/);
    expect((sqlResult.fromClause.match(/LEFT JOIN/g) || []).length).toBe(1);
    
    // Should have three select expressions
    expect(sqlResult.selectExpressions).toHaveLength(3);
    expect(sqlResult.selectExpressions[0]).toMatch(/t1\.name AS merchant_name/);
    expect(sqlResult.selectExpressions[1]).toMatch(/t1\.category AS merchant_category/);
    expect(sqlResult.selectExpressions[2]).toMatch(/\(submission\.amount \* 2\) AS total_amount/);
  });

  test('generates optimized SQL with shared aggregates', () => {
    const namedResults = {
      rep_names: evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext),
      rep_count: evaluateFormula('COUNT_AGG(rep_links, rep_rel.id)', baseContext),
      amount: evaluateFormula('amount', baseContext)
    };
    
    const sqlResult = generateSQL(namedResults, 'submission');
    
    // Should have two aggregate subqueries
    expect(sqlResult.aggregateSubqueries).toHaveLength(2);
    
    // Should reference aggregates by alias
    expect(sqlResult.selectExpressions[0]).toBe('agg1 AS rep_names');
    expect(sqlResult.selectExpressions[1]).toBe('agg2 AS rep_count');
    expect(sqlResult.selectExpressions[2]).toBe('submission.amount AS amount');
  });

  test('handles complex expressions with multiple join and aggregate dependencies', () => {
    const namedResults = {
      complex_calc: evaluateFormula('IF(amount > 100, merchant_rel.name & " - " & STRING_AGG(rep_links, rep_rel.name, ", "), "simple")', baseContext)
    };
    
    const sqlResult = generateSQL(namedResults, 'submission');
    
    // Should have one join for merchant
    expect(sqlResult.fromClause).toMatch(/LEFT JOIN merchant t1/);
    
    // Should have one aggregate subquery
    expect(sqlResult.aggregateSubqueries).toHaveLength(1);
    
    // Select expression should use CASE statement
    expect(sqlResult.selectExpressions[0]).toMatch(/CASE WHEN.*THEN.*ELSE.*END AS complex_calc/);
  });
});

describe('Error Handling in Intent Generation', () => {
  test('provides helpful error messages with semantic context', () => {
    expect(() => {
      evaluateFormula('unknown_field', baseContext);
    }).toThrow(/Unknown column: UNKNOWN_FIELD/);
    
    expect(() => {
      evaluateFormula('merchant_rel.unknown_field', baseContext);
    }).toThrow(/Unknown field UNKNOWN_FIELD in relationship merchant/);
    
    expect(() => {
      evaluateFormula('STRING_AGG(unknown_rel, name, ", ")', baseContext);
    }).toThrow(/Unknown inverse relationship: UNKNOWN_REL/);
  });
});

// Run the tests and show results
console.log(`\n=== Test Results ===`);
console.log(`${passedTests}/${totalTests} tests passed`);
if (passedTests === totalTests) {
  console.log('🎉 All tests passed!');
} else {
  console.log(`❌ ${totalTests - passedTests} tests failed`);
  process.exit(1);
} 