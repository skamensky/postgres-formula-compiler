/**
 * Formula Formatter
 * Provides opinionated, idempotent formatting for formula language
 */

import { Lexer, TokenType } from './lexer.js';
import { Parser } from './parser.js';
import { TYPE } from './types-unified.js';
import { FUNCTION_METADATA } from './function-metadata.js';

// Formatting options
const DefaultFormattingOptions = {
  indentSize: 2,
  maxLineLength: 100,
  spaceAroundOperators: true,
  spaceAfterCommas: true,
  spaceInsideParentheses: false,
  newlineAfterOpenParen: false,
  alignArguments: true,
  uppercaseFunctions: true,
  uppercaseKeywords: true,
  removeExtraSpaces: true,
  addTrailingCommas: false,
  breakLongExpressions: true
};

/**
 * Formula Formatter
 */
export class FormulaFormatter {
  constructor(options = {}) {
    this.options = { ...DefaultFormattingOptions, ...options };
  }

  /**
   * Format formula text
   * @param {string} text - Formula text to format
   * @returns {string} Formatted formula text
   */
  format(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    try {
      // Parse the formula into AST
      const parser = new Parser(new Lexer(text.trim()));
      const ast = parser.parse();
      
      // Format the AST
      const formatted = this.formatNode(ast, 0, false);
      
      // Apply final cleanup
      return this.finalCleanup(formatted);
      
    } catch (error) {
      // If parsing fails, do basic token-level formatting
      console.warn('Parse failed, falling back to token-level formatting:', error);
      return this.formatTokens(text);
    }
  }

  /**
   * Format AST node
   * @param {Object} node - AST node
   * @param {number} depth - Current indentation depth
   * @param {boolean} inlineContext - Whether we're in an inline context
   * @returns {string} Formatted text
   */
  formatNode(node, depth = 0, inlineContext = false) {
    if (!node) return '';

    switch (node.type) {
      case TYPE.NUMBER_LITERAL:
        return String(node.value);
      
      case TYPE.STRING_LITERAL:
        return `"${node.value}"`;
      
      case TYPE.BOOLEAN_LITERAL:
      case TYPE.NULL_LITERAL:
        return this.options.uppercaseKeywords ? node.value.toUpperCase() : node.value;
      
      case TYPE.IDENTIFIER:
        // Handle special keywords
        if (['AND', 'OR', 'NOT', 'TRUE', 'FALSE', 'NULL'].includes(node.value.toUpperCase())) {
          return this.options.uppercaseKeywords ? node.value.toUpperCase() : node.value;
        }
        return node.value;
      
      case TYPE.FUNCTION_CALL:
        return this.formatFunctionCall(node, depth, inlineContext);
      
      case TYPE.BINARY_OP:
        return this.formatBinaryOp(node, depth, inlineContext);
      
      case TYPE.UNARY_OP:
        return this.formatUnaryOp(node, depth, inlineContext);
      
      case TYPE.RELATIONSHIP_REF:
        return this.formatRelationshipRef(node);
      
      default:
        return node.value || '';
    }
  }

  /**
   * Format function call
   */
  formatFunctionCall(node, depth, inlineContext) {
    const funcName = this.options.uppercaseFunctions ? node.name.toUpperCase() : node.name;
    const args = node.args || [];
    
    if (args.length === 0) {
      return `${funcName}()`;
    }

    // Check if this should be formatted on multiple lines
    const shouldBreakLines = this.shouldBreakFunctionCall(node, inlineContext);
    
    if (shouldBreakLines) {
      return this.formatMultiLineFunctionCall(funcName, args, depth);
    } else {
      return this.formatInlineFunctionCall(funcName, args, depth, inlineContext);
    }
  }

  /**
   * Format inline function call
   */
  formatInlineFunctionCall(funcName, args, depth, inlineContext) {
    const formattedArgs = args.map(arg => this.formatNode(arg, depth, true));
    const space = this.options.spaceInsideParentheses ? ' ' : '';
    const separator = this.options.spaceAfterCommas ? ', ' : ',';
    
    return `${funcName}(${space}${formattedArgs.join(separator)}${space})`;
  }

  /**
   * Format multi-line function call
   */
  formatMultiLineFunctionCall(funcName, args, depth) {
    const indent = this.getIndent(depth);
    const argIndent = this.getIndent(depth + 1);
    
    let result = `${funcName}(\n`;
    
    args.forEach((arg, index) => {
      const formattedArg = this.formatNode(arg, depth + 1, false);
      const comma = index < args.length - 1 ? ',' : '';
      result += `${argIndent}${formattedArg}${comma}\n`;
    });
    
    result += `${indent})`;
    return result;
  }

