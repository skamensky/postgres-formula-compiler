/**
 * NULL Handling Tests
 * Tests for ISNULL(), NULLVALUE(), ISBLANK() functions and NULL literal
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, relationshipContext, printTestResults } from './test-utils.js';

console.log('Running NULL Handling Tests...\n');

// Basic NULL handling function tests
test('ISNULL function with column', () => {
  const result = evaluateFormula('ISNULL(note)', testContext);
  assertEqual(result, '("s"."note" IS NULL)');
});

test('ISNULL function with NULL literal', () => {
  const result = evaluateFormula('ISNULL(NULL)', testContext);
  assertEqual(result, '(NULL IS NULL)');
});

test('NULLVALUE function with column and default', () => {
  const result = evaluateFormula('NULLVALUE(note, "No note")', testContext);
  assertEqual(result, 'COALESCE("s"."note", \'No note\')');
});

test('NULLVALUE function with NULL literal', () => {
  const result = evaluateFormula('NULLVALUE(NULL, "Default")', testContext);
  assertEqual(result, 'COALESCE(NULL, \'Default\')');
});

test('ISBLANK function with column', () => {
  const result = evaluateFormula('ISBLANK(note)', testContext);
  assertEqual(result, '("s"."note" IS NULL OR "s"."note" = \'\')');
});

test('ISBLANK function with NULL', () => {
  const result = evaluateFormula('ISBLANK(NULL)', testContext);
  assertEqual(result, '(NULL IS NULL OR NULL = \'\')');
});

test('NULL literal', () => {
  const result = evaluateFormula('NULL', testContext);
  assertEqual(result, 'NULL');
});

// Complex NULL handling expressions
test('NULLVALUE with expression', () => {
  const result = evaluateFormula('NULLVALUE(note, "Empty") & " - " & STRING(amount)', testContext);
  assertEqual(result, '((COALESCE("s"."note", \'Empty\') || \' - \') || CAST("s"."amount" AS TEXT))');
});

test('IF with ISNULL condition', () => {
  const result = evaluateFormula('IF(ISNULL(note), "No note", note)', testContext);
  assertEqual(result, 'CASE WHEN ("s"."note" IS NULL) THEN \'No note\' ELSE "s"."note" END');
});

test('NULLVALUE in arithmetic', () => {
  const result = evaluateFormula('NULLVALUE(amount, 0) + 100', testContext);
  assertEqual(result, '(COALESCE("s"."amount", 0) + 100)');
});

test('Complex null handling with relationships', () => {
  // This test uses the relationshipContext from test-utils
  const result = evaluateFormula('NULLVALUE(merchant_rel.business_name, "Unknown Business")', relationshipContext);
  assertEqual(result, 'COALESCE("rel_merchant"."business_name", \'Unknown Business\')');
});

// Error Tests
test('Error - ISNULL with wrong argument count', () => {
  assertError(
    () => evaluateFormula('ISNULL()', testContext),
    /ISNULL\(\) takes exactly one argument/,
    'Should throw error when ISNULL has no arguments'
  );
});

test('Error - ISNULL with too many arguments', () => {
  assertError(
    () => evaluateFormula('ISNULL(note, amount)', testContext),
    /ISNULL\(\) takes exactly one argument/,
    'Should throw error when ISNULL has too many arguments'
  );
});

test('Error - NULLVALUE with wrong argument count', () => {
  assertError(
    () => evaluateFormula('NULLVALUE(note)', testContext),
    /NULLVALUE\(\) takes exactly two arguments/,
    'Should throw error when NULLVALUE has wrong argument count'
  );
});

test('Error - NULLVALUE with too many arguments', () => {
  assertError(
    () => evaluateFormula('NULLVALUE(note, "default", "extra")', testContext),
    /NULLVALUE\(\) takes exactly two arguments/,
    'Should throw error when NULLVALUE has too many arguments'
  );
});

test('Error - ISBLANK with wrong argument count', () => {
  assertError(
    () => evaluateFormula('ISBLANK()', testContext),
    /ISBLANK\(\) takes exactly one argument/,
    'Should throw error when ISBLANK has no arguments'
  );
});

test('Error - ISBLANK with too many arguments', () => {
  assertError(
    () => evaluateFormula('ISBLANK(note, amount)', testContext),
    /ISBLANK\(\) takes exactly one argument/,
    'Should throw error when ISBLANK has too many arguments'
  );
});

// Test 18: ISNULL function with string literal
test('ISNULL function with string literal', () => {
  const result = evaluateFormula('ISNULL("hello")', testContext);
  assertEqual(result, '(\'hello\' IS NULL)');
});

// Test 19: NULLVALUE function with NULL and default
test('NULLVALUE function with NULL and default', () => {
  const result = evaluateFormula('NULLVALUE(NULL, "default")', testContext);
  assertEqual(result, 'COALESCE(NULL, \'default\')');
});

// Test 20: NULLVALUE function with matching types
test('NULLVALUE function with matching types', () => {
  const result = evaluateFormula('NULLVALUE("maybe null", "definitely not null")', testContext);
  assertEqual(result, 'COALESCE(\'maybe null\', \'definitely not null\')');
});

// Test 21: ISBLANK function with string literal
test('ISBLANK function with string literal', () => {
  const result = evaluateFormula('ISBLANK("test")', testContext);
  assertEqual(result, '(\'test\' IS NULL OR \'test\' = \'\')');
});

// Test 22: NULLVALUE in string concatenation
test('NULLVALUE in string concatenation', () => {
  const result = evaluateFormula('NULLVALUE("maybe null", "default") & " value"', testContext);
  assertEqual(result, '(COALESCE(\'maybe null\', \'default\') || \' value\')');
});

// Test 23: Complex null handling expression
test('Complex null handling expression', () => {
  const result = evaluateFormula('IF(ISBLANK(revenue), NULLVALUE(cost, 0), revenue)', testContext);
  assertEqual(result, 'CASE WHEN ("s"."revenue" IS NULL OR "s"."revenue" = \'\') THEN COALESCE("s"."cost", 0) ELSE "s"."revenue" END');
});

// Test 24: Error - NULLVALUE with incompatible types
test('Error - NULLVALUE with incompatible types', () => {
  assertError(
    () => evaluateFormula('NULLVALUE(revenue, "string default")', testContext),
    /NULLVALUE\(\) value and default must be the same type, got number and string/,
    'Should throw error when NULLVALUE has incompatible types'
  );
});

// Test 25: Mixed null handling in complex expression
test('Mixed null handling in complex expression', () => {
  const result = evaluateFormula('STRING(NULLVALUE(revenue, 0)) & " (empty: " & STRING(ISBLANK(revenue)) & ")"', testContext);
  assertEqual(result, '(((CAST(COALESCE("s"."revenue", 0) AS TEXT) || \' (empty: \') || CAST(("s"."revenue" IS NULL OR "s"."revenue" = \'\') AS TEXT)) || \')\')');
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 