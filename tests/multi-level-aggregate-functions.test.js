/**
 * Multi-Level Aggregate Functions Tests
 * Tests for aggregate functions that operate on chained inverse relationships
 */

import { evaluateFormula, test, assertEqual, assertError, relationshipContext, printTestResults } from './test-utils.js';

console.log('Running Multi-Level Aggregate Functions Tests...\n');

// Extended context for multi-level aggregate testing
const multiLevelAggregateContext = {
  tableName: 'merchant',
  // New flat structure
  tableInfos: [
    {
      tableName: 'merchant',
      columnList: {
        'business_name': 'string',
        'fee_rate': 'number',
        'id': 'number'
      }
    },
    {
      tableName: 'submission',
      columnList: {
        'amount': 'number',
        'status': 'string',
        'merchant_id': 'number'
      }
    },
    {
      tableName: 'rep_link',
      columnList: {
        'commission_percentage': 'number',
        'submission': 'number',
        'rep': 'number'
      }
    },
    {
      tableName: 'rep',
      columnList: {
        'name': 'string',
        'rate': 'number'
      }
    }
  ],
  relationshipInfos: [
    {
      name: 'submission',
      fromTable: 'merchant',
      toTable: 'submission',
      joinColumn: 'merchant_id'
    }
  ],
  // Keep old structure for backward compatibility and inverse relationships
  columnList: {
    'business_name': 'string',
    'fee_rate': 'number',
    'id': 'number'
  },
  relationshipInfo: {
    'submission': {
      tableName: 'submission',
      joinColumn: 'merchant_id',
      columnList: {
        'amount': 'number',
        'status': 'string',
        'merchant_id': 'number'
      }
    }
  },
  inverseRelationshipInfo: {
    // Single-level inverse (from submission perspective)
    'rep_links_submission': {
      tableName: 'rep_link',
      joinColumn: 'submission',
      columnList: {
        'commission_percentage': 'number',
        'rep': 'number'
      },
      relationshipInfo: {
        'rep': {
          tableName: 'rep',
          joinColumn: 'rep',
          columnList: {
            'name': 'string',
            'rate': 'number'
          }
        }
      }
    },
    // Multi-level inverse (from merchant perspective through submissions)
    'submissions_merchant': {
      tableName: 'submission',
      joinColumn: 'merchant_id',
      columnList: {
        'amount': 'number',
        'status': 'string',
        'merchant_id': 'number'
      }
    }
  }
};

