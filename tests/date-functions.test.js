/**
 * Date Functions Tests
 * Tests for YEAR, MONTH, DAY, WEEKDAY, ADDMONTHS, ADDDAYS, DATEDIF functions
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Date Functions Tests...\n');

// Test 224: YEAR function with date column
test('YEAR function with date column', () => {
  const result = evaluateFormula('YEAR(created_date)', testContext);
  assertEqual(result, 'EXTRACT(YEAR FROM "s"."created_date")');
});

// Test 225: YEAR function with TODAY()
test('YEAR function with TODAY()', () => {
  const result = evaluateFormula('YEAR(TODAY())', testContext);
  assertEqual(result, 'EXTRACT(YEAR FROM current_date)');
});

// Test 226: YEAR function with DATE() literal
test('YEAR function with DATE() literal', () => {
  const result = evaluateFormula('YEAR(DATE("2023-12-25"))', testContext);
  assertEqual(result, 'EXTRACT(YEAR FROM DATE(\'2023-12-25\'))');
});

// Test 227: MONTH function with date column
test('MONTH function with date column', () => {
  const result = evaluateFormula('MONTH(updated_date)', testContext);
  assertEqual(result, 'EXTRACT(MONTH FROM "s"."updated_date")');
});

// Test 228: MONTH function with TODAY()
test('MONTH function with TODAY()', () => {
  const result = evaluateFormula('MONTH(TODAY())', testContext);
  assertEqual(result, 'EXTRACT(MONTH FROM current_date)');
});

// Test 229: DAY function with date column
test('DAY function with date column', () => {
  const result = evaluateFormula('DAY(created_date)', testContext);
  assertEqual(result, 'EXTRACT(DAY FROM "s"."created_date")');
});

// Test 230: DAY function with DATE() literal
test('DAY function with DATE() literal', () => {
  const result = evaluateFormula('DAY(DATE("2023-12-25"))', testContext);
  assertEqual(result, 'EXTRACT(DAY FROM DATE(\'2023-12-25\'))');
});

// Test 231: WEEKDAY function with date column
test('WEEKDAY function with date column', () => {
  const result = evaluateFormula('WEEKDAY(created_date)', testContext);
  assertEqual(result, 'EXTRACT(DOW FROM "s"."created_date") + 1');
});

// Test 232: WEEKDAY function with TODAY()
test('WEEKDAY function with TODAY()', () => {
  const result = evaluateFormula('WEEKDAY(TODAY())', testContext);
  assertEqual(result, 'EXTRACT(DOW FROM current_date) + 1');
});

// Test 233: ADDMONTHS function with date column and number
test('ADDMONTHS function with date column and number', () => {
  const result = evaluateFormula('ADDMONTHS(created_date, 6)', testContext);
  assertEqual(result, '("s"."created_date" + INTERVAL \'6 months\')');
});

// Test 234: ADDMONTHS function with TODAY() and negative number
test('ADDMONTHS function with TODAY() and negative number', () => {
  const result = evaluateFormula('ADDMONTHS(TODAY(), -3)', testContext);
  assertEqual(result, '(current_date + INTERVAL \'-3 months\')');
});

// Test 235: ADDDAYS function with date column and number
test('ADDDAYS function with date column and number', () => {
  const result = evaluateFormula('ADDDAYS(updated_date, 30)', testContext);
  assertEqual(result, '("s"."updated_date" + INTERVAL \'30 days\')');
});

// Test 236: ADDDAYS function with TODAY() and negative number
test('ADDDAYS function with TODAY() and negative number', () => {
  const result = evaluateFormula('ADDDAYS(TODAY(), -7)', testContext);
  assertEqual(result, '(current_date + INTERVAL \'-7 days\')');
});

// Test 237: DATEDIF function with days unit
test('DATEDIF function with days unit', () => {
  const result = evaluateFormula('DATEDIF(created_date, updated_date, "days")', testContext);
  assertEqual(result, '("s"."updated_date" - "s"."created_date")');
});

// Test 238: DATEDIF function with months unit
test('DATEDIF function with months unit', () => {
  const result = evaluateFormula('DATEDIF(created_date, TODAY(), "months")', testContext);
  assertEqual(result, '((EXTRACT(YEAR FROM current_date) - EXTRACT(YEAR FROM "s"."created_date")) * 12 + (EXTRACT(MONTH FROM current_date) - EXTRACT(MONTH FROM "s"."created_date")))');
});

// Test 239: DATEDIF function with years unit
test('DATEDIF function with years unit', () => {
  const result = evaluateFormula('DATEDIF(DATE("2020-01-01"), TODAY(), "years")', testContext);
  assertEqual(result, '(EXTRACT(YEAR FROM current_date) - EXTRACT(YEAR FROM DATE(\'2020-01-01\')))');
});

// Test 240: Date functions return number type (can be used in arithmetic)
test('Date functions return number type (can be used in arithmetic)', () => {
  const result = evaluateFormula('YEAR(created_date) + MONTH(created_date)', testContext);
  assertEqual(result, '(EXTRACT(YEAR FROM "s"."created_date") + EXTRACT(MONTH FROM "s"."created_date"))');
});

// Test 241: Date functions in string concatenation
test('Date functions in string concatenation', () => {
  const result = evaluateFormula('STRING(YEAR(created_date)) & "-" & STRING(MONTH(created_date))', testContext);
  assertEqual(result, '((CAST(EXTRACT(YEAR FROM "s"."created_date") AS TEXT) || \'-\') || CAST(EXTRACT(MONTH FROM "s"."created_date") AS TEXT))');
});

// Test 243: Complex date function expression
test('Complex date function expression', () => {
  const result = evaluateFormula('ADDDAYS(ADDMONTHS(created_date, 6), DATEDIF(created_date, updated_date, "days"))', testContext);
  assertEqual(result, '(("s"."created_date" + INTERVAL \'6 months\') + INTERVAL \'("s"."updated_date" - "s"."created_date") days\')');
});

// Error Tests

// Test 244: YEAR with wrong argument count
test('Error - YEAR with wrong argument count', () => {
  assertError(
    () => evaluateFormula('YEAR()', testContext),
    /YEAR\(\) takes exactly one argument/,
    'Should throw error when YEAR has no arguments'
  );
});

// Test 245: YEAR with non-date argument
test('Error - YEAR with non-date argument', () => {
  assertError(
    () => evaluateFormula('YEAR(revenue)', testContext),
    /YEAR\(\) requires date argument, got number/,
    'Should throw error when YEAR has non-date argument'
  );
});

// Test 249: ADDMONTHS with wrong argument count
test('Error - ADDMONTHS with wrong argument count', () => {
  assertError(
    () => evaluateFormula('ADDMONTHS(created_date)', testContext),
    /ADDMONTHS\(\) takes exactly two arguments: ADDMONTHS\(date, months\)/,
    'Should throw error when ADDMONTHS has wrong argument count'
  );
});

// Test 250: ADDMONTHS with non-date first argument
test('Error - ADDMONTHS with non-date first argument', () => {
  assertError(
    () => evaluateFormula('ADDMONTHS(revenue, 6)', testContext),
    /ADDMONTHS\(\) first argument must be date, got number/,
    'Should throw error when ADDMONTHS first argument is not date'
  );
});

// Test 254: DATEDIF with wrong argument count
test('Error - DATEDIF with wrong argument count', () => {
  assertError(
    () => evaluateFormula('DATEDIF(created_date, updated_date)', testContext),
    /DATEDIF\(\) takes exactly three arguments: DATEDIF\(date1, date2, unit\)/,
    'Should throw error when DATEDIF has wrong argument count'
  );
});

// Test 257: DATEDIF with non-string literal third argument
test('Error - DATEDIF with non-string literal third argument', () => {
  assertError(
    () => evaluateFormula('DATEDIF(created_date, updated_date, revenue)', testContext),
    /DATEDIF\(\) third argument must be a string literal: "days", "months", or "years"/,
    'Should throw error when DATEDIF third argument is not string literal'
  );
});

// Test 258: DATEDIF with invalid unit
test('Error - DATEDIF with invalid unit', () => {
  assertError(
    () => evaluateFormula('DATEDIF(created_date, updated_date, "hours")', testContext),
    /DATEDIF\(\) unit must be "days", "months", or "years", got "hours"/,
    'Should throw error when DATEDIF has invalid unit'
  );
});

// Test 39: Error - MONTH with non-date argument
test('Error - MONTH with non-date argument', () => {
  assertError(
    () => evaluateFormula('MONTH("hello")', testContext),
    /MONTH\(\) requires date argument, got string/,
    'Should throw error when MONTH has non-date argument'
  );
});

// Test 40: Error - DAY with wrong argument count
test('Error - DAY with wrong argument count', () => {
  assertError(
    () => evaluateFormula('DAY(created_date, updated_date)', testContext),
    /DAY\(\) takes exactly one argument/,
    'Should throw error when DAY has too many arguments'
  );
});

// Test 41: Error - WEEKDAY with non-date argument
test('Error - WEEKDAY with non-date argument', () => {
  assertError(
    () => evaluateFormula('WEEKDAY(cost)', testContext),
    /WEEKDAY\(\) requires date argument, got number/,
    'Should throw error when WEEKDAY has non-date argument'
  );
});

// Test 42: Error - ADDMONTHS with non-number second argument
test('Error - ADDMONTHS with non-number second argument', () => {
  assertError(
    () => evaluateFormula('ADDMONTHS(created_date, "six")', testContext),
    /ADDMONTHS\(\) second argument must be number, got string/,
    'Should throw error when ADDMONTHS second argument is not number'
  );
});

// Test 43: Error - ADDDAYS with wrong argument count
test('Error - ADDDAYS with wrong argument count', () => {
  assertError(
    () => evaluateFormula('ADDDAYS(created_date, 30, 15)', testContext),
    /ADDDAYS\(\) takes exactly two arguments: ADDDAYS\(date, days\)/,
    'Should throw error when ADDDAYS has wrong argument count'
  );
});

// Test 44: Error - ADDDAYS with wrong argument types
test('Error - ADDDAYS with wrong argument types', () => {
  assertError(
    () => evaluateFormula('ADDDAYS("hello", created_date)', testContext),
    /ADDDAYS\(\) first argument must be date, got string/,
    'Should throw error when ADDDAYS has wrong argument types'
  );
});

// Test 45: Error - DATEDIF with non-date first argument
test('Error - DATEDIF with non-date first argument', () => {
  assertError(
    () => evaluateFormula('DATEDIF(revenue, updated_date, "days")', testContext),
    /DATEDIF\(\) first argument must be date, got number/,
    'Should throw error when DATEDIF first argument is not date'
  );
});

// Test 46: Error - DATEDIF with non-date second argument
test('Error - DATEDIF with non-date second argument', () => {
  assertError(
    () => evaluateFormula('DATEDIF(created_date, cost, "days")', testContext),
    /DATEDIF\(\) second argument must be date, got number/,
    'Should throw error when DATEDIF second argument is not date'
  );
});

// Test 47: Error - Mixed date function errors
test('Error - Mixed date function errors', () => {
  assertError(
    () => evaluateFormula('YEAR(MONTH(created_date))', testContext),
    /YEAR\(\) requires date argument, got number/,
    'Should throw error when nested date functions have wrong types'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 