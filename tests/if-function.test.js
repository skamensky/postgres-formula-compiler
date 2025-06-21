/**
 * IF Function Tests
 * Tests for IF() function with boolean conditions
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, relationshipContext, printTestResults } from './test-utils.js';

console.log('Running IF Function Tests...\n');

// Test 79: Basic IF function with boolean column
test('Basic IF function with boolean column', () => {
  const result = evaluateFormula('IF(closed, "Yes", "No")', testContext);
  assertEqual(result, 'CASE WHEN "s"."closed" THEN \'Yes\' ELSE \'No\' END');
});

// Test 80: IF function with two arguments (no else)
test('IF function with two arguments (no else)', () => {
  const result = evaluateFormula('IF(syndication, amount)', testContext);
  assertEqual(result, 'CASE WHEN "s"."syndication" THEN "s"."amount" ELSE NULL END');
});

// Test 81: IF function with numeric values
test('IF function with numeric values', () => {
  const result = evaluateFormula('IF(open_approval, amount, 0)', testContext);
  assertEqual(result, 'CASE WHEN "s"."open_approval" THEN "s"."amount" ELSE 0 END');
});

// Test 86: Complex IF with relationships
test('Complex IF with relationships', () => {
  const result = evaluateFormula('IF(closed, merchant_rel.business_name, "Pending")', relationshipContext);
  assertEqual(result, 'CASE WHEN "s"."closed" THEN "rel_merchant"."business_name" ELSE \'Pending\' END');
});

// Test 100: IF with comparison condition
test('IF with comparison condition', () => {
  const result = evaluateFormula('IF(revenue > 1000, "High", "Low")', testContext);
  assertEqual(result, 'CASE WHEN ("s"."revenue" > 1000) THEN \'High\' ELSE \'Low\' END');
});

// Test 112: IF with logical condition
test('IF with logical condition', () => {
  const result = evaluateFormula('IF(AND(revenue > 1000, cost < 500), "Good Deal", "Check Again")', testContext);
  assertEqual(result, 'CASE WHEN (("s"."revenue" > 1000) AND ("s"."cost" < 500)) THEN \'Good Deal\' ELSE \'Check Again\' END');
});

// Test 126: Boolean literals in IF conditions
test('Boolean literals in IF conditions', () => {
  const result = evaluateFormula('IF(TRUE, "yes", "no")', testContext);
  assertEqual(result, 'CASE WHEN TRUE THEN \'yes\' ELSE \'no\' END');
});

// Test 142: CONTAINS returns boolean (can be used in IF)
test('CONTAINS returns boolean (can be used in IF)', () => {
  const result = evaluateFormula('IF(CONTAINS("hello world", "world"), "Found", "Not found")', testContext);
  assertEqual(result, 'CASE WHEN (POSITION(\'world\' IN \'hello world\') > 0) THEN \'Found\' ELSE \'Not found\' END');
});

// Test 162: SUBSTITUTE in IF condition with CONTAINS
test('SUBSTITUTE in IF condition with CONTAINS', () => {
  const result = evaluateFormula('IF(CONTAINS("Company LLC", "LLC"), SUBSTITUTE("Company LLC", "LLC", "Limited"), "No change")', testContext);
  assertEqual(result, 'CASE WHEN (POSITION(\'LLC\' IN \'Company LLC\') > 0) THEN REPLACE(\'Company LLC\', \'LLC\', \'Limited\') ELSE \'No change\' END');
});

// Test 186: Math functions in IF conditions
test('Math functions in IF conditions', () => {
  const result = evaluateFormula('IF(ABS(revenue - cost) > 1000, "Large difference", "Small difference")', testContext);
  assertEqual(result, 'CASE WHEN (ABS(("s"."revenue" - "s"."cost")) > 1000) THEN \'Large difference\' ELSE \'Small difference\' END');
});

// Test 211: NULL in IF condition
test('NULL in IF condition', () => {
  const result = evaluateFormula('IF(ISNULL(revenue), "No revenue", "Has revenue")', testContext);
  assertEqual(result, 'CASE WHEN ("s"."revenue" IS NULL) THEN \'No revenue\' ELSE \'Has revenue\' END');
});

// Test 215: Boolean literals in IF
test('Boolean literals in IF conditions', () => {
  const result = evaluateFormula('IF(TRUE, "always true", "never false")', testContext);
  assertEqual(result, 'CASE WHEN TRUE THEN \'always true\' ELSE \'never false\' END');
});

// Test 242: Date functions in IF conditions
test('Date functions in IF conditions', () => {
  const result = evaluateFormula('IF(YEAR(created_date) = 2023, "This year", "Other year")', testContext);
  assertEqual(result, 'CASE WHEN (EXTRACT(YEAR FROM "s"."created_date") = 2023) THEN \'This year\' ELSE \'Other year\' END');
});

// Error Tests
test('IF function error - wrong number of arguments', () => {
  assertError(
    () => evaluateFormula('IF()', testContext),
    /IF\(\) takes 2 or 3 arguments/,
    'Should throw error when IF() has no arguments'
  );
});

test('IF function error - too many arguments', () => {
  assertError(
    () => evaluateFormula('IF(closed, "A", "B", "C")', testContext),
    /IF\(\) takes 2 or 3 arguments/,
    'Should throw error when IF() has too many arguments'
  );
});

test('IF function error - non-boolean condition', () => {
  assertError(
    () => evaluateFormula('IF(revenue, "Yes", "No")', testContext),
    /IF\(\) condition must be boolean, got number/,
    'Should throw error when IF() condition is not boolean'
  );
});

test('IF function error - mismatched types', () => {
  assertError(
    () => evaluateFormula('IF(closed, amount, "text")', testContext),
    /IF\(\) true and false values must be the same type, got number and string/,
    'Should throw error when IF() true and false values have different types'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 