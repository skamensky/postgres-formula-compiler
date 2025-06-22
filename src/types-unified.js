/**
 * Unified Type System
 * Single source of truth for all type information using JavaScript Symbols
 * Replaces the fragmented string-based type systems
 */

// Literal value constants - centralized source for literal string values
export const LITERAL_VALUE = {
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  NULL: 'NULL'
};

// Core unified type system using Symbols for performance and type safety
export const TYPE = {
  // Literal/AST node types (what the parser creates)
  STRING_LITERAL: Symbol('STRING_LITERAL'),
  NUMBER_LITERAL: Symbol('NUMBER_LITERAL'), 
  BOOLEAN_LITERAL: Symbol('BOOLEAN_LITERAL'),
  DATE_LITERAL: Symbol('DATE_LITERAL'),
  NULL_LITERAL: Symbol('NULL_LITERAL'),
  
  // AST structural types (parser constructs)
  IDENTIFIER: Symbol('IDENTIFIER'),
  FUNCTION_CALL: Symbol('FUNCTION_CALL'),
  BINARY_OP: Symbol('BINARY_OP'),
  UNARY_OP: Symbol('UNARY_OP'),
  RELATIONSHIP_REF: Symbol('RELATIONSHIP_REF'),
  AGGREGATE_FUNCTION: Symbol('AGGREGATE_FUNCTION'),
  
  // Value types (what expressions evaluate to)
  STRING: Symbol('STRING'),
  NUMBER: Symbol('NUMBER'),
  BOOLEAN: Symbol('BOOLEAN'),
  DATE: Symbol('DATE'),
  NULL: Symbol('NULL'),
  
  // Special metadata types (for function definitions)
  EXPRESSION: Symbol('EXPRESSION'),
  INVERSE_RELATIONSHIP: Symbol('INVERSE_RELATIONSHIP')
};

// Type categories for easier classification and validation
export const TYPE_CATEGORY = {
  LITERAL: new Set([
    TYPE.STRING_LITERAL, 
    TYPE.NUMBER_LITERAL, 
    TYPE.BOOLEAN_LITERAL, 
    TYPE.DATE_LITERAL, 
    TYPE.NULL_LITERAL
  ]),
  
  AST_NODE: new Set([
    TYPE.IDENTIFIER, 
    TYPE.FUNCTION_CALL, 
    TYPE.BINARY_OP, 
    TYPE.UNARY_OP, 
    TYPE.RELATIONSHIP_REF,
    TYPE.AGGREGATE_FUNCTION
  ]),
  
  VALUE: new Set([
    TYPE.STRING, 
    TYPE.NUMBER, 
    TYPE.BOOLEAN, 
    TYPE.DATE, 
    TYPE.NULL
  ]),
  
  METADATA: new Set([
    TYPE.EXPRESSION, 
    TYPE.INVERSE_RELATIONSHIP
  ])
};

// Helper functions for type classification
export function isLiteralType(type) {
  return TYPE_CATEGORY.LITERAL.has(type);
}

export function isASTNodeType(type) {
  return TYPE_CATEGORY.AST_NODE.has(type);
}

export function isValueType(type) {
  return TYPE_CATEGORY.VALUE.has(type);
}

export function isMetadataType(type) {
  return TYPE_CATEGORY.METADATA.has(type);
}

// Mapping from literal types to their corresponding value types
const LITERAL_TO_VALUE_TYPE = {
  [TYPE.STRING_LITERAL]: TYPE.STRING,
  [TYPE.NUMBER_LITERAL]: TYPE.NUMBER,
  [TYPE.BOOLEAN_LITERAL]: TYPE.BOOLEAN,
  [TYPE.DATE_LITERAL]: TYPE.DATE,
  [TYPE.NULL_LITERAL]: TYPE.NULL
};

/**
 * Get the value type that corresponds to a literal type
 * @param {Symbol} literalType - The literal type
 * @returns {Symbol} The corresponding value type
 */
export function getValueTypeForLiteral(literalType) {
  const valueType = LITERAL_TO_VALUE_TYPE[literalType];
  if (!valueType) {
    throw new Error(`No value type mapping for literal type: ${literalType.toString()}`);
  }
  return valueType;
}

/**
 * Convert type symbol to human-readable string for error messages
 * @param {Symbol} type - The type symbol
 * @returns {string} Human-readable type name
 */
export function typeToString(type) {
  // Extract the description from the symbol
  const description = type.toString().match(/Symbol\(([^)]+)\)/)?.[1];
  if (!description) {
    return 'unknown';
  }
  
  // Convert to human-readable format
  return description.toLowerCase().replace(/_/g, ' ');
}

/**
 * Validate that a type is one of the expected types
 * @param {Symbol} type - The type to validate
 * @param {Symbol[]} expectedTypes - Array of valid types
 * @param {string} context - Context for error message
 * @throws {Error} If type is not in expectedTypes
 */
export function validateTypeCategory(type, expectedTypes, context = '') {
  if (!expectedTypes.includes(type)) {
    const expected = expectedTypes.map(t => typeToString(t)).join(' or ');
    const actual = typeToString(type);
    throw new Error(`${context ? context + ': ' : ''}Expected ${expected}, got ${actual}`);
  }
}

/**
 * Check if two types are compatible for operations
 * @param {Symbol} type1 - First type
 * @param {Symbol} type2 - Second type
 * @param {string} operation - The operation being performed
 * @returns {boolean} True if types are compatible
 */
export function areTypesCompatible(type1, type2, operation) {
  // Null is compatible with any type
  if (type1 === TYPE.NULL || type2 === TYPE.NULL) {
    return true;
  }
  
  // For most operations, types must match exactly
  if (operation === 'comparison' || operation === 'logical') {
    return type1 === type2;
  }
  
  // For arithmetic, allow some type coercion
  if (operation === 'arithmetic') {
    const numericTypes = new Set([TYPE.NUMBER, TYPE.DATE]);
    return numericTypes.has(type1) && numericTypes.has(type2);
  }
  
  // For string concatenation, both must be strings
  if (operation === 'concatenation') {
    return type1 === TYPE.STRING && type2 === TYPE.STRING;
  }
  
  return false;
}

// Export all types as individual named exports for convenience
export const {
  STRING_LITERAL,
  NUMBER_LITERAL,
  BOOLEAN_LITERAL,
  DATE_LITERAL,
  NULL_LITERAL,
  IDENTIFIER,
  FUNCTION_CALL,
  BINARY_OP,
  UNARY_OP,
  RELATIONSHIP_REF,
  AGGREGATE_FUNCTION,
  STRING,
  NUMBER,
  BOOLEAN,
  DATE,
  NULL,
  EXPRESSION,
  INVERSE_RELATIONSHIP
} = TYPE;