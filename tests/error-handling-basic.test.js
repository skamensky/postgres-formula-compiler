/**
 * Basic Error Handling Tests
 * Tests for fundamental parsing and compilation errors
 */

import { evaluateFormula, test, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Basic Error Handling Tests...\n');

// Test 15: Unary plus error (not supported)
test('Unary plus error (not supported)', () => {
  assertError(
    () => evaluateFormula('+revenue', testContext),
    /Unary plus operator is not supported/,
    'Should throw error for unsupported unary plus operator'
  );
});

// Test 19: Unknown column error
test('Unknown column error', () => {
  assertError(
    () => evaluateFormula('unknown_column', testContext),
    /Unknown column: UNKNOWN_COLUMN\. Available columns:/,
    'Should throw error for unknown column'
  );
});

// Test 20: String concatenation type error
test('String concatenation type error', () => {
  assertError(
    () => evaluateFormula('revenue & cost', testContext),
    /String concatenation operator & requires both operands to be strings/,
    'Should throw error when using & with non-string operands'
  );
});

// Test 27: Unknown function error
test('Unknown function error', () => {
  assertError(
    () => evaluateFormula('UNKNOWN_FUNC()', testContext),
    /Unknown function: UNKNOWN_FUNC/,
    'Should throw error for unknown function'
  );
});

// Test 28: Mismatched parentheses error
test('Mismatched parentheses error', () => {
  assertError(
    () => evaluateFormula('(revenue + cost', testContext),
    /Expected RPAREN/,
    'Should throw error for mismatched parentheses'
  );
});

// Test 29: Unterminated string error
test('Unterminated string error', () => {
  assertError(
    () => evaluateFormula('DATE("2023-01-01)', testContext),
    /Unterminated string literal/,
    'Should throw error for unterminated string'
  );
});

// Test 30: Empty formula error
test('Empty formula error', () => {
  assertError(
    () => evaluateFormula('', testContext),
    /Unexpected token: EOF/,
    'Should throw error for empty formula'
  );
});

// Test 25: Type mismatch error - adding date to date
test('Type mismatch error - adding date to date', () => {
  assertError(
    () => evaluateFormula('created_date + updated_date', testContext),
    /Invalid operand types for \+/,
    'Should throw error for invalid date + date operation'
  );
});

// Test 26: Type mismatch error - unary operator on date
test('Type mismatch error - unary operator on date', () => {
  assertError(
    () => evaluateFormula('-created_date', testContext),
    /Unary - requires numeric operand/,
    'Should throw error for unary operator on date'
  );
});

// Test 44: Unary plus error in parentheses (not supported)
test('Unary plus error in parentheses (not supported)', () => {
  assertError(
    () => evaluateFormula('+((revenue + cost) - 200)', testContext),
    /Unary plus operator is not supported/,
    'Should throw error for unsupported unary plus operator in parentheses'
  );
});

// Test 51: Error on number + string with + operator
test('Error on number + string with + operator', () => {
  assertError(
    () => evaluateFormula('revenue + description', testContext),
    /Invalid operand types for \+: number and string/,
    'Should throw error when using + with number and string'
  );
});

// Test 54: Error on number & string concatenation (strict mode)
test('Error on number & string concatenation (strict mode)', () => {
  assertError(
    () => evaluateFormula('950 & " dollars"', testContext),
    /String concatenation operator & requires both operands to be strings, got number and string/,
    'Should throw error when using & with number and string without explicit casting'
  );
});

// Test 70: Multiplication/Division error with wrong types
test('Multiplication error with wrong types', () => {
  assertError(
    () => evaluateFormula('created_date * 2', testContext),
    /Invalid operand types for \*: date and number/,
    'Should throw error when multiplying date with number'
  );
});

// Test 71: Division error with wrong types
test('Division error with wrong types', () => {
  assertError(
    () => evaluateFormula('"hello" / 2', testContext),
    /Invalid operand types for \/: string and number/,
    'Should throw error when dividing string by number'
  );
});

// Test 78: Unterminated block comment error
test('Unterminated block comment error', () => {
  assertError(
    () => evaluateFormula('/* Unterminated comment\nrevenue', testContext),
    /Unterminated block comment/,
    'Should throw error for unterminated block comment'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 