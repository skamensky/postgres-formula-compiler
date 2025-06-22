/**
 * Function Metadata - Single Source of Truth
 * 
 * This file contains all function definitions, argument specifications,
 * and validation logic. It serves as the authoritative source for:
 * - Function signatures and return types
 * - Argument validation rules
 * - Documentation generation
 * - Error message generation
 */

import { TYPE, typeToString } from './types-unified.js';

// Function name constants - eliminates magic strings
export const FUNCTIONS = {
  // Math functions
  ROUND: 'ROUND',
  ABS: 'ABS',
  CEIL: 'CEIL',
  CEILING: 'CEILING',
  FLOOR: 'FLOOR',
  POWER: 'POWER',
  SQRT: 'SQRT',
  LOG: 'LOG',
  LOG10: 'LOG10',
  EXP: 'EXP',
  SIN: 'SIN',
  COS: 'COS',
  TAN: 'TAN',
  RANDOM: 'RANDOM',
  MIN: 'MIN',
  MAX: 'MAX',
  MOD: 'MOD',
  SIGN: 'SIGN',
  
  // String functions
  LENGTH: 'LENGTH',
  UPPER: 'UPPER',
  LOWER: 'LOWER',
  TRIM: 'TRIM',
  SUBSTR: 'SUBSTR',
  CONCAT: 'CONCAT',
  REPLACE: 'REPLACE',
  CONTAINS: 'CONTAINS',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
  
  // Date functions
  NOW: 'NOW',
  TODAY: 'TODAY',
  YEAR: 'YEAR',
  MONTH: 'MONTH',
  DAY: 'DAY',
  HOUR: 'HOUR',
  MINUTE: 'MINUTE',
  SECOND: 'SECOND',
  DATE_ADD: 'DATE_ADD',
  DATE_DIFF: 'DATE_DIFF',
  FORMAT_DATE: 'FORMAT_DATE',
  
  // Logical functions
  IF: 'IF',
  
  // Null handling functions
  ISNULL: 'ISNULL',
  COALESCE: 'COALESCE',
  
  // Aggregate functions
  COUNT: 'COUNT',
  SUM: 'SUM',
  AVG: 'AVG',
  MIN_AGG: 'MIN_AGG',
  MAX_AGG: 'MAX_AGG',
  STRING_AGG: 'STRING_AGG',
  
  // Core functions
  EVAL: 'EVAL'
};

// Category constants
export const CATEGORIES = {
  MATH: 'Math',
  STRING: 'String',
  DATE: 'Date',
  LOGICAL: 'Logical',
  NULL_HANDLING: 'Null Handling',
  AGGREGATE: 'Aggregate',
  CORE: 'Core'
};

