/**
 * Aggregate Functions Tests
 * Tests for aggregate functions that operate on inverse relationships
 */

import { evaluateFormula, test, assertEqual, assertError, relationshipContext, printTestResults } from './test-utils.js';

console.log('Running Aggregate Functions Tests...\n');

// Basic STRING_AGG tests
test('STRING_AGG basic usage', () => {
  const result = evaluateFormula('STRING_AGG(rep_links_submission, commission_percentage, ",")', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'STRING_AGG');
  assertEqual(result.aggregateIntents[0].sourceRelation, 'rep_links_submission');
});

test('STRING_AGG with expression', () => {
  const result = evaluateFormula('STRING_AGG(rep_links_submission, rep_rel.name, ",")', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'STRING_AGG');
});

test('STRING_AGG_DISTINCT basic usage', () => {
  const result = evaluateFormula('STRING_AGG_DISTINCT(rep_links_submission, commission_percentage, "|")', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'STRING_AGG_DISTINCT');
});

// Numeric aggregate functions
test('SUM_AGG basic usage', () => {
  const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage)', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'SUM_AGG');
});

test('COUNT_AGG basic usage', () => {
  const result = evaluateFormula('COUNT_AGG(rep_links_submission, commission_percentage)', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'COUNT_AGG');
});

test('AVG_AGG basic usage', () => {
  const result = evaluateFormula('AVG_AGG(rep_links_submission, commission_percentage)', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'AVG_AGG');
});

test('MIN_AGG basic usage', () => {
  const result = evaluateFormula('MIN_AGG(rep_links_submission, commission_percentage)', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'MIN_AGG');
});

test('MAX_AGG basic usage', () => {
  const result = evaluateFormula('MAX_AGG(rep_links_submission, commission_percentage)', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'MAX_AGG');
});

// Boolean aggregate functions
test('AND_AGG basic usage', () => {
  const result = evaluateFormula('AND_AGG(rep_links_submission, commission_percentage > 0)', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'AND_AGG');
});

test('OR_AGG basic usage', () => {
  const result = evaluateFormula('OR_AGG(rep_links_submission, commission_percentage > 10)', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'OR_AGG');
});

// Multiple aggregates on same relationship (should share subquery)
test('Multiple aggregates on same relationship', () => {
  const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage) + COUNT_AGG(rep_links_submission, commission_percentage)', relationshipContext);
  assertEqual(result.aggregateIntents.length, 2);
  assertEqual(result.aggregateIntents[0].sourceRelation, 'rep_links_submission');
  assertEqual(result.aggregateIntents[1].sourceRelation, 'rep_links_submission');
});

// Multiple aggregates on different relationships
test('Multiple aggregates on different relationships', () => {
  const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage) + COUNT_AGG(documents_submission, size)', relationshipContext);
  assertEqual(result.aggregateIntents.length, 2);
  assertEqual(result.aggregateIntents[0].sourceRelation, 'rep_links_submission');
  assertEqual(result.aggregateIntents[1].sourceRelation, 'documents_submission');
});

// Complex expression with aggregates and regular functions
test('Complex expression with aggregates', () => {
  const result = evaluateFormula('IF(SUM_AGG(rep_links_submission, commission_percentage) > 100, "High Commission", "Low Commission")', relationshipContext);
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'SUM_AGG');
});

// Nested relationships within aggregates
test('Aggregate with nested relationship', () => {
  const result = evaluateFormula('STRING_AGG(rep_links_submission, rep_rel.name, ",")', relationshipContext);
  assertEqual(result.expression.type, 'AGGREGATE_FUNCTION');
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].internalJoins.length, 1); // Should have internal join for rep_rel
});

// Error cases
test('STRING_AGG wrong argument count', () => {
  assertError(
    () => evaluateFormula('STRING_AGG(rep_links_submission)', relationshipContext),
    /STRING_AGG\(\) takes exactly 3 arguments/,
    'Should throw error for wrong argument count'
  );
});

test('SUM_AGG wrong argument count', () => {
  assertError(
    () => evaluateFormula('SUM_AGG(rep_links_submission)', relationshipContext),
    /SUM_AGG\(\) takes exactly 2 arguments/,
    'Should throw error for wrong argument count'
  );
});

test('Unknown inverse relationship', () => {
  assertError(
    () => evaluateFormula('SUM_AGG(unknown_relationship, amount)', relationshipContext),
    /Unknown inverse relationship: UNKNOWN_RELATIONSHIP\. Available inverse relationships:/,
    'Should throw error for unknown inverse relationship'
  );
});

test('Non-string delimiter for STRING_AGG', () => {
  assertError(
    () => evaluateFormula('STRING_AGG(rep_links_submission, commission_percentage, 123)', relationshipContext),
    /STRING_AGG\(\) delimiter must be string/,
    'Should throw error for non-string delimiter'
  );
});

test('First argument must be relationship name', () => {
  assertError(
    () => evaluateFormula('SUM_AGG("not_a_relationship", commission_percentage)', relationshipContext),
    /first argument must be an inverse relationship name/,
    'Should throw error when first argument is not an identifier'
  );
});

// Integration with other functions
test('Aggregate in string concatenation', () => {
  const result = evaluateFormula('"Total: " & STRING(SUM_AGG(rep_links_submission, commission_percentage))', relationshipContext);
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'SUM_AGG');
});

test('Aggregate in comparison', () => {
  const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage) > 50', relationshipContext);
  assertEqual(result.aggregateIntents.length, 1);
  assertEqual(result.aggregateIntents[0].aggregateFunction, 'SUM_AGG');
});

printTestResults(); 