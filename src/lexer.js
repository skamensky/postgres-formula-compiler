import { LITERAL_VALUE } from './types-unified.js';

// Token types
const TokenType = {
  NUMBER: 'NUMBER',
  IDENTIFIER: 'IDENTIFIER',
  FUNCTION: 'FUNCTION',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  AMPERSAND: 'AMPERSAND',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  STRING: 'STRING',
  DOT: 'DOT',
  GT: 'GT',           // >
  GTE: 'GTE',         // >=
  LT: 'LT',           // <
  LTE: 'LTE',         // <=
  EQ: 'EQ',           // =
  NEQ: 'NEQ',         // != or <>
  AND: 'AND',         // AND
  OR: 'OR',           // OR
  NOT: 'NOT',         // NOT
  EOF: 'EOF'
};

// Token values - centralized operator values to eliminate duplication
const TokenValue = {
  PLUS: '+',
  MINUS: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  AMPERSAND: '&',
  GT: '>',
  GTE: '>=',
  LT: '<',
  LTE: '<=',
  EQ: '=',
  NEQ_BANG: '!=',
  NEQ_BRACKETS: '<>'
};

// Token metadata for TextMate grammar generation
const TOKEN_METADATA = {
  [TokenType.NUMBER]: {
    name: 'NUMBER',
    pattern: /\d+(\.\d+)?/,
    textMateScope: 'constant.numeric.formula',
    description: 'Numeric literals (integers and decimals)',
    examples: ['42', '3.14', '0.5']
  },
  [TokenType.STRING]: {
    name: 'STRING',
    pattern: /"[^"]*"/,
    textMateScope: 'string.quoted.double.formula',
    description: 'String literals enclosed in double quotes',
    examples: ['"hello"', '"Hello World"', '""']
  },
  [TokenType.IDENTIFIER]: {
    name: 'IDENTIFIER',
    pattern: /[a-zA-Z_]\w*/,
    textMateScope: 'variable.other.formula',
    description: 'Column references, boolean literals (TRUE/FALSE/NULL), and function names',
    examples: ['amount', 'merchant_id', 'TRUE', 'FALSE', 'NULL']
  },
  [TokenType.PLUS]: {
    name: 'PLUS',
    pattern: /\+/,
    textMateScope: 'keyword.operator.arithmetic.formula',
    description: 'Addition operator',
    examples: ['+']
  },
  [TokenType.MINUS]: {
    name: 'MINUS',
    pattern: /-/,
    textMateScope: 'keyword.operator.arithmetic.formula',
    description: 'Subtraction or unary minus operator',
    examples: ['-']
  },
  [TokenType.MULTIPLY]: {
    name: 'MULTIPLY',
    pattern: /\*/,
    textMateScope: 'keyword.operator.arithmetic.formula',
    description: 'Multiplication operator',
    examples: ['*']
  },
  [TokenType.DIVIDE]: {
    name: 'DIVIDE',
    pattern: /\//,
    textMateScope: 'keyword.operator.arithmetic.formula',
    description: 'Division operator',
    examples: ['/']
  },
  [TokenType.AMPERSAND]: {
    name: 'AMPERSAND',
    pattern: /&/,
    textMateScope: 'keyword.operator.string.formula',
    description: 'String concatenation operator',
    examples: ['&']
  },
  [TokenType.GT]: {
    name: 'GT',
    pattern: />/,
    textMateScope: 'keyword.operator.comparison.formula',
    description: 'Greater than comparison operator',
    examples: ['>']
  },
  [TokenType.GTE]: {
    name: 'GTE',
    pattern: />=/,
    textMateScope: 'keyword.operator.comparison.formula',
    description: 'Greater than or equal comparison operator',
    examples: ['>=']
  },
  [TokenType.LT]: {
    name: 'LT',
    pattern: /</,
    textMateScope: 'keyword.operator.comparison.formula',
    description: 'Less than comparison operator',
    examples: ['<']
  },
  [TokenType.LTE]: {
    name: 'LTE',
    pattern: /<=/,
    textMateScope: 'keyword.operator.comparison.formula',
    description: 'Less than or equal comparison operator',
    examples: ['<=']
  },
  [TokenType.EQ]: {
    name: 'EQ',
    pattern: /=/,
    textMateScope: 'keyword.operator.comparison.formula',
    description: 'Equality comparison operator',
    examples: ['=']
  },
  [TokenType.NEQ]: {
    name: 'NEQ',
    pattern: /(!= | <>)/,
    textMateScope: 'keyword.operator.comparison.formula',
    description: 'Not equal comparison operator',
    examples: ['!=', '<>']
  },
  [TokenType.LPAREN]: {
    name: 'LPAREN',
    pattern: /\(/,
    textMateScope: 'punctuation.definition.parameters.begin.formula',
    description: 'Left parenthesis for grouping and function calls',
    examples: ['(']
  },
  [TokenType.RPAREN]: {
    name: 'RPAREN',
    pattern: /\)/,
    textMateScope: 'punctuation.definition.parameters.end.formula',
    description: 'Right parenthesis for grouping and function calls',
    examples: [')']
  },
  [TokenType.COMMA]: {
    name: 'COMMA',
    pattern: /,/,
    textMateScope: 'punctuation.separator.parameters.formula',
    description: 'Comma separator for function arguments',
    examples: [',']
  },
  [TokenType.DOT]: {
    name: 'DOT',
    pattern: /\./,
    textMateScope: 'punctuation.accessor.formula',
    description: 'Dot operator for relationship field access',
    examples: ['.']
  }
};

