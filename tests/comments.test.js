/**
 * Comments Tests
 * Tests for line comments and block comments
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Comments Tests...\n');

// Test 56: Line comment at beginning
test('Line comment at beginning', () => {
  const result = evaluateFormula('// This is a comment\nrevenue + cost', testContext);
  assertEqual(result, '("s"."revenue" + "s"."cost")');
});

// Test 57: Line comment with whitespace
test('Line comment with whitespace', () => {
  const result = evaluateFormula('  // Comment with spaces\n  revenue - cost  ', testContext);
  assertEqual(result, '("s"."revenue" - "s"."cost")');
});

// Test 58: Block comment
test('Block comment', () => {
  const result = evaluateFormula('/* Block comment */ revenue * 2', testContext);
  assertEqual(result, '("s"."revenue" * 2)');
});

// Test 59: Block comment spanning multiple lines
test('Block comment spanning multiple lines', () => {
  const result = evaluateFormula(`/* This is a
  multi-line
  block comment */
  revenue + 100`, testContext);
  assertEqual(result, '("s"."revenue" + 100)');
});

// Test 60: Multiple line comments
test('Multiple line comments', () => {
  const result = evaluateFormula(`// First comment
  revenue + cost
  // Second comment`, testContext);
  assertEqual(result, '("s"."revenue" + "s"."cost")');
});

// Error Tests
test('Unterminated block comment error', () => {
  assertError(
    () => evaluateFormula('/* Unterminated block comment revenue + cost', testContext),
    /Unterminated block comment/,
    'Should throw error for unterminated block comment'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 