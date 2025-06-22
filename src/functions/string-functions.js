/**
 * String Functions
 * Handles UPPER, LOWER, TRIM, LEN, LEFT, RIGHT, MID, CONTAINS, SUBSTITUTE functions
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
 * Compile string function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileStringFunction(compiler, node) {
  const funcName = node.name;
  
  // Check if this function exists and belongs to string category
  const metadata = FUNCTION_METADATA[funcName];
  if (!metadata || metadata.category !== CATEGORIES.STRING) {
    return null; // Not handled by this module
  }
  
  // Compile arguments
  const compiledArgs = node.args.map(arg => compiler.compile(arg));
  
  // Validate using metadata
  if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {
    return; // Validation failed, error already reported
  }
  
  // Convert Symbol return type to string for consistency
  const returnTypeString = metadata.returnType === TYPE.NUMBER ? 'number' : 
                          metadata.returnType === TYPE.STRING ? 'string' :
                          metadata.returnType === TYPE.BOOLEAN ? 'boolean' :
                          metadata.returnType === TYPE.DATE ? 'date' : 'unknown';
  
  // All string functions use standard compilation
  return {
    type: 'FUNCTION_CALL',
    semanticId: compiler.generateSemanticId('function', funcName, compiledArgs.map(a => a.semanticId)),
    dependentJoins: compiledArgs.flatMap(a => a.dependentJoins),
    returnType: returnTypeString,
    compilationContext: compiler.compilationContext,
    value: { name: funcName },
    children: compiledArgs
  };
}