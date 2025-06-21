/**
 * Shared test utilities for Formula Compiler tests
 * Contains test helper functions and test context
 */

// Import the formula compiler function
import { evaluateFormula } from '../formula-compiler.js';

// Export the formula compiler function for convenience
export { evaluateFormula };

// Test utilities
export let testCount = 0;
export let passedTests = 0;
export let failedTests = 0;

export function test(description, testFn) {
  testCount++;
  try {
    testFn();
    console.log(`✓ Test ${testCount}: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`✗ Test ${testCount}: ${description}`);
    console.error(`  Error: ${error.message}`);
    failedTests++;
  }
}

export function assertEqual(actual, expected, message = '') {
  // Handle result from evaluateFormula which returns {expression, joins}
  const actualValue = (typeof actual === 'object' && actual.expression !== undefined) ? actual.expression : actual;
  if (actualValue !== expected) {
    throw new Error(`Expected ${expected}, got ${actualValue}. ${message}`);
  }
}

export function assertError(fn, expectedMessagePattern, message = '') {
  try {
    fn();
    throw new Error(`Expected error but function succeeded. ${message}`);
  } catch (error) {
    if (!expectedMessagePattern.test(error.message)) {
      throw new Error(`Error message "${error.message}" doesn't match pattern ${expectedMessagePattern}. ${message}`);
    }
  }
}

// Test context - shared by all test files
export const testContext = {
  tableName: 'test_table',
  columnList: {
    'revenue': 'number',
    'cost': 'number', 
    'created_date': 'date',
    'updated_date': 'date',
    'Revenue': 'number', // Test case-insensitive column names
    'COST': 'number',
    'status': 'string',
    'active': 'boolean',
    'note': 'string',
    'amount': 'number',
    'priority': 'string',
    'closed': 'boolean',
    'syndication': 'boolean',
    'open_approval': 'boolean',
    'description': 'string',
    'name': 'string',
    'company_name': 'string'
  }
};

// Extended test context with relationships
export const relationshipContext = {
  tableName: 'submission',
  columnList: {
    'amount': 'number',
    'revenue': 'number',
    'cost': 'number',
    'created_date': 'date',
    'updated_date': 'date',
    'status': 'string',
    'closed': 'boolean',
    'syndication': 'boolean',
    'open_approval': 'boolean'
  },
  relationshipInfo: {
    'merchant': {
      tableName: 'merchant',
      joinColumn: 'merchant_id',
      columnList: {
        'business_name': 'string',
        'fee_rate': 'number'
      }
    },
    'funder': {
      tableName: 'funder',
      joinColumn: 'funder_id',
      columnList: {
        'name': 'string',
        'rate': 'number'
      }
    }
  },
  inverseRelationshipInfo: {
    'rep_links_submission': {
      tableName: 'rep_link',
      joinColumn: 'submission',
      columnList: {
        'commission_percentage': 'number',
        'rep': 'number'
      },
      relationshipInfo: {
        'rep': {
          tableName: 'rep',
          joinColumn: 'rep',
          columnList: {
            'name': 'string',
            'rate': 'number'
          }
        }
      }
    },
    'documents_submission': {
      tableName: 'document',
      joinColumn: 'submission',
      columnList: {
        'filename': 'string',
        'size': 'number',
        'created_date': 'date'
      }
    }
  }
};

// Test results summary
export function printTestResults() {
  console.log('\n' + '='.repeat(50));
  console.log(`Test Results: ${passedTests}/${testCount} passed`);
  if (failedTests > 0) {
    console.log(`❌ ${failedTests} tests failed`);
    return false;
  } else {
    console.log('✅ All tests passed!');
    return true;
  }
}

// Reset counters (useful for test runner)
export function resetCounters() {
  testCount = 0;
  passedTests = 0;
  failedTests = 0;
} 