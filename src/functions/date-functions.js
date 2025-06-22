/**
 * Date Functions
 * Handles YEAR, MONTH, DAY, WEEKDAY, ADDMONTHS, ADDDAYS, DATEDIF functions
 * Now uses metadata-driven approach for validation and compilation
 */

import { 
  validateFunctionArgs, 
  FUNCTIONS, 
  CATEGORIES,
  FUNCTION_METADATA
} from '../function-metadata.js';
import { TYPE, typeToString } from '../types-unified.js';

/**
 * Compile date function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileDateFunction(compiler, node) {
  const funcName = node.name;
  
  // Check if this function exists and belongs to date category
  const metadata = FUNCTION_METADATA[funcName];
  if (!metadata || metadata.category !== CATEGORIES.DATE) {
    return null; // Not handled by this module
  }
  
  // Handle special functions that need custom error messages
  if (funcName === FUNCTIONS.DATEDIF) {
    return compileDatedifFunction(compiler, node, metadata);
  }
  
  // Compile arguments
  const compiledArgs = node.args.map(arg => compiler.compile(arg));
  
  // Validate using metadata
  if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {
    return; // Validation failed, error already reported
  }
  
  // All date functions use standard compilation (except DATEDIF which is handled separately)
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



/**
 * Compile DATEDIF function with special string literal validation
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @param {Object} metadata - Function metadata
 * @returns {Object} Compiled DATEDIF function
 */
function compileDatedifFunction(compiler, node, metadata) {
  // Validate argument count
  if (node.args.length !== 3) {
    compiler.error('DATEDIF() takes exactly three arguments: DATEDIF(date1, date2, unit)', node.position);
  }
  
  // Compile first two arguments
  const datedifArg1 = compiler.compile(node.args[0]);
  const datedifArg2 = compiler.compile(node.args[1]);
  
  // Validate argument types for first two arguments
  if (datedifArg1.returnType !== TYPE.DATE) {
    compiler.error('DATEDIF() first argument must be date, got ' + typeToString(datedifArg1.returnType), node.position);
  }
  if (datedifArg2.returnType !== TYPE.DATE) {
    compiler.error('DATEDIF() second argument must be date, got ' + typeToString(datedifArg2.returnType), node.position);
  }
  
  // Third argument must be a string literal
  if (node.args[2].type !== TYPE.STRING_LITERAL) {
    compiler.error('DATEDIF() third argument must be a string literal: "days", "months", or "years"', node.position);
  }
  
  const unit = node.args[2].value;
  if (!['days', 'months', 'years'].includes(unit)) {
    compiler.error(`DATEDIF() unit must be "days", "months", or "years", got "${unit}"`, node.position);
  }
  
  return {
    type: TYPE.FUNCTION_CALL,
    semanticId: compiler.generateSemanticId('function', 'DATEDIF', [datedifArg1.semanticId, datedifArg2.semanticId, unit]),
    dependentJoins: [...datedifArg1.dependentJoins, ...datedifArg2.dependentJoins],
    returnType: TYPE.NUMBER,
    compilationContext: compiler.compilationContext,
    value: { name: 'DATEDIF', unit: unit },
    children: [datedifArg1, datedifArg2]
  };
}