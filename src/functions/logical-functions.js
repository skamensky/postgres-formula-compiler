/**
 * Logical Functions
 * Handles AND, OR, and NOT functions
 */

/**
 * Compile logical function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileLogicalFunction(compiler, node) {
  const funcName = node.name;
  
  switch (funcName) {
    case 'AND':
      if (node.args.length < 2) {
        compiler.error('AND() takes at least two arguments', node.position);
      }
      
      const andArgs = [];
      const andDependentJoins = [];
      const andChildIds = [];
      
      for (let i = 0; i < node.args.length; i++) {
        const arg = compiler.compile(node.args[i]);
        if (arg.returnType !== 'boolean') {
          compiler.error(`AND() argument ${i + 1} must be boolean, got ${arg.returnType}`, node.position);
        }
        andArgs.push(arg);
        andDependentJoins.push(...arg.dependentJoins);
        andChildIds.push(arg.semanticId);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'AND', andChildIds),
        dependentJoins: andDependentJoins,
        returnType: 'boolean',
        compilationContext: compiler.compilationContext,
        value: { name: 'AND' },
        children: andArgs
      };

    case 'OR':
      if (node.args.length < 2) {
        compiler.error('OR() takes at least two arguments', node.position);
      }
      
      const orArgs = [];
      const orDependentJoins = [];
      const orChildIds = [];
      
      for (let i = 0; i < node.args.length; i++) {
        const arg = compiler.compile(node.args[i]);
        if (arg.returnType !== 'boolean') {
          compiler.error(`OR() argument ${i + 1} must be boolean, got ${arg.returnType}`, node.position);
        }
        orArgs.push(arg);
        orDependentJoins.push(...arg.dependentJoins);
        orChildIds.push(arg.semanticId);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'OR', orChildIds),
        dependentJoins: orDependentJoins,
        returnType: 'boolean',
        compilationContext: compiler.compilationContext,
        value: { name: 'OR' },
        children: orArgs
      };

    case 'NOT':
      if (node.args.length !== 1) {
        compiler.error('NOT() takes exactly one argument', node.position);
      }
      
      const notArg = compiler.compile(node.args[0]);
      if (notArg.returnType !== 'boolean') {
        compiler.error('NOT() requires boolean argument, got ' + notArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'NOT', [notArg.semanticId]),
        dependentJoins: notArg.dependentJoins,
        returnType: 'boolean',
        compilationContext: compiler.compilationContext,
        value: { name: 'NOT' },
        children: [notArg]
      };

    default:
      return null; // Not handled by this module
  }
}