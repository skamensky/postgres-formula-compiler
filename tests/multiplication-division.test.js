/**
 * Multiplication & Division Tests
 * Tests for multiplication (*) and division (/) operators and their precedence
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Multiplication & Division Tests...\n');

// Test 61: Basic multiplication
test('Basic multiplication', () => {
  const result = evaluateFormula('6 * 7', testContext);
  assertEqual(result, '(6 * 7)');
});

// Test 62: Basic division
test('Basic division', () => {
  const result = evaluateFormula('15 / 3', testContext);
  assertEqual(result, '(15 / 3)');
});

// Test 63: Column multiplication
test('Column multiplication', () => {
  const result = evaluateFormula('revenue * 2', testContext);
  assertEqual(result, '("s"."revenue" * 2)');
});

// Test 64: Column division
test('Column division', () => {
  const result = evaluateFormula('revenue / cost', testContext);
  assertEqual(result, '("s"."revenue" / "s"."cost")');
});

// Test 65: Operator precedence - multiplication before addition
test('Operator precedence - multiplication before addition', () => {
  const result = evaluateFormula('2 + 3 * 4', testContext);
  assertEqual(result, '(2 + (3 * 4))');
});

// Test 66: Operator precedence - division before subtraction
test('Operator precedence - division before subtraction', () => {
  const result = evaluateFormula('10 - 8 / 2', testContext);
  assertEqual(result, '(10 - (8 / 2))');
});

// Test 67: Mixed operators with columns
test('Mixed operators with columns', () => {
  const result = evaluateFormula('revenue + cost * 2', testContext);
  assertEqual(result, '("s"."revenue" + ("s"."cost" * 2))');
});

// Test 69: Complex expression with all operators
test('Complex expression with all operators', () => {
  const result = evaluateFormula('revenue + cost * 2 - 100 / 4', testContext);
  assertEqual(result, '(("s"."revenue" + ("s"."cost" * 2)) - (100 / 4))');
});

// Error Tests
test('Multiplication/Division error with wrong types', () => {
  assertError(
    () => evaluateFormula('revenue * "hello"', testContext),
    /Invalid operand types for \*: number and string/,
    'Should throw error when multiplying number and string'
  );
});

test('Division error with wrong types', () => {
  assertError(
    () => evaluateFormula('created_date / cost', testContext),
    /Invalid operand types for \/: date and number/,
    'Should throw error when dividing date and number'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 