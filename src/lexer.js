import { TokenType } from './types.js';

/**
 * Token Definitions with TextMate Grammar Metadata
 * Used for both lexing and VSCode syntax highlighting generation
 */
export const TOKEN_DEFINITIONS = {
  // Core function names - these are the built-in functions
  FUNCTIONS: {
    pattern: /\b(TODAY|ME|DATE|STRING|IF|ISNULL|NULLVALUE|ISBLANK|AND|OR|NOT|ABS|ROUND|MIN|MAX|MOD|CEILING|FLOOR|UPPER|LOWER|TRIM|LEN|LEFT|RIGHT|MID|CONTAINS|SUBSTITUTE|YEAR|MONTH|DAY|WEEKDAY|ADDMONTHS|ADDDAYS|DATEDIF|STRING_AGG|STRING_AGG_DISTINCT|SUM_AGG|COUNT_AGG|AVG_AGG|MIN_AGG|MAX_AGG|AND_AGG|OR_AGG)\b/i,
    textMateScope: 'support.function.formula',
    description: 'Built-in formula functions',
    tokenType: TokenType.IDENTIFIER
  },
  
  // Boolean and null literals
  LITERALS: {
    pattern: /\b(TRUE|FALSE|NULL)\b/i,
    textMateScope: 'constant.language.formula',
    description: 'Boolean and null literals',
    tokenType: TokenType.IDENTIFIER
  },
  
  // String literals in double quotes
  STRING_LITERAL: {
    pattern: /"[^"]*"/,
    textMateScope: 'string.quoted.double.formula',
    description: 'String literals in double quotes',
    tokenType: TokenType.STRING
  },
  
  // Numeric literals
  NUMBER: {
    pattern: /\d+(\.\d+)?/,
    textMateScope: 'constant.numeric.formula',
    description: 'Numeric literals',
    tokenType: TokenType.NUMBER
  },
  
  // Column references and identifiers (catch-all for unknown identifiers)
  IDENTIFIER: {
    pattern: /[a-zA-Z_]\w*/,
    textMateScope: 'variable.other.formula',
    description: 'Column references and identifiers',
    tokenType: TokenType.IDENTIFIER
  },
  
  // Operators
  COMPARISON_OPERATORS: {
    pattern: /(>=|<=|<>|!=|>|<|=)/,
    textMateScope: 'keyword.operator.comparison.formula',
    description: 'Comparison operators',
    tokenType: 'COMPARISON'
  },
  
  ARITHMETIC_OPERATORS: {
    pattern: /[+\-*/]/,
    textMateScope: 'keyword.operator.arithmetic.formula',
    description: 'Arithmetic operators',
    tokenType: 'ARITHMETIC'
  },
  
  STRING_OPERATOR: {
    pattern: /&/,
    textMateScope: 'keyword.operator.string.formula',
    description: 'String concatenation operator',
    tokenType: TokenType.AMPERSAND
  },
  
  // Punctuation
  PARENTHESES: {
    pattern: /[()]/,
    textMateScope: 'punctuation.parenthesis.formula',
    description: 'Parentheses',
    tokenType: 'PAREN'
  },
  
  COMMA: {
    pattern: /,/,
    textMateScope: 'punctuation.separator.comma.formula',
    description: 'Comma separator',
    tokenType: TokenType.COMMA
  },
  
  DOT: {
    pattern: /\./,
    textMateScope: 'punctuation.accessor.dot.formula',
    description: 'Dot notation for relationships',
    tokenType: TokenType.DOT
  },
  
  // Comments
  LINE_COMMENT: {
    pattern: /\/\/.*$/,
    textMateScope: 'comment.line.double-slash.formula',
    description: 'Line comment',
    tokenType: 'COMMENT'
  },
  
  BLOCK_COMMENT: {
    pattern: /\/\*[\s\S]*?\*\//,
    textMateScope: 'comment.block.formula',
    description: 'Block comment',
    tokenType: 'COMMENT'
  }
};

/**
 * Lexer - converts formula string into tokens
 */
