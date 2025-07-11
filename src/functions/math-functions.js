/**
 * Math Functions
 * Handles ABS, ROUND, MIN, MAX, MOD, CEILING, FLOOR functions
 * Now uses metadata-driven approach for validation and compilation
 */

import { 
  validateFunctionArgs, 
  FUNCTIONS, 
  CATEGORIES,
  FUNCTION_METADATA
} from '../function-metadata.js';
import { TYPE } from '../types-unified.js';

/**
 * Compile math function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileMathFunction(compiler, node) {
  const funcName = node.name;
  
  // Check if this function exists and belongs to math category
  const metadata = FUNCTION_METADATA[funcName];
  if (!metadata || metadata.category !== CATEGORIES.MATH) {
    return null; // Not handled by this module
  }
  
  // Compile arguments
  const compiledArgs = node.args.map(arg => compiler.compile(arg));
  
  // Validate using metadata
  if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {
    return; // Validation failed, error already reported
  }
  
  // All math functions use standard compilation (no special handling required)
  return {
    type: TYPE.FUNCTION_CALL,
    semanticId: compiler.generateSemanticId('function', funcName, compiledArgs.map(a => a.semanticId)),
    dependentJoins: compiledArgs.flatMap(a => a.dependentJoins),
    returnType: metadata.returnType,
    compilationContext: compiler.compilationContext,
    value: { name: funcName },
    children: compiledArgs
  };
}