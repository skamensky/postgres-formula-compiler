/**
 * Basic Arithmetic & Literals Tests
 * Tests basic numeric literals, addition, subtraction, and column arithmetic
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Basic Arithmetic & Literals Tests...\n');

// Test 1: Basic numeric literals
test('Basic numeric literal', () => {
  const result = evaluateFormula('42', testContext);
  assertEqual(result, '42');
});

// Test 2: Basic addition
test('Numeric addition', () => {
  const result = evaluateFormula('10 + 5', testContext);
  assertEqual(result, '(10 + 5)');
});

// Test 3: Basic subtraction
test('Numeric subtraction', () => {
  const result = evaluateFormula('20 - 8', testContext);
  assertEqual(result, '(20 - 8)');
});

// Test 4: Column references
test('Column reference', () => {
  const result = evaluateFormula('revenue', testContext);
  assertEqual(result, '"s"."revenue"');
});

// Test 5: Case-insensitive column references
test('Case-insensitive column reference', () => {
  const result = evaluateFormula('REVENUE', testContext);
  assertEqual(result, '"s"."revenue"');
});

// Test 6: Column arithmetic
test('Column arithmetic', () => {
  const result = evaluateFormula('revenue - cost', testContext);
  assertEqual(result, '("s"."revenue" - "s"."cost")');
});

// Test 7: Mixed column and literal arithmetic
test('Mixed column and literal arithmetic', () => {
  const result = evaluateFormula('revenue + 100', testContext);
  assertEqual(result, '("s"."revenue" + 100)');
});

// Test 16: Unary minus
test('Unary minus', () => {
  const result = evaluateFormula('-cost', testContext);
  assertEqual(result, '-"s"."cost"');
});

// Test 17: Space insensitive
test('Space insensitive parsing', () => {
  const result = evaluateFormula('  revenue   +   cost  ', testContext);
  assertEqual(result, '("s"."revenue" + "s"."cost")');
});

// Test 31: Multiple operations
test('Multiple operations', () => {
  const result = evaluateFormula('revenue - cost + 100', testContext);
  assertEqual(result, '(("s"."revenue" - "s"."cost") + 100)');
});

// Test 33: Mixed case column names
test('Mixed case column names', () => {
  const result = evaluateFormula('Revenue + COST', testContext);
  assertEqual(result, '("s"."revenue" + "s"."cost")');
});

// Error Tests
test('Unary plus error (not supported)', () => {
  assertError(
    () => evaluateFormula('+revenue', testContext),
    /Unary plus operator is not supported/,
    'Should throw error for unsupported unary plus operator'
  );
});

test('Unknown column error', () => {
  assertError(
    () => evaluateFormula('unknown_column', testContext),
    /Unknown column: UNKNOWN_COLUMN\. Available columns:/,
    'Should throw error for unknown column'
  );
});

test('Empty formula error', () => {
  assertError(
    () => evaluateFormula('', testContext),
    /Unexpected token: EOF/,
    'Should throw error for empty formula'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 