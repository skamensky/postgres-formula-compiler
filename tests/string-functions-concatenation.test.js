/**
 * String Functions & Concatenation Tests
 * Tests for STRING() function and string concatenation with &
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running String Functions & Concatenation Tests...\n');

// Test 47: STRING() function with number
test('STRING() function with number', () => {
  const result = evaluateFormula('STRING(42)', testContext);
  assertEqual(result, 'CAST(42 AS TEXT)');
});

// Test 48: STRING() function with column
test('STRING() function with column', () => {
  const result = evaluateFormula('STRING(revenue)', testContext);
  assertEqual(result, 'CAST("s"."revenue" AS TEXT)');
});

// Test 49: String concatenation with &
test('String concatenation with &', () => {
  const result = evaluateFormula('"Hello" & " " & "World"', testContext);
  assertEqual(result, '((\'Hello\' || \' \') || \'World\')');
});

// Test 50: Mixed type string concatenation with STRING() function
test('Mixed type string concatenation with STRING() function', () => {
  const result = evaluateFormula('"Revenue: " & STRING(revenue)', testContext);
  assertEqual(result, '(\'Revenue: \' || CAST("s"."revenue" AS TEXT))');
});

// Test 55: Correct usage with STRING() function for concatenation
test('Correct usage with STRING() function for concatenation', () => {
  const result = evaluateFormula('STRING(revenue) & " dollars"', testContext);
  assertEqual(result, '(CAST("s"."revenue" AS TEXT) || \' dollars\')');
});

// Error Tests
test('String concatenation type error', () => {
  assertError(
    () => evaluateFormula('revenue & cost', testContext),
    /String concatenation operator & requires both operands to be strings/,
    'Should throw error when using & with non-string operands'
  );
});

test('Error on number + string with + operator', () => {
  assertError(
    () => evaluateFormula('revenue + "hello"', testContext),
    /Invalid operand types for \+: number and string/,
    'Should throw error when adding number and string with + operator'
  );
});

test('STRING() function error - no arguments', () => {
  assertError(
    () => evaluateFormula('STRING()', testContext),
    /STRING\(\) takes exactly one argument/,
    'Should throw error when STRING() has no arguments'
  );
});

test('STRING() function error - multiple arguments', () => {
  assertError(
    () => evaluateFormula('STRING(revenue, cost)', testContext),
    /STRING\(\) takes exactly one argument/,
    'Should throw error when STRING() has multiple arguments'
  );
});

test('Error on number & string concatenation (strict mode)', () => {
  assertError(
    () => evaluateFormula('42 & "hello"', testContext),
    /String concatenation operator & requires both operands to be strings/,
    'Should throw error on number & string concatenation'
  );
});

test('Unterminated string error', () => {
  assertError(
    () => evaluateFormula('"unterminated string', testContext),
    /Unterminated string literal/,
    'Should throw error for unterminated string'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 