  /**
   * Format binary operation
   */
  formatBinaryOp(node, depth, inlineContext) {
    const left = this.formatNode(node.left, depth, true);
    const right = this.formatNode(node.right, depth, true);
    const op = node.op;
    
    // Determine spacing around operator
    const space = this.options.spaceAroundOperators ? ' ' : '';
    
    // Special handling for concatenation (&)
    if (op === '&') {
      return `${left}${space}&${space}${right}`;
    }
    
    // Handle precedence and parentheses
    const needsParens = this.needsParentheses(node, inlineContext);
    const formatted = `${left}${space}${op}${space}${right}`;
    
    return needsParens ? `(${formatted})` : formatted;
  }

  /**
   * Format unary operation
   */
  formatUnaryOp(node, depth, inlineContext) {
    const operand = this.formatNode(node.operand, depth, true);
    
    // Unary minus should be tight to operand
    if (node.op === '-') {
      return `-${operand}`;
    }
    
    return `${node.op}${operand}`;
  }

  /**
   * Format relationship reference
   */
  formatRelationshipRef(node) {
    const chain = node.relationshipChain.map(rel => `${rel}_rel`).join('.');
    
    if (node.fieldName) {
      return `${chain}.${node.fieldName}`;
    }
    
    return chain;
  }

  /**
   * Determine if function call should break across lines
   */
  shouldBreakFunctionCall(node, inlineContext) {
    if (inlineContext) return false;
    
    const args = node.args || [];
    
    // Break if too many arguments
    if (args.length > 3) return true;
    
    // Break if any argument is complex
    if (args.some(arg => this.isComplexExpression(arg))) return true;
    
    // Break if total length would be too long
    const estimatedLength = this.estimateLength(node);
    if (estimatedLength > this.options.maxLineLength) return true;
    
    return false;
  }

  /**
   * Check if expression is complex
   */
  isComplexExpression(node) {
    if (!node) return false;
    
    switch (node.type) {
      case TYPE.FUNCTION_CALL:
        return true;
      
      case TYPE.BINARY_OP:
        return this.isComplexExpression(node.left) || this.isComplexExpression(node.right);
      
      case TYPE.RELATIONSHIP_REF:
        return node.relationshipChain && node.relationshipChain.length > 1;
      
      default:
        return false;
    }
  }

  /**
   * Estimate formatted length of expression
   */
  estimateLength(node) {
    if (!node) return 0;
    
    switch (node.type) {
      case TYPE.NUMBER_LITERAL:
        return String(node.value).length;
      
      case TYPE.STRING_LITERAL:
        return node.value.length + 2; // Include quotes
      
      case TYPE.BOOLEAN_LITERAL:
      case TYPE.NULL_LITERAL:
      case TYPE.IDENTIFIER:
        return node.value.length;
      
      case TYPE.FUNCTION_CALL:
        const args = node.args || [];
        const argsLength = args.reduce((sum, arg) => sum + this.estimateLength(arg), 0);
        const separators = args.length > 0 ? (args.length - 1) * 2 : 0; // ', '
        return node.name.length + 2 + argsLength + separators; // name + () + args + separators
      
      case TYPE.BINARY_OP:
        return this.estimateLength(node.left) + 3 + this.estimateLength(node.right); // left + ' op ' + right
      
      case TYPE.UNARY_OP:
        return 1 + this.estimateLength(node.operand);
      
      case TYPE.RELATIONSHIP_REF:
        const chainLength = node.relationshipChain.reduce((sum, rel) => sum + rel.length + 4, 0); // rel + '_rel'
        const fieldLength = node.fieldName ? node.fieldName.length + 1 : 0; // .field
        return chainLength + fieldLength;
      
      default:
        return 10; // Conservative estimate
    }
  }

  /**
   * Determine if parentheses are needed
   */
  needsParentheses(node, inlineContext) {
    // For now, conservative approach - could be refined with precedence rules
    return false;
  }

  /**
   * Get indentation string
   */
  getIndent(depth) {
    return ' '.repeat(depth * this.options.indentSize);
  }

  /**
   * Fallback token-level formatting
   */
  formatTokens(text) {
    try {
      const lexer = new Lexer(text);
      const tokens = [];
      let token;
      
      do {
        token = lexer.getNextToken();
        tokens.push(token);
      } while (token.type !== TokenType.EOF);
      
      return this.formatTokenSequence(tokens);
      
    } catch (error) {
      console.warn('Token formatting failed, returning original text:', error);
      return text;
    }
  }

  /**
   * Format sequence of tokens
   */
  formatTokenSequence(tokens) {
    let result = '';
    let prevToken = null;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === TokenType.EOF) break;
      
      const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;
      
      // Add space before token if needed
      if (prevToken && this.needsSpaceBefore(token, prevToken)) {
        result += ' ';
      }
      
      // Add the token value
      result += this.formatTokenValue(token);
      
      // Add space after token if needed
      if (nextToken && this.needsSpaceAfter(token, nextToken)) {
        result += ' ';
      }
      
