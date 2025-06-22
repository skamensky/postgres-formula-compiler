/**
 * Function Metadata - Single Source of Truth
 * All function definitions, argument specifications, and documentation metadata
 */

// Type constants
export const TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  NULL: 'null',
  EXPRESSION: 'expression',
  INVERSE_RELATIONSHIP: 'inverse_relationship',
  STRING_LITERAL: 'string_literal'
};

// AST Node Type constants (to eliminate magic strings in validation)
export const AST_TYPES = {
  STRING_LITERAL: 'STRING_LITERAL',
  IDENTIFIER: 'IDENTIFIER',
  FUNCTION_CALL: 'FUNCTION_CALL',
  BINARY_OP: 'BINARY_OP',
  // etc.
};

// Return Type constants (these happen to match TYPES but make intent clearer)
export const RETURN_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  NULL: 'null'
};

// Function name constants to eliminate magic strings
export const FUNCTIONS = {
  // Core functions
  TODAY: 'TODAY',
  ME: 'ME',
  DATE: 'DATE',
  STRING: 'STRING',
  IF: 'IF',
  
  // NULL handling functions
  ISNULL: 'ISNULL',
  NULLVALUE: 'NULLVALUE',
  ISBLANK: 'ISBLANK',
  
  // Logical functions
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  
  // Math functions
  ABS: 'ABS',
  ROUND: 'ROUND',
  MIN: 'MIN',
  MAX: 'MAX',
  MOD: 'MOD',
  CEILING: 'CEILING',
  FLOOR: 'FLOOR',
  
  // String functions
  UPPER: 'UPPER',
  LOWER: 'LOWER',
  TRIM: 'TRIM',
  LEN: 'LEN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  MID: 'MID',
  CONTAINS: 'CONTAINS',
  SUBSTITUTE: 'SUBSTITUTE',
  
  // Date functions
  YEAR: 'YEAR',
  MONTH: 'MONTH',
  DAY: 'DAY',
  WEEKDAY: 'WEEKDAY',
  ADDMONTHS: 'ADDMONTHS',
  ADDDAYS: 'ADDDAYS',
  DATEDIF: 'DATEDIF',
  
  // Aggregate functions
  STRING_AGG: 'STRING_AGG',
  STRING_AGG_DISTINCT: 'STRING_AGG_DISTINCT',
  SUM_AGG: 'SUM_AGG',
  COUNT_AGG: 'COUNT_AGG',
  AVG_AGG: 'AVG_AGG',
  MIN_AGG: 'MIN_AGG',
  MAX_AGG: 'MAX_AGG',
  AND_AGG: 'AND_AGG',
  OR_AGG: 'OR_AGG'
};

// Function categories for documentation
export const CATEGORIES = {
  CORE: 'core',
  NULL_HANDLING: 'null-handling',
  LOGICAL: 'logical',
  MATH: 'math',
  STRING: 'string',
  DATE: 'date',
  AGGREGATE: 'aggregate'
};