// Complete function metadata
export const FUNCTION_METADATA = {
  // Math functions
  [FUNCTIONS.ROUND]: {
    name: FUNCTIONS.ROUND,
    category: CATEGORIES.MATH,
    description: 'Rounds a number to specified decimal places',
    returnType: TYPE.NUMBER,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'number', type: TYPE.NUMBER, description: 'Number to round' },
      { name: 'decimals', type: TYPE.NUMBER, description: 'Number of decimal places' }
    ]
  },
  
  [FUNCTIONS.ABS]: {
    name: FUNCTIONS.ABS,
    category: CATEGORIES.MATH,
    description: 'Returns the absolute value of a number',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'number', type: TYPE.NUMBER, description: 'Number to get absolute value of' }
    ]
  },
  
  [FUNCTIONS.CEIL]: {
    name: FUNCTIONS.CEIL,
    category: CATEGORIES.MATH,
    description: 'Rounds a number up to the nearest integer',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'number', type: TYPE.NUMBER, description: 'Number to round up' }
    ]
  },
  
  [FUNCTIONS.CEILING]: {
    name: FUNCTIONS.CEILING,
    category: CATEGORIES.MATH,
    description: 'Rounds a number up to the nearest integer',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'number', type: TYPE.NUMBER, description: 'Number to round up' }
    ]
  },
  
  [FUNCTIONS.FLOOR]: {
    name: FUNCTIONS.FLOOR,
    category: CATEGORIES.MATH,
    description: 'Rounds a number down to the nearest integer',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'number', type: TYPE.NUMBER, description: 'Number to round down' }
    ]
  },
  
  [FUNCTIONS.POWER]: {
    name: FUNCTIONS.POWER,
    category: CATEGORIES.MATH,
    description: 'Raises a number to a power',
    returnType: TYPE.NUMBER,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'base', type: TYPE.NUMBER, description: 'Base number' },
      { name: 'exponent', type: TYPE.NUMBER, description: 'Exponent' }
    ]
  },
  
  [FUNCTIONS.SQRT]: {
    name: FUNCTIONS.SQRT,
    category: CATEGORIES.MATH,
    description: 'Returns the square root of a number',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'value', type: TYPE.NUMBER, description: 'Number to get square root of' }
    ]
  },
  
  [FUNCTIONS.LOG]: {
    name: FUNCTIONS.LOG,
    category: CATEGORIES.MATH,
    description: 'Returns the natural logarithm of a number',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'value', type: TYPE.NUMBER, description: 'Number to get natural logarithm of' }
    ]
  },
  
  [FUNCTIONS.LOG10]: {
    name: FUNCTIONS.LOG10,
    category: CATEGORIES.MATH,
    description: 'Returns the base-10 logarithm of a number',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'value', type: TYPE.NUMBER, description: 'Number to get base-10 logarithm of' }
    ]
  },
  
  [FUNCTIONS.EXP]: {
    name: FUNCTIONS.EXP,
    category: CATEGORIES.MATH,
    description: 'Returns e raised to the power of a number',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'value', type: TYPE.NUMBER, description: 'Exponent' }
    ]
  },
  
  [FUNCTIONS.SIN]: {
    name: FUNCTIONS.SIN,
    category: CATEGORIES.MATH,
    description: 'Returns the sine of an angle in radians',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'angle', type: TYPE.NUMBER, description: 'Angle in radians' }
    ]
  },
  
  [FUNCTIONS.COS]: {
    name: FUNCTIONS.COS,
    category: CATEGORIES.MATH,
    description: 'Returns the cosine of an angle in radians',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'angle', type: TYPE.NUMBER, description: 'Angle in radians' }
    ]
  },
  
  [FUNCTIONS.TAN]: {
    name: FUNCTIONS.TAN,
    category: CATEGORIES.MATH,
    description: 'Returns the tangent of an angle in radians',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'angle', type: TYPE.NUMBER, description: 'Angle in radians' }
    ]
  },
  
  [FUNCTIONS.RANDOM]: {
    name: FUNCTIONS.RANDOM,
    category: CATEGORIES.MATH,
    description: 'Returns a random number between 0 and 1',
    returnType: TYPE.NUMBER,
    minArgs: 0,
    maxArgs: 0,
    arguments: []
  },
  
  [FUNCTIONS.MIN]: {
    name: FUNCTIONS.MIN,
    category: CATEGORIES.MATH,
    description: 'Returns the minimum of two numbers',
    returnType: TYPE.NUMBER,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'num1', type: TYPE.NUMBER, description: 'First number' },
      { name: 'num2', type: TYPE.NUMBER, description: 'Second number' }
    ]
  },
  
  [FUNCTIONS.MAX]: {
    name: FUNCTIONS.MAX,
    category: CATEGORIES.MATH,
    description: 'Returns the maximum of two numbers',
    returnType: TYPE.NUMBER,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'num1', type: TYPE.NUMBER, description: 'First number' },
      { name: 'num2', type: TYPE.NUMBER, description: 'Second number' }
    ]
  },
  
  [FUNCTIONS.MOD]: {
    name: FUNCTIONS.MOD,
    category: CATEGORIES.MATH,
    description: 'Returns the remainder of division',
    returnType: TYPE.NUMBER,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'dividend', type: TYPE.NUMBER, description: 'Number to divide' },
      { name: 'divisor', type: TYPE.NUMBER, description: 'Number to divide by' }
    ]
  },
  
  [FUNCTIONS.SIGN]: {
    name: FUNCTIONS.SIGN,
    category: CATEGORIES.MATH,
    description: 'Returns the sign of a number (-1, 0, or 1)',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'value', type: TYPE.NUMBER, description: 'Number to get sign of' }
    ]
  },
  
  // String functions
  [FUNCTIONS.LENGTH]: {
    name: FUNCTIONS.LENGTH,
    category: CATEGORIES.STRING,
    description: 'Returns the length of a string',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'text', type: TYPE.STRING, description: 'String to get length of' }
    ]
  },
  
  [FUNCTIONS.UPPER]: {
    name: FUNCTIONS.UPPER,
    category: CATEGORIES.STRING,
    description: 'Converts a string to uppercase',
    returnType: TYPE.STRING,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'text', type: TYPE.STRING, description: 'String to convert to uppercase' }
    ]
  },
  
  [FUNCTIONS.LOWER]: {
    name: FUNCTIONS.LOWER,
    category: CATEGORIES.STRING,
    description: 'Converts a string to lowercase',
    returnType: TYPE.STRING,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'text', type: TYPE.STRING, description: 'String to convert to lowercase' }
    ]
  },
  
  [FUNCTIONS.TRIM]: {
    name: FUNCTIONS.TRIM,
    category: CATEGORIES.STRING,
    description: 'Removes whitespace from both ends of a string',
    returnType: TYPE.STRING,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'text', type: TYPE.STRING, description: 'String to trim' }
    ]
  },
  
  [FUNCTIONS.SUBSTR]: {
    name: FUNCTIONS.SUBSTR,
    category: CATEGORIES.STRING,
    description: 'Extracts a substring from a string',
    returnType: TYPE.STRING,
    minArgs: 2,
    maxArgs: 3,
    arguments: [
      { name: 'text', type: TYPE.STRING, description: 'Source string' },
      { name: 'start', type: TYPE.NUMBER, description: 'Starting position (1-based)' },
      { name: 'length', type: TYPE.NUMBER, description: 'Length of substring (optional)', optional: true }
    ]
  },
  
  [FUNCTIONS.CONCAT]: {
    name: FUNCTIONS.CONCAT,
    category: CATEGORIES.STRING,
    description: 'Concatenates two or more strings',
    returnType: TYPE.STRING,
    minArgs: 2,
    maxArgs: null, // unlimited
    variadic: true,
    arguments: [
      { name: 'strings', type: TYPE.STRING, description: 'Strings to concatenate', variadic: true }
    ]
  },
  
  [FUNCTIONS.REPLACE]: {
    name: FUNCTIONS.REPLACE,
    category: CATEGORIES.STRING,
    description: 'Replaces occurrences of a substring with another string',
    returnType: TYPE.STRING,
    minArgs: 3,
    maxArgs: 3,
    arguments: [
      { name: 'text', type: TYPE.STRING, description: 'Source string' },
      { name: 'search', type: TYPE.STRING, description: 'String to search for' },
      { name: 'replacement', type: TYPE.STRING, description: 'Replacement string' }
    ]
  },
  
  [FUNCTIONS.CONTAINS]: {
    name: FUNCTIONS.CONTAINS,
    category: CATEGORIES.STRING,
    description: 'Checks if a string contains a substring',
    returnType: TYPE.BOOLEAN,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'text', type: TYPE.STRING, description: 'String to search in' },
      { name: 'search', type: TYPE.STRING, description: 'Substring to search for' }
    ]
  },
  
  [FUNCTIONS.STARTS_WITH]: {
    name: FUNCTIONS.STARTS_WITH,
    category: CATEGORIES.STRING,
    description: 'Checks if a string starts with a substring',
    returnType: TYPE.BOOLEAN,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'text', type: TYPE.STRING, description: 'String to check' },
      { name: 'prefix', type: TYPE.STRING, description: 'Prefix to check for' }
    ]
  },
  
  [FUNCTIONS.ENDS_WITH]: {
    name: FUNCTIONS.ENDS_WITH,
    category: CATEGORIES.STRING,
    description: 'Checks if a string ends with a substring',
    returnType: TYPE.BOOLEAN,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'text', type: TYPE.STRING, description: 'String to check' },
      { name: 'suffix', type: TYPE.STRING, description: 'Suffix to check for' }
    ]
  },
  
  // Date functions
  [FUNCTIONS.NOW]: {
    name: FUNCTIONS.NOW,
    category: CATEGORIES.DATE,
    description: 'Returns the current date and time',
    returnType: TYPE.DATE,
    minArgs: 0,
    maxArgs: 0,
    arguments: []
  },
  
  [FUNCTIONS.TODAY]: {
    name: FUNCTIONS.TODAY,
    category: CATEGORIES.DATE,
    description: 'Returns the current date (without time)',
    returnType: TYPE.DATE,
    minArgs: 0,
    maxArgs: 0,
    arguments: []
  },
  
  [FUNCTIONS.YEAR]: {
    name: FUNCTIONS.YEAR,
    category: CATEGORIES.DATE,
    description: 'Extracts the year from a date',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Date to extract year from' }
    ]
  },
  
  [FUNCTIONS.MONTH]: {
    name: FUNCTIONS.MONTH,
    category: CATEGORIES.DATE,
    description: 'Extracts the month from a date (1-12)',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Date to extract month from' }
    ]
  },
  
  [FUNCTIONS.DAY]: {
    name: FUNCTIONS.DAY,
    category: CATEGORIES.DATE,
    description: 'Extracts the day from a date (1-31)',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Date to extract day from' }
    ]
  },
  
  [FUNCTIONS.HOUR]: {
    name: FUNCTIONS.HOUR,
    category: CATEGORIES.DATE,
    description: 'Extracts the hour from a date (0-23)',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Date to extract hour from' }
    ]
  },
  
  [FUNCTIONS.MINUTE]: {
    name: FUNCTIONS.MINUTE,
    category: CATEGORIES.DATE,
    description: 'Extracts the minute from a date (0-59)',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Date to extract minute from' }
    ]
  },
  
  [FUNCTIONS.SECOND]: {
    name: FUNCTIONS.SECOND,
    category: CATEGORIES.DATE,
    description: 'Extracts the second from a date (0-59)',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Date to extract second from' }
    ]
  },
  
  [FUNCTIONS.DATE_ADD]: {
    name: FUNCTIONS.DATE_ADD,
    category: CATEGORIES.DATE,
    description: 'Adds a specified amount of time to a date',
    returnType: TYPE.DATE,
    minArgs: 3,
    maxArgs: 3,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Base date' },
      { name: 'amount', type: TYPE.NUMBER, description: 'Amount to add' },
      { name: 'unit', type: TYPE.STRING_LITERAL, description: 'Time unit (day, month, year, hour, minute, second)' }
    ]
  },
  
  [FUNCTIONS.DATE_DIFF]: {
    name: FUNCTIONS.DATE_DIFF,
    category: CATEGORIES.DATE,
    description: 'Calculates the difference between two dates',
    returnType: TYPE.NUMBER,
    minArgs: 3,
    maxArgs: 3,
    arguments: [
      { name: 'date1', type: TYPE.DATE, description: 'First date' },
      { name: 'date2', type: TYPE.DATE, description: 'Second date' },
      { name: 'unit', type: TYPE.STRING_LITERAL, description: 'Time unit (day, month, year, hour, minute, second)' }
    ]
  },
  
  [FUNCTIONS.FORMAT_DATE]: {
    name: FUNCTIONS.FORMAT_DATE,
    category: CATEGORIES.DATE,
    description: 'Formats a date as a string',
    returnType: TYPE.STRING,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Date to format' },
      { name: 'format', type: TYPE.STRING_LITERAL, description: 'Format string' }
    ]
  },
  
  // Logical functions
  [FUNCTIONS.IF]: {
    name: FUNCTIONS.IF,
    category: CATEGORIES.LOGICAL,
    description: 'Returns one value if condition is true, another if false',
    returnType: TYPE.EXPRESSION, // return type depends on the branches
    minArgs: 3,
    maxArgs: 3,
    specialHandling: 'conditional', // compiler handles type checking specially
    arguments: [
      { name: 'condition', type: TYPE.BOOLEAN, description: 'Condition to evaluate' },
      { name: 'trueValue', type: TYPE.EXPRESSION, description: 'Value to return if condition is true' },
      { name: 'falseValue', type: TYPE.EXPRESSION, description: 'Value to return if condition is false' }
    ]
  },
  
  // Null handling functions
  [FUNCTIONS.ISNULL]: {
    name: FUNCTIONS.ISNULL,
    category: CATEGORIES.NULL_HANDLING,
    description: 'Returns true if the value is null',
    returnType: TYPE.BOOLEAN,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'value', type: TYPE.EXPRESSION, description: 'Value to check for null' }
    ]
  },
  
  [FUNCTIONS.COALESCE]: {
    name: FUNCTIONS.COALESCE,
    category: CATEGORIES.NULL_HANDLING,
    description: 'Returns the first non-null value from a list of expressions',
    returnType: TYPE.EXPRESSION, // return type depends on the arguments
    minArgs: 2,
    maxArgs: null, // unlimited
    variadic: true,
    specialHandling: 'coalesce', // compiler handles type checking specially
    arguments: [
      { name: 'values', type: TYPE.EXPRESSION, description: 'Values to check (returns first non-null)', variadic: true }
    ]
  },
  
  // Aggregate functions
  [FUNCTIONS.COUNT]: {
    name: FUNCTIONS.COUNT,
    category: CATEGORIES.AGGREGATE,
    description: 'Counts the number of non-null values',
    returnType: TYPE.NUMBER,
    minArgs: 2,
    maxArgs: 2,
    aggregateFunction: true,
    arguments: [
      { name: 'relationship', type: TYPE.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'value', type: TYPE.EXPRESSION, description: 'Expression to count' }
    ]
  },
  
  [FUNCTIONS.SUM]: {
    name: FUNCTIONS.SUM,
    category: CATEGORIES.AGGREGATE,
    description: 'Sums numeric values',
    returnType: TYPE.NUMBER,
    minArgs: 2,
    maxArgs: 2,
    aggregateFunction: true,
    arguments: [
      { name: 'relationship', type: TYPE.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'value', type: TYPE.NUMBER, description: 'Numeric expression to sum' }
    ]
  },
  
  [FUNCTIONS.AVG]: {
    name: FUNCTIONS.AVG,
    category: CATEGORIES.AGGREGATE,
    description: 'Calculates the average of numeric values',
    returnType: TYPE.NUMBER,
    minArgs: 2,
    maxArgs: 2,
    aggregateFunction: true,
    arguments: [
      { name: 'relationship', type: TYPE.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'value', type: TYPE.NUMBER, description: 'Numeric expression to average' }
    ]
  },
  
  [FUNCTIONS.MIN_AGG]: {
    name: FUNCTIONS.MIN_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Finds the minimum value',
    returnType: TYPE.EXPRESSION, // return type matches input type
    minArgs: 2,
    maxArgs: 2,
    aggregateFunction: true,
    arguments: [
      { name: 'relationship', type: TYPE.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'value', type: TYPE.EXPRESSION, description: 'Expression to find minimum of' }
    ]
  },
  
  [FUNCTIONS.MAX_AGG]: {
    name: FUNCTIONS.MAX_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Finds the maximum value',
    returnType: TYPE.EXPRESSION, // return type matches input type
    minArgs: 2,
    maxArgs: 2,
    aggregateFunction: true,
    arguments: [
      { name: 'relationship', type: TYPE.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'value', type: TYPE.EXPRESSION, description: 'Expression to find maximum of' }
    ]
  },
  
  [FUNCTIONS.STRING_AGG]: {
    name: FUNCTIONS.STRING_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Concatenates string values with a separator',
    returnType: TYPE.STRING,
    minArgs: 3,
    maxArgs: 3,
    aggregateFunction: true,
    arguments: [
      { name: 'relationship', type: TYPE.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'value', type: TYPE.STRING, description: 'String expression to concatenate' },
      { name: 'separator', type: TYPE.STRING, description: 'Separator between values' }
    ]
  },
  
  // Core functions
  [FUNCTIONS.EVAL]: {
    name: FUNCTIONS.EVAL,
    category: CATEGORIES.CORE,
    description: 'Evaluates an expression from another table',
    returnType: TYPE.EXPRESSION, // return type depends on the evaluated expression
    minArgs: 1,
    maxArgs: 1,
    specialHandling: 'relationship', // compiler handles this specially
    arguments: [
      { name: 'relationshipRef', type: TYPE.INVERSE_RELATIONSHIP, description: 'Reference to relationship and expression' }
    ]
  }
};