class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
  }

  error(message) {
    throw {
      message: `Lexer error: ${message}`,
      position: this.position
    };
  }

  advance() {
    this.position++;
    if (this.position >= this.input.length) {
      this.currentChar = null;
    } else {
      this.currentChar = this.input[this.position];
    }
  }

  skipWhitespace() {
    while (this.currentChar !== null && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  skipLineComment() {
    // Skip '//'
    this.advance();
    this.advance();
    
    // Skip until end of line or end of input
    while (this.currentChar !== null && this.currentChar !== '\n') {
      this.advance();
    }
    
    // Skip the newline character if present
    if (this.currentChar === '\n') {
      this.advance();
    }
  }

  skipBlockComment() {
    // Skip '/*'
    this.advance();
    this.advance();
    
    // Skip until '*/' or end of input
    while (this.currentChar !== null) {
      if (this.currentChar === '*' && this.position + 1 < this.input.length && this.input[this.position + 1] === '/') {
        // Skip '*/'
        this.advance();
        this.advance();
        return;
      }
      this.advance();
    }
    
    this.error('Unterminated block comment');
  }

  readNumber() {
    let result = '';
    const startPos = this.position;
    
    while (this.currentChar !== null && /[\d.]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    
    return {
      type: TokenType.NUMBER,
      value: parseFloat(result),
      position: startPos
    };
  }

  readIdentifier() {
    let result = '';
    const startPos = this.position;
    
    while (this.currentChar !== null && /[a-zA-Z_]\w*/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    
    const upperResult = result.toUpperCase();
    
    // Check for boolean literals only - treat logical operators as regular identifiers
    switch (upperResult) {
      case 'TRUE':
        return { type: TokenType.IDENTIFIER, value: 'TRUE', position: startPos }; // Treat as special identifier for now
      case 'FALSE':
        return { type: TokenType.IDENTIFIER, value: 'FALSE', position: startPos }; // Treat as special identifier for now
      case 'NULL':
        return { type: TokenType.IDENTIFIER, value: 'NULL', position: startPos }; // Treat as special identifier for now
      default:
        return {
          type: TokenType.IDENTIFIER,
          value: upperResult, // Case-insensitive - includes AND, OR, NOT as regular identifiers
          position: startPos
        };
    }
  }

  readString() {
    let result = '';
    const startPos = this.position;
    this.advance(); // Skip opening quote
    
    while (this.currentChar !== null && this.currentChar !== '"') {
      result += this.currentChar;
      this.advance();
    }
    
    if (this.currentChar === null) {
      this.error('Unterminated string literal');
    }
    
    this.advance(); // Skip closing quote
    
    return {
      type: TokenType.STRING,
      value: result,
      position: startPos
    };
  }

  getNextToken() {
    while (this.currentChar !== null) {
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Handle comments and division
      if (this.currentChar === '/') {
        if (this.position + 1 < this.input.length) {
          const nextChar = this.input[this.position + 1];
          if (nextChar === '/') {
            this.skipLineComment();
            continue;
          } else if (nextChar === '*') {
            this.skipBlockComment();
            continue;
          }
        }
        // Single '/' is division operator
        const currentPos = this.position;
        this.advance();
        return { type: TokenType.DIVIDE, value: '/', position: currentPos };
      }

      if (/\d/.test(this.currentChar)) {
        return this.readNumber();
      }

      if (/[a-zA-Z_]/.test(this.currentChar)) {
        return this.readIdentifier();
      }

      if (this.currentChar === '"') {
        return this.readString();
      }

      const currentPos = this.position;
      
      if (this.currentChar === '+') {
        this.advance();
        return { type: TokenType.PLUS, value: '+', position: currentPos };
      }

      if (this.currentChar === '-') {
        this.advance();
        return { type: TokenType.MINUS, value: '-', position: currentPos };
      }

      if (this.currentChar === '(') {
        this.advance();
        return { type: TokenType.LPAREN, value: '(', position: currentPos };
      }

      if (this.currentChar === ')') {
        this.advance();
        return { type: TokenType.RPAREN, value: ')', position: currentPos };
      }

      if (this.currentChar === ',') {
        this.advance();
        return { type: TokenType.COMMA, value: ',', position: currentPos };
      }

      if (this.currentChar === '.') {
        this.advance();
        return { type: TokenType.DOT, value: '.', position: currentPos };
      }

      if (this.currentChar === '&') {
        this.advance();
        return { type: TokenType.AMPERSAND, value: '&', position: currentPos };
      }

      if (this.currentChar === '*') {
        this.advance();
        return { type: TokenType.MULTIPLY, value: '*', position: currentPos };
      }

      if (this.currentChar === '>') {
        this.advance();
        if (this.currentChar === '=') {
          this.advance();
          return { type: TokenType.GTE, value: '>=', position: currentPos };
        }
        return { type: TokenType.GT, value: '>', position: currentPos };
      }

      if (this.currentChar === '<') {
        this.advance();
        if (this.currentChar === '=') {
          this.advance();
          return { type: TokenType.LTE, value: '<=', position: currentPos };
        } else if (this.currentChar === '>') {
          this.advance();
          return { type: TokenType.NEQ, value: '<>', position: currentPos };
        }
        return { type: TokenType.LT, value: '<', position: currentPos };
      }

      if (this.currentChar === '=') {
        this.advance();
        return { type: TokenType.EQ, value: '=', position: currentPos };
      }

      if (this.currentChar === '!') {
        this.advance();
        if (this.currentChar === '=') {
          this.advance();
          return { type: TokenType.NEQ, value: '!=', position: currentPos };
        }
        this.error(`Unexpected character: !`);
      }

      this.error(`Invalid character: ${this.currentChar}`);
    }

    return { type: TokenType.EOF, value: null, position: this.position };
  }
}

// Export for ES modules
export { Lexer };