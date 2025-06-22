import { mapPostgresType } from './utils.js';
import { TokenType, NodeType } from './types.js';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Compiler } from './compiler.js';
import './function-compiler.js'; // This extends Compiler prototype with function methods
import { generateSQL } from './sql-generator.js';

/**
 * Main API function - Now returns intent representation only
 * @param {string} formula - The formula string to compile
 * @param {Object} context - Context object with tableName and columnList
 * @param {Object} options - Optional compilation options
 * @returns {CompilationResult} Intent representation
 */
function evaluateFormula(formula, context, options = {}) {
  try {
    // Lexer stage
    const lexer = new Lexer(formula);
    
    // Parser stage
    const parser = new Parser(lexer);
    const ast = parser.parse();
    
    // Compiler stage - generates intents, not SQL
    const compiler = new Compiler(context, options);
    const result = compiler.compile(ast);
    
    const compilationResult = {
      expression: result,
      joinIntents: compiler.getJoinIntents(),
      aggregateIntents: compiler.getAggregateIntents(),
      returnType: result.returnType
    };
    
    // Return the modern intent-based format directly
    // Legacy conversion is no longer automatic - it's only used when explicitly needed
    return compilationResult;
  } catch (error) {
    // Re-throw with consistent error format
    throw {
      message: error.message,
      position: error.position || 0
    };
  }
}

// Export for ES modules
export { evaluateFormula, generateSQL, mapPostgresType };