// Basic multi-level aggregate tests
test('Multi-level STRING_AGG: submissions_merchant_rep_links_submission', () => {
  const result = evaluateFormula('STRING_AGG(submissions_merchant_rep_links_submission, commission_percentage, ",")', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'STRING_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
  assertEqual(result.aggregateIntents[0].relationshipChain.length, 2);
});

test('Multi-level COUNT_AGG: submissions_merchant_rep_links_submission', () => {
  const result = evaluateFormula('COUNT_AGG(submissions_merchant_rep_links_submission, rep)', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'COUNT_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

test('Multi-level SUM_AGG: submissions_merchant_rep_links_submission', () => {
  const result = evaluateFormula('SUM_AGG(submissions_merchant_rep_links_submission, commission_percentage)', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'SUM_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

test('Multi-level AVG_AGG: submissions_merchant_rep_links_submission', () => {
  const result = evaluateFormula('AVG_AGG(submissions_merchant_rep_links_submission, commission_percentage)', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'AVG_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

test('Multi-level MIN_AGG: submissions_merchant_rep_links_submission', () => {
  const result = evaluateFormula('MIN_AGG(submissions_merchant_rep_links_submission, commission_percentage)', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'MIN_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

test('Multi-level MAX_AGG: submissions_merchant_rep_links_submission', () => {
  const result = evaluateFormula('MAX_AGG(submissions_merchant_rep_links_submission, commission_percentage)', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'MAX_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

test('Multi-level AND_AGG: submissions_merchant_rep_links_submission', () => {
  const result = evaluateFormula('AND_AGG(submissions_merchant_rep_links_submission, commission_percentage > 0)', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'AND_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

test('Multi-level OR_AGG: submissions_merchant_rep_links_submission', () => {
  const result = evaluateFormula('OR_AGG(submissions_merchant_rep_links_submission, commission_percentage > 10)', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'OR_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

test('Multi-level STRING_AGG_DISTINCT: submissions_merchant_rep_links_submission', () => {
  const result = evaluateFormula('STRING_AGG_DISTINCT(submissions_merchant_rep_links_submission, STRING(commission_percentage), "|")', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'STRING_AGG_DISTINCT');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

// Multi-level with nested relationships
test('Multi-level aggregate with nested relationship: rep_rel.name', () => {
  const result = evaluateFormula('STRING_AGG(submissions_merchant_rep_links_submission, rep_rel.name, ",")', multiLevelAggregateContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].multiLevel, true);
  assertEqual(result.aggregateIntents[0].internalJoins.length, 1); // Should have internal join for rep_rel
});

// Multiple multi-level aggregates on same relationship chain
test('Multiple multi-level aggregates on same relationship chain', () => {
  const result = evaluateFormula('SUM_AGG(submissions_merchant_rep_links_submission, commission_percentage) + COUNT_AGG(submissions_merchant_rep_links_submission, rep)', multiLevelAggregateContext);
  assertEqual(result.aggregateIntents.length, 2);
  assertEqual(result.aggregateIntents[0].sourceRelation, 'submissions_merchant_rep_links_submission');
  assertEqual(result.aggregateIntents[1].sourceRelation, 'submissions_merchant_rep_links_submission');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
  assertEqual(result.aggregateIntents[1].multiLevel, true);
});

// Complex expressions with multi-level aggregates
test('Complex expression with multi-level aggregate', () => {
  const result = evaluateFormula('IF(SUM_AGG(submissions_merchant_rep_links_submission, commission_percentage) > 100, "High Commission", "Low Commission")', multiLevelAggregateContext);
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'SUM_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

test('Multi-level aggregate in string concatenation', () => {
  const result = evaluateFormula('"Total reps: " & STRING(COUNT_AGG(submissions_merchant_rep_links_submission, rep))', multiLevelAggregateContext);
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'COUNT_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

// Error cases
test('Error: Multi-level relationship with invalid pattern', () => {
  assertError(
    () => evaluateFormula('STRING_AGG(invalid_pattern, commission_percentage, ",")', multiLevelAggregateContext),
    /Multi-level aggregate relationship must follow pattern/,
    'Should throw error for invalid pattern'
  );
});

test('Error: Multi-level relationship with too few parts', () => {
  assertError(
    () => evaluateFormula('STRING_AGG(too_few, commission_percentage, ",")', multiLevelAggregateContext),
    /Multi-level aggregate relationship must follow pattern/,
    'Should throw error for too few parts'
  );
});

test('Error: Multi-level relationship exceeding depth limit', () => {
  const limitedContext = {
    ...multiLevelAggregateContext
  };
  
  assertError(
    () => evaluateFormula('STRING_AGG(submissions_merchant_rep_links_submission_payments_rep_link_docs_payment, amount, ",")', limitedContext, { maxInverseAggregateDepth: 2 }),
    /Multi-level aggregate chain too deep \(max 2 levels\)/,
    'Should throw error for exceeding depth limit'
  );
});

test('Error: Unknown inverse relationship in chain', () => {
  assertError(
    () => evaluateFormula('STRING_AGG(unknown_table_rep_links_submission, commission_percentage, ",")', multiLevelAggregateContext),
    /Unknown inverse relationship in chain/,
    'Should throw error for unknown inverse relationship'
  );
});

test('Error: Multi-level STRING_AGG wrong argument count', () => {
  assertError(
    () => evaluateFormula('STRING_AGG(submissions_merchant_rep_links_submission, commission_percentage)', multiLevelAggregateContext),
    /STRING_AGG\(\) takes exactly 3 arguments/,
    'Should throw error for wrong argument count'
  );
});

test('Error: Multi-level aggregate with non-string delimiter', () => {
  assertError(
    () => evaluateFormula('STRING_AGG(submissions_merchant_rep_links_submission, commission_percentage, 123)', multiLevelAggregateContext),
    /STRING_AGG\(\) delimiter must be string/,
    'Should throw error for non-string delimiter'
  );
});

// Backward compatibility tests
test('Backward compatibility: Single-level aggregates still work', () => {
  const result = evaluateFormula('STRING_AGG(rep_links_submission, commission_percentage, ",")', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'STRING_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, undefined); // Should not be marked as multi-level
});

// Integration with other features
test('Multi-level aggregate with comparison operators', () => {
  const result = evaluateFormula('SUM_AGG(submissions_merchant_rep_links_submission, commission_percentage) > 50', multiLevelAggregateContext);
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'SUM_AGG');
  assertEqual(result.aggregateIntents[0].multiLevel, true);
});

test('Multi-level aggregate with logical functions', () => {
  const result = evaluateFormula('AND(SUM_AGG(submissions_merchant_rep_links_submission, commission_percentage) > 0, COUNT_AGG(submissions_merchant_rep_links_submission, rep) > 1)', multiLevelAggregateContext);
  assertEqual(result.aggregateIntents.length, 2);
  assertEqual(result.aggregateIntents[0].multiLevel, true);
  assertEqual(result.aggregateIntents[1].multiLevel, true);
});

printTestResults();