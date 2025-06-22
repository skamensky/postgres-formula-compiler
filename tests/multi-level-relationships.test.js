/**
 * Multi-Level Relationships Tests
 * Tests for extended nested relationship chains
 */

import { evaluateFormula, test, assertEqual, assertError, assertArrayEqual, assertDeepEqual, printTestResults } from './test-utils.js';

console.log('Running Multi-Level Relationships Tests...\n');

// Extended test context with multi-level relationships
const multiLevelContext = {
  tableName: 'submission',
  columnList: {
    'id': 'number',
    'amount': 'number',
    'status': 'string',
    'created_at': 'date',
    'merchant_id': 'number',
    'main_rep_id': 'number'
  },
  relationshipInfo: {
    'merchant': {
      tableName: 'merchant',
      joinColumn: 'merchant_id',
      columnList: {
        'id': 'number',
        'business_name': 'string',
        'main_rep_id': 'number',
        'address': 'string',
        'city': 'string'
      },
      relationshipInfo: {
        'main_rep': {
          tableName: 'rep',
          joinColumn: 'main_rep_id',
          columnList: {
            'id': 'number',
            'name': 'string',
            'email': 'string',
            'user_id': 'number',
            'manager_id': 'number'
          },
          relationshipInfo: {
            'user': {
              tableName: 'user',
              joinColumn: 'user_id',
              columnList: {
                'id': 'number',
                'username': 'string',
                'email': 'string',
                'status': 'string'
              }
            },
            'manager': {
              tableName: 'rep',
              joinColumn: 'manager_id',
              columnList: {
                'id': 'number',
                'name': 'string',
                'email': 'string'
              }
            }
          }
        }
      }
    },
    'main_rep': {
      tableName: 'rep',
      joinColumn: 'main_rep_id',
      columnList: {
        'id': 'number',
        'name': 'string',
        'email': 'string',
        'user_id': 'number'
      },
      relationshipInfo: {
        'user': {
          tableName: 'user',
          joinColumn: 'user_id',
          columnList: {
            'id': 'number',
            'username': 'string',
            'email': 'string',
            'status': 'string'
          }
        }
      }
    }
  }
};

// Test 1: Two-level relationship
test('Two-level relationship: merchant_rel.main_rep_rel.name', () => {
  const result = evaluateFormula('merchant_rel.main_rep_rel.name', multiLevelContext);
  assertEqual(result.expression.type, 'RELATIONSHIP_REF');
  assertArrayEqual(result.expression.value.relationshipChain, ['merchant', 'main_rep']);
  assertEqual(result.expression.value.fieldName, 'name');
  assertEqual(result.expression.dependentJoins.length, 2);
  assertEqual(result.joinIntents.length, 2);
});

// Test 2: Three-level relationship
test('Three-level relationship: merchant_rel.main_rep_rel.user_rel.username', () => {
  const result = evaluateFormula('merchant_rel.main_rep_rel.user_rel.username', multiLevelContext);
  assertEqual(result.expression.type, 'RELATIONSHIP_REF');
  assertArrayEqual(result.expression.value.relationshipChain, ['merchant', 'main_rep', 'user']);
  assertEqual(result.expression.value.fieldName, 'username');
  assertEqual(result.expression.dependentJoins.length, 3);
  assertEqual(result.joinIntents.length, 3);
});

// Test 3: Three-level relationship with manager chain
test('Three-level relationship: merchant_rel.main_rep_rel.manager_rel.name', () => {
  const result = evaluateFormula('merchant_rel.main_rep_rel.manager_rel.name', multiLevelContext);
  assertEqual(result.expression.type, 'RELATIONSHIP_REF');
  assertArrayEqual(result.expression.value.relationshipChain, ['merchant', 'main_rep', 'manager']);
  assertEqual(result.expression.value.fieldName, 'name');
  assertEqual(result.expression.dependentJoins.length, 3);
  assertEqual(result.joinIntents.length, 3);
});

// Test 4: Multi-level relationship in expression
test('Multi-level relationship in expression', () => {
  const result = evaluateFormula('merchant_rel.business_name & " - " & merchant_rel.main_rep_rel.name', multiLevelContext);
  assertEqual(result.expression.type, 'BINARY_OP');
  assertEqual(result.joinIntents.length, 2); // merchant + merchant.main_rep
});

// Test 5: Multi-level relationship with IF function
test('Multi-level relationship with IF function', () => {
  const result = evaluateFormula('IF(ISNULL(merchant_rel.main_rep_rel.user_rel.status), "No Status", merchant_rel.main_rep_rel.user_rel.status)', multiLevelContext);
  assertEqual(result.expression.type, 'FUNCTION_CALL');
  assertEqual(result.joinIntents.length, 3); // All three levels of the chain
});

// Test 6: Backward compatibility - single level relationship
test('Backward compatibility: single level merchant_rel.business_name', () => {
  const result = evaluateFormula('merchant_rel.business_name', multiLevelContext);
  assertEqual(result.expression.type, 'RELATIONSHIP_REF');
  assertArrayEqual(result.expression.value.relationshipChain, ['merchant']);
  assertEqual(result.expression.value.fieldName, 'business_name');
  assertEqual(result.expression.dependentJoins.length, 1);
  assertEqual(result.joinIntents.length, 1);
});

