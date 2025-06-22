/**
 * Function Dispatcher
 * Coordinates all function compilation modules and delegates to the appropriate handler
 */

import { compileCoreFunction } from './functions/core-functions.js';
import { compileNullFunction } from './functions/null-functions.js';
import { compileLogicalFunction } from './functions/logical-functions.js';
import { compileMathFunction } from './functions/math-functions.js';
import { compileStringFunction } from './functions/string-functions.js';
import { compileDateFunction } from './functions/date-functions.js';
import { compileAggregateFunction } from './functions/aggregate-functions.js';

/**
 * Main function compilation dispatcher
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call
 */
export function compileFunction(compiler, node) {
  const funcName = node.name;
  
  // Try each function category in order
  let result;
  
  // Handle aggregate functions first (they have specific patterns)
  result = compileAggregateFunction(compiler, node);
  if (result) return result;
  
  // Core/Special functions (TODAY, ME, DATE, STRING, IF)
  result = compileCoreFunction(compiler, node);
  if (result) return result;
  
  // NULL handling functions (ISNULL, NULLVALUE, ISBLANK)
  result = compileNullFunction(compiler, node);
  if (result) return result;
  
  // Logical functions (AND, OR, NOT)
  result = compileLogicalFunction(compiler, node);
  if (result) return result;
  
  // Math functions (ABS, ROUND, MIN, MAX, MOD, CEILING, FLOOR)
  result = compileMathFunction(compiler, node);
  if (result) return result;
  
  // String functions (UPPER, LOWER, TRIM, LEN, LEFT, RIGHT, MID, CONTAINS, SUBSTITUTE)
  result = compileStringFunction(compiler, node);
  if (result) return result;
  
  // Date functions (YEAR, MONTH, DAY, WEEKDAY, ADDMONTHS, ADDDAYS, DATEDIF)
  result = compileDateFunction(compiler, node);
  if (result) return result;
  
  // If no module handled the function, it's unknown
  compiler.error(`Unknown function: ${funcName}`, node.position);
}