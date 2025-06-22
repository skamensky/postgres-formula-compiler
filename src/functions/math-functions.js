/**
 * Math Functions
 * Handles ABS, ROUND, MIN, MAX, MOD, CEILING, FLOOR functions
 */

/**
 * Compile math function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileMathFunction(compiler, node) {
  const funcName = node.name;
  
  switch (funcName) {
    case 'ABS':
      if (node.args.length !== 1) {
        compiler.error('ABS() takes exactly one argument', node.position);
      }
      
      const absArg = compiler.compile(node.args[0]);
      if (absArg.returnType !== 'number') {
        compiler.error('ABS() requires number argument, got ' + absArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'ABS', [absArg.semanticId]),
        dependentJoins: absArg.dependentJoins,
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'ABS' },
        children: [absArg]
      };

    case 'ROUND':
      if (node.args.length !== 2) {
        compiler.error('ROUND() takes exactly two arguments: ROUND(number, decimals)', node.position);
      }
      
      const roundArg1 = compiler.compile(node.args[0]);
      const roundArg2 = compiler.compile(node.args[1]);
      
      if (roundArg1.returnType !== 'number') {
        compiler.error('ROUND() first argument must be number, got ' + roundArg1.returnType, node.position);
      }
      if (roundArg2.returnType !== 'number') {
        compiler.error('ROUND() second argument must be number, got ' + roundArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'ROUND', [roundArg1.semanticId, roundArg2.semanticId]),
        dependentJoins: [...roundArg1.dependentJoins, ...roundArg2.dependentJoins],
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'ROUND' },
        children: [roundArg1, roundArg2]
      };

    case 'MIN':
      if (node.args.length !== 2) {
        compiler.error('MIN() takes exactly two arguments: MIN(num1, num2)', node.position);
      }
      
      const minArg1 = compiler.compile(node.args[0]);
      const minArg2 = compiler.compile(node.args[1]);
      
      if (minArg1.returnType !== 'number') {
        compiler.error('MIN() first argument must be number, got ' + minArg1.returnType, node.position);
      }
      if (minArg2.returnType !== 'number') {
        compiler.error('MIN() second argument must be number, got ' + minArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'MIN', [minArg1.semanticId, minArg2.semanticId]),
        dependentJoins: [...minArg1.dependentJoins, ...minArg2.dependentJoins],
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'MIN' },
        children: [minArg1, minArg2]
      };

    case 'MAX':
      if (node.args.length !== 2) {
        compiler.error('MAX() takes exactly two arguments: MAX(num1, num2)', node.position);
      }
      
      const maxArg1 = compiler.compile(node.args[0]);
      const maxArg2 = compiler.compile(node.args[1]);
      
      if (maxArg1.returnType !== 'number') {
        compiler.error('MAX() first argument must be number, got ' + maxArg1.returnType, node.position);
      }
      if (maxArg2.returnType !== 'number') {
        compiler.error('MAX() second argument must be number, got ' + maxArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'MAX', [maxArg1.semanticId, maxArg2.semanticId]),
        dependentJoins: [...maxArg1.dependentJoins, ...maxArg2.dependentJoins],
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'MAX' },
        children: [maxArg1, maxArg2]
      };

    case 'MOD':
      if (node.args.length !== 2) {
        compiler.error('MOD() takes exactly two arguments: MOD(dividend, divisor)', node.position);
      }
      
      const modArg1 = compiler.compile(node.args[0]);
      const modArg2 = compiler.compile(node.args[1]);
      
      if (modArg1.returnType !== 'number') {
        compiler.error('MOD() first argument must be number, got ' + modArg1.returnType, node.position);
      }
      if (modArg2.returnType !== 'number') {
        compiler.error('MOD() second argument must be number, got ' + modArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'MOD', [modArg1.semanticId, modArg2.semanticId]),
        dependentJoins: [...modArg1.dependentJoins, ...modArg2.dependentJoins],
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'MOD' },
        children: [modArg1, modArg2]
      };

    case 'CEILING':
      if (node.args.length !== 1) {
        compiler.error('CEILING() takes exactly one argument', node.position);
      }
      
      const ceilingArg = compiler.compile(node.args[0]);
      if (ceilingArg.returnType !== 'number') {
        compiler.error('CEILING() requires number argument, got ' + ceilingArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'CEILING', [ceilingArg.semanticId]),
        dependentJoins: ceilingArg.dependentJoins,
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'CEILING' },
        children: [ceilingArg]
      };

    case 'FLOOR':
      if (node.args.length !== 1) {
        compiler.error('FLOOR() takes exactly one argument', node.position);
      }
      
      const floorArg = compiler.compile(node.args[0]);
      if (floorArg.returnType !== 'number') {
        compiler.error('FLOOR() requires number argument, got ' + floorArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'FLOOR', [floorArg.semanticId]),
        dependentJoins: floorArg.dependentJoins,
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'FLOOR' },
        children: [floorArg]
      };

    default:
      return null; // Not handled by this module
  }
}