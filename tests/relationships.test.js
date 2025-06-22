/**
 * Relationships Tests
 * Tests for relationship references and field access
 */

import { evaluateFormula, test, assertEqual, assertError, relationshipContext, printTestResults } from './test-utils.js';

console.log('Running Relationships Tests...\n');

// Test 72: Basic relationship reference
test('Basic relationship reference', () => {
  const result = evaluateFormula('merchant_rel.business_name', relationshipContext);
  assertEqual(result, '"rel_merchant"."business_name"');
});

// Test 73: Relationship with numeric field
test('Relationship with numeric field', () => {
  const result = evaluateFormula('funder_rel.rate', relationshipContext);
  assertEqual(result, '"rel_funder"."rate"');
});

// Test 74: Relationship in expression
test('Relationship in expression', () => {
  const result = evaluateFormula('amount * merchant_rel.fee_rate', relationshipContext);
  assertEqual(result, '("s"."amount" * "rel_merchant"."fee_rate")');
});

// Test 75: Multiple relationships
test('Multiple relationships', () => {
  const result = evaluateFormula('merchant_rel.business_name & " - " & funder_rel.name', relationshipContext);
  assertEqual(result, '(("rel_merchant"."business_name" || \' - \') || "rel_funder"."name")');
});

// Error Tests

// Test 76: Unknown relationship error
test('Unknown relationship error', () => {
  assertError(
    () => evaluateFormula('unknown_rel.field', relationshipContext),
    /Unknown relationship: unknown\. Available relationships from submission:/,
    'Should throw error for unknown relationship'
  );
});

// Test 77: Unknown field in relationship error
test('Unknown field in relationship error', () => {
  assertError(
    () => evaluateFormula('merchant_rel.unknown_field', relationshipContext),
    /Unknown field UNKNOWN_FIELD in relationship chain merchant\.UNKNOWN_FIELD\. Available fields:/,
    'Should throw error for unknown field in relationship'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 