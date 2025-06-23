/**
 * Date Arithmetic Tests
 * Tests for date arithmetic operations (date + number, date - number, date - date)
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Date Arithmetic Tests...\n');

// Test 11: Date arithmetic - date + number
test('Date arithmetic - date + number', () => {
  const result = evaluateFormula('created_date + 30', testContext);
  assertEqual(result, '("s"."created_date" + 30 * INTERVAL \'1 day\')');
});

// Test 12: Date arithmetic - date - number
test('Date arithmetic - date - number', () => {
  const result = evaluateFormula('created_date - 7', testContext);
  assertEqual(result, '("s"."created_date" - 7 * INTERVAL \'1 day\')');
});

// Test 13: Date arithmetic - date - date
test('Date arithmetic - date - date', () => {
  const result = evaluateFormula('updated_date - created_date', testContext);
  assertEqual(result, '("s"."updated_date" - "s"."created_date")');
});

// Test 34: Expression with column arithmetic and date
test('Expression with column arithmetic and date', () => {
  const result = evaluateFormula('created_date + revenue', testContext);
  assertEqual(result, '("s"."created_date" + "s"."revenue" * INTERVAL \'1 day\')');
});

// Test 45: Date arithmetic with parentheses
test('Date arithmetic with parentheses', () => {
  const result = evaluateFormula('(created_date + 30) - 7', testContext);
  assertEqual(result, '(("s"."created_date" + 30 * INTERVAL \'1 day\') - 7 * INTERVAL \'1 day\')');
});

// Error Tests
test('Type mismatch error - adding date to date', () => {
  assertError(
    () => evaluateFormula('created_date + updated_date', testContext),
    /Invalid operand types for \+: date and date/,
    'Should throw error when adding date to date'
  );
});

test('Type mismatch error - unary operator on date', () => {
  assertError(
    () => evaluateFormula('-created_date', testContext),
    /Unary - requires numeric operand/,
    'Should throw error when applying unary minus to date'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 