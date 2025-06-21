/**
 * Boolean Literals Tests
 * Tests for TRUE and FALSE literals
 */

import { evaluateFormula, test, assertEqual, testContext, printTestResults } from './test-utils.js';

console.log('Running Boolean Literals Tests...\n');

// Test 119: TRUE literal
test('TRUE literal', () => {
  const result = evaluateFormula('TRUE', testContext);
  assertEqual(result, 'TRUE');
});

// Test 120: FALSE literal
test('FALSE literal', () => {
  const result = evaluateFormula('FALSE', testContext);
  assertEqual(result, 'FALSE');
});

// Test 124: NOT FALSE (function syntax)
test('NOT FALSE', () => {
  const result = evaluateFormula('NOT(FALSE)', testContext);
  assertEqual(result, 'NOT (FALSE)');
});

// Test 129: Case insensitive boolean literals with AND function
test('Case insensitive boolean literals', () => {
  const result = evaluateFormula('AND(TRUE, FALSE)', testContext);
  assertEqual(result, '(TRUE AND FALSE)');
});

// Test 130: Mixed case boolean literals with OR function
test('Mixed case boolean literals', () => {
  const result = evaluateFormula('OR(TRUE, FALSE)', testContext);
  assertEqual(result, '(TRUE OR FALSE)');
});

// Test 214: Boolean literals
test('Boolean literals TRUE and FALSE', () => {
  const result1 = evaluateFormula('TRUE', testContext);
  assertEqual(result1, 'TRUE');
  const result2 = evaluateFormula('FALSE', testContext);
  assertEqual(result2, 'FALSE');
});

// Print results and exit with appropriate code
const success = printTestResults();
if (!success) {
  process.exit(1);
} 