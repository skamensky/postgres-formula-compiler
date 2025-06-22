/**
 * Logical Operator Functions Tests
 * Tests for AND(), OR(), NOT() functions (not infix operators)
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Logical Operator Functions Tests...\n');

// Basic AND function tests
test('AND function with two boolean comparisons', () => {
  const result = evaluateFormula('AND(revenue > 1000, cost < 500)', testContext);
  assertEqual(result, '(("s"."revenue" > 1000) AND ("s"."cost" < 500))');
});

test('AND function with three arguments', () => {
  const result = evaluateFormula('AND(revenue > 1000, cost < 500, amount > 0)', testContext);
  assertEqual(result, '(("s"."revenue" > 1000) AND ("s"."cost" < 500) AND ("s"."amount" > 0))');
});

test('AND function with boolean columns', () => {
  const result = evaluateFormula('AND(closed, syndication)', testContext);
  assertEqual(result, '("s"."closed" AND "s"."syndication")');
});

test('AND function with boolean literals', () => {
  const result = evaluateFormula('AND(TRUE, FALSE)', testContext);
  assertEqual(result, '(TRUE AND FALSE)');
});

// Basic OR function tests
test('OR function with two boolean comparisons', () => {
  const result = evaluateFormula('OR(revenue > 5000, cost < 100)', testContext);
  assertEqual(result, '(("s"."revenue" > 5000) OR ("s"."cost" < 100))');
});

test('OR function with three arguments', () => {
  const result = evaluateFormula('OR(revenue > 5000, cost < 100, amount = 0)', testContext);
  assertEqual(result, '(("s"."revenue" > 5000) OR ("s"."cost" < 100) OR ("s"."amount" = 0))');
});

test('OR function with boolean columns', () => {
  const result = evaluateFormula('OR(closed, open_approval)', testContext);
  assertEqual(result, '("s"."closed" OR "s"."open_approval")');
});

test('OR function with boolean literals', () => {
  const result = evaluateFormula('OR(TRUE, FALSE)', testContext);
  assertEqual(result, '(TRUE OR FALSE)');
});

// Basic NOT function tests
test('NOT function with comparison', () => {
  const result = evaluateFormula('NOT(revenue > 1000)', testContext);
  assertEqual(result, 'NOT (("s"."revenue" > 1000))');
});

test('NOT function with boolean column', () => {
  const result = evaluateFormula('NOT(closed)', testContext);
  assertEqual(result, 'NOT ("s"."closed")');
});

test('NOT function with boolean literal', () => {
  const result = evaluateFormula('NOT(TRUE)', testContext);
  assertEqual(result, 'NOT (TRUE)');
});

// Complex nested expressions
test('Nested AND and OR functions', () => {
  const result = evaluateFormula('AND(OR(revenue > 1000, cost < 100), revenue < 10000)', testContext);
  assertEqual(result, '((("s"."revenue" > 1000) OR ("s"."cost" < 100)) AND ("s"."revenue" < 10000))');
});

test('NOT with AND function', () => {
  const result = evaluateFormula('NOT(AND(revenue > 1000, cost < 100))', testContext);
  assertEqual(result, 'NOT ((("s"."revenue" > 1000) AND ("s"."cost" < 100)))');
});

test('Complex expression with all logical functions', () => {
  const result = evaluateFormula('OR(AND(revenue > 1000, NOT(closed)), amount = 0)', testContext);
  assertEqual(result, '((("s"."revenue" > 1000) AND NOT ("s"."closed")) OR ("s"."amount" = 0))');
});

// Variadic argument tests
test('AND function with four arguments', () => {
  const result = evaluateFormula('AND(revenue > 0, cost > 0, amount > 0, closed)', testContext);
  assertEqual(result, '(("s"."revenue" > 0) AND ("s"."cost" > 0) AND ("s"."amount" > 0) AND "s"."closed")');
});

test('OR function with five arguments', () => {
  const result = evaluateFormula('OR(revenue > 5000, cost < 100, amount = 0, closed, syndication)', testContext);
  assertEqual(result, '(("s"."revenue" > 5000) OR ("s"."cost" < 100) OR ("s"."amount" = 0) OR "s"."closed" OR "s"."syndication")');
});

// Tests with NULL handling functions
test('Logical functions with null handling functions', () => {
  const result = evaluateFormula('AND(ISNULL(revenue), ISBLANK(note))', testContext);
  assertEqual(result, '(("s"."revenue" IS NULL) AND ("s"."note" IS NULL OR "s"."note" = \'\'))');
});

test('OR with ISNULL and comparison', () => {
  const result = evaluateFormula('OR(ISNULL(revenue), revenue > 1000)', testContext);
  assertEqual(result, '(("s"."revenue" IS NULL) OR ("s"."revenue" > 1000))');
});

// Error Tests
test('Error - AND with no arguments', () => {
  assertError(
    () => evaluateFormula('AND()', testContext),
    /AND\(\) takes at least 2 arguments/,
    'Should throw error when AND has no arguments'
  );
});

test('Error - AND with one argument', () => {
  assertError(
    () => evaluateFormula('AND(TRUE)', testContext),
    /AND\(\) takes at least 2 arguments/,
    'Should throw error when AND has only one argument'
  );
});

test('Error - OR with no arguments', () => {
  assertError(
    () => evaluateFormula('OR()', testContext),
    /OR\(\) takes at least 2 arguments/,
    'Should throw error when OR has no arguments'
  );
});

test('Error - OR with one argument', () => {
  assertError(
    () => evaluateFormula('OR(FALSE)', testContext),
    /OR\(\) takes at least 2 arguments/,
    'Should throw error when OR has only one argument'
  );
});

test('Error - NOT with no arguments', () => {
  assertError(
    () => evaluateFormula('NOT()', testContext),
    /NOT\(\) takes exactly one argument/,
    'Should throw error when NOT has no arguments'
  );
});

test('Error - NOT with too many arguments', () => {
  assertError(
    () => evaluateFormula('NOT(TRUE, FALSE)', testContext),
    /NOT\(\) takes exactly one argument/,
    'Should throw error when NOT has too many arguments'
  );
});

test('Error - AND with non-boolean argument', () => {
  assertError(
    () => evaluateFormula('AND(revenue, cost)', testContext),
    /AND\(\) argument 1 must be boolean, got number/,
    'Should throw error when AND has non-boolean argument'
  );
});

test('Error - OR with non-boolean argument', () => {
  assertError(
    () => evaluateFormula('OR(revenue > 1000, "text")', testContext),
    /OR\(\) argument 2 must be boolean, got string/,
    'Should throw error when OR has non-boolean argument'
  );
});

test('Error - NOT with non-boolean argument', () => {
  assertError(
    () => evaluateFormula('NOT(revenue)', testContext),
    /NOT\(\) requires boolean argument, got number/,
    'Should throw error when NOT has non-boolean argument'
  );
});

test('Error - AND with mixed valid and invalid arguments', () => {
  assertError(
    () => evaluateFormula('AND(revenue > 1000, cost, closed)', testContext),
    /AND\(\) argument 2 must be boolean, got number/,
    'Should throw error when AND has mixed valid and invalid arguments'
  );
});

// Print results and exit with appropriate code
printTestResults(); 