// Function metadata definitions
export const FUNCTION_METADATA = {
  // Core Functions
  [FUNCTIONS.TODAY]: {
    name: FUNCTIONS.TODAY,
    category: CATEGORIES.CORE,
    description: 'Returns the current date',
    arguments: [],
    returnType: TYPES.DATE,
    testRefs: ['tests/core-functions.test.js:15'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.ME]: {
    name: FUNCTIONS.ME,
    category: CATEGORIES.CORE,
    description: 'Returns the current user identifier',
    arguments: [],
    returnType: TYPES.STRING,
    testRefs: ['tests/core-functions.test.js:23'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.DATE]: {
    name: FUNCTIONS.DATE,
    category: CATEGORIES.CORE,
    description: 'Converts a string literal to a date',
    arguments: [
      { name: 'dateString', type: TYPES.STRING_LITERAL, description: 'String representation of date' }
    ],
    returnType: TYPES.DATE,
    testRefs: ['tests/core-functions.test.js:31'],
    requiresSpecialHandling: true
  },
  
  [FUNCTIONS.STRING]: {
    name: FUNCTIONS.STRING,
    category: CATEGORIES.CORE,
    description: 'Converts any value to string representation',
    arguments: [
      { name: 'value', type: TYPES.EXPRESSION, description: 'Value to convert to string' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/string-functions-concatenation.test.js:15'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.IF]: {
    name: FUNCTIONS.IF,
    category: CATEGORIES.CORE,
    description: 'Conditional expression with optional else clause',
    arguments: [
      { name: 'condition', type: TYPES.BOOLEAN, description: 'Boolean condition to evaluate' },
      { name: 'trueValue', type: TYPES.EXPRESSION, description: 'Value when condition is true' },
      { name: 'falseValue', type: TYPES.EXPRESSION, description: 'Value when condition is false', optional: true }
    ],
    returnType: TYPES.EXPRESSION, // Matches type of true/false values
    testRefs: ['tests/if-function.test.js:15'],
    requiresSpecialHandling: true,
    minArgs: 2,
    maxArgs: 3
  },
  
  // NULL Handling Functions
  [FUNCTIONS.ISNULL]: {
    name: FUNCTIONS.ISNULL,
    category: CATEGORIES.NULL_HANDLING,
    description: 'Returns true if the value is NULL',
    arguments: [
      { name: 'value', type: TYPES.EXPRESSION, description: 'Value to check for NULL' }
    ],
    returnType: TYPES.BOOLEAN,
    testRefs: ['tests/null-handling.test.js:15'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.NULLVALUE]: {
    name: FUNCTIONS.NULLVALUE,
    category: CATEGORIES.NULL_HANDLING,
    description: 'Returns default value if first value is NULL',
    arguments: [
      { name: 'value', type: TYPES.EXPRESSION, description: 'Value to check for NULL' },
      { name: 'defaultValue', type: TYPES.EXPRESSION, description: 'Default value if first is NULL' }
    ],
    returnType: TYPES.EXPRESSION,
    testRefs: ['tests/null-handling.test.js:33'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.ISBLANK]: {
    name: FUNCTIONS.ISBLANK,
    category: CATEGORIES.NULL_HANDLING,
    description: 'Returns true if the value is NULL or empty string',
    arguments: [
      { name: 'value', type: TYPES.EXPRESSION, description: 'Value to check for blank' }
    ],
    returnType: TYPES.BOOLEAN,
    testRefs: ['tests/null-handling.test.js:55'],
    requiresSpecialHandling: false
  },
  
  // Logical Functions
  [FUNCTIONS.AND]: {
    name: FUNCTIONS.AND,
    category: CATEGORIES.LOGICAL,
    description: 'Returns true if all conditions are true',
    arguments: [
      { name: 'condition', type: TYPES.BOOLEAN, description: 'Boolean condition', variadic: true }
    ],
    returnType: TYPES.BOOLEAN,
    testRefs: ['tests/logical-operators-functions.test.js:15'],
    requiresSpecialHandling: true,
    minArgs: 2,
    maxArgs: null // unlimited
  },
  
  [FUNCTIONS.OR]: {
    name: FUNCTIONS.OR,
    category: CATEGORIES.LOGICAL,
    description: 'Returns true if any condition is true',
    arguments: [
      { name: 'condition', type: TYPES.BOOLEAN, description: 'Boolean condition', variadic: true }
    ],
    returnType: TYPES.BOOLEAN,
    testRefs: ['tests/logical-operators-functions.test.js:45'],
    requiresSpecialHandling: true,
    minArgs: 2,
    maxArgs: null // unlimited
  },
  
  [FUNCTIONS.NOT]: {
    name: FUNCTIONS.NOT,
    category: CATEGORIES.LOGICAL,
    description: 'Returns the logical negation of the condition',
    arguments: [
      { name: 'condition', type: TYPES.BOOLEAN, description: 'Boolean condition to negate' }
    ],
    returnType: TYPES.BOOLEAN,
    testRefs: ['tests/logical-operators-functions.test.js:73'],
    requiresSpecialHandling: false
  },
  
  // Math Functions
  [FUNCTIONS.ABS]: {
    name: FUNCTIONS.ABS,
    category: CATEGORIES.MATH,
    description: 'Returns the absolute value of a number',
    arguments: [
      { name: 'number', type: TYPES.NUMBER, description: 'Number to get absolute value of' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/math-functions.test.js:35'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.ROUND]: {
    name: FUNCTIONS.ROUND,
    category: CATEGORIES.MATH,
    description: 'Rounds a number to specified decimal places',
    arguments: [
      { name: 'number', type: TYPES.NUMBER, description: 'Number to round' },
      { name: 'decimals', type: TYPES.NUMBER, description: 'Number of decimal places' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/math-functions.test.js:15'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.MIN]: {
    name: FUNCTIONS.MIN,
    category: CATEGORIES.MATH,
    description: 'Returns the smaller of two numbers',
    arguments: [
      { name: 'num1', type: TYPES.NUMBER, description: 'First number' },
      { name: 'num2', type: TYPES.NUMBER, description: 'Second number' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/math-functions.test.js:60'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.MAX]: {
    name: FUNCTIONS.MAX,
    category: CATEGORIES.MATH,
    description: 'Returns the larger of two numbers',
    arguments: [
      { name: 'num1', type: TYPES.NUMBER, description: 'First number' },
      { name: 'num2', type: TYPES.NUMBER, description: 'Second number' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/math-functions.test.js:85'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.MOD]: {
    name: FUNCTIONS.MOD,
    category: CATEGORIES.MATH,
    description: 'Returns the remainder after division',
    arguments: [
      { name: 'dividend', type: TYPES.NUMBER, description: 'Number to divide' },
      { name: 'divisor', type: TYPES.NUMBER, description: 'Number to divide by' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/math-functions.test.js:110'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.CEILING]: {
    name: FUNCTIONS.CEILING,
    category: CATEGORIES.MATH,
    description: 'Rounds a number up to the nearest integer',
    arguments: [
      { name: 'number', type: TYPES.NUMBER, description: 'Number to round up' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/math-functions.test.js:135'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.FLOOR]: {
    name: FUNCTIONS.FLOOR,
    category: CATEGORIES.MATH,
    description: 'Rounds a number down to the nearest integer',
    arguments: [
      { name: 'number', type: TYPES.NUMBER, description: 'Number to round down' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/math-functions.test.js:155'],
    requiresSpecialHandling: false
  },
  
  // String Functions
  [FUNCTIONS.UPPER]: {
    name: FUNCTIONS.UPPER,
    category: CATEGORIES.STRING,
    description: 'Converts text to uppercase',
    arguments: [
      { name: 'text', type: TYPES.STRING, description: 'Text to convert to uppercase' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/text-functions.test.js:15'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.LOWER]: {
    name: FUNCTIONS.LOWER,
    category: CATEGORIES.STRING,
    description: 'Converts text to lowercase',
    arguments: [
      { name: 'text', type: TYPES.STRING, description: 'Text to convert to lowercase' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/text-functions.test.js:16'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.TRIM]: {
    name: FUNCTIONS.TRIM,
    category: CATEGORIES.STRING,
    description: 'Removes leading and trailing whitespace',
    arguments: [
      { name: 'text', type: TYPES.STRING, description: 'Text to trim whitespace from' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/text-functions.test.js:17'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.LEN]: {
    name: FUNCTIONS.LEN,
    category: CATEGORIES.STRING,
    description: 'Returns the length of text',
    arguments: [
      { name: 'text', type: TYPES.STRING, description: 'Text to measure length of' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/text-functions.test.js:20'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.LEFT]: {
    name: FUNCTIONS.LEFT,
    category: CATEGORIES.STRING,
    description: 'Returns the leftmost characters from text',
    arguments: [
      { name: 'text', type: TYPES.STRING, description: 'Text to extract from' },
      { name: 'count', type: TYPES.NUMBER, description: 'Number of characters to extract' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/text-functions.test.js:40'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.RIGHT]: {
    name: FUNCTIONS.RIGHT,
    category: CATEGORIES.STRING,
    description: 'Returns the rightmost characters from text',
    arguments: [
      { name: 'text', type: TYPES.STRING, description: 'Text to extract from' },
      { name: 'count', type: TYPES.NUMBER, description: 'Number of characters to extract' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/text-functions.test.js:65'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.MID]: {
    name: FUNCTIONS.MID,
    category: CATEGORIES.STRING,
    description: 'Returns characters from the middle of text',
    arguments: [
      { name: 'text', type: TYPES.STRING, description: 'Text to extract from' },
      { name: 'start', type: TYPES.NUMBER, description: 'Starting position (1-based)' },
      { name: 'length', type: TYPES.NUMBER, description: 'Number of characters to extract' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/text-functions.test.js:90'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.CONTAINS]: {
    name: FUNCTIONS.CONTAINS,
    category: CATEGORIES.STRING,
    description: 'Returns true if text contains the search string',
    arguments: [
      { name: 'text', type: TYPES.STRING, description: 'Text to search in' },
      { name: 'searchText', type: TYPES.STRING, description: 'Text to search for' }
    ],
    returnType: TYPES.BOOLEAN,
    testRefs: ['tests/text-functions.test.js:119'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.SUBSTITUTE]: {
    name: FUNCTIONS.SUBSTITUTE,
    category: CATEGORIES.STRING,
    description: 'Replaces old text with new text in a string',
    arguments: [
      { name: 'text', type: TYPES.STRING, description: 'Text to perform substitution in' },
      { name: 'oldText', type: TYPES.STRING, description: 'Text to replace' },
      { name: 'newText', type: TYPES.STRING, description: 'Replacement text' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/text-functions.test.js:144'],
    requiresSpecialHandling: false
  },
  
  // Date Functions
  [FUNCTIONS.YEAR]: {
    name: FUNCTIONS.YEAR,
    category: CATEGORIES.DATE,
    description: 'Extracts the year from a date',
    arguments: [
      { name: 'date', type: TYPES.DATE, description: 'Date to extract year from' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/date-functions.test.js:15'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.MONTH]: {
    name: FUNCTIONS.MONTH,
    category: CATEGORIES.DATE,
    description: 'Extracts the month from a date',
    arguments: [
      { name: 'date', type: TYPES.DATE, description: 'Date to extract month from' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/date-functions.test.js:35'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.DAY]: {
    name: FUNCTIONS.DAY,
    category: CATEGORIES.DATE,
    description: 'Extracts the day from a date',
    arguments: [
      { name: 'date', type: TYPES.DATE, description: 'Date to extract day from' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/date-functions.test.js:55'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.WEEKDAY]: {
    name: FUNCTIONS.WEEKDAY,
    category: CATEGORIES.DATE,
    description: 'Returns the day of the week as a number (1=Sunday)',
    arguments: [
      { name: 'date', type: TYPES.DATE, description: 'Date to get weekday from' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/date-functions.test.js:75'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.ADDMONTHS]: {
    name: FUNCTIONS.ADDMONTHS,
    category: CATEGORIES.DATE,
    description: 'Adds months to a date',
    arguments: [
      { name: 'date', type: TYPES.DATE, description: 'Starting date' },
      { name: 'months', type: TYPES.NUMBER, description: 'Number of months to add' }
    ],
    returnType: TYPES.DATE,
    testRefs: ['tests/date-functions.test.js:95'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.ADDDAYS]: {
    name: FUNCTIONS.ADDDAYS,
    category: CATEGORIES.DATE,
    description: 'Adds days to a date',
    arguments: [
      { name: 'date', type: TYPES.DATE, description: 'Starting date' },
      { name: 'days', type: TYPES.NUMBER, description: 'Number of days to add' }
    ],
    returnType: TYPES.DATE,
    testRefs: ['tests/date-functions.test.js:120'],
    requiresSpecialHandling: false
  },
  
  [FUNCTIONS.DATEDIF]: {
    name: FUNCTIONS.DATEDIF,
    category: CATEGORIES.DATE,
    description: 'Returns the difference between two dates in specified units',
    arguments: [
      { name: 'startDate', type: TYPES.DATE, description: 'Starting date' },
      { name: 'endDate', type: TYPES.DATE, description: 'Ending date' },
      { name: 'unit', type: TYPES.STRING_LITERAL, description: 'Unit: "days", "months", or "years"' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/date-functions.test.js:145'],
    requiresSpecialHandling: true
  },
  
  // Aggregate Functions
  [FUNCTIONS.STRING_AGG]: {
    name: FUNCTIONS.STRING_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Concatenates values from related records with delimiter',
    arguments: [
      { name: 'relationship', type: TYPES.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'expression', type: TYPES.EXPRESSION, description: 'Expression to evaluate for each record' },
      { name: 'delimiter', type: TYPES.STRING, description: 'String delimiter to separate values' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/aggregate-functions.test.js:15'],
    requiresSpecialHandling: true
  },
  
  [FUNCTIONS.STRING_AGG_DISTINCT]: {
    name: FUNCTIONS.STRING_AGG_DISTINCT,
    category: CATEGORIES.AGGREGATE,
    description: 'Concatenates distinct values from related records with delimiter',
    arguments: [
      { name: 'relationship', type: TYPES.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'expression', type: TYPES.EXPRESSION, description: 'Expression to evaluate for each record' },
      { name: 'delimiter', type: TYPES.STRING, description: 'String delimiter to separate values' }
    ],
    returnType: TYPES.STRING,
    testRefs: ['tests/aggregate-functions.test.js:33'],
    requiresSpecialHandling: true
  },
  
  [FUNCTIONS.SUM_AGG]: {
    name: FUNCTIONS.SUM_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Sums numeric values from related records',
    arguments: [
      { name: 'relationship', type: TYPES.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'expression', type: TYPES.EXPRESSION, description: 'Numeric expression to sum' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/aggregate-functions.test.js:45'],
    requiresSpecialHandling: true
  },
  
  [FUNCTIONS.COUNT_AGG]: {
    name: FUNCTIONS.COUNT_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Counts related records',
    arguments: [
      { name: 'relationship', type: TYPES.INVERSE_RELATIONSHIP, description: 'Inverse relationship to count' },
      { name: 'expression', type: TYPES.EXPRESSION, description: 'Expression to evaluate (value ignored)' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/aggregate-functions.test.js:55'],
    requiresSpecialHandling: true
  },
  
  [FUNCTIONS.AVG_AGG]: {
    name: FUNCTIONS.AVG_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Averages numeric values from related records',
    arguments: [
      { name: 'relationship', type: TYPES.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'expression', type: TYPES.EXPRESSION, description: 'Numeric expression to average' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/aggregate-functions.test.js:65'],
    requiresSpecialHandling: true
  },
  
  [FUNCTIONS.MIN_AGG]: {
    name: FUNCTIONS.MIN_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Finds minimum value from related records',
    arguments: [
      { name: 'relationship', type: TYPES.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'expression', type: TYPES.EXPRESSION, description: 'Expression to find minimum of' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/aggregate-functions.test.js:75'],
    requiresSpecialHandling: true
  },
  
  [FUNCTIONS.MAX_AGG]: {
    name: FUNCTIONS.MAX_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Finds maximum value from related records',
    arguments: [
      { name: 'relationship', type: TYPES.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'expression', type: TYPES.EXPRESSION, description: 'Expression to find maximum of' }
    ],
    returnType: TYPES.NUMBER,
    testRefs: ['tests/aggregate-functions.test.js:85'],
    requiresSpecialHandling: true
  },
  
  [FUNCTIONS.AND_AGG]: {
    name: FUNCTIONS.AND_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Returns true if all values from related records are true',
    arguments: [
      { name: 'relationship', type: TYPES.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'expression', type: TYPES.EXPRESSION, description: 'Boolean expression to evaluate' }
    ],
    returnType: TYPES.BOOLEAN,
    testRefs: ['tests/aggregate-functions.test.js:95'],
    requiresSpecialHandling: true
  },
  
  [FUNCTIONS.OR_AGG]: {
    name: FUNCTIONS.OR_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Returns true if any value from related records is true',
    arguments: [
      { name: 'relationship', type: TYPES.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'expression', type: TYPES.EXPRESSION, description: 'Boolean expression to evaluate' }
    ],
    returnType: TYPES.BOOLEAN,
    testRefs: ['tests/aggregate-functions.test.js:105'],
    requiresSpecialHandling: true
  }
};

// Export function names list for easy iteration
export const ALL_FUNCTION_NAMES = Object.values(FUNCTIONS);

// Export categorized function lists
export const FUNCTION_CATEGORIES = {
  [CATEGORIES.CORE]: [FUNCTIONS.TODAY, FUNCTIONS.ME, FUNCTIONS.DATE, FUNCTIONS.STRING, FUNCTIONS.IF],
  [CATEGORIES.NULL_HANDLING]: [FUNCTIONS.ISNULL, FUNCTIONS.NULLVALUE, FUNCTIONS.ISBLANK],
  [CATEGORIES.LOGICAL]: [FUNCTIONS.AND, FUNCTIONS.OR, FUNCTIONS.NOT],
  [CATEGORIES.MATH]: [FUNCTIONS.ABS, FUNCTIONS.ROUND, FUNCTIONS.MIN, FUNCTIONS.MAX, FUNCTIONS.MOD, FUNCTIONS.CEILING, FUNCTIONS.FLOOR],
  [CATEGORIES.STRING]: [FUNCTIONS.UPPER, FUNCTIONS.LOWER, FUNCTIONS.TRIM, FUNCTIONS.LEN, FUNCTIONS.LEFT, FUNCTIONS.RIGHT, FUNCTIONS.MID, FUNCTIONS.CONTAINS, FUNCTIONS.SUBSTITUTE],
  [CATEGORIES.DATE]: [FUNCTIONS.YEAR, FUNCTIONS.MONTH, FUNCTIONS.DAY, FUNCTIONS.WEEKDAY, FUNCTIONS.ADDMONTHS, FUNCTIONS.ADDDAYS, FUNCTIONS.DATEDIF],
  [CATEGORIES.AGGREGATE]: [FUNCTIONS.STRING_AGG, FUNCTIONS.STRING_AGG_DISTINCT, FUNCTIONS.SUM_AGG, FUNCTIONS.COUNT_AGG, FUNCTIONS.AVG_AGG, FUNCTIONS.MIN_AGG, FUNCTIONS.MAX_AGG, FUNCTIONS.AND_AGG, FUNCTIONS.OR_AGG]
};

/**
 * Get function metadata by name
 * @param {string} functionName - Function name
 * @returns {Object|null} Function metadata or null if not found
 */
export function getFunctionMetadata(functionName) {
  return FUNCTION_METADATA[functionName] || null;
}

/**
 * Check if a function exists
 * @param {string} functionName - Function name to check
 * @returns {boolean} True if function exists
 */
export function isValidFunction(functionName) {
  return functionName in FUNCTION_METADATA;
}

/**
 * Validate function arguments against metadata
 * @param {string} functionName - Function name
 * @param {Array} args - Compiled arguments
 * @param {Object} compiler - Compiler instance for error reporting
 * @param {Object} node - AST node for position info
 * @returns {Object} Validation result with validated args
 */
export function validateFunctionArgs(functionName, args, compiler, node) {
  const metadata = getFunctionMetadata(functionName);
  if (!metadata) {
    compiler.error(`Unknown function: ${functionName}`, node.position);
  }
  
  // Argument count validation
  const expectedMin = metadata.minArgs || metadata.arguments.length;
  const expectedMax = metadata.maxArgs !== undefined ? metadata.maxArgs : metadata.arguments.length;
  
  if (args.length < expectedMin) {
    if (expectedMin === 1) {
      compiler.error(`${functionName}() takes at least ${expectedMin} argument`, node.position);
    } else {
      compiler.error(`${functionName}() takes at least ${expectedMin} arguments`, node.position);
    }
  }
  
  if (expectedMax !== null && args.length > expectedMax) {
    if (expectedMin === expectedMax) {
      compiler.error(`${functionName}() takes exactly ${expectedMin} argument${expectedMin === 1 ? '' : 's'}`, node.position);
    } else {
      compiler.error(`${functionName}() takes ${expectedMin}-${expectedMax} arguments`, node.position);
    }
  }
  
  // Type validation for each argument
  const validatedArgs = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // For variadic functions, use the first argument spec for all extra args
    const expectedArgIndex = Math.min(i, metadata.arguments.length - 1);
    const expectedArg = metadata.arguments[expectedArgIndex];
    
    if (!expectedArg) {
      // This shouldn't happen due to count validation above, but handle gracefully
      validatedArgs.push(arg);
      continue;
    }
    
    // Type checking based on expected argument type
    if (expectedArg.type === TYPES.STRING_LITERAL && arg.type !== AST_TYPES.STRING_LITERAL) {
      compiler.error(`${functionName}() ${expectedArg.name} must be a string literal, got ${arg.returnType}`, node.position);
    } else if (expectedArg.type === TYPES.BOOLEAN && arg.returnType !== RETURN_TYPES.BOOLEAN) {
      compiler.error(`${functionName}() ${expectedArg.name} must be boolean, got ${arg.returnType}`, node.position);
    } else if (expectedArg.type === TYPES.NUMBER && arg.returnType !== RETURN_TYPES.NUMBER) {
      compiler.error(`${functionName}() ${expectedArg.name} must be number, got ${arg.returnType}`, node.position);
    } else if (expectedArg.type === TYPES.STRING && arg.returnType !== RETURN_TYPES.STRING) {
      compiler.error(`${functionName}() ${expectedArg.name} must be string, got ${arg.returnType}`, node.position);
    } else if (expectedArg.type === TYPES.DATE && arg.returnType !== RETURN_TYPES.DATE) {
      compiler.error(`${functionName}() ${expectedArg.name} must be date, got ${arg.returnType}`, node.position);
    }
    // TYPES.EXPRESSION accepts any type
    // TYPES.INVERSE_RELATIONSHIP is handled specially by aggregate functions
    
    validatedArgs.push(arg);
  }
  
  return {
    metadata,
    validatedArgs
  };
}