      prevToken = token;
    }
    
    return result;
  }

  /**
   * Format individual token value
   */
  formatTokenValue(token) {
    switch (token.type) {
      case TokenType.IDENTIFIER:
        // Handle functions and keywords
        if (FUNCTION_METADATA[token.value] && this.options.uppercaseFunctions) {
          return token.value.toUpperCase();
        }
        if (['AND', 'OR', 'NOT', 'TRUE', 'FALSE', 'NULL'].includes(token.value.toUpperCase()) && this.options.uppercaseKeywords) {
          return token.value.toUpperCase();
        }
        return token.value;
      
      case TokenType.STRING:
        return `"${token.value}"`;
      
      default:
        return String(token.value);
    }
  }

  /**
   * Determine if space is needed before token
   */
  needsSpaceBefore(token, prevToken) {
    // No space after opening paren or before closing paren
    if (prevToken.type === TokenType.LPAREN || token.type === TokenType.RPAREN) {
      return this.options.spaceInsideParentheses;
    }
    
    // No space before comma or dot
    if (token.type === TokenType.COMMA || token.type === TokenType.DOT) {
      return false;
    }
    
    // No space after dot
    if (prevToken.type === TokenType.DOT) {
      return false;
    }
    
    // Space around operators
    if (this.isOperator(token.type) || this.isOperator(prevToken.type)) {
      return this.options.spaceAroundOperators;
    }
    
    // Space after comma
    if (prevToken.type === TokenType.COMMA) {
      return this.options.spaceAfterCommas;
    }
    
    // General case: space between different token types
    return this.shouldAddSpace(prevToken.type, token.type);
  }

  /**
   * Determine if space is needed after token
   */
  needsSpaceAfter(token, nextToken) {
    // This is handled by needsSpaceBefore on the next iteration
    return false;
  }

  /**
   * Check if token type is an operator
   */
  isOperator(tokenType) {
    return [
      TokenType.PLUS, TokenType.MINUS, TokenType.MULTIPLY, TokenType.DIVIDE,
      TokenType.AMPERSAND, TokenType.GT, TokenType.GTE, TokenType.LT,
      TokenType.LTE, TokenType.EQ, TokenType.NEQ
    ].includes(tokenType);
  }

  /**
   * Determine if space should be added between token types
   */
  shouldAddSpace(prevType, currentType) {
    // Identifier followed by identifier needs space
    if (prevType === TokenType.IDENTIFIER && currentType === TokenType.IDENTIFIER) {
      return true;
    }
    
    // Number followed by identifier needs space
    if (prevType === TokenType.NUMBER && currentType === TokenType.IDENTIFIER) {
      return true;
    }
    
    // Identifier followed by number needs space
    if (prevType === TokenType.IDENTIFIER && currentType === TokenType.NUMBER) {
      return true;
    }
    
    return false;
  }

  /**
   * Final cleanup of formatted text
   */
  finalCleanup(text) {
    let result = text;
    
    if (this.options.removeExtraSpaces) {
      // Remove multiple consecutive spaces
      result = result.replace(/\s+/g, ' ');
      
      // Remove spaces at beginning and end of lines
      result = result.replace(/^\s+|\s+$/gm, '');
      
      // Remove trailing spaces
      result = result.trim();
    }
    
    return result;
  }

  /**
   * Check if formula is already formatted
   * @param {string} text - Original text
   * @returns {boolean} True if already formatted
   */
  isFormatted(text) {
    try {
      const formatted = this.format(text);
      return text.trim() === formatted.trim();
    } catch (error) {
      return false;
    }
  }

  /**
   * Format with custom options
   * @param {string} text - Text to format
   * @param {Object} customOptions - Custom formatting options
   * @returns {string} Formatted text
   */
  formatWith(text, customOptions) {
    const originalOptions = { ...this.options };
    this.options = { ...this.options, ...customOptions };
    
    try {
      return this.format(text);
    } finally {
      this.options = originalOptions;
    }
  }

  /**
   * Get formatting options
   */
  getOptions() {
    return { ...this.options };
  }

  /**
   * Set formatting options
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }
}

// Predefined formatting styles
export const FormattingStyles = {
  COMPACT: {
    spaceAroundOperators: false,
    spaceAfterCommas: true,
    spaceInsideParentheses: false,
    newlineAfterOpenParen: false,
    maxLineLength: 120,
    breakLongExpressions: false
  },
  
  EXPANDED: {
    spaceAroundOperators: true,
    spaceAfterCommas: true,
    spaceInsideParentheses: true,
    newlineAfterOpenParen: true,
    maxLineLength: 80,
    breakLongExpressions: true,
    alignArguments: true
  },
  
  MINIMAL: {
    spaceAroundOperators: false,
    spaceAfterCommas: false,
    spaceInsideParentheses: false,
    uppercaseFunctions: false,
    uppercaseKeywords: false,
    removeExtraSpaces: true
  }
};

// Export the formatter and options
export { DefaultFormattingOptions };