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
import { TYPE } from '../types-unified.js';

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
  
  if (funcName === FUNCTIONS.ADDMONTHS || funcName === FUNCTIONS.ADDDAYS) {
    return compileAddDateFunction(compiler, node, metadata);
  }
  
  if (metadata.specialHandling === 'date_extraction') {
    return compileDateExtractionFunction(compiler, node, metadata);
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
  
  // All date functions use standard compilation (except DATEDIF which is handled separately)
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
 * Compile date extraction functions (YEAR, MONTH, DAY, WEEKDAY) with custom error messages
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @param {Object} metadata - Function metadata
 * @returns {Object} Compiled date extraction function
 */
function compileDateExtractionFunction(compiler, node, metadata) {
  const funcName = metadata.name;
  
  // Custom argument count validation
  if (node.args.length !== 1) {
    compiler.error(`${funcName}() takes exactly one argument`, node.position);
  }
  
  // Compile argument
  const arg = compiler.compile(node.args[0]);
  
  // Custom type validation
  if (arg.returnType !== 'date') {
    compiler.error(`${funcName}() requires date argument, got ${arg.returnType}`, node.position);
  }
  
  return {
    type: 'FUNCTION_CALL',
    semanticId: compiler.generateSemanticId('function', funcName, [arg.semanticId]),
    dependentJoins: arg.dependentJoins,
    returnType: 'number',
    compilationContext: compiler.compilationContext,
    value: { name: funcName },
    children: [arg]
  };
}

/**
 * Compile ADDMONTHS/ADDDAYS functions with custom error messages
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @param {Object} metadata - Function metadata
 * @returns {Object} Compiled add date function
 */
function compileAddDateFunction(compiler, node, metadata) {
  const funcName = metadata.name;
  
  // Custom argument count validation
  if (node.args.length !== 2) {
    const signature = funcName === FUNCTIONS.ADDMONTHS ? 'ADDMONTHS(date, months)' : 'ADDDAYS(date, days)';
    compiler.error(`${funcName}() takes exactly two arguments: ${signature}`, node.position);
  }
  
  // Compile arguments
  const arg1 = compiler.compile(node.args[0]);
  const arg2 = compiler.compile(node.args[1]);
  
  // Custom type validation
  if (arg1.returnType !== 'date') {
    compiler.error(`${funcName}() first argument must be date, got ${arg1.returnType}`, node.position);
  }
  if (arg2.returnType !== 'number') {
    compiler.error(`${funcName}() second argument must be number, got ${arg2.returnType}`, node.position);
  }
  
  return {
    type: 'FUNCTION_CALL',
    semanticId: compiler.generateSemanticId('function', funcName, [arg1.semanticId, arg2.semanticId]),
    dependentJoins: [...arg1.dependentJoins, ...arg2.dependentJoins],
    returnType: 'date',
    compilationContext: compiler.compilationContext,
    value: { name: funcName },
    children: [arg1, arg2]
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
  if (datedifArg1.returnType !== 'date') {
    compiler.error('DATEDIF() first argument must be date, got ' + datedifArg1.returnType, node.position);
  }
  if (datedifArg2.returnType !== 'date') {
    compiler.error('DATEDIF() second argument must be date, got ' + datedifArg2.returnType, node.position);
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
    type: 'FUNCTION_CALL',
    semanticId: compiler.generateSemanticId('function', 'DATEDIF', [datedifArg1.semanticId, datedifArg2.semanticId, unit]),
    dependentJoins: [...datedifArg1.dependentJoins, ...datedifArg2.dependentJoins],
    returnType: 'number',
    compilationContext: compiler.compilationContext,
    value: { name: 'DATEDIF', unit: unit },
    children: [datedifArg1, datedifArg2]
  };
}