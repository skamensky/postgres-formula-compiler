/**
 * Math Functions Tests
 * Tests for ROUND, ABS, MIN, MAX, MOD, CEILING, FLOOR functions
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Math Functions Tests...\n');

// Test 169: ROUND function with number literals
test('ROUND function with number literals', () => {
  const result = evaluateFormula('ROUND(3.14159, 2)', testContext);
  assertEqual(result, 'ROUND(3.14159, 2)');
});

// Test 170: ROUND function with columns
test('ROUND function with columns', () => {
  const result = evaluateFormula('ROUND(revenue, 0)', testContext);
  assertEqual(result, 'ROUND("s"."revenue", 0)');
});

// Test 171: ABS function with number literal
test('ABS function with number literal', () => {
  const result = evaluateFormula('ABS(-42)', testContext);
  assertEqual(result, 'ABS(-42)');
});

// Test 172: ABS function with column
test('ABS function with column', () => {
  const result = evaluateFormula('ABS(revenue)', testContext);
  assertEqual(result, 'ABS("s"."revenue")');
});

// Test 173: MIN function with number literals
test('MIN function with number literals', () => {
  const result = evaluateFormula('MIN(10, 20)', testContext);
  assertEqual(result, 'LEAST(10, 20)');
});

// Test 174: MIN function with columns
test('MIN function with columns', () => {
  const result = evaluateFormula('MIN(revenue, cost)', testContext);
  assertEqual(result, 'LEAST("s"."revenue", "s"."cost")');
});

// Test 175: MAX function with number literals
test('MAX function with number literals', () => {
  const result = evaluateFormula('MAX(10, 20)', testContext);
  assertEqual(result, 'GREATEST(10, 20)');
});

// Test 176: MAX function with columns
test('MAX function with columns', () => {
  const result = evaluateFormula('MAX(revenue, cost)', testContext);
  assertEqual(result, 'GREATEST("s"."revenue", "s"."cost")');
});

// Test 177: MOD function with number literals
test('MOD function with number literals', () => {
  const result = evaluateFormula('MOD(10, 3)', testContext);
  assertEqual(result, 'MOD(10, 3)');
});

// Test 178: MOD function with columns
test('MOD function with columns', () => {
  const result = evaluateFormula('MOD(revenue, 12)', testContext);
  assertEqual(result, 'MOD("s"."revenue", 12)');
});

// Test 179: CEILING function with number literal
test('CEILING function with number literal', () => {
  const result = evaluateFormula('CEILING(3.14)', testContext);
  assertEqual(result, 'CEILING(3.14)');
});

// Test 180: CEILING function with column
test('CEILING function with column', () => {
  const result = evaluateFormula('CEILING(revenue)', testContext);
  assertEqual(result, 'CEILING("s"."revenue")');
});

// Test 181: FLOOR function with number literal
test('FLOOR function with number literal', () => {
  const result = evaluateFormula('FLOOR(3.99)', testContext);
  assertEqual(result, 'FLOOR(3.99)');
});

// Test 182: FLOOR function with column
test('FLOOR function with column', () => {
  const result = evaluateFormula('FLOOR(revenue)', testContext);
  assertEqual(result, 'FLOOR("s"."revenue")');
});

// Test 183: Complex math expression
test('Complex math expression', () => {
  const result = evaluateFormula('ROUND(ABS(revenue - cost), 2)', testContext);
  assertEqual(result, 'ROUND(ABS(("s"."revenue" - "s"."cost")), 2)');
});

// Test 184: Math functions return number type (can be used in arithmetic)
test('Math functions return number type (can be used in arithmetic)', () => {
  const result = evaluateFormula('ROUND(revenue, 2) + ABS(cost)', testContext);
  assertEqual(result, '(ROUND("s"."revenue", 2) + ABS("s"."cost"))');
});

// Test 185: Math functions in string concatenation
test('Math functions in string concatenation', () => {
  const result = evaluateFormula('STRING(ROUND(revenue, 2)) & " USD"', testContext);
  assertEqual(result, '(CAST(ROUND("s"."revenue", 2) AS TEXT) || \' USD\')');
});

// Test 31: Error - ROUND with non-number second argument
test('Error - ROUND with non-number second argument', () => {
  assertError(
    () => evaluateFormula('ROUND(3.14, "bad")', testContext),
    /ROUND\(\) decimals must be number, got string/,
    'Should throw error when ROUND second argument is not number'
  );
});

// Test 32: Error - MAX with non-number second argument
test('Error - MAX with non-number second argument', () => {
  assertError(
    () => evaluateFormula('MAX(10, TODAY())', testContext),
    /MAX\(\) num2 must be number, got date/,
    'Should throw error when MAX second argument is not number'
  );
});

// Test 33: Error - MOD with non-number arguments
test('Error - MOD with non-number arguments', () => {
  assertError(
    () => evaluateFormula('MOD(10, "bad")', testContext),
    /MOD\(\) divisor must be number, got string/,
    'Should throw error when MOD has non-number arguments'
  );
});

// Test 34: Error - CEILING with wrong argument count
test('Error - CEILING with wrong argument count', () => {
  assertError(
    () => evaluateFormula('CEILING(3.14, 2)', testContext),
    /CEILING\(\) takes exactly one argument/,
    'Should throw error when CEILING has wrong argument count'
  );
});

// Test 35: Error - FLOOR with non-number argument
test('Error - FLOOR with non-number argument', () => {
  assertError(
    () => evaluateFormula('FLOOR("bad")', testContext),
    /FLOOR\(\) number must be number, got string/,
    'Should throw error when FLOOR has non-number argument'
  );
});

// Test 36: Error - Mixed math function errors
test('Error - Mixed math function errors', () => {
  assertError(
    () => evaluateFormula('MIN("bad", 10)', testContext),
    /MIN\(\) num1 must be number, got string/,
    'Should throw error when nested math functions have wrong types'
  );
});

// Error Tests

// Test 187: ROUND with wrong argument count
test('Error - ROUND with wrong argument count', () => {
  assertError(
    () => evaluateFormula('ROUND(3.14)', testContext),
    /ROUND\(\) takes exactly 2 arguments/,
    'Should throw error when ROUND has wrong argument count'
  );
});

// Test 188: ROUND with non-number first argument
test('Error - ROUND with non-number first argument', () => {
  assertError(
    () => evaluateFormula('ROUND("bad", 2)', testContext),
    /ROUND\(\) number must be number, got string/,
    'Should throw error when ROUND first argument is not number'
  );
});

// Test 190: ABS with wrong argument count
test('Error - ABS with wrong argument count', () => {
  assertError(
    () => evaluateFormula('ABS(3, 4)', testContext),
    /ABS\(\) takes exactly one argument/,
    'Should throw error when ABS has wrong argument count'
  );
});

// Test 191: ABS with non-number argument
test('Error - ABS with non-number argument', () => {
  assertError(
    () => evaluateFormula('ABS("bad")', testContext),
    /ABS\(\) number must be number, got string/,
    'Should throw error when ABS has non-number argument'
  );
});

// Test 192: MIN with wrong argument count
test('Error - MIN with wrong argument count', () => {
  assertError(
    () => evaluateFormula('MIN(10)', testContext),
    /MIN\(\) takes exactly 2 arguments/,
    'Should throw error when MIN has wrong argument count'
  );
});

// Test 193: MIN with non-number arguments
test('Error - MIN with non-number arguments', () => {
  assertError(
    () => evaluateFormula('MIN("bad", 10)', testContext),
    /MIN\(\) num1 must be number, got string/,
    'Should throw error when MIN has non-number arguments'
  );
});

// Test 195: MOD with wrong argument count
test('Error - MOD with wrong argument count', () => {
  assertError(
    () => evaluateFormula('MOD(10)', testContext),
    /MOD\(\) takes exactly 2 arguments/,
    'Should throw error when MOD has wrong argument count'
  );
});

// Test 198: CEILING with non-number argument
test('Error - CEILING with non-number argument', () => {
  assertError(
    () => evaluateFormula('CEILING(TODAY())', testContext),
    /CEILING\(\) number must be number, got date/,
    'Should throw error when CEILING has non-number argument'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 