/**
 * Validates function arguments against metadata
 * @param {string} functionName - Name of the function
 * @param {Array} args - Array of argument AST nodes with returnType property
 * @param {Object} compiler - Compiler instance with error method
 * @param {Object} node - AST node for error positioning
 * @returns {boolean} True if validation passes
 */
export function validateFunctionArgs(functionName, args, compiler, node) {
  const metadata = FUNCTION_METADATA[functionName];
  if (!metadata) {
    compiler.error(`Unknown function: ${functionName}`, node.position);
    return false;
  }
  
  // Check argument count for non-variadic functions
  if (!metadata.variadic) {
    if (args.length < metadata.minArgs) {
      const argText = metadata.minArgs === 1 ? 'argument' : 'arguments';
      compiler.error(`${functionName}() takes at least ${metadata.minArgs} ${argText}`, node.position);
      return false;
    }
    
    if (metadata.maxArgs !== null && args.length > metadata.maxArgs) {
      if (metadata.minArgs === metadata.maxArgs) {
        const argText = metadata.minArgs === 1 ? 'argument' : 'arguments';
        compiler.error(`${functionName}() takes exactly ${metadata.minArgs} ${argText}`, node.position);
      } else {
        compiler.error(`${functionName}() expects at most ${metadata.maxArgs} arguments, got ${args.length}`, node.position);
      }
      return false;
    }
  } else {
    // For variadic functions, check minimum only
    if (args.length < metadata.minArgs) {
      compiler.error(`${functionName}() expects at least ${metadata.minArgs} arguments, got ${args.length}`, node.position);
      return false;
    }
  }
  
  // Skip type validation for special handling functions
  if (metadata.specialHandling) {
    return true;
  }
  
  // Validate argument types
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const expectedArg = metadata.variadic ? 
      metadata.arguments[0] : // For variadic, all args use first spec
      metadata.arguments[i];   // For regular, use specific spec
    
    if (!expectedArg) {
      continue; // Extra args for variadic functions
    }
    
    // Get the return type for comparison (always a string)
    const argReturnType = arg.returnType;
    
    // Type validation based on expected type
    if (expectedArg.type === TYPE.STRING_LITERAL && arg.type !== TYPE.STRING_LITERAL) {
      compiler.error(`${functionName}() ${expectedArg.name} must be a string literal, got ${argReturnType}`, node.position);
    } else if (expectedArg.type === TYPE.BOOLEAN && argReturnType !== 'boolean') {
      compiler.error(`${functionName}() ${expectedArg.name} must be boolean, got ${argReturnType}`, node.position);
    } else if (expectedArg.type === TYPE.NUMBER && argReturnType !== 'number') {
      compiler.error(`${functionName}() ${expectedArg.name} must be number, got ${argReturnType}`, node.position);
    } else if (expectedArg.type === TYPE.STRING && argReturnType !== 'string') {
      compiler.error(`${functionName}() ${expectedArg.name} must be string, got ${argReturnType}`, node.position);
    } else if (expectedArg.type === TYPE.DATE && argReturnType !== 'date') {
      compiler.error(`${functionName}() ${expectedArg.name} must be date, got ${argReturnType}`, node.position);
    }
  }
  
  return true;
}