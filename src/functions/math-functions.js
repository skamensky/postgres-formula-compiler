/**
 * Math Functions
 * Handles ABS, ROUND, MIN, MAX, MOD, CEILING, FLOOR functions
 * Now uses metadata-driven approach for validation and compilation
 */

import { 
  validateFunctionArgs, 
  getFunctionMetadata, 
  FUNCTIONS, 
  FUNCTION_CATEGORIES, 
  CATEGORIES 
} from '../function-metadata.js';

/**
 * Compile math function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileMathFunction(compiler, node) {
  const funcName = node.name;
  
  // Check if this function belongs to math category
  if (!FUNCTION_CATEGORIES[CATEGORIES.MATH].includes(funcName)) {
    return null; // Not handled by this module
  }
  
  // Compile arguments
  const compiledArgs = node.args.map(arg => compiler.compile(arg));
  
  // Validate using metadata
  const { metadata, validatedArgs } = validateFunctionArgs(funcName, compiledArgs, compiler, node);
  
  // All math functions use standard compilation (no special handling required)
  return {
    type: 'FUNCTION_CALL',
    semanticId: compiler.generateSemanticId('function', funcName, validatedArgs.map(a => a.semanticId)),
    dependentJoins: validatedArgs.flatMap(a => a.dependentJoins),
    returnType: metadata.returnType,
    compilationContext: compiler.compilationContext,
    value: { name: funcName },
    children: validatedArgs
  };
}