/**
 * Test Runner - Runs all Formula Compiler tests
 * Imports and executes all individual test files
 */

import { resetCounters, testCount, passedTests, failedTests } from './test-utils.js';

console.log('🧪 Formula Compiler Test Suite');
console.log('=' .repeat(50));

// List of all test files to run
const testFiles = [
  './basic-arithmetic-literals.test.js',
  './core-functions.test.js', 
  './date-arithmetic.test.js',
  './parentheses-precedence.test.js',
  './string-functions-concatenation.test.js',
  './comments.test.js',
  './multiplication-division.test.js',
  './null-handling.test.js',
  './if-function.test.js',
  './comparison-operators.test.js',
  './logical-operators-functions.test.js',
  './boolean-literals.test.js',
  './text-functions.test.js',
  './math-functions.test.js',
  './date-functions.test.js',
  './relationships.test.js',
  './multi-level-relationships.test.js',
  './aggregate-functions.test.js',
  './multi-level-aggregate-functions.test.js',
  './error-handling-basic.test.js'
  // TODO: Add remaining test files as they are created:
  // './column-references.test.js'
];

let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;
let failedFiles = [];

// Run each test file
for (const testFile of testFiles) {
  try {
    console.log(`\n📁 Running ${testFile.replace('./', '').replace('.test.js', '')} tests...`);
    
    // Reset counters before each test file
    resetCounters();
    
    // Import and run the test file
    await import(testFile);
    
    // Accumulate results
    totalTests += testCount;
    totalPassed += passedTests;
    totalFailed += failedTests;
    
    if (failedTests > 0) {
      failedFiles.push(testFile);
      console.log(`❌ ${passedTests}/${testCount} tests passed in ${testFile} (${failedTests} failed)`);
    } else {
      console.log(`✅ ${passedTests}/${testCount} tests passed in ${testFile}`);
    }
    
  } catch (error) {
    console.error(`❌ Error running ${testFile}:`, error.message);
    failedFiles.push(testFile);
    totalFailed++; // Count file failure as one failed test
    totalTests++; // Count the file as one test
  }
}

// Print overall results
console.log('\n' + '='.repeat(50));
console.log('🏁 FINAL TEST RESULTS');
console.log('='.repeat(50));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${totalPassed}`);
console.log(`Failed: ${totalFailed}`);

if (totalFailed === 0) {
  console.log('🎉 ALL TESTS PASSED! 🎉');
  process.exit(0);
} else {
  console.log(`❌ ${totalFailed} tests failed`);
  if (failedFiles.length > 0) {
    console.log('Failed test files:');
    failedFiles.forEach(file => console.log(`  - ${file}`));
  }
  process.exit(1);
} 