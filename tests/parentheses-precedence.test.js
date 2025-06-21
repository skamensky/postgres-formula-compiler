/**
 * Parentheses & Precedence Tests
 * Tests for parentheses grouping and operator precedence
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Parentheses & Precedence Tests...\n');

// Test 14: Complex expression with parentheses
test('Complex expression with parentheses', () => {
  const result = evaluateFormula('(revenue - cost) + 50', testContext);
  assertEqual(result, '(("s"."revenue" - "s"."cost") + 50)');
});

// Test 35: Basic parentheses precedence override
test('Basic parentheses precedence override', () => {
  const result = evaluateFormula('2 * (3 + 4)', testContext);
  assertEqual(result, '(2 * (3 + 4))');
});

// Test 36: Multiple parenthesized expressions
test('Multiple parenthesized expressions', () => {
  const result = evaluateFormula('(revenue + 100) - (cost + 50)', testContext);
  assertEqual(result, '(("s"."revenue" + 100) - ("s"."cost" + 50))');
});

// Test 37: Nested parentheses with numbers
test('Nested parentheses with numbers', () => {
  const result = evaluateFormula('((10 + 5) * 2)', testContext);
  assertEqual(result, '((10 + 5) * 2)');
});

// Test 38: Deep nested parentheses
test('Deep nested parentheses', () => {
  const result = evaluateFormula('(((revenue + cost) - 100) * 2)', testContext);
  assertEqual(result, '((("s"."revenue" + "s"."cost") - 100) * 2)');
});

// Test 39: Unary operators with parentheses
test('Unary operators with parentheses', () => {
  const result = evaluateFormula('-(revenue + cost)', testContext);
  assertEqual(result, '-("s"."revenue" + "s"."cost")');
});

// Test 40: Functions with parenthesized arguments
test('Functions with parenthesized arguments', () => {
  const result = evaluateFormula('STRING((revenue + cost))', testContext);
  assertEqual(result, 'CAST(("s"."revenue" + "s"."cost") AS TEXT)');
});

// Test 41: Complex nested expression with numbers
test('Complex nested expression with numbers', () => {
  const result = evaluateFormula('(2 + 3) * (4 - 1)', testContext);
  assertEqual(result, '((2 + 3) * (4 - 1))');
});

// Test 42: Parentheses with mixed types
test('Parentheses with mixed types', () => {
  assertError(
    () => evaluateFormula('(revenue + 100) + (created_date - 30)', testContext),
    /Invalid operand types for \+: number and date/,
    'Should throw error when adding number and date results'
  );
});

// Test 43: Multiple levels of parentheses with numbers
test('Multiple levels of parentheses with numbers', () => {
  const result = evaluateFormula('((2 + 3) * 4) + 5', testContext);
  assertEqual(result, '(((2 + 3) * 4) + 5)');
});

// Test 46: Parentheses changing operator precedence
test('Parentheses changing operator precedence', () => {
  const result = evaluateFormula('2 + 3 * 4', testContext);
  assertEqual(result, '(2 + (3 * 4))');
  
  const result2 = evaluateFormula('(2 + 3) * 4', testContext);
  assertEqual(result2, '((2 + 3) * 4)');
});

// Test 68: Parentheses override precedence
test('Parentheses override precedence (multiplication)', () => {
  const result = evaluateFormula('(revenue + cost) * 2', testContext);
  assertEqual(result, '(("s"."revenue" + "s"."cost") * 2)');
});

// Test 15: Parentheses override precedence
test('Parentheses override precedence', () => {
  const result1 = evaluateFormula('revenue - cost + 100', testContext);
  const result2 = evaluateFormula('revenue - (cost + 100)', testContext);
  assertEqual(result1, '(("s"."revenue" - "s"."cost") + 100)');
  assertEqual(result2, '("s"."revenue" - ("s"."cost" + 100))');
});

// Error Tests
test('Unary plus error in parentheses (not supported)', () => {
  assertError(
    () => evaluateFormula('(+revenue)', testContext),
    /Unary plus operator is not supported/,
    'Should throw error for unary plus even in parentheses'
  );
});

test('Mismatched parentheses error', () => {
  assertError(
    () => evaluateFormula('(revenue + cost', testContext),
    /Expected RPAREN, got EOF/,
    'Should throw error for mismatched parentheses'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 