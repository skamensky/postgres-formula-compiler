/**
 * Comparison Operators Tests
 * Tests for >, >=, <, <=, =, !=, <> operators
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Comparison Operators Tests...\n');

// Test 87: Basic greater than with numbers
test('Basic greater than with numbers', () => {
  const result = evaluateFormula('revenue > 1000', testContext);
  assertEqual(result, '("s"."revenue" > 1000)');
});

// Test 88: Greater than or equal with numbers
test('Greater than or equal with numbers', () => {
  const result = evaluateFormula('revenue >= 5000', testContext);
  assertEqual(result, '("s"."revenue" >= 5000)');
});

// Test 89: Less than with numbers
test('Less than with numbers', () => {
  const result = evaluateFormula('cost < 10000', testContext);
  assertEqual(result, '("s"."cost" < 10000)');
});

// Test 90: Less than or equal with numbers
test('Less than or equal with numbers', () => {
  const result = evaluateFormula('revenue <= 2500', testContext);
  assertEqual(result, '("s"."revenue" <= 2500)');
});

// Test 91: Equals with numbers
test('Equals with numbers', () => {
  const result = evaluateFormula('cost = 1000', testContext);
  assertEqual(result, '("s"."cost" = 1000)');
});

// Test 92: Not equals with !=
test('Not equals with !=', () => {
  const result = evaluateFormula('revenue != 0', testContext);
  assertEqual(result, '("s"."revenue" <> 0)');
});

// Test 93: Not equals with <>
test('Not equals with <>', () => {
  const result = evaluateFormula('revenue <> 500', testContext);
  assertEqual(result, '("s"."revenue" <> 500)');
});

// Test 94: String comparison with equals
test('String comparison with equals', () => {
  const result = evaluateFormula('status = "approved"', testContext);
  assertEqual(result, '("s"."status" = \'approved\')');
});

// Test 95: String comparison with not equals
test('String comparison with not equals', () => {
  const result = evaluateFormula('status <> "pending"', testContext);
  assertEqual(result, '("s"."status" <> \'pending\')');
});

// Test 96: Date comparison
test('Date comparison', () => {
  const result = evaluateFormula('created_date > DATE("2023-01-01")', testContext);
  assertEqual(result, '("s"."created_date" > DATE(\'2023-01-01\'))');
});

// Test 97: Boolean comparison with literal true/false
test('Boolean comparison with literal true/false', () => {
  const result = evaluateFormula('closed = closed', testContext);
  assertEqual(result, '("s"."closed" = "s"."closed")');
});

// Test 98: Comparison with column to column
test('Comparison with column to column', () => {
  const result = evaluateFormula('revenue > cost', testContext);
  assertEqual(result, '("s"."revenue" > "s"."cost")');
});

// Test 99: Comparison with complex expression
test('Comparison with complex expression', () => {
  const result = evaluateFormula('cost * 2 > revenue + 1000', testContext);
  assertEqual(result, '(("s"."cost" * 2) > ("s"."revenue" + 1000))');
});

// Test 222: NULL with comparison operators
test('NULL with comparison operators', () => {
  const result = evaluateFormula('revenue = NULL', testContext);
  assertEqual(result, '("s"."revenue" = NULL)');
});

// Error Tests
test('Error - incompatible types for comparison', () => {
  assertError(
    () => evaluateFormula('revenue > "text"', testContext),
    /Cannot compare number and string/,
    'Should throw error when comparing incompatible types'
  );
});

test('Error - comparing number with date', () => {
  assertError(
    () => evaluateFormula('amount > created_date', testContext),
    /Cannot compare number and date/,
    'Should throw error when comparing number with date'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 