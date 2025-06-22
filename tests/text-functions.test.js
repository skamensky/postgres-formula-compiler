/**
 * Text Functions Tests
 * Tests for UPPER, LOWER, TRIM, LEN, LEFT, RIGHT, MID, CONTAINS, SUBSTITUTE functions
 */

import { evaluateFormula, test, assertEqual, assertError, testContext, printTestResults } from './test-utils.js';

console.log('Running Text Functions Tests...\n');

// Test 131: UPPER function with string literal
test('UPPER function with string literal', () => {
  const result = evaluateFormula('UPPER("hello world")', testContext);
  assertEqual(result, 'UPPER(\'hello world\')');
});

// Test 132: LOWER function with string literal
test('LOWER function with string literal', () => {
  const result = evaluateFormula('LOWER("HELLO WORLD")', testContext);
  assertEqual(result, 'LOWER(\'HELLO WORLD\')');
});

// Test 133: TRIM function with string literal
test('TRIM function with string literal', () => {
  const result = evaluateFormula('TRIM("  hello  ")', testContext);
  assertEqual(result, 'TRIM(\'  hello  \')');
});

// Test 134: LEN function with string literal
test('LEN function with string literal', () => {
  const result = evaluateFormula('LEN("hello")', testContext);
  assertEqual(result, 'LENGTH(\'hello\')');
});

// Test 135: LEFT function with string and number
test('LEFT function with string and number', () => {
  const result = evaluateFormula('LEFT("hello world", 5)', testContext);
  assertEqual(result, 'LEFT(\'hello world\', 5)');
});

// Test 136: RIGHT function with string and number
test('RIGHT function with string and number', () => {
  const result = evaluateFormula('RIGHT("hello world", 5)', testContext);
  assertEqual(result, 'RIGHT(\'hello world\', 5)');
});

// Test 137: MID function with string and two numbers
test('MID function with string and two numbers', () => {
  const result = evaluateFormula('MID("hello world", 2, 5)', testContext);
  assertEqual(result, 'SUBSTRING(\'hello world\', 2, 5)');
});

// Test 138: CONTAINS function with two strings
test('CONTAINS function with two strings', () => {
  const result = evaluateFormula('CONTAINS("hello world", "world")', testContext);
  assertEqual(result, '(POSITION(\'world\' IN \'hello world\') > 0)');
});

// Test 139: UPPER function with string column
test('UPPER function with string column', () => {
  const result = evaluateFormula('UPPER(name)', testContext);
  assertEqual(result, 'UPPER("s"."name")');
});

// Test 140: Complex text function expression
test('Complex text function expression', () => {
  const result = evaluateFormula('UPPER(LEFT(TRIM(name), 3)) & "..."', testContext);
  assertEqual(result, '(UPPER(LEFT(TRIM("s"."name"), 3)) || \'...\')');
});

// Test 141: LEN function returns number type (can be used in arithmetic)
test('LEN function returns number type (can be used in arithmetic)', () => {
  const result = evaluateFormula('LEN("hello") + 5', testContext);
  assertEqual(result, '(LENGTH(\'hello\') + 5)');
});

// SUBSTITUTE Function Tests

// Test 156: SUBSTITUTE function with string literals
test('SUBSTITUTE function with string literals', () => {
  const result = evaluateFormula('SUBSTITUTE("hello world", "world", "universe")', testContext);
  assertEqual(result, 'REPLACE(\'hello world\', \'world\', \'universe\')');
});

// Test 157: SUBSTITUTE function with string column
test('SUBSTITUTE function with string column', () => {
  const result = evaluateFormula('SUBSTITUTE(name, "Inc", "LLC")', testContext);
  assertEqual(result, 'REPLACE("s"."name", \'Inc\', \'LLC\')');
});

// Test 158: SUBSTITUTE with multiple replacements
test('SUBSTITUTE with multiple replacements', () => {
  const result = evaluateFormula('SUBSTITUTE("hello hello world", "hello", "hi")', testContext);
  assertEqual(result, 'REPLACE(\'hello hello world\', \'hello\', \'hi\')');
});

// Test 159: SUBSTITUTE in complex expression
test('SUBSTITUTE in complex expression', () => {
  const result = evaluateFormula('UPPER(SUBSTITUTE(company_name, "LLC", "Limited Liability Company"))', testContext);
  assertEqual(result, 'UPPER(REPLACE("s"."company_name", \'LLC\', \'Limited Liability Company\'))');
});

// Test 160: SUBSTITUTE with empty replacement
test('SUBSTITUTE with empty replacement', () => {
  const result = evaluateFormula('SUBSTITUTE("hello world", "hello ", "")', testContext);
  assertEqual(result, 'REPLACE(\'hello world\', \'hello \', \'\')');
});

// Test 161: SUBSTITUTE returns string type (can be concatenated)
test('SUBSTITUTE returns string type (can be concatenated)', () => {
  const result = evaluateFormula('SUBSTITUTE("hello world", "world", "universe") & "!"', testContext);
  assertEqual(result, '(REPLACE(\'hello world\', \'world\', \'universe\') || \'!\')');
});

// Error Tests

// Test 143: UPPER with wrong argument count
test('Error - UPPER with wrong argument count', () => {
  assertError(
    () => evaluateFormula('UPPER("hello", "world")', testContext),
    /UPPER\(\) takes exactly one argument/,
    'Should throw error when UPPER has wrong argument count'
  );
});

// Test 144: UPPER with non-string argument
test('Error - UPPER with non-string argument', () => {
  assertError(
    () => evaluateFormula('UPPER(42)', testContext),
    /UPPER\(\) text must be string, got number/,
    'Should throw error when UPPER has non-string argument'
  );
});

