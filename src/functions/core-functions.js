/**
 * Core/Special Functions
 * Handles TODAY, ME, DATE, STRING, and IF functions
 * Now uses metadata-driven approach where possible
 */

import { 
  validateFunctionArgs, 
  FUNCTIONS, 
  CATEGORIES,
  FUNCTION_METADATA
} from '../function-metadata.js';
import { TYPE, typeToString } from '../types-unified.js';

/**
 * Compile core/special function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call
 */
export function compileCoreFunction(compiler, node) {
  const funcName = node.name;
  
  // Check if this function exists and belongs to core category
  const metadata = FUNCTION_METADATA[funcName];
  if (!metadata || metadata.category !== CATEGORIES.CORE) {
    return null; // Not handled by this module
  }
  
  // Handle functions that need special processing
  if (funcName === FUNCTIONS.DATE) {
    return compileDateFunction(compiler, node, metadata);
  }
  
  if (funcName === FUNCTIONS.IF) {
    return compileIfFunction(compiler, node);
  }
  
  // Handle standard core functions (TODAY, ME, STRING)
  const compiledArgs = node.args.map(arg => compiler.compile(arg));
  
  // Validate using metadata
  if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {
    return; // Validation failed, error already reported
  }
  
  // Special handling for different core functions
  switch (funcName) {
    case FUNCTIONS.TODAY:
    case FUNCTIONS.ME:
      return {
        type: TYPE.FUNCTION_CALL,
        semanticId: compiler.generateSemanticId('function', funcName),
        dependentJoins: [],
        returnType: metadata.returnType,
        compilationContext: compiler.compilationContext,
        value: { name: funcName, args: [] }
      };
      
    case FUNCTIONS.STRING:
      return {
        type: TYPE.FUNCTION_CALL,
        semanticId: compiler.generateSemanticId('function', funcName, compiledArgs.map(a => a.semanticId)),
        dependentJoins: compiledArgs.flatMap(a => a.dependentJoins),
        returnType: metadata.returnType,
        compilationContext: compiler.compilationContext,
        value: { name: funcName },
        children: compiledArgs
      };
      
    default:
      return null;
  }
}

/**
 * Compile DATE function with string literal validation
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @param {Object} metadata - Function metadata
 * @returns {Object} Compiled DATE function
 */
function compileDateFunction(compiler, node, metadata) {
  if (node.args.length !== 1) {
    compiler.error('DATE() takes exactly one argument', node.position);
  }
  
  const dateArg = compiler.compile(node.args[0]);
  if (dateArg.type !== TYPE.STRING_LITERAL) {
    compiler.error('DATE() function requires a string literal', node.position);
  }
  
  return {
    type: TYPE.FUNCTION_CALL,
    semanticId: compiler.generateSemanticId('function', 'DATE', [dateArg.semanticId]),
    dependentJoins: [],
    returnType: TYPE.DATE,
    compilationContext: compiler.compilationContext,
    value: { name: 'DATE', stringValue: dateArg.value },
    children: [dateArg]
  };
}

/**
 * Compile IF function
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled IF function
 */
export function compileIfFunction(compiler, node) {
  if (node.args.length < 2 || node.args.length > 3) {
    compiler.error('IF() takes 2 or 3 arguments: IF(condition, true_value, false_value) or IF(condition, true_value)', node.position);
  }
  
  const condition = compiler.compile(node.args[0]);
  const trueValue = compiler.compile(node.args[1]);
  let falseValue = null;
  
  if (node.args.length === 3) {
    falseValue = compiler.compile(node.args[2]);
    
    if (trueValue.returnType !== falseValue.returnType) {
      compiler.error(`IF() true and false values must be the same type, got ${typeToString(trueValue.returnType)} and ${typeToString(falseValue.returnType)}`, node.position);
    }
  }
  
  if (condition.returnType !== TYPE.BOOLEAN) {
    compiler.error(`IF() condition must be boolean, got ${typeToString(condition.returnType)}`, node.position);
  }
  
  const children = falseValue ? [condition, trueValue, falseValue] : [condition, trueValue];
  const childIds = children.map(child => child.semanticId);
  const dependentJoins = children.flatMap(child => child.dependentJoins);
  
  return {
    type: TYPE.FUNCTION_CALL,
    semanticId: compiler.generateSemanticId('function', 'IF', childIds),
    dependentJoins: dependentJoins,
    returnType: trueValue.returnType,
    compilationContext: compiler.compilationContext,
    value: { name: 'IF' },
    children: children
  };
}