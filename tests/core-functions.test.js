/**
 * Core Functions Tests
 * Tests for TODAY(), ME(), DATE() functions
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Core Functions Tests...\n');

// Test 8: TODAY() function
test('TODAY() function', () => {
  const result = evaluateFormula('TODAY()', testContext);
  assertEqual(result, 'current_date');
});

// Test 9: ME() function
test('ME() function', () => {
  const result = evaluateFormula('ME()', testContext);
  assertEqual(result, '(select auth().uid())');
});

// Test 10: DATE() function with string literal
test('DATE() function with string literal', () => {
  const result = evaluateFormula('DATE("2023-01-01")', testContext);
  assertEqual(result, 'DATE(\'2023-01-01\')');
});

// Test 18: Case insensitive functions
test('Case insensitive function names', () => {
  const result = evaluateFormula('today()', testContext);
  assertEqual(result, 'current_date');
});

// Test 32: Nested function calls in expressions
test('Complex expression with TODAY()', () => {
  // Note: This test is commented out because adding number + date is not valid
  // const result = evaluateFormula('revenue + TODAY()', testContext);
  // assertEqual(result, '("s"."revenue" + current_date)');
  
  // Instead, test a valid expression with TODAY()
  const result = evaluateFormula('STRING(revenue) & " on " & STRING(TODAY())', testContext);
  assertEqual(result, '((CAST("s"."revenue" AS TEXT) || \' on \') || CAST(current_date AS TEXT))');
});

// Error Tests
test('TODAY() with arguments error', () => {
  assertError(
    () => evaluateFormula('TODAY(5)', testContext),
    /TODAY\(\) takes no arguments/,
    'Should throw error when TODAY() has arguments'
  );
});

test('ME() with arguments error', () => {
  assertError(
    () => evaluateFormula('ME(42)', testContext),
    /ME\(\) takes no arguments/,
    'Should throw error when ME() has arguments'
  );
});

test('DATE() without arguments error', () => {
  assertError(
    () => evaluateFormula('DATE()', testContext),
    /DATE\(\) takes exactly one argument/,
    'Should throw error when DATE() has no arguments'
  );
});

test('DATE() with non-string argument error', () => {
  assertError(
    () => evaluateFormula('DATE(42)', testContext),
    /DATE\(\) function requires a string literal/,
    'Should throw error when DATE() has non-string argument'
  );
});

test('Unknown function error', () => {
  assertError(
    () => evaluateFormula('UNKNOWN_FUNCTION()', testContext),
    /Unknown function: UNKNOWN_FUNCTION/,
    'Should throw error for unknown function'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 