// Test 148: LEFT with wrong argument count
test('Error - LEFT with wrong argument count', () => {
  assertError(
    () => evaluateFormula('LEFT("hello")', testContext),
    /LEFT\(\) takes exactly 2 arguments/,
    'Should throw error when LEFT has wrong argument count'
  );
});

// Test 149: LEFT with non-string first argument
test('Error - LEFT with non-string first argument', () => {
  assertError(
    () => evaluateFormula('LEFT(123, 5)', testContext),
    /LEFT\(\) text must be string, got number/,
    'Should throw error when LEFT first argument is not string'
  );
});

// Test 152: MID with wrong argument count
test('Error - MID with wrong argument count', () => {
  assertError(
    () => evaluateFormula('MID("hello", 2)', testContext),
    /MID\(\) takes exactly 3 arguments/,
    'Should throw error when MID has wrong argument count'
  );
});

// Test 154: CONTAINS with wrong argument types
test('Error - CONTAINS with wrong argument types', () => {
  assertError(
    () => evaluateFormula('CONTAINS("hello", 123)', testContext),
    /CONTAINS\(\) search_text must be string, got number/,
    'Should throw error when CONTAINS second argument is not string'
  );
});

// Test 163: SUBSTITUTE with wrong argument count
test('Error - SUBSTITUTE with wrong argument count', () => {
  assertError(
    () => evaluateFormula('SUBSTITUTE("hello", "world")', testContext),
    /SUBSTITUTE\(\) takes exactly 3 arguments/,
    'Should throw error when SUBSTITUTE has wrong argument count'
  );
});

// Test 165: SUBSTITUTE with non-string first argument
test('Error - SUBSTITUTE with non-string first argument', () => {
  assertError(
    () => evaluateFormula('SUBSTITUTE(123, "1", "2")', testContext),
    /SUBSTITUTE\(\) text must be string, got number/,
    'Should throw error when SUBSTITUTE first argument is not string'
  );
});

// Test 26: Error - LOWER with non-string argument
test('Error - LOWER with non-string argument', () => {
  assertError(
    () => evaluateFormula('LOWER(revenue)', testContext),
    /LOWER\(\) text must be string, got number/,
    'Should throw error when LOWER has non-string argument'
  );
});

// Test 27: Error - TRIM with non-string argument
test('Error - TRIM with non-string argument', () => {
  assertError(
    () => evaluateFormula('TRIM(123)', testContext),
    /TRIM\(\) text must be string, got number/,
    'Should throw error when TRIM has non-string argument'
  );
});

// Test 28: Error - LEN with non-string argument
test('Error - LEN with non-string argument', () => {
  assertError(
    () => evaluateFormula('LEN(TODAY())', testContext),
    /LEN\(\) text must be string, got date/,
    'Should throw error when LEN has non-string argument'
  );
});

// Test 29: Error - LEFT with non-number second argument
test('Error - LEFT with non-number second argument', () => {
  assertError(
    () => evaluateFormula('LEFT("hello", "world")', testContext),
    /LEFT\(\) num_chars must be number, got string/,
    'Should throw error when LEFT second argument is not number'
  );
});

// Test 30: Error - RIGHT with wrong arguments
test('Error - RIGHT with wrong arguments', () => {
  assertError(
    () => evaluateFormula('RIGHT(123, "abc")', testContext),
    /RIGHT\(\) text must be string, got number/,
    'Should throw error when RIGHT has wrong argument types'
  );
});

// Test 31: Error - MID with wrong argument types
test('Error - MID with wrong argument types', () => {
  assertError(
    () => evaluateFormula('MID(123, "start", "length")', testContext),
    /MID\(\) text must be string, got number/,
    'Should throw error when MID has wrong argument types'
  );
});

// Test 32: Error - CONTAINS with wrong argument count
test('Error - CONTAINS with wrong argument count', () => {
  assertError(
    () => evaluateFormula('CONTAINS("hello")', testContext),
    /CONTAINS\(\) takes exactly 2 arguments/,
    'Should throw error when CONTAINS has wrong argument count'
  );
});

// Test 33: Error - SUBSTITUTE with too many arguments
test('Error - SUBSTITUTE with too many arguments', () => {
  assertError(
    () => evaluateFormula('SUBSTITUTE("hello", "world", "universe", "extra")', testContext),
    /SUBSTITUTE\(\) takes exactly 3 arguments/,
    'Should throw error when SUBSTITUTE has too many arguments'
  );
});

// Test 34: Error - SUBSTITUTE with non-string second argument
test('Error - SUBSTITUTE with non-string second argument', () => {
  assertError(
    () => evaluateFormula('SUBSTITUTE("hello", 123, "world")', testContext),
    /SUBSTITUTE\(\) old_text must be string, got number/,
    'Should throw error when SUBSTITUTE second argument is not string'
  );
});

// Test 35: Error - SUBSTITUTE with non-string third argument
test('Error - SUBSTITUTE with non-string third argument', () => {
  assertError(
    () => evaluateFormula('SUBSTITUTE("hello", "world", 123)', testContext),
    /SUBSTITUTE\(\) new_text must be string, got number/,
    'Should throw error when SUBSTITUTE third argument is not string'
  );
});

// Test 36: Error - SUBSTITUTE with mixed invalid types
test('Error - SUBSTITUTE with mixed invalid types', () => {
  assertError(
    () => evaluateFormula('SUBSTITUTE(revenue, "hello", TODAY())', testContext),
    /SUBSTITUTE\(\) text must be string, got number/,
    'Should throw error when SUBSTITUTE has multiple invalid argument types'
  );
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 