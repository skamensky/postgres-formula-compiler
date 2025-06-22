/**
 * Logical Functions
 * Handles AND, OR, and NOT functions
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
 * Compile logical function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileLogicalFunction(compiler, node) {
  const funcName = node.name;
  
  // Check if this function exists and belongs to logical category
  const metadata = FUNCTION_METADATA[funcName];
  if (!metadata || metadata.category !== CATEGORIES.LOGICAL) {
    return null; // Not handled by this module
  }
  

  
  // Compile arguments
  const compiledArgs = node.args.map(arg => compiler.compile(arg));
  
  // Validate using metadata
  if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {
    return; // Validation failed, error already reported
  }
  
  // Convert Symbol return type to string for consistency
  const returnTypeString = metadata.returnType === TYPE.BOOLEAN ? 'boolean' : 'unknown';
  
  // All logical functions use standard compilation
  return {
    type: TYPE.FUNCTION_CALL,
    semanticId: compiler.generateSemanticId('function', funcName, compiledArgs.map(a => a.semanticId)),
    dependentJoins: compiledArgs.flatMap(a => a.dependentJoins),
    returnType: returnTypeString,
    compilationContext: compiler.compilationContext,
    value: { name: funcName },
    children: compiledArgs
  };
}