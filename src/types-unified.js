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

// Operation symbols for type checking
export const OPERATION = {
  // Arithmetic
  PLUS: Symbol('PLUS'),
  MINUS: Symbol('MINUS'),
  MULTIPLY: Symbol('MULTIPLY'),
  DIVIDE: Symbol('DIVIDE'),
  
  // String
  CONCATENATE: Symbol('CONCATENATE'),
  
  // Comparison
  EQUAL: Symbol('EQUAL'),
  NOT_EQUAL: Symbol('NOT_EQUAL'),
  GREATER_THAN: Symbol('GREATER_THAN'),
  GREATER_THAN_EQUAL: Symbol('GREATER_THAN_EQUAL'),
  LESS_THAN: Symbol('LESS_THAN'),
  LESS_THAN_EQUAL: Symbol('LESS_THAN_EQUAL')
};

// Operation rules - defines valid type combinations and result types
export const OPERATION_RULES = [
  // Arithmetic operations
  { left: TYPE.NUMBER, op: OPERATION.PLUS, right: TYPE.NUMBER, result: TYPE.NUMBER, description: '`number + number` → `number`' },
  { left: TYPE.DATE, op: OPERATION.PLUS, right: TYPE.NUMBER, result: TYPE.DATE, description: '`date + number` → `date` (adds days)' },
  // Note: number + date is handled as a special case in the compiler (only for literals/identifiers)
  
  { left: TYPE.NUMBER, op: OPERATION.MINUS, right: TYPE.NUMBER, result: TYPE.NUMBER, description: '`number - number` → `number`' },
  { left: TYPE.DATE, op: OPERATION.MINUS, right: TYPE.NUMBER, result: TYPE.DATE, description: '`date - number` → `date` (subtracts days)' },
  { left: TYPE.DATE, op: OPERATION.MINUS, right: TYPE.DATE, result: TYPE.NUMBER, description: '`date - date` → `number` (difference in days)' },
  
  { left: TYPE.NUMBER, op: OPERATION.MULTIPLY, right: TYPE.NUMBER, result: TYPE.NUMBER, description: '`number * number` → `number`' },
  { left: TYPE.NUMBER, op: OPERATION.DIVIDE, right: TYPE.NUMBER, result: TYPE.NUMBER, description: '`number / number` → `number`' },
  
  // String operations
  { left: TYPE.STRING, op: OPERATION.CONCATENATE, right: TYPE.STRING, result: TYPE.STRING, description: '`string & string` → `string` (concatenation)' },
  
  // Comparison operations (same types)
  { left: TYPE.STRING, op: OPERATION.EQUAL, right: TYPE.STRING, result: TYPE.BOOLEAN, description: '`string = string` → `boolean`' },
  { left: TYPE.NUMBER, op: OPERATION.EQUAL, right: TYPE.NUMBER, result: TYPE.BOOLEAN, description: '`number = number` → `boolean`' },
  { left: TYPE.BOOLEAN, op: OPERATION.EQUAL, right: TYPE.BOOLEAN, result: TYPE.BOOLEAN, description: '`boolean = boolean` → `boolean`' },
  { left: TYPE.DATE, op: OPERATION.EQUAL, right: TYPE.DATE, result: TYPE.BOOLEAN, description: '`date = date` → `boolean`' },
  { left: TYPE.NULL, op: OPERATION.EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`null = null` → `boolean`' },
  
  // NULL comparisons with other types (NULL can be compared with any type)
  { left: TYPE.NULL, op: OPERATION.EQUAL, right: TYPE.STRING, result: TYPE.BOOLEAN, description: '`null = string` → `boolean`' },
  { left: TYPE.NULL, op: OPERATION.EQUAL, right: TYPE.NUMBER, result: TYPE.BOOLEAN, description: '`null = number` → `boolean`' },
  { left: TYPE.NULL, op: OPERATION.EQUAL, right: TYPE.BOOLEAN, result: TYPE.BOOLEAN, description: '`null = boolean` → `boolean`' },
  { left: TYPE.NULL, op: OPERATION.EQUAL, right: TYPE.DATE, result: TYPE.BOOLEAN, description: '`null = date` → `boolean`' },
  { left: TYPE.STRING, op: OPERATION.EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`string = null` → `boolean`' },
  { left: TYPE.NUMBER, op: OPERATION.EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`number = null` → `boolean`' },
  { left: TYPE.BOOLEAN, op: OPERATION.EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`boolean = null` → `boolean`' },
  { left: TYPE.DATE, op: OPERATION.EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`date = null` → `boolean`' },
  
  // Not equal
  { left: TYPE.STRING, op: OPERATION.NOT_EQUAL, right: TYPE.STRING, result: TYPE.BOOLEAN, description: '`string != string` → `boolean`' },
  { left: TYPE.NUMBER, op: OPERATION.NOT_EQUAL, right: TYPE.NUMBER, result: TYPE.BOOLEAN, description: '`number != number` → `boolean`' },
  { left: TYPE.BOOLEAN, op: OPERATION.NOT_EQUAL, right: TYPE.BOOLEAN, result: TYPE.BOOLEAN, description: '`boolean != boolean` → `boolean`' },
  { left: TYPE.DATE, op: OPERATION.NOT_EQUAL, right: TYPE.DATE, result: TYPE.BOOLEAN, description: '`date != date` → `boolean`' },
  { left: TYPE.NULL, op: OPERATION.NOT_EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`null != null` → `boolean`' },
  
  // NULL not equal comparisons with other types
  { left: TYPE.NULL, op: OPERATION.NOT_EQUAL, right: TYPE.STRING, result: TYPE.BOOLEAN, description: '`null != string` → `boolean`' },
  { left: TYPE.NULL, op: OPERATION.NOT_EQUAL, right: TYPE.NUMBER, result: TYPE.BOOLEAN, description: '`null != number` → `boolean`' },
  { left: TYPE.NULL, op: OPERATION.NOT_EQUAL, right: TYPE.BOOLEAN, result: TYPE.BOOLEAN, description: '`null != boolean` → `boolean`' },
  { left: TYPE.NULL, op: OPERATION.NOT_EQUAL, right: TYPE.DATE, result: TYPE.BOOLEAN, description: '`null != date` → `boolean`' },
  { left: TYPE.STRING, op: OPERATION.NOT_EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`string != null` → `boolean`' },
  { left: TYPE.NUMBER, op: OPERATION.NOT_EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`number != null` → `boolean`' },
  { left: TYPE.BOOLEAN, op: OPERATION.NOT_EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`boolean != null` → `boolean`' },
  { left: TYPE.DATE, op: OPERATION.NOT_EQUAL, right: TYPE.NULL, result: TYPE.BOOLEAN, description: '`date != null` → `boolean`' },
  
  // Relational comparisons (numbers, dates, strings)
  { left: TYPE.NUMBER, op: OPERATION.GREATER_THAN, right: TYPE.NUMBER, result: TYPE.BOOLEAN, description: '`number > number` → `boolean`' },
  { left: TYPE.DATE, op: OPERATION.GREATER_THAN, right: TYPE.DATE, result: TYPE.BOOLEAN, description: '`date > date` → `boolean`' },
  { left: TYPE.STRING, op: OPERATION.GREATER_THAN, right: TYPE.STRING, result: TYPE.BOOLEAN, description: '`string > string` → `boolean` (lexicographic)' },
  
  { left: TYPE.NUMBER, op: OPERATION.GREATER_THAN_EQUAL, right: TYPE.NUMBER, result: TYPE.BOOLEAN, description: '`number >= number` → `boolean`' },
  { left: TYPE.DATE, op: OPERATION.GREATER_THAN_EQUAL, right: TYPE.DATE, result: TYPE.BOOLEAN, description: '`date >= date` → `boolean`' },
  { left: TYPE.STRING, op: OPERATION.GREATER_THAN_EQUAL, right: TYPE.STRING, result: TYPE.BOOLEAN, description: '`string >= string` → `boolean` (lexicographic)' },
  
  { left: TYPE.NUMBER, op: OPERATION.LESS_THAN, right: TYPE.NUMBER, result: TYPE.BOOLEAN, description: '`number < number` → `boolean`' },
  { left: TYPE.DATE, op: OPERATION.LESS_THAN, right: TYPE.DATE, result: TYPE.BOOLEAN, description: '`date < date` → `boolean`' },
  { left: TYPE.STRING, op: OPERATION.LESS_THAN, right: TYPE.STRING, result: TYPE.BOOLEAN, description: '`string < string` → `boolean` (lexicographic)' },
  
  { left: TYPE.NUMBER, op: OPERATION.LESS_THAN_EQUAL, right: TYPE.NUMBER, result: TYPE.BOOLEAN, description: '`number <= number` → `boolean`' },
  { left: TYPE.DATE, op: OPERATION.LESS_THAN_EQUAL, right: TYPE.DATE, result: TYPE.BOOLEAN, description: '`date <= date` → `boolean`' },
  { left: TYPE.STRING, op: OPERATION.LESS_THAN_EQUAL, right: TYPE.STRING, result: TYPE.BOOLEAN, description: '`string <= string` → `boolean` (lexicographic)' }
];

/**
 * Check if an operation is valid for given types
 * @param {Symbol} leftType - Left operand type
 * @param {Symbol} operation - Operation symbol
 * @param {Symbol} rightType - Right operand type
 * @returns {Object|null} Operation rule if valid, null if invalid
 */
export function getOperationRule(leftType, operation, rightType) {
  return OPERATION_RULES.find(rule => 
    rule.left === leftType && 
    rule.op === operation && 
    rule.right === rightType
  ) || null;
}

/**
 * Get all operations supported by a type
 * @param {Symbol} type - The type to check
 * @returns {Array} Array of operation descriptions
 */
export function getOperationsForType(type) {
  const operations = [];
  
  // Get operations where this type is the left operand
  const leftOps = OPERATION_RULES
    .filter(rule => rule.left === type)
    .map(rule => rule.description);
  
  // Get operations where this type is the right operand (avoid duplicates)
  const rightOps = OPERATION_RULES
    .filter(rule => rule.right === type && rule.left !== type)
    .map(rule => rule.description);
  
  return [...new Set([...leftOps, ...rightOps])];
}

/**
 * Get the result type of an operation
 * @param {Symbol} leftType - Left operand type
 * @param {Symbol} operation - Operation symbol
 * @param {Symbol} rightType - Right operand type
 * @returns {Symbol|null} Result type if valid, null if invalid
 */
export function getOperationResultType(leftType, operation, rightType) {
  const rule = getOperationRule(leftType, operation, rightType);
  return rule ? rule.result : null;
}

// Comprehensive type metadata for documentation generation  
export const TYPE_METADATA = {
  [TYPE.STRING]: {
    name: 'string',
    category: 'basic',
    description: 'Text data type for representing textual information.',
    getOperations: () => [
      'String functions: `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, etc.',
      ...getOperationsForType(TYPE.STRING),
      'Implicit string conversion: numbers and booleans convert to strings in string contexts'
    ],
    literals: 'String literals are enclosed in double quotes: `"text content"`',
    compatibility: () => getOperationsForType(TYPE.STRING)
  },
  
  [TYPE.NUMBER]: {
    name: 'number',
    category: 'basic',
    description: 'Numeric data type for representing integers and decimal numbers.',
    getOperations: () => [
      'Math functions: `ROUND()`, `ABS()`, `CEILING()`, `FLOOR()`, etc.',
      ...getOperationsForType(TYPE.NUMBER)
    ],
    literals: 'Numeric literals can be integers or decimals: `123`, `45.67`',
    compatibility: () => getOperationsForType(TYPE.NUMBER)
  },
  
  [TYPE.BOOLEAN]: {
    name: 'boolean',
    category: 'basic',
    description: 'Logical data type representing true or false values.',
    getOperations: () => [
      'Logical functions: `AND()`, `OR()`, `NOT()`',
      'Conditional functions: `IF()` conditions',
      ...getOperationsForType(TYPE.BOOLEAN)
    ],
    literals: 'Boolean literals are the keywords `TRUE` and `FALSE`',
    compatibility: () => getOperationsForType(TYPE.BOOLEAN)
  },
  
  [TYPE.DATE]: {
    name: 'date',
    category: 'basic',
    description: 'Date data type for representing calendar dates and timestamps.',
    getOperations: () => [
      'Date functions: `YEAR()`, `MONTH()`, `DAY()`, `WEEKDAY()`, `DATEDIF()`, etc.',
      ...getOperationsForType(TYPE.DATE)
    ],
    literals: 'Date literals are created using the `DATE()` function: `DATE("2023-12-25")`',
    compatibility: () => getOperationsForType(TYPE.DATE)
  },
  
  [TYPE.NULL]: {
    name: 'null',
    category: 'basic',
    description: 'Special type representing the absence of a value.',
    getOperations: () => [
      'Null checking: `ISNULL()`, `ISBLANK()`',
      'Null handling: `NULLVALUE()`, `COALESCE()`',
      'Any operation with null typically results in null',
      ...getOperationsForType(TYPE.NULL)
    ],
    literals: 'The null literal is the keyword `NULL`',
    compatibility: () => [
      '`null` is equal only to `null`',
      'Cross-type comparisons may use implicit conversion', 
      'Null values propagate through most operations'
    ]
  },
  
  [TYPE.EXPRESSION]: {
    name: 'expression',
    category: 'special',
    description: 'A meta-type representing any valid formula expression that can be evaluated.',
    usage: [
      'Used in function parameters that accept any type of expression, such as:',
      '- Conditional expressions in `IF(condition, trueValue, falseValue)`',
      '- Value expressions in aggregate functions',
      '- Type conversion functions like `STRING(expression)`'
    ],
    note: 'This type indicates that the parameter accepts any valid expression, and the actual return type depends on what the expression evaluates to.',
    getOperations: () => [],
    literals: 'N/A - this is a meta-type for function signatures',
    compatibility: () => ['Accepts any valid expression type']
  },
  
  [TYPE.INVERSE_RELATIONSHIP]: {
    name: 'inverse_relationship',
    category: 'special',
    description: 'A special type representing a relationship traversal for aggregate functions.',
    usage: [
      'Used as the first parameter in aggregate functions to specify which related records to aggregate over.',
      '**Syntax:** `table_relationship` or `table_relationship.field` for multi-level relationships'
    ],
    getOperations: () => [],
    literals: 'N/A - this refers to relationship definitions in your data model',
    compatibility: () => ['Only used in aggregate function contexts']
  }
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