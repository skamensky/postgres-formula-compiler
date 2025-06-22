/**
 * NULL Handling Functions
 * Handles ISNULL, NULLVALUE, and ISBLANK functions
 */

/**
 * Compile null handling function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileNullFunction(compiler, node) {
  const funcName = node.name;
  
  switch (funcName) {
    case 'ISNULL':
      if (node.args.length !== 1) {
        compiler.error('ISNULL() takes exactly one argument', node.position);
      }
      
      const isnullArg = compiler.compile(node.args[0]);
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'ISNULL', [isnullArg.semanticId]),
        dependentJoins: isnullArg.dependentJoins,
        returnType: 'boolean',
        compilationContext: compiler.compilationContext,
        value: { name: 'ISNULL' },
        children: [isnullArg]
      };

    case 'NULLVALUE':
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

    case 'ISBLANK':
      if (node.args.length !== 1) {
        compiler.error('ISBLANK() takes exactly one argument', node.position);
      }
      
      const isblankArg = compiler.compile(node.args[0]);
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'ISBLANK', [isblankArg.semanticId]),
        dependentJoins: isblankArg.dependentJoins,
        returnType: 'boolean',
        compilationContext: compiler.compilationContext,
        value: { name: 'ISBLANK' },
        children: [isblankArg]
      };

    default:
      return null; // Not handled by this module
  }
}