// Test 7: Different starting relationships
test('Different starting relationship: main_rep_rel.user_rel.email', () => {
  const result = evaluateFormula('main_rep_rel.user_rel.email', multiLevelContext);
  assertEqual(result.expression.type, 'RELATIONSHIP_REF');
  assertArrayEqual(result.expression.value.relationshipChain, ['main_rep', 'user']);
  assertEqual(result.expression.value.fieldName, 'email');
  assertEqual(result.expression.dependentJoins.length, 2);
  assertEqual(result.joinIntents.length, 2);
});

// Test 8: Error handling - unknown relationship in chain
test('Error: unknown relationship in chain', () => {
  assertError(
    () => evaluateFormula('merchant_rel.unknown_rel.field', multiLevelContext),
    /Unknown relationship: merchant\.unknown/,
    'Should throw error for unknown relationship in chain'
  );
});

// Test 9: Error handling - unknown field in final table
test('Error: unknown field in final table', () => {
  assertError(
    () => evaluateFormula('merchant_rel.main_rep_rel.unknown_field', multiLevelContext),
    /Unknown field UNKNOWN_FIELD in relationship chain merchant\.main_rep\.UNKNOWN_FIELD/,
    'Should throw error for unknown field in final table'
  );
});

// Test 10: Error handling - chain ending with relationship
test('Error: chain ending with relationship', () => {
  assertError(
    () => evaluateFormula('merchant_rel.main_rep_rel', multiLevelContext),
    /Relationship chain must end with a field name/,
    'Should throw error when chain ends with relationship'
  );
});

// Test 11: Error handling - depth limit exceeded
test('Error: depth limit exceeded', () => {
  // Create a context with 6 levels of relationships (exceeds limit of 5)
  const deepContext = {
    tableName: 'submission',
    columnList: { 'id': 'number' },
    relationshipInfo: {
      'a': {
        tableName: 'table1',
        joinColumn: 'id',
        columnList: { 'id': 'number' },
        relationshipInfo: {
          'b': {
            tableName: 'table2',
            joinColumn: 'id',
            columnList: { 'id': 'number' },
            relationshipInfo: {
              'c': {
                tableName: 'table3',
                joinColumn: 'id',
                columnList: { 'id': 'number' },
                relationshipInfo: {
                  'd': {
                    tableName: 'table4',
                    joinColumn: 'id',
                    columnList: { 'id': 'number' },
                    relationshipInfo: {
                      'e': {
                        tableName: 'table5',
                        joinColumn: 'id',
                        columnList: { 'id': 'number' },
                        relationshipInfo: {
                          'f': {
                            tableName: 'table6',
                            joinColumn: 'id',
                            columnList: { 'field': 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  assertError(
    () => evaluateFormula('a_rel.b_rel.c_rel.d_rel.e_rel.f_rel.field', deepContext),
    /Relationship chain too deep \(max 5 levels\)/,
    'Should throw error when depth limit is exceeded'
  );
});

// Test 12: Semantic ID generation for multi-level relationships
test('Semantic ID generation for multi-level relationships', () => {
  const result = evaluateFormula('merchant_rel.main_rep_rel.user_rel.username', multiLevelContext);
  
  // Check that semantic IDs are hierarchical and unique
  const semanticId = result.expression.semanticId;
  assertEqual(semanticId.includes('multi_relationship_ref'), true);
  assertEqual(semanticId.includes('merchant.main_rep.user.USERNAME'), true);
  
  // Check join semantic IDs are unique
  const joinSemanticIds = result.expression.dependentJoins;
  assertEqual(joinSemanticIds.length, 3);
  assertEqual(new Set(joinSemanticIds).size, 3); // All unique
});

// Test 13: Type validation through multi-level chain
test('Type validation through multi-level chain', () => {
  const result = evaluateFormula('merchant_rel.main_rep_rel.user_rel.username', multiLevelContext);
  assertEqual(result.expression.returnType, 'string');
  assertEqual(result.returnType, 'string');
});

// Test 14: Complex expression with multiple multi-level relationships
test('Complex expression with multiple multi-level relationships', () => {
  const result = evaluateFormula('merchant_rel.main_rep_rel.name & " (" & merchant_rel.main_rep_rel.user_rel.email & ")"', multiLevelContext);
  assertEqual(result.expression.type, 'BINARY_OP');
  // Should create joins for both relationship chains
  const uniqueJoins = new Set(result.joinIntents.map(j => j.semanticId));
  assertEqual(uniqueJoins.size >= 3, true); // At least merchant, main_rep, user joins
});

// Test 15: Comparison operations with multi-level relationships
test('Comparison operations with multi-level relationships', () => {
  const result = evaluateFormula('merchant_rel.main_rep_rel.user_rel.status = "active"', multiLevelContext);
  assertEqual(result.expression.type, 'BINARY_OP');
  assertEqual(result.expression.value.op, '=');
  assertEqual(result.expression.returnType, 'boolean');
  assertEqual(result.joinIntents.length, 3);
});

printTestResults();