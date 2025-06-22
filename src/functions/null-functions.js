/**
 * NULL Handling Functions
 * Handles ISNULL, NULLVALUE, and ISBLANK functions
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
 * Compile null handling function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileNullFunction(compiler, node) {
  const funcName = node.name;
  
  // Check if this function exists and belongs to null handling category
  const metadata = FUNCTION_METADATA[funcName];
  if (!metadata || metadata.category !== CATEGORIES.NULL_HANDLING) {
    return null; // Not handled by this module
  }
  
  // Handle NULLVALUE specially due to its complex type checking
  if (funcName === FUNCTIONS.NULLVALUE) {
    return compileNullValueFunction(compiler, node);
  }
  
  // Compile arguments
  const compiledArgs = node.args.map(arg => compiler.compile(arg));
  
  // Validate using metadata
  if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {
    return; // Validation failed, error already reported
  }
  
  // Convert Symbol return type to string for consistency
  const returnTypeString = metadata.returnType === TYPE.BOOLEAN ? 'boolean' : 'unknown';
  
  // Standard null functions (ISNULL, ISBLANK) use standard compilation
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

/**
 * Compile NULLVALUE function with special type checking
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled NULLVALUE function
 */
function compileNullValueFunction(compiler, node) {
  if (node.args.length !== 2) {
    compiler.error('NULLVALUE() takes exactly two arguments', node.position);
  }
  
  const nullvalueArg1 = compiler.compile(node.args[0]);
  const nullvalueArg2 = compiler.compile(node.args[1]);
  
  // Type checking - both arguments should be the same type (unless one is null)
  if (nullvalueArg1.returnType !== nullvalueArg2.returnType && 
      nullvalueArg1.returnType !== 'null' && nullvalueArg2.returnType !== 'null') {
    compiler.error(`NULLVALUE() value and default must be the same type, got ${nullvalueArg1.returnType} and ${nullvalueArg2.returnType}`, node.position);
  }
  
  // Return type is the non-null type, or the first type if both are non-null
  const nullvalueReturnType = nullvalueArg1.returnType !== 'null' ? nullvalueArg1.returnType : nullvalueArg2.returnType;
  
  return {
    type: 'FUNCTION_CALL',
    semanticId: compiler.generateSemanticId('function', 'NULLVALUE', [nullvalueArg1.semanticId, nullvalueArg2.semanticId]),
    dependentJoins: [...nullvalueArg1.dependentJoins, ...nullvalueArg2.dependentJoins],
    returnType: nullvalueReturnType,
    compilationContext: compiler.compilationContext,
    value: { name: 'NULLVALUE' },
    children: [nullvalueArg1, nullvalueArg2]
  };
}