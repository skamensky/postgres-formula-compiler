/**
 * Shared test utilities for Formula Compiler tests
 * Contains test helper functions and test context
 */

// Import the formula compiler functions
import { evaluateFormula, generateSQL } from '../formula-compiler.js';

// Export the formula compiler functions for convenience
export { evaluateFormula, generateSQL };

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
  // Handle result from evaluateFormula which now returns compilation results
  let actualValue = actual;
  
  if (typeof actual === 'object' && actual.expression !== undefined) {
    // This is a compilation result - we need to generate SQL for single expressions
    try {
      // For single expression tests, generate SQL using a dummy field name
      const namedResults = { test_field: actual };
      const sqlResult = generateSQL(namedResults, 's');
      
      // Extract just the expression part from the SELECT clause
      const selectMatch = sqlResult.sql.match(/SELECT\s+(.+)\s+AS\s+test_field/s);
      if (selectMatch) {
        actualValue = selectMatch[1].trim();
      } else {
        actualValue = sqlResult.sql;
      }
    } catch (error) {
      // If SQL generation fails, fall back to showing the compilation result
      actualValue = `[Compilation Result: ${JSON.stringify(actual, null, 2)}]`;
    }
  }
  
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

export function assertArrayEqual(actual, expected, message = '') {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    throw new Error(`Both values must be arrays. ${message}`);
  }
  if (actual.length !== expected.length) {
    throw new Error(`Array lengths differ: expected ${expected.length}, got ${actual.length}. ${message}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`Array element ${i} differs: expected ${expected[i]}, got ${actual[i]}. ${message}`);
    }
  }
}

export function assertDeepEqual(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Deep comparison failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message}`);
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

// Extended test context with relationships - supporting both old and new format
export const relationshipContext = {
  tableName: 'submission',
  // New flat structure
  tableInfos: [
    {
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
      }
    },
    {
      tableName: 'merchant',
      columnList: {
        'business_name': 'string',
        'fee_rate': 'number'
      }
    },
    {
      tableName: 'funder',
      columnList: {
        'name': 'string',
        'rate': 'number'
      }
    }
  ],
  relationshipInfos: [
    {
      name: 'merchant',
      fromTable: 'submission',
      toTable: 'merchant',
      joinColumn: 'merchant_id'
    },
    {
      name: 'funder',
      fromTable: 'submission',
      toTable: 'funder',
      joinColumn: 'funder_id'
    }
  ],
  // Keep old structure for backward compatibility and inverse relationships
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