// Function names for syntax highlighting (extracted from function metadata)
const BUILT_IN_FUNCTIONS = [
  // Math functions
  'ROUND', 'ABS', 'CEIL', 'CEILING', 'FLOOR', 'POWER', 'SQRT', 'LOG', 'LOG10', 'EXP',
  'SIN', 'COS', 'TAN', 'RANDOM', 'MIN', 'MAX', 'MOD', 'SIGN',
  
  // String functions  
  'LENGTH', 'LEN', 'UPPER', 'LOWER', 'TRIM', 'LEFT', 'RIGHT', 'MID', 'SUBSTR',
  'CONCAT', 'REPLACE', 'SUBSTITUTE', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH',
  
  // Date functions
  'NOW', 'TODAY', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND', 'WEEKDAY',
  'ADDMONTHS', 'ADDDAYS', 'DATEDIF', 'DATE_ADD', 'DATE_DIFF', 'FORMAT_DATE',
  
  // Logical functions
  'IF', 'AND', 'OR', 'NOT',
  
  // Null handling functions
  'ISNULL', 'ISBLANK', 'NULLVALUE', 'COALESCE',
  
  // Aggregate functions
  'COUNT', 'SUM', 'AVG', 'MIN_AGG', 'MAX_AGG', 'STRING_AGG', 'STRING_AGG_DISTINCT',
  'SUM_AGG', 'COUNT_AGG', 'AVG_AGG', 'AND_AGG', 'OR_AGG',
  
  // Core functions
  'ME', 'STRING', 'DATE', 'EVAL'
];

// Boolean and null literals
const LITERALS = [LITERAL_VALUE.TRUE, LITERAL_VALUE.FALSE, LITERAL_VALUE.NULL];

/**
 * Check if an identifier is a built-in function
 * @param {string} identifier - The identifier to check
 * @returns {boolean} True if it's a built-in function
 */
function isBuiltInFunction(identifier) {
  return BUILT_IN_FUNCTIONS.includes(identifier.toUpperCase());
}

/**
 * Check if an identifier is a boolean or null literal
 * @param {string} identifier - The identifier to check
 * @returns {boolean} True if it's a literal
 */
function isLiteral(identifier) {
  return LITERALS.includes(identifier.toUpperCase());
}

/**
 * Get all token definitions for programmatic access
 * @returns {Object} Token metadata mapped by token type
 */
function getTokenDefinitions() {
  return TOKEN_METADATA;
}

/**
 * Get all built-in function names
 * @returns {Array<string>} Array of function names
 */  
function getFunctionNames() {
  return [...BUILT_IN_FUNCTIONS];
}

/**
 * Get all literal values
 * @returns {Array<string>} Array of literal values
 */
function getLiterals() {
  return [...LITERALS];
}

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
      case LITERAL_VALUE.TRUE:
        return { type: TokenType.IDENTIFIER, value: LITERAL_VALUE.TRUE, position: startPos }; // Treat as special identifier for now
      case LITERAL_VALUE.FALSE:
        return { type: TokenType.IDENTIFIER, value: LITERAL_VALUE.FALSE, position: startPos }; // Treat as special identifier for now
      case LITERAL_VALUE.NULL:
        return { type: TokenType.IDENTIFIER, value: LITERAL_VALUE.NULL, position: startPos }; // Treat as special identifier for now
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
export { 
  Lexer, 
  TokenType, 
  TokenValue, 
  TOKEN_METADATA,
  BUILT_IN_FUNCTIONS,
  LITERALS,
  isBuiltInFunction,
  isLiteral,
  getTokenDefinitions,
  getFunctionNames,
  getLiterals
};