/**
 * String Functions
 * Handles UPPER, LOWER, TRIM, LEN, LEFT, RIGHT, MID, CONTAINS, SUBSTITUTE functions
 */

/**
 * Compile string function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileStringFunction(compiler, node) {
  const funcName = node.name;
  
  switch (funcName) {
    case 'UPPER':
    case 'LOWER':
    case 'TRIM':
      return compileSimpleStringFunction(compiler, node, funcName);

    case 'LEN':
      if (node.args.length !== 1) {
        compiler.error('LEN() takes exactly one argument', node.position);
      }
      
      const lenArg = compiler.compile(node.args[0]);
      if (lenArg.returnType !== 'string') {
        compiler.error('LEN() requires string argument, got ' + lenArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'LEN', [lenArg.semanticId]),
        dependentJoins: lenArg.dependentJoins,
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'LEN' },
        children: [lenArg]
      };

    case 'LEFT':
      if (node.args.length !== 2) {
        compiler.error('LEFT() takes exactly two arguments: LEFT(text, num)', node.position);
      }
      
      const leftArg1 = compiler.compile(node.args[0]);
      const leftArg2 = compiler.compile(node.args[1]);
      
      if (leftArg1.returnType !== 'string') {
        compiler.error('LEFT() first argument must be string, got ' + leftArg1.returnType, node.position);
      }
      if (leftArg2.returnType !== 'number') {
        compiler.error('LEFT() second argument must be number, got ' + leftArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'LEFT', [leftArg1.semanticId, leftArg2.semanticId]),
        dependentJoins: [...leftArg1.dependentJoins, ...leftArg2.dependentJoins],
        returnType: 'string',
        compilationContext: compiler.compilationContext,
        value: { name: 'LEFT' },
        children: [leftArg1, leftArg2]
      };

    case 'RIGHT':
      if (node.args.length !== 2) {
        compiler.error('RIGHT() takes exactly two arguments: RIGHT(text, num)', node.position);
      }
      
      const rightArg1 = compiler.compile(node.args[0]);
      const rightArg2 = compiler.compile(node.args[1]);
      
      if (rightArg1.returnType !== 'string') {
        compiler.error('RIGHT() first argument must be string, got ' + rightArg1.returnType, node.position);
      }
      if (rightArg2.returnType !== 'number') {
        compiler.error('RIGHT() second argument must be number, got ' + rightArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'RIGHT', [rightArg1.semanticId, rightArg2.semanticId]),
        dependentJoins: [...rightArg1.dependentJoins, ...rightArg2.dependentJoins],
        returnType: 'string',
        compilationContext: compiler.compilationContext,
        value: { name: 'RIGHT' },
        children: [rightArg1, rightArg2]
      };

    case 'MID':
      if (node.args.length !== 3) {
        compiler.error('MID() takes exactly three arguments: MID(text, start, length)', node.position);
      }
      
      const midArg1 = compiler.compile(node.args[0]);
      const midArg2 = compiler.compile(node.args[1]);
      const midArg3 = compiler.compile(node.args[2]);
      
      if (midArg1.returnType !== 'string') {
        compiler.error('MID() first argument must be string, got ' + midArg1.returnType, node.position);
      }
      if (midArg2.returnType !== 'number') {
        compiler.error('MID() second argument must be number, got ' + midArg2.returnType, node.position);
      }
      if (midArg3.returnType !== 'number') {
        compiler.error('MID() third argument must be number, got ' + midArg3.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'MID', [midArg1.semanticId, midArg2.semanticId, midArg3.semanticId]),
        dependentJoins: [...midArg1.dependentJoins, ...midArg2.dependentJoins, ...midArg3.dependentJoins],
        returnType: 'string',
        compilationContext: compiler.compilationContext,
        value: { name: 'MID' },
        children: [midArg1, midArg2, midArg3]
      };

    case 'CONTAINS':
      if (node.args.length !== 2) {
        compiler.error('CONTAINS() takes exactly two arguments: CONTAINS(text, search)', node.position);
      }
      
      const containsArg1 = compiler.compile(node.args[0]);
      const containsArg2 = compiler.compile(node.args[1]);
      
      if (containsArg1.returnType !== 'string') {
        compiler.error('CONTAINS() first argument must be string, got ' + containsArg1.returnType, node.position);
      }
      if (containsArg2.returnType !== 'string') {
        compiler.error('CONTAINS() second argument must be string, got ' + containsArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'CONTAINS', [containsArg1.semanticId, containsArg2.semanticId]),
        dependentJoins: [...containsArg1.dependentJoins, ...containsArg2.dependentJoins],
        returnType: 'boolean',
        compilationContext: compiler.compilationContext,
        value: { name: 'CONTAINS' },
        children: [containsArg1, containsArg2]
      };

    case 'SUBSTITUTE':
      if (node.args.length !== 3) {
        compiler.error('SUBSTITUTE() takes exactly three arguments: SUBSTITUTE(text, old_text, new_text)', node.position);
      }
      
      const subArg1 = compiler.compile(node.args[0]);
      const subArg2 = compiler.compile(node.args[1]);
      const subArg3 = compiler.compile(node.args[2]);
      
      if (subArg1.returnType !== 'string') {
        compiler.error('SUBSTITUTE() first argument must be string, got ' + subArg1.returnType, node.position);
      }
      if (subArg2.returnType !== 'string') {
        compiler.error('SUBSTITUTE() second argument must be string, got ' + subArg2.returnType, node.position);
      }
      if (subArg3.returnType !== 'string') {
        compiler.error('SUBSTITUTE() third argument must be string, got ' + subArg3.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'SUBSTITUTE', [subArg1.semanticId, subArg2.semanticId, subArg3.semanticId]),
        dependentJoins: [...subArg1.dependentJoins, ...subArg2.dependentJoins, ...subArg3.dependentJoins],
        returnType: 'string',
        compilationContext: compiler.compilationContext,
        value: { name: 'SUBSTITUTE' },
        children: [subArg1, subArg2, subArg3]
      };

    default:
      return null; // Not handled by this module
  }
}

/**
 * Helper function for simple string functions (UPPER, LOWER, TRIM)
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @param {string} funcName - Function name
 * @returns {Object} Compiled function call
 */
function compileSimpleStringFunction(compiler, node, funcName) {
  if (node.args.length !== 1) {
    compiler.error(`${funcName}() takes exactly one argument`, node.position);
  }
  
  const arg = compiler.compile(node.args[0]);
  if (arg.returnType !== 'string') {
    compiler.error(`${funcName}() requires string argument, got ${arg.returnType}`, node.position);
  }
  
  return {
    type: 'FUNCTION_CALL',
    semanticId: compiler.generateSemanticId('function', funcName, [arg.semanticId]),
    dependentJoins: arg.dependentJoins,
    returnType: 'string',
    compilationContext: compiler.compilationContext,
    value: { name: funcName },
    children: [arg]
  };
}