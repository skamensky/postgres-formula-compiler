/**
 * Core/Special Functions
 * Handles TODAY, ME, DATE, STRING, and IF functions
 */

import { TYPE } from '../types-unified.js';

/**
 * Compile core/special function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call
 */
export function compileCoreFunction(compiler, node) {
  const funcName = node.name;
  
  switch (funcName) {
    case 'TODAY':
      if (node.args.length !== 0) {
        compiler.error('TODAY() takes no arguments', node.position);
      }
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'TODAY'),
        dependentJoins: [],
        returnType: 'date',
        compilationContext: compiler.compilationContext,
        value: { name: 'TODAY', args: [] }
      };

    case 'ME':
      if (node.args.length !== 0) {
        compiler.error('ME() takes no arguments', node.position);
      }
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'ME'),
        dependentJoins: [],
        returnType: 'string',
        compilationContext: compiler.compilationContext,
        value: { name: 'ME', args: [] }
      };

    case 'DATE':
      if (node.args.length !== 1) {
        compiler.error('DATE() takes exactly one argument', node.position);
      }
      
      const dateArg = compiler.compile(node.args[0]);
      if (dateArg.type !== 'STRING_LITERAL') {
        compiler.error('DATE() function requires a string literal', node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'DATE', [dateArg.semanticId]),
        dependentJoins: [],
        returnType: 'date',
        compilationContext: compiler.compilationContext,
        value: { name: 'DATE', stringValue: dateArg.value },
        children: [dateArg]
      };

    case 'STRING':
      if (node.args.length !== 1) {
        compiler.error('STRING() takes exactly one argument', node.position);
      }
      
      const stringArg = compiler.compile(node.args[0]);
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'STRING', [stringArg.semanticId]),
        dependentJoins: stringArg.dependentJoins,
        returnType: 'string',
        compilationContext: compiler.compilationContext,
        value: { name: 'STRING' },
        children: [stringArg]
      };

    case 'IF':
      return compileIfFunction(compiler, node);

    default:
      return null; // Not handled by this module
  }
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
      compiler.error(`IF() true and false values must be the same type, got ${trueValue.returnType} and ${falseValue.returnType}`, node.position);
    }
  }
  
  if (condition.returnType !== 'boolean') {
    compiler.error(`IF() condition must be boolean, got ${condition.returnType}`, node.position);
  }
  
  const children = falseValue ? [condition, trueValue, falseValue] : [condition, trueValue];
  const childIds = children.map(child => child.semanticId);
  const dependentJoins = children.flatMap(child => child.dependentJoins);
  
  return {
    type: 'FUNCTION_CALL',
    semanticId: compiler.generateSemanticId('function', 'IF', childIds),
    dependentJoins: dependentJoins,
    returnType: trueValue.returnType,
    compilationContext: compiler.compilationContext,
    value: { name: 'IF' },
    children: children
  };
}