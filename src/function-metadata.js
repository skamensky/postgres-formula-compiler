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
  LEN: 'LEN',
  UPPER: 'UPPER',
  LOWER: 'LOWER',
  TRIM: 'TRIM',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  MID: 'MID',
  SUBSTR: 'SUBSTR',
  CONCAT: 'CONCAT',
  REPLACE: 'REPLACE',
  SUBSTITUTE: 'SUBSTITUTE',
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
  WEEKDAY: 'WEEKDAY',
  ADDMONTHS: 'ADDMONTHS',
  ADDDAYS: 'ADDDAYS',
  DATEDIF: 'DATEDIF',
  DATE_ADD: 'DATE_ADD',
  DATE_DIFF: 'DATE_DIFF',
  FORMAT_DATE: 'FORMAT_DATE',
  
  // Logical functions
  IF: 'IF',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  
  // Null handling functions
  ISNULL: 'ISNULL',
  ISBLANK: 'ISBLANK',
  NULLVALUE: 'NULLVALUE',
  COALESCE: 'COALESCE',
  
  // Aggregate functions
  COUNT: 'COUNT',
  SUM: 'SUM',
  AVG: 'AVG',
  MIN_AGG: 'MIN_AGG',
  MAX_AGG: 'MAX_AGG',
  STRING_AGG: 'STRING_AGG',
  STRING_AGG_DISTINCT: 'STRING_AGG_DISTINCT',
  SUM_AGG: 'SUM_AGG',
  COUNT_AGG: 'COUNT_AGG',
  AVG_AGG: 'AVG_AGG',
  AND_AGG: 'AND_AGG',
  OR_AGG: 'OR_AGG',
  
  // Core functions
  ME: 'ME',
  STRING: 'STRING',
  DATE: 'DATE',
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
      { name: 'requires string argument', type: TYPE.STRING, description: 'String to convert to uppercase' }
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
      { name: 'requires string argument', type: TYPE.STRING, description: 'String to convert to lowercase' }
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
      { name: 'requires string argument', type: TYPE.STRING, description: 'String to trim' }
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
      { name: 'second argument', type: TYPE.STRING, description: 'Substring to search for' }
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
  
  [FUNCTIONS.LEN]: {
    name: FUNCTIONS.LEN,
    category: CATEGORIES.STRING,
    description: 'Returns the length of a string',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'requires string argument', type: TYPE.STRING, description: 'String to get length of' }
    ]
  },
  
  [FUNCTIONS.LEFT]: {
    name: FUNCTIONS.LEFT,
    category: CATEGORIES.STRING,
    description: 'Returns the leftmost characters from a string',
    returnType: TYPE.STRING,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'first argument', type: TYPE.STRING, description: 'Source string' },
      { name: 'second argument', type: TYPE.NUMBER, description: 'Number of characters to extract' }
    ]
  },
  
  [FUNCTIONS.RIGHT]: {
    name: FUNCTIONS.RIGHT,
    category: CATEGORIES.STRING,
    description: 'Returns the rightmost characters from a string',
    returnType: TYPE.STRING,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'first argument', type: TYPE.STRING, description: 'Source string' },
      { name: 'numChars', type: TYPE.NUMBER, description: 'Number of characters to extract' }
    ]
  },
  
  [FUNCTIONS.MID]: {
    name: FUNCTIONS.MID,
    category: CATEGORIES.STRING,
    description: 'Returns characters from the middle of a string',
    returnType: TYPE.STRING,
    minArgs: 3,
    maxArgs: 3,
    arguments: [
      { name: 'first argument', type: TYPE.STRING, description: 'Source string' },
      { name: 'start', type: TYPE.NUMBER, description: 'Starting position (1-based)' },
      { name: 'length', type: TYPE.NUMBER, description: 'Number of characters to extract' }
    ]
  },
  
  [FUNCTIONS.SUBSTITUTE]: {
    name: FUNCTIONS.SUBSTITUTE,
    category: CATEGORIES.STRING,
    description: 'Replaces occurrences of a substring with another string',
    returnType: TYPE.STRING,
    minArgs: 3,
    maxArgs: 3,
    arguments: [
      { name: 'first argument', type: TYPE.STRING, description: 'Source string' },
      { name: 'second argument', type: TYPE.STRING, description: 'Text to replace' },
      { name: 'third argument', type: TYPE.STRING, description: 'Replacement text' }
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
    specialHandling: 'date_extraction',
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
    specialHandling: 'date_extraction',
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
    specialHandling: 'date_extraction',
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
  
  [FUNCTIONS.WEEKDAY]: {
    name: FUNCTIONS.WEEKDAY,
    category: CATEGORIES.DATE,
    description: 'Returns the day of the week as a number (1=Sunday)',
    returnType: TYPE.NUMBER,
    minArgs: 1,
    maxArgs: 1,
    specialHandling: 'date_extraction',
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Date to get weekday from' }
    ]
  },
  
  [FUNCTIONS.ADDMONTHS]: {
    name: FUNCTIONS.ADDMONTHS,
    category: CATEGORIES.DATE,
    description: 'Adds months to a date',
    returnType: TYPE.DATE,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Starting date' },
      { name: 'months', type: TYPE.NUMBER, description: 'Number of months to add' }
    ]
  },
  
  [FUNCTIONS.ADDDAYS]: {
    name: FUNCTIONS.ADDDAYS,
    category: CATEGORIES.DATE,
    description: 'Adds days to a date',
    returnType: TYPE.DATE,
    minArgs: 2,
    maxArgs: 2,
    arguments: [
      { name: 'date', type: TYPE.DATE, description: 'Starting date' },
      { name: 'days', type: TYPE.NUMBER, description: 'Number of days to add' }
    ]
  },
  
  [FUNCTIONS.DATEDIF]: {
    name: FUNCTIONS.DATEDIF,
    category: CATEGORIES.DATE,
    description: 'Returns the difference between two dates in specified units',
    returnType: TYPE.NUMBER,
    minArgs: 3,
    maxArgs: 3,
    specialHandling: 'datedif',
    arguments: [
      { name: 'date1', type: TYPE.DATE, description: 'First date' },
      { name: 'date2', type: TYPE.DATE, description: 'Second date' },
      { name: 'unit', type: TYPE.STRING_LITERAL, description: 'Time unit ("days", "months", or "years")' }
    ]
  },
  
  // Core functions
  [FUNCTIONS.ME]: {
    name: FUNCTIONS.ME,
    category: CATEGORIES.CORE,
    description: 'Returns the current user identifier',
    returnType: TYPE.STRING,
    minArgs: 0,
    maxArgs: 0,
    arguments: []
  },
  
  [FUNCTIONS.STRING]: {
    name: FUNCTIONS.STRING,
    category: CATEGORIES.CORE,
    description: 'Converts a value to a string',
    returnType: TYPE.STRING,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'value', type: TYPE.EXPRESSION, description: 'Value to convert to string' }
    ]
  },
  
  [FUNCTIONS.DATE]: {
    name: FUNCTIONS.DATE,
    category: CATEGORIES.CORE,
    description: 'Creates a date from a string literal',
    returnType: TYPE.DATE,
    minArgs: 1,
    maxArgs: 1,
    specialHandling: 'string_literal',
    arguments: [
      { name: 'dateString', type: TYPE.STRING_LITERAL, description: 'Date string in ISO format' }
    ]
  },
  
  // Logical functions
  [FUNCTIONS.IF]: {
    name: FUNCTIONS.IF,
    category: CATEGORIES.CORE,
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
  
  [FUNCTIONS.AND]: {
    name: FUNCTIONS.AND,
    category: CATEGORIES.LOGICAL,
    description: 'Returns true if all arguments are true',
    returnType: TYPE.BOOLEAN,
    minArgs: 2,
    maxArgs: null,
    variadic: true,
    arguments: [
      { name: 'argument', type: TYPE.BOOLEAN, description: 'Boolean conditions to check', variadic: true }
    ]
  },
  
  [FUNCTIONS.OR]: {
    name: FUNCTIONS.OR,
    category: CATEGORIES.LOGICAL,
    description: 'Returns true if any argument is true',
    returnType: TYPE.BOOLEAN,
    minArgs: 2,
    maxArgs: null,
    variadic: true,
    arguments: [
      { name: 'argument', type: TYPE.BOOLEAN, description: 'Boolean conditions to check', variadic: true }
    ]
  },
  
  [FUNCTIONS.NOT]: {
    name: FUNCTIONS.NOT,
    category: CATEGORIES.LOGICAL,
    description: 'Returns the opposite of a boolean value',
    returnType: TYPE.BOOLEAN,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'requires boolean argument', type: TYPE.BOOLEAN, description: 'Boolean condition to negate' }
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
  
  [FUNCTIONS.ISBLANK]: {
    name: FUNCTIONS.ISBLANK,
    category: CATEGORIES.NULL_HANDLING,
    description: 'Returns true if the value is null or empty string',
    returnType: TYPE.BOOLEAN,
    minArgs: 1,
    maxArgs: 1,
    arguments: [
      { name: 'value', type: TYPE.EXPRESSION, description: 'Value to check for blank' }
    ]
  },
  
  [FUNCTIONS.NULLVALUE]: {
    name: FUNCTIONS.NULLVALUE,
    category: CATEGORIES.NULL_HANDLING,
    description: 'Returns the first value if not null, otherwise returns the second value',
    returnType: TYPE.EXPRESSION,
    minArgs: 2,
    maxArgs: 2,
    specialHandling: 'nullvalue',
    arguments: [
      { name: 'value', type: TYPE.EXPRESSION, description: 'Value to check for null' },
      { name: 'defaultValue', type: TYPE.EXPRESSION, description: 'Value to return if first is null' }
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
  
  [FUNCTIONS.STRING_AGG_DISTINCT]: {
    name: FUNCTIONS.STRING_AGG_DISTINCT,
    category: CATEGORIES.AGGREGATE,
    description: 'Concatenates unique string values with a separator',
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
  
  [FUNCTIONS.SUM_AGG]: {
    name: FUNCTIONS.SUM_AGG,
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
  
  [FUNCTIONS.COUNT_AGG]: {
    name: FUNCTIONS.COUNT_AGG,
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
  
  [FUNCTIONS.AVG_AGG]: {
    name: FUNCTIONS.AVG_AGG,
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
  
  [FUNCTIONS.AND_AGG]: {
    name: FUNCTIONS.AND_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Returns true if all boolean values are true',
    returnType: TYPE.BOOLEAN,
    minArgs: 2,
    maxArgs: 2,
    aggregateFunction: true,
    arguments: [
      { name: 'relationship', type: TYPE.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'value', type: TYPE.BOOLEAN, description: 'Boolean expression to check' }
    ]
  },
  
  [FUNCTIONS.OR_AGG]: {
    name: FUNCTIONS.OR_AGG,
    category: CATEGORIES.AGGREGATE,
    description: 'Returns true if any boolean value is true',
    returnType: TYPE.BOOLEAN,
    minArgs: 2,
    maxArgs: 2,
    aggregateFunction: true,
    arguments: [
      { name: 'relationship', type: TYPE.INVERSE_RELATIONSHIP, description: 'Inverse relationship to aggregate' },
      { name: 'value', type: TYPE.BOOLEAN, description: 'Boolean expression to check' }
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
        // Check for wrong argument count
    if (args.length < metadata.minArgs || (metadata.maxArgs !== null && args.length > metadata.maxArgs)) {
      let errorMsg;
      
      if (metadata.minArgs === 0 && metadata.maxArgs === 0) {
        errorMsg = `${functionName}() takes no arguments`;
      } else if (metadata.minArgs === metadata.maxArgs) {
        // Fixed argument count
        if (metadata.minArgs === 1) {
          errorMsg = `${functionName}() takes exactly one argument`;
        } else {
          errorMsg = `${functionName}() takes exactly ${metadata.minArgs} arguments`;
        }
      } else {
        // Range of arguments
        errorMsg = `${functionName}() takes between ${metadata.minArgs} and ${metadata.maxArgs} arguments, got ${args.length}`;
      }
      
      compiler.error(errorMsg, node.position);
      return false;
    }

  } else {
    // For variadic functions, check minimum only
    if (args.length < metadata.minArgs) {
      let errorMsg;
      if (metadata.minArgs === 1) {
        errorMsg = `${functionName}() takes at least one argument`;
      } else {
        errorMsg = `${functionName}() takes at least ${metadata.minArgs} arguments`;
      }
      compiler.error(errorMsg, node.position);
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
    
    // Generate error message with appropriate argument reference
    let argName = expectedArg.name;
    if (metadata.variadic) {
      argName = `${expectedArg.name} ${i + 1}`;
    }
    
    // Type validation based on expected type
    if (expectedArg.type === TYPE.STRING_LITERAL && arg.type !== TYPE.STRING_LITERAL) {
      compiler.error(`${functionName}() ${argName} must be a string literal, got ${typeToString(argReturnType)}`, node.position);
    } else if (expectedArg.type === TYPE.BOOLEAN && argReturnType !== TYPE.BOOLEAN) {
      if (argName.startsWith('requires') || argName.startsWith('boolean argument')) {
        compiler.error(`${functionName}() ${argName}, got ${typeToString(argReturnType)}`, node.position);
      } else {
        compiler.error(`${functionName}() ${argName} must be boolean, got ${typeToString(argReturnType)}`, node.position);
      }
    } else if (expectedArg.type === TYPE.NUMBER && argReturnType !== TYPE.NUMBER) {
      compiler.error(`${functionName}() ${argName} must be number, got ${typeToString(argReturnType)}`, node.position);
    } else if (expectedArg.type === TYPE.STRING && argReturnType !== TYPE.STRING) {
      if (argName.startsWith('requires')) {
        compiler.error(`${functionName}() ${argName}, got ${typeToString(argReturnType)}`, node.position);
      } else {
        compiler.error(`${functionName}() ${argName} must be string, got ${typeToString(argReturnType)}`, node.position);
      }
    } else if (expectedArg.type === TYPE.DATE && argReturnType !== TYPE.DATE) {
      compiler.error(`${functionName}() ${argName} must be date, got ${typeToString(argReturnType)}`, node.position);
    }
  }
  
  return true;
}