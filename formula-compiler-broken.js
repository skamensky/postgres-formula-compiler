/**
 * JavaScript-based Excel-like Formula Compiler
 * Converts formulas to PostgreSQL SQL without external dependencies
   */

/**
 * Map PostgreSQL data types to formula compiler types
 */
function mapPostgresType(pgType) {
  // Numeric types
  if (['numeric', 'integer', 'bigint', 'smallint', 'decimal', 'real', 'double precision'].includes(pgType)) {
    return 'number';
  }
  
  // Date/timestamp types  
  if (['timestamp', 'timestamp with time zone', 'timestamptz', 'date'].includes(pgType)) {
    return 'date';
  }
  
  // Boolean type
  if (pgType === 'boolean') {
    return 'boolean';
  }
  
  // Everything else (text, varchar, etc.) as string
  return 'string';
}

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

// AST Node types
const NodeType = {
  BINARY_OP: 'BINARY_OP',
  UNARY_OP: 'UNARY_OP',
  NUMBER: 'NUMBER',
  IDENTIFIER: 'IDENTIFIER',
  FUNCTION_CALL: 'FUNCTION_CALL',
  DATE_LITERAL: 'DATE_LITERAL',
  STRING_LITERAL: 'STRING_LITERAL',
  BOOLEAN_LITERAL: 'BOOLEAN_LITERAL',
  NULL_LITERAL: 'NULL_LITERAL',
  RELATIONSHIP_REF: 'RELATIONSHIP_REF'
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

/**
 * Parser - converts tokens into AST
 */
class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
  }

  error(message) {
    throw {
      message: `Parser error: ${message}`,
      position: this.currentToken.position
    };
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      this.error(`Expected ${tokenType}, got ${this.currentToken.type}`);
    }
  }

  factor() {
    const token = this.currentToken;

    if (token.type === TokenType.EOF) {
      this.error('Unexpected token: EOF');
    }

    if (token.type === TokenType.PLUS) {
      this.error('Unary plus operator is not supported', token.position);
    }

    if (token.type === TokenType.MINUS) {
      this.eat(TokenType.MINUS);
      const operand = this.factor();
      
      // Check for consecutive unary operators (like - -)
      if (operand.type === NodeType.UNARY_OP) {
        this.error('Consecutive operators are not allowed (use parentheses for clarity)', token.position);
      }
      
      return {
        type: NodeType.UNARY_OP,
        op: '-',
        operand: operand,
        position: token.position
      };
    }

    if (token.type === TokenType.NUMBER) {
      this.eat(TokenType.NUMBER);
      return {
        type: NodeType.NUMBER,
        value: token.value,
        position: token.position
      };
    }

    if (token.type === TokenType.IDENTIFIER) {
      const identifier = token.value;
      const position = token.position;
      this.eat(TokenType.IDENTIFIER);
      
      // Check for relationship reference: identifier_rel.field
      if (identifier.endsWith('_REL') && this.currentToken.type === TokenType.DOT) {
        this.eat(TokenType.DOT);
        const fieldToken = this.currentToken;
        this.eat(TokenType.IDENTIFIER);
        
        return {
          type: NodeType.RELATIONSHIP_REF,
          relationName: identifier.slice(0, -4).toLowerCase(), // Remove '_REL' and normalize
          fieldName: fieldToken.value,
          position: position
        };
      }
      
      if (this.currentToken.type === TokenType.LPAREN) {
        // Function call
        this.eat(TokenType.LPAREN);
        const args = [];
        
        if (this.currentToken.type !== TokenType.RPAREN) {
          args.push(this.comparison());
          
          while (this.currentToken.type === TokenType.COMMA) {
            this.eat(TokenType.COMMA);
            args.push(this.comparison());
          }
        }
        
        this.eat(TokenType.RPAREN);
        
        return {
          type: NodeType.FUNCTION_CALL,
          name: identifier,
          args: args,
          position: position
        };
      } else {
        // Special identifiers: TRUE, FALSE, NULL
        if (identifier === 'TRUE' || identifier === 'FALSE') {
          return {
            type: NodeType.BOOLEAN_LITERAL,
            value: identifier,
            position: position
          };
        } else if (identifier === 'NULL') {
          return {
            type: NodeType.NULL_LITERAL,
            value: 'NULL',
            position: position
          };
        } else {
          // Regular identifier (column reference)
          return {
            type: NodeType.IDENTIFIER,
            value: identifier,
            position: position
          };
        }
      }
    }

    if (token.type === TokenType.STRING) {
      this.eat(TokenType.STRING);
      return {
        type: NodeType.STRING_LITERAL,
        value: token.value,
        position: token.position
      };
    }

    if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN);
      const node = this.comparison();
      this.eat(TokenType.RPAREN);
      return node;
    }

    this.error(`Unexpected token: ${token.type}`);
  }

  term() {
    let node = this.factor();

    while (this.currentToken.type === TokenType.MULTIPLY || 
           this.currentToken.type === TokenType.DIVIDE) {
      const token = this.currentToken;
      
      if (token.type === TokenType.MULTIPLY) {
        this.eat(TokenType.MULTIPLY);
      } else if (token.type === TokenType.DIVIDE) {
        this.eat(TokenType.DIVIDE);
      }

      // Check if the next token is also an operator (consecutive operators)
      if (this.currentToken.type === TokenType.MULTIPLY || 
          this.currentToken.type === TokenType.DIVIDE ||
          this.currentToken.type === TokenType.PLUS || 
          this.currentToken.type === TokenType.MINUS ||
          this.currentToken.type === TokenType.AMPERSAND) {
        this.error('Consecutive operators are not allowed (use parentheses for clarity)', this.currentToken.position);
      }

      node = {
        type: NodeType.BINARY_OP,
        left: node,
        op: token.value,
        right: this.factor(),
        position: token.position
      };
    }

    return node;
  }

  comparison() {
    let node = this.expr();

    while (this.currentToken.type === TokenType.GT ||
           this.currentToken.type === TokenType.GTE ||
           this.currentToken.type === TokenType.LT ||
           this.currentToken.type === TokenType.LTE ||
           this.currentToken.type === TokenType.EQ ||
           this.currentToken.type === TokenType.NEQ) {
      const token = this.currentToken;
      this.eat(token.type);

      node = {
        type: NodeType.BINARY_OP,
        left: node,
        op: token.value,
        right: this.expr(),
        position: token.position
      };
    }

    return node;
  }

  expr() {
    let node = this.term();

    while (this.currentToken.type === TokenType.PLUS || 
           this.currentToken.type === TokenType.MINUS ||
           this.currentToken.type === TokenType.AMPERSAND) {
      const token = this.currentToken;
      
      if (token.type === TokenType.PLUS) {
        this.eat(TokenType.PLUS);
      } else if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS);
      } else if (token.type === TokenType.AMPERSAND) {
        this.eat(TokenType.AMPERSAND);
      }

      // Check if the next token is also an operator (consecutive operators)
      if (this.currentToken.type === TokenType.PLUS || 
          this.currentToken.type === TokenType.MINUS ||
          this.currentToken.type === TokenType.AMPERSAND ||
          this.currentToken.type === TokenType.MULTIPLY || 
          this.currentToken.type === TokenType.DIVIDE) {
        this.error('Consecutive operators are not allowed (use parentheses for clarity)', this.currentToken.position);
      }

      node = {
        type: NodeType.BINARY_OP,
        left: node,
        op: token.value,
        right: this.term(),
        position: token.position
      };
    }

    return node;
  }

  parse() {
    const node = this.comparison();
    
    if (this.currentToken.type !== TokenType.EOF) {
      this.error('Unexpected token after expression');
    }

    return node;
  }
}

/**
 * Intent-based Formula Compiler
 * Generates semantic intent representations instead of SQL
 * 
 * NOTE: Assumes no special characters in table/column names for semantic ID generation
 * Uses hierarchical semantic IDs to maintain context across compilations
 */

/**
 * @typedef {Object} ExpressionIntent
 * @property {string} type - Expression type (maps to NodeType)
 * @property {string} semanticId - Hierarchical human-readable identifier
 * @property {Array<string>} dependentJoins - Required join semanticIds
 * @property {string} returnType - Result type ('string'|'number'|'boolean'|'date'|'null')
 * @property {string} compilationContext - Context where this was compiled ('main'|'agg:...')
 * @property {*} value - Type-specific value
 * @property {Array<ExpressionIntent>} [children] - Sub-expressions for complex types
 */

/**
 * @typedef {Object} JoinIntent
 * @property {'direct_relationship'|'inverse_relationship'} relationshipType
 * @property {string} sourceTable - Table joining FROM
 * @property {string} targetTable - Table joining TO
 * @property {string} joinField - Field used for join
 * @property {string} semanticId - Human-readable unique identifier
 * @property {string} compilationContext - Context where this join is needed
 */

/**
 * @typedef {Object} AggregateIntent
 * @property {string} semanticId - Hierarchical identifier
 * @property {string} aggregateFunction - Function name (STRING_AGG, SUM, etc.)
 * @property {string} sourceRelation - Inverse relationship semantic ID
 * @property {ExpressionIntent} expression - Expression to aggregate
 * @property {ExpressionIntent} [delimiter] - Delimiter for STRING_AGG
 * @property {Array<JoinIntent>} internalJoins - Joins needed within subquery
 * @property {string} returnType - Result type of aggregate
 */

/**
 * @typedef {Object} CompilationResult
 * @property {ExpressionIntent} expression - Root expression intent
 * @property {Array<JoinIntent>} joinIntents - Required joins
 * @property {Array<AggregateIntent>} aggregateIntents - Required aggregates
 * @property {string} returnType - Overall result type
 */

class Compiler {
  constructor(context) {
    this.context = context;
    this.tableName = context.tableName;
    this.columnList = {};
    this.joinIntents = new Map(); // semanticId -> JoinIntent
    this.aggregateIntents = new Map(); // semanticId -> AggregateIntent
    this.compilationContext = 'main'; // Track current compilation context
    this.idCounter = 1; // For generating unique IDs
    
    // Normalize column names to uppercase for case-insensitive lookup
    for (const [name, type] of Object.entries(context.columnList)) {
      this.columnList[name.toUpperCase()] = type;
    }
  }

  error(message, position) {
    throw {
      message: `Compiler error: ${message}`,
      position: position
    };
  }

  getColumnType(columnName) {
    const upperName = columnName.toUpperCase();
    if (!(upperName in this.columnList)) {
      return null;
    }
    return this.columnList[upperName];
  }

  /**
   * Generate hierarchical semantic ID
   * @param {string} type - Expression type
   * @param {string} details - Type-specific details
   * @param {Array<string>} [childIds] - Child semantic IDs for hierarchy
   * @returns {string} Hierarchical semantic ID
   */
  generateSemanticId(type, details, childIds = []) {
    if (childIds.length === 0) {
      return `${type}:${details}@${this.compilationContext}`;
    }
    return `${type}:${details}[${childIds.join(',')}]@${this.compilationContext}`;
  }

  compile(node) {
    switch (node.type) {
      case NodeType.NUMBER:
        return {
          type: 'NUMBER',
          semanticId: this.generateSemanticId('number', node.value.toString()),
          dependentJoins: [],
          returnType: 'number',
          compilationContext: this.compilationContext,
          value: node.value
        };

      case NodeType.IDENTIFIER:
        return this.compileIdentifier(node);

      case NodeType.BOOLEAN_LITERAL:
        return {
          type: 'BOOLEAN_LITERAL',
          semanticId: this.generateSemanticId('boolean', node.value),
          dependentJoins: [],
          returnType: 'boolean',
          compilationContext: this.compilationContext,
          value: node.value
        };

      case NodeType.NULL_LITERAL:
        return {
          type: 'NULL_LITERAL',
          semanticId: this.generateSemanticId('null', 'NULL'),
          dependentJoins: [],
          returnType: 'null',
          compilationContext: this.compilationContext,
          value: null
        };

      case NodeType.STRING_LITERAL:
        return {
          type: 'STRING_LITERAL',
          semanticId: this.generateSemanticId('string', `'${node.value}'`),
          dependentJoins: [],
          returnType: 'string',
          compilationContext: this.compilationContext,
          value: node.value
        };

      case NodeType.DATE_LITERAL:
        return {
          type: 'DATE_LITERAL',
          semanticId: this.generateSemanticId('date', node.value),
          dependentJoins: [],
          returnType: 'date',
          compilationContext: this.compilationContext,
          value: node.value
        };

      case NodeType.UNARY_OP:
        return this.compileUnaryOp(node);

      case NodeType.BINARY_OP:
        return this.compileBinaryOp(node);

      case NodeType.FUNCTION_CALL:
        return this.compileFunction(node);

      case NodeType.RELATIONSHIP_REF:
        return this.compileRelationshipRef(node);

      default:
        this.error(`Unknown node type: ${node.type}`, node.position);
    }
  }

  compileIdentifier(node) {
    const columnType = this.getColumnType(node.value);
    if (columnType === null) {
      const availableColumns = Object.keys(this.columnList).slice(0, 10);
      const suggestionText = availableColumns.length > 0 
        ? ` Available columns: ${availableColumns.join(', ')}${Object.keys(this.columnList).length > 10 ? ' (and ' + (Object.keys(this.columnList).length - 10) + ' more)' : ''}`
        : '';
      this.error(`Unknown column: ${node.value}.${suggestionText}`, node.position);
    }

        return {
      type: 'IDENTIFIER',
      semanticId: this.generateSemanticId('column', `${this.tableName}.${node.value.toLowerCase()}`),
      dependentJoins: [],
      returnType: columnType,
      compilationContext: this.compilationContext,
      value: node.value.toLowerCase()
    };
  }

  compileUnaryOp(node) {
    const operand = this.compile(node.operand);
    
    if (operand.returnType !== 'number') {
      this.error(`Unary ${node.op} requires numeric operand`, node.position);
    }

        return {
      type: 'UNARY_OP',
      semanticId: this.generateSemanticId('unary_op', node.op, [operand.semanticId]),
      dependentJoins: operand.dependentJoins,
      returnType: 'number',
      compilationContext: this.compilationContext,
      value: { op: node.op },
      children: [operand]
    };
  }

  compileBinaryOp(node) {
    const left = this.compile(node.left);
    const right = this.compile(node.right);
    
    // Collect dependent joins from both sides
    const dependentJoins = [...left.dependentJoins, ...right.dependentJoins];
    
    // Type checking and result type determination
    let resultType;
    if (['+', '-', '*', '/'].includes(node.op)) {
      // Handle date arithmetic
      if (node.op === '+') {
        if ((left.returnType === 'date' && right.returnType === 'number') || 
            (left.returnType === 'number' && right.returnType === 'date')) {
          resultType = 'string'; // PostgreSQL returns interval as string when adding days
        } else if (left.returnType === 'date' && right.returnType === 'date') {
          this.error(`Invalid operand types for +: date and date`, node.position);
        } else if (left.returnType === 'number' && right.returnType === 'number') {
          resultType = 'number';
        } else {
          this.error(`Invalid operand types for +: ${left.returnType} and ${right.returnType}`, node.position);
        }
      } else if (node.op === '-') {
        if (left.returnType === 'date' && right.returnType === 'number') {
          resultType = 'string'; // PostgreSQL returns interval as string when subtracting days
        } else if (left.returnType === 'date' && right.returnType === 'date') {
          resultType = 'number'; // Date difference returns number of days
        } else if (left.returnType === 'number' && right.returnType === 'number') {
          resultType = 'number';
        } else if (left.returnType === 'date' && right.returnType !== 'number' && right.returnType !== 'date') {
          this.error(`Unary - requires numeric operand`, node.position);
        } else {
          this.error(`Invalid operand types for -: ${left.returnType} and ${right.returnType}`, node.position);
        }
      } else if (node.op === '*' || node.op === '/') {
        if (left.returnType !== 'number' || right.returnType !== 'number') {
          this.error(`Invalid operand types for ${node.op}: ${left.returnType} and ${right.returnType}`, node.position);
        }
        resultType = 'number';
      }
    } else if (node.op === '&') {
      if (left.returnType !== 'string' || right.returnType !== 'string') {
        this.error(`String concatenation operator & requires both operands to be strings, got ${left.returnType} and ${right.returnType}. Use STRING() function to cast values to strings.`, node.position);
      }
      resultType = 'string';
    } else if (['>', '>=', '<', '<=', '=', '!=', '<>'].includes(node.op)) {
      // Comparison operators
      if (left.returnType !== right.returnType && left.returnType !== 'null' && right.returnType !== 'null') {
        this.error(`Cannot compare ${left.returnType} and ${right.returnType}`, node.position);
      }
      resultType = 'boolean';
    } else {
      this.error(`Unknown binary operator: ${node.op}`, node.position);
        }
        
        return {
      type: 'BINARY_OP',
      semanticId: this.generateSemanticId('binary_op', node.op, [left.semanticId, right.semanticId]),
      dependentJoins: dependentJoins,
      returnType: resultType,
      compilationContext: this.compilationContext,
      value: { op: node.op },
      children: [left, right]
    };
  }

  compileRelationshipRef(node) {
    // Check if relationship info exists
    if (!this.context.relationshipInfo || !this.context.relationshipInfo[node.relationName]) {
      const availableRelationships = Object.keys(this.context.relationshipInfo || {}).slice(0, 10);
      const suggestionText = availableRelationships.length > 0 
        ? ` Available relationships: ${availableRelationships.join(', ')}`
        : '';
      this.error(`Unknown relationship: ${node.relationName}.${suggestionText}`, node.position);
    }
    
    const relInfo = this.context.relationshipInfo[node.relationName];
    
    // Check if field exists in related table
    const fieldType = relInfo.columnList[node.fieldName.toLowerCase()];
    if (!fieldType) {
      const availableFields = Object.keys(relInfo.columnList).slice(0, 10);
      const suggestionText = availableFields.length > 0 
        ? ` Available fields: ${availableFields.join(', ')}`
        : '';
      this.error(`Unknown field ${node.fieldName} in relationship ${node.relationName}.${suggestionText}`, node.position);
    }
    
    // Generate join intent
    const joinSemanticId = this.generateJoinSemanticId('direct_relationship', this.tableName, node.relationName, relInfo.joinColumn);
    
    // Track join intent (deduplicated by semanticId)
    if (!this.joinIntents.has(joinSemanticId)) {
      this.joinIntents.set(joinSemanticId, {
        relationshipType: 'direct_relationship',
        sourceTable: this.tableName,
        targetTable: node.relationName,
        joinField: relInfo.joinColumn,
        semanticId: joinSemanticId,
        compilationContext: this.compilationContext
      });
        }
        
        return {
      type: 'RELATIONSHIP_REF',
      semanticId: this.generateSemanticId('relationship_ref', `${node.relationName}.${node.fieldName}`, [joinSemanticId]),
      dependentJoins: [joinSemanticId],
      returnType: fieldType,
      compilationContext: this.compilationContext,
      value: { relationName: node.relationName, fieldName: node.fieldName.toLowerCase() }
    };
  }

  /**
   * Generate semantic ID for join intent
   */
  generateJoinSemanticId(relationshipType, sourceTable, targetTable, joinField) {
    if (relationshipType === 'direct_relationship') {
      return `direct:${sourceTable}→${targetTable}[${joinField}]@${this.compilationContext}`;
    } else {
      return `inverse:${sourceTable}←${targetTable}[${joinField}]@${this.compilationContext}`;
    }
  }

  compileFunction(node) {
    const funcName = node.name;
    
    // Handle aggregate functions separately
    if (['STRING_AGG', 'STRING_AGG_DISTINCT', 'SUM_AGG', 'COUNT_AGG', 'AVG_AGG', 'MIN_AGG', 'MAX_AGG', 'AND_AGG', 'OR_AGG'].includes(funcName)) {
      return this.compileAggregateFunction(node);
    }
    
    // Handle regular functions
    switch (funcName) {
      case 'TODAY':
        if (node.args.length !== 0) {
          this.error('TODAY() takes no arguments', node.position);
        }
        return {
          type: 'FUNCTION_CALL',
          semanticId: this.generateSemanticId('function', 'TODAY'),
          dependentJoins: [],
          returnType: 'date',
          compilationContext: this.compilationContext,
          value: { name: 'TODAY', args: [] }
        };

      case 'ME':
        if (node.args.length !== 0) {
          this.error('ME() takes no arguments', node.position);
        }
        return {
          type: 'FUNCTION_CALL',
          semanticId: this.generateSemanticId('function', 'ME'),
          dependentJoins: [],
          returnType: 'string',
          compilationContext: this.compilationContext,
/**
 * JavaScript-based Excel-like Formula Compiler
 * Converts formulas to PostgreSQL SQL without external dependencies
   */

/**
 * Map PostgreSQL data types to formula compiler types
 */
function mapPostgresType(pgType) {
  // Numeric types
  if (['numeric', 'integer', 'bigint', 'smallint', 'decimal', 'real', 'double precision'].includes(pgType)) {
    return 'number';
  }
  
  // Date/timestamp types  
  if (['timestamp', 'timestamp with time zone', 'timestamptz', 'date'].includes(pgType)) {
    return 'date';
  }
  
  // Boolean type
  if (pgType === 'boolean') {
    return 'boolean';
  }
  
  // Everything else (text, varchar, etc.) as string
  return 'string';
}

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

// AST Node types
const NodeType = {
  BINARY_OP: 'BINARY_OP',
  UNARY_OP: 'UNARY_OP',
  NUMBER: 'NUMBER',
  IDENTIFIER: 'IDENTIFIER',
  FUNCTION_CALL: 'FUNCTION_CALL',
  DATE_LITERAL: 'DATE_LITERAL',
  STRING_LITERAL: 'STRING_LITERAL',
  BOOLEAN_LITERAL: 'BOOLEAN_LITERAL',
  NULL_LITERAL: 'NULL_LITERAL',
  RELATIONSHIP_REF: 'RELATIONSHIP_REF'
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

/**
 * Parser - converts tokens into AST
 */
class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
  }

  error(message) {
    throw {
      message: `Parser error: ${message}`,
      position: this.currentToken.position
    };
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      this.error(`Expected ${tokenType}, got ${this.currentToken.type}`);
    }
  }

  factor() {
    const token = this.currentToken;

    if (token.type === TokenType.EOF) {
      this.error('Unexpected token: EOF');
    }

    if (token.type === TokenType.PLUS) {
      this.error('Unary plus operator is not supported', token.position);
    }

    if (token.type === TokenType.MINUS) {
      this.eat(TokenType.MINUS);
      const operand = this.factor();
      
      // Check for consecutive unary operators (like - -)
      if (operand.type === NodeType.UNARY_OP) {
        this.error('Consecutive operators are not allowed (use parentheses for clarity)', token.position);
      }
      
      return {
        type: NodeType.UNARY_OP,
        op: '-',
        operand: operand,
        position: token.position
      };
    }

    if (token.type === TokenType.NUMBER) {
      this.eat(TokenType.NUMBER);
      return {
        type: NodeType.NUMBER,
        value: token.value,
        position: token.position
      };
    }

    if (token.type === TokenType.IDENTIFIER) {
      const identifier = token.value;
      const position = token.position;
      this.eat(TokenType.IDENTIFIER);
      
      // Check for relationship reference: identifier_rel.field
      if (identifier.endsWith('_REL') && this.currentToken.type === TokenType.DOT) {
        this.eat(TokenType.DOT);
        const fieldToken = this.currentToken;
        this.eat(TokenType.IDENTIFIER);
        
        return {
          type: NodeType.RELATIONSHIP_REF,
          relationName: identifier.slice(0, -4).toLowerCase(), // Remove '_REL' and normalize
          fieldName: fieldToken.value,
          position: position
        };
      }
      
      if (this.currentToken.type === TokenType.LPAREN) {
        // Function call
        this.eat(TokenType.LPAREN);
        const args = [];
        
        if (this.currentToken.type !== TokenType.RPAREN) {
          args.push(this.comparison());
          
          while (this.currentToken.type === TokenType.COMMA) {
            this.eat(TokenType.COMMA);
            args.push(this.comparison());
          }
        }
        
        this.eat(TokenType.RPAREN);
        
        return {
          type: NodeType.FUNCTION_CALL,
          name: identifier,
          args: args,
          position: position
        };
      } else {
        // Special identifiers: TRUE, FALSE, NULL
        if (identifier === 'TRUE' || identifier === 'FALSE') {
          return {
            type: NodeType.BOOLEAN_LITERAL,
            value: identifier,
            position: position
          };
        } else if (identifier === 'NULL') {
          return {
            type: NodeType.NULL_LITERAL,
            value: 'NULL',
            position: position
          };
        } else {
          // Regular identifier (column reference)
          return {
            type: NodeType.IDENTIFIER,
            value: identifier,
            position: position
          };
        }
      }
    }

    if (token.type === TokenType.STRING) {
      this.eat(TokenType.STRING);
      return {
        type: NodeType.STRING_LITERAL,
        value: token.value,
        position: token.position
      };
    }

    if (token.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN);
      const node = this.comparison();
      this.eat(TokenType.RPAREN);
      return node;
    }

    this.error(`Unexpected token: ${token.type}`);
  }

  term() {
    let node = this.factor();

    while (this.currentToken.type === TokenType.MULTIPLY || 
           this.currentToken.type === TokenType.DIVIDE) {
      const token = this.currentToken;
      
      if (token.type === TokenType.MULTIPLY) {
        this.eat(TokenType.MULTIPLY);
      } else if (token.type === TokenType.DIVIDE) {
        this.eat(TokenType.DIVIDE);
      }

      // Check if the next token is also an operator (consecutive operators)
      if (this.currentToken.type === TokenType.MULTIPLY || 
          this.currentToken.type === TokenType.DIVIDE ||
          this.currentToken.type === TokenType.PLUS || 
          this.currentToken.type === TokenType.MINUS ||
          this.currentToken.type === TokenType.AMPERSAND) {
        this.error('Consecutive operators are not allowed (use parentheses for clarity)', this.currentToken.position);
      }

      node = {
        type: NodeType.BINARY_OP,
        left: node,
        op: token.value,
        right: this.factor(),
        position: token.position
      };
    }

    return node;
  }

  comparison() {
    let node = this.expr();

    while (this.currentToken.type === TokenType.GT ||
           this.currentToken.type === TokenType.GTE ||
           this.currentToken.type === TokenType.LT ||
           this.currentToken.type === TokenType.LTE ||
           this.currentToken.type === TokenType.EQ ||
           this.currentToken.type === TokenType.NEQ) {
      const token = this.currentToken;
      this.eat(token.type);

      node = {
        type: NodeType.BINARY_OP,
        left: node,
        op: token.value,
        right: this.expr(),
        position: token.position
      };
    }

    return node;
  }

  expr() {
    let node = this.term();

    while (this.currentToken.type === TokenType.PLUS || 
           this.currentToken.type === TokenType.MINUS ||
           this.currentToken.type === TokenType.AMPERSAND) {
      const token = this.currentToken;
      
      if (token.type === TokenType.PLUS) {
        this.eat(TokenType.PLUS);
      } else if (token.type === TokenType.MINUS) {
        this.eat(TokenType.MINUS);
      } else if (token.type === TokenType.AMPERSAND) {
        this.eat(TokenType.AMPERSAND);
      }

      // Check if the next token is also an operator (consecutive operators)
      if (this.currentToken.type === TokenType.PLUS || 
          this.currentToken.type === TokenType.MINUS ||
          this.currentToken.type === TokenType.AMPERSAND ||
          this.currentToken.type === TokenType.MULTIPLY || 
          this.currentToken.type === TokenType.DIVIDE) {
        this.error('Consecutive operators are not allowed (use parentheses for clarity)', this.currentToken.position);
      }

      node = {
        type: NodeType.BINARY_OP,
        left: node,
        op: token.value,
        right: this.term(),
        position: token.position
      };
    }

    return node;
  }

  parse() {
    const node = this.comparison();
    
    if (this.currentToken.type !== TokenType.EOF) {
      this.error('Unexpected token after expression');
    }

    return node;
  }
}

/**
 * Intent-based Formula Compiler
 * Generates semantic intent representations instead of SQL
 * 
 * NOTE: Assumes no special characters in table/column names for semantic ID generation
 * Uses hierarchical semantic IDs to maintain context across compilations
 */

/**
 * @typedef {Object} ExpressionIntent
 * @property {string} type - Expression type (maps to NodeType)
 * @property {string} semanticId - Hierarchical human-readable identifier
 * @property {Array<string>} dependentJoins - Required join semanticIds
 * @property {string} returnType - Result type ('string'|'number'|'boolean'|'date'|'null')
 * @property {string} compilationContext - Context where this was compiled ('main'|'agg:...')
 * @property {*} value - Type-specific value
 * @property {Array<ExpressionIntent>} [children] - Sub-expressions for complex types
 */

/**
 * @typedef {Object} JoinIntent
 * @property {'direct_relationship'|'inverse_relationship'} relationshipType
 * @property {string} sourceTable - Table joining FROM
 * @property {string} targetTable - Table joining TO
 * @property {string} joinField - Field used for join
 * @property {string} semanticId - Human-readable unique identifier
 * @property {string} compilationContext - Context where this join is needed
 */

/**
 * @typedef {Object} AggregateIntent
 * @property {string} semanticId - Hierarchical identifier
 * @property {string} aggregateFunction - Function name (STRING_AGG, SUM, etc.)
 * @property {string} sourceRelation - Inverse relationship semantic ID
 * @property {ExpressionIntent} expression - Expression to aggregate
 * @property {ExpressionIntent} [delimiter] - Delimiter for STRING_AGG
 * @property {Array<JoinIntent>} internalJoins - Joins needed within subquery
 * @property {string} returnType - Result type of aggregate
 */

/**
 * @typedef {Object} CompilationResult
 * @property {ExpressionIntent} expression - Root expression intent
 * @property {Array<JoinIntent>} joinIntents - Required joins
 * @property {Array<AggregateIntent>} aggregateIntents - Required aggregates
 * @property {string} returnType - Overall result type
 */

class Compiler {
  constructor(context) {
    this.context = context;
    this.tableName = context.tableName;
    this.columnList = {};
    this.joinIntents = new Map(); // semanticId -> JoinIntent
    this.aggregateIntents = new Map(); // semanticId -> AggregateIntent
    this.compilationContext = 'main'; // Track current compilation context
    this.idCounter = 1; // For generating unique IDs
    
    // Normalize column names to uppercase for case-insensitive lookup
    for (const [name, type] of Object.entries(context.columnList)) {
      this.columnList[name.toUpperCase()] = type;
    }
  }

  error(message, position) {
    throw {
      message: `Compiler error: ${message}`,
      position: position
    };
  }

  getColumnType(columnName) {
    const upperName = columnName.toUpperCase();
    if (!(upperName in this.columnList)) {
      return null;
    }
    return this.columnList[upperName];
  }

  /**
   * Generate hierarchical semantic ID
   * @param {string} type - Expression type
   * @param {string} details - Type-specific details
   * @param {Array<string>} [childIds] - Child semantic IDs for hierarchy
   * @returns {string} Hierarchical semantic ID
   */
  generateSemanticId(type, details, childIds = []) {
    if (childIds.length === 0) {
      return `${type}:${details}@${this.compilationContext}`;
    }
    return `${type}:${details}[${childIds.join(',')}]@${this.compilationContext}`;
  }

  compile(node) {
    switch (node.type) {
      case NodeType.NUMBER:
        return {
          type: 'NUMBER',
          semanticId: this.generateSemanticId('number', node.value.toString()),
          dependentJoins: [],
          returnType: 'number',
          compilationContext: this.compilationContext,
          value: node.value
        };

      case NodeType.IDENTIFIER:
        return this.compileIdentifier(node);

      case NodeType.BOOLEAN_LITERAL:
        return {
          type: 'BOOLEAN_LITERAL',
          semanticId: this.generateSemanticId('boolean', node.value),
          dependentJoins: [],
          returnType: 'boolean',
          compilationContext: this.compilationContext,
          value: node.value
        };

      case NodeType.NULL_LITERAL:
        return {
          type: 'NULL_LITERAL',
          semanticId: this.generateSemanticId('null', 'NULL'),
          dependentJoins: [],
          returnType: 'null',
          compilationContext: this.compilationContext,
          value: null
        };

      case NodeType.STRING_LITERAL:
        return {
          type: 'STRING_LITERAL',
          semanticId: this.generateSemanticId('string', `'${node.value}'`),
          dependentJoins: [],
          returnType: 'string',
          compilationContext: this.compilationContext,
          value: node.value
        };

      case NodeType.DATE_LITERAL:
        return {
          type: 'DATE_LITERAL',
          semanticId: this.generateSemanticId('date', node.value),
          dependentJoins: [],
          returnType: 'date',
          compilationContext: this.compilationContext,
          value: node.value
        };

      case NodeType.UNARY_OP:
        return this.compileUnaryOp(node);

      case NodeType.BINARY_OP:
        return this.compileBinaryOp(node);

      case NodeType.FUNCTION_CALL:
        return this.compileFunction(node);

      case NodeType.RELATIONSHIP_REF:
        return this.compileRelationshipRef(node);

      default:
        this.error(`Unknown node type: ${node.type}`, node.position);
    }
  }

  compileIdentifier(node) {
    const columnType = this.getColumnType(node.value);
    if (columnType === null) {
      const availableColumns = Object.keys(this.columnList).slice(0, 10);
      const suggestionText = availableColumns.length > 0 
        ? ` Available columns: ${availableColumns.join(', ')}${Object.keys(this.columnList).length > 10 ? ' (and ' + (Object.keys(this.columnList).length - 10) + ' more)' : ''}`
        : '';
      this.error(`Unknown column: ${node.value}.${suggestionText}`, node.position);
    }

        return {
      type: 'IDENTIFIER',
      semanticId: this.generateSemanticId('column', `${this.tableName}.${node.value.toLowerCase()}`),
      dependentJoins: [],
      returnType: columnType,
      compilationContext: this.compilationContext,
      value: node.value.toLowerCase()
    };
  }

  compileUnaryOp(node) {
    const operand = this.compile(node.operand);
    
    if (operand.returnType !== 'number') {
      this.error(`Unary ${node.op} requires numeric operand`, node.position);
    }

        return {
      type: 'UNARY_OP',
      semanticId: this.generateSemanticId('unary_op', node.op, [operand.semanticId]),
      dependentJoins: operand.dependentJoins,
      returnType: 'number',
      compilationContext: this.compilationContext,
      value: { op: node.op },
      children: [operand]
    };
  }

  compileBinaryOp(node) {
    const left = this.compile(node.left);
    const right = this.compile(node.right);
    
    // Collect dependent joins from both sides
    const dependentJoins = [...left.dependentJoins, ...right.dependentJoins];
    
    // Type checking and result type determination
    let resultType;
    if (['+', '-', '*', '/'].includes(node.op)) {
      if (left.returnType !== 'number' || right.returnType !== 'number') {
        this.error(`Arithmetic operator ${node.op} requires numeric operands, got ${left.returnType} and ${right.returnType}`, node.position);
      }
      resultType = 'number';
    } else if (node.op === '&') {
      if (left.returnType !== 'string' || right.returnType !== 'string') {
        this.error(`String concatenation operator & requires both operands to be strings, got ${left.returnType} and ${right.returnType}. Use STRING() function to cast values to strings.`, node.position);
      }
      resultType = 'string';
    } else if (['>', '>=', '<', '<=', '=', '!=', '<>'].includes(node.op)) {
      // Comparison operators
      if (left.returnType !== right.returnType && left.returnType !== 'null' && right.returnType !== 'null') {
        this.error(`Cannot compare ${left.returnType} and ${right.returnType}`, node.position);
      }
      resultType = 'boolean';
    } else {
      this.error(`Unknown binary operator: ${node.op}`, node.position);
        }
        
        return {
      type: 'BINARY_OP',
      semanticId: this.generateSemanticId('binary_op', node.op, [left.semanticId, right.semanticId]),
      dependentJoins: dependentJoins,
      returnType: resultType,
      compilationContext: this.compilationContext,
      value: { op: node.op },
      children: [left, right]
    };
  }

  compileRelationshipRef(node) {
    // Check if relationship info exists
    if (!this.context.relationshipInfo || !this.context.relationshipInfo[node.relationName]) {
      const availableRelationships = Object.keys(this.context.relationshipInfo || {}).slice(0, 10);
      const suggestionText = availableRelationships.length > 0 
        ? ` Available relationships: ${availableRelationships.join(', ')}`
        : '';
      this.error(`Unknown relationship: ${node.relationName}.${suggestionText}`, node.position);
    }
    
    const relInfo = this.context.relationshipInfo[node.relationName];
    
    // Check if field exists in related table
    const fieldType = relInfo.columnList[node.fieldName.toLowerCase()];
    if (!fieldType) {
      const availableFields = Object.keys(relInfo.columnList).slice(0, 10);
      const suggestionText = availableFields.length > 0 
        ? ` Available fields: ${availableFields.join(', ')}`
        : '';
      this.error(`Unknown field ${node.fieldName} in relationship ${node.relationName}.${suggestionText}`, node.position);
    }
    
    // Generate join intent
    const joinSemanticId = this.generateJoinSemanticId('direct_relationship', this.tableName, node.relationName, relInfo.joinColumn);
    
    // Track join intent (deduplicated by semanticId)
    if (!this.joinIntents.has(joinSemanticId)) {
      this.joinIntents.set(joinSemanticId, {
        relationshipType: 'direct_relationship',
        sourceTable: this.tableName,
        targetTable: node.relationName,
        joinField: relInfo.joinColumn,
        semanticId: joinSemanticId,
        compilationContext: this.compilationContext
      });
        }
        
        return {
      type: 'RELATIONSHIP_REF',
      semanticId: this.generateSemanticId('relationship_ref', `${node.relationName}.${node.fieldName}`, [joinSemanticId]),
      dependentJoins: [joinSemanticId],
      returnType: fieldType,
      compilationContext: this.compilationContext,
      value: { relationName: node.relationName, fieldName: node.fieldName.toLowerCase() }
    };
  }

  /**
   * Generate semantic ID for join intent
   */
  generateJoinSemanticId(relationshipType, sourceTable, targetTable, joinField) {
    if (relationshipType === 'direct_relationship') {
      return `direct:${sourceTable}→${targetTable}[${joinField}]@${this.compilationContext}`;
    } else {
      return `inverse:${sourceTable}←${targetTable}[${joinField}]@${this.compilationContext}`;
    }
  }

  compileFunction(node) {
    const funcName = node.name;
    
    // Handle aggregate functions separately
    if (['STRING_AGG', 'STRING_AGG_DISTINCT', 'SUM_AGG', 'COUNT_AGG', 'AVG_AGG', 'MIN_AGG', 'MAX_AGG', 'AND_AGG', 'OR_AGG'].includes(funcName)) {
      return this.compileAggregateFunction(node);
    }
    
    // Handle regular functions
    switch (funcName) {
      case 'TODAY':
        if (node.args.length !== 0) {
          this.error('TODAY() takes no arguments', node.position);
        }
        return {
          type: 'FUNCTION_CALL',
          semanticId: this.generateSemanticId('function', 'TODAY'),
          dependentJoins: [],
          returnType: 'date',
          compilationContext: this.compilationContext,
          value: { name: 'TODAY', args: [] }
        };

      case 'ME':
        if (node.args.length !== 0) {
          this.error('ME() takes no arguments', node.position);
        }
        return {
          type: 'FUNCTION_CALL',
          semanticId: this.generateSemanticId('function', 'ME'),
          dependentJoins: [],
          returnType: 'string',
          compilationContext: this.compilationContext,
          value: { name: 'ME', args: [] }
        };

      case 'DATE':
        if (node.args.length !== 1) {
          this.error('DATE() takes exactly one argument', node.position);
        }
        
        const dateArg = this.compile(node.args[0]);
        if (dateArg.type !== 'STRING_LITERAL') {
          this.error('DATE() function requires a string literal', node.position);
        }
        
        return {
          type: 'FUNCTION_CALL',
          semanticId: this.generateSemanticId('function', 'DATE', [dateArg.semanticId]),
          dependentJoins: [],
          returnType: 'date',
          compilationContext: this.compilationContext,
          value: { name: 'DATE' },
          children: [dateArg]
        };

      case 'STRING':
        if (node.args.length !== 1) {
          this.error('STRING() takes exactly one argument', node.position);
        }
        
        const stringArg = this.compile(node.args[0]);
        return {
          type: 'FUNCTION_CALL',
          semanticId: this.generateSemanticId('function', 'STRING', [stringArg.semanticId]),
          dependentJoins: stringArg.dependentJoins,
          returnType: 'string',
          compilationContext: this.compilationContext,
          value: { name: 'STRING' },
          children: [stringArg]
        };

      case 'IF':
        return this.compileIfFunction(node);

      case 'UPPER':
      case 'LOWER':
        return this.compileStringFunction(node, funcName);

      case 'NOT':
        return this.compileLogicalFunction(node, funcName);

      case 'AND':
      case 'OR':
        return this.compileLogicalFunction(node, funcName);

      // Add other function cases...
      default:
        this.error(`Unknown function: ${funcName}`, node.position);
    }
  }

  compileIfFunction(node) {
    if (node.args.length < 2 || node.args.length > 3) {
      this.error('IF() takes 2 or 3 arguments: IF(condition, true_value, false_value) or IF(condition, true_value)', node.position);
    }
    
    const condition = this.compile(node.args[0]);
    const trueValue = this.compile(node.args[1]);
    let falseValue = null;
    
    if (node.args.length === 3) {
      falseValue = this.compile(node.args[2]);
      
      if (trueValue.returnType !== falseValue.returnType) {
        this.error(`IF() true and false values must be the same type, got ${trueValue.returnType} and ${falseValue.returnType}`, node.position);
      }
    }
    
    if (condition.returnType !== 'boolean') {
      this.error(`IF() condition must be boolean, got ${condition.returnType}`, node.position);
    }
    
    const children = falseValue ? [condition, trueValue, falseValue] : [condition, trueValue];
    const childIds = children.map(child => child.semanticId);
    const dependentJoins = children.flatMap(child => child.dependentJoins);
        
        return {
      type: 'FUNCTION_CALL',
      semanticId: this.generateSemanticId('function', 'IF', childIds),
      dependentJoins: dependentJoins,
      returnType: trueValue.returnType,
      compilationContext: this.compilationContext,
      value: { name: 'IF' },
      children: children
    };
  }

  compileStringFunction(node, funcName) {
        if (node.args.length !== 1) {
      this.error(`${funcName}() takes exactly one argument`, node.position);
    }
    
    const arg = this.compile(node.args[0]);
    if (arg.returnType !== 'string') {
      this.error(`${funcName}() requires string argument, got ${arg.returnType}`, node.position);
        }
        
        return {
      type: 'FUNCTION_CALL',
      semanticId: this.generateSemanticId('function', funcName, [arg.semanticId]),
      dependentJoins: arg.dependentJoins,
      returnType: 'string',
      compilationContext: this.compilationContext,
      value: { name: funcName },
      children: [arg]
    };
  }

  compileLogicalFunction(node, funcName) {
    if (funcName === 'NOT') {
      if (node.args.length !== 1) {
        this.error('NOT() takes exactly one argument', node.position);
      }
      
      const arg = this.compile(node.args[0]);
      if (arg.returnType !== 'boolean') {
        this.error(`NOT() requires boolean argument, got ${arg.returnType}`, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'NOT', [arg.semanticId]),
        dependentJoins: arg.dependentJoins,
        returnType: 'boolean',
        compilationContext: this.compilationContext,
        value: { name: 'NOT' },
        children: [arg]
      };
    } else if (funcName === 'AND' || funcName === 'OR') {
      if (node.args.length < 2) {
        this.error(`${funcName}() takes at least two arguments`, node.position);
      }
      
      const args = [];
      const dependentJoins = [];
      
      for (const argNode of node.args) {
        const arg = this.compile(argNode);
        if (arg.returnType !== 'boolean') {
          this.error(`${funcName}() requires boolean arguments, got ${arg.returnType}`, node.position);
        }
        args.push(arg);
        dependentJoins.push(...arg.dependentJoins);
      }
      
      const childIds = args.map(arg => arg.semanticId);
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', funcName, childIds),
        dependentJoins: dependentJoins,
        returnType: 'boolean',
        compilationContext: this.compilationContext,
        value: { name: funcName },
        children: args
      };
    } else {
      this.error(`Unknown logical function: ${funcName}`, node.position);
    }
  }

  compileAggregateFunction(node) {
    const funcName = node.name;
    let expectedArgCount = 2; // Most aggregate functions take 2 args
    if (funcName === 'STRING_AGG' || funcName === 'STRING_AGG_DISTINCT') {
      expectedArgCount = 3; // STRING_AGG takes delimiter as 3rd arg
    }
    
    if (node.args.length !== expectedArgCount) {
      this.error(`${funcName}() takes exactly ${expectedArgCount} arguments`, node.position);
    }

    // First argument must be an inverse relationship identifier
    const relationshipArg = node.args[0];
    if (relationshipArg.type !== NodeType.IDENTIFIER) {
      this.error(`${funcName}() first argument must be an inverse relationship name`, node.position);
    }

    const relationshipName = relationshipArg.value.toLowerCase();
    
    // Check if inverse relationship info exists
    const inverseRelKeys = Object.keys(this.context.inverseRelationshipInfo || {});
    const matchingKey = inverseRelKeys.find(key => key.toLowerCase() === relationshipName);
    
    if (!matchingKey) {
      const availableRelationships = inverseRelKeys.slice(0, 10);
      const suggestionText = availableRelationships.length > 0 
        ? ` Available inverse relationships: ${availableRelationships.join(', ')}${inverseRelKeys.length > 10 ? ' (and ' + (inverseRelKeys.length - 10) + ' more)' : ''}`
        : '';
      this.error(`Unknown inverse relationship: ${relationshipArg.value}.${suggestionText}`, node.position);
    }

    const inverseRelInfo = this.context.inverseRelationshipInfo[matchingKey];
    
    // Create sub-compilation context for aggregate expression
    const subContext = {
      tableName: inverseRelInfo.tableName,
      columnList: inverseRelInfo.columnList,
      relationshipInfo: inverseRelInfo.relationshipInfo || {}
    };
    
    const subCompiler = new Compiler(subContext);
    subCompiler.compilationContext = `agg:${this.tableName}→${inverseRelInfo.tableName}[${inverseRelInfo.joinColumn}]`;
    
    // Compile the expression in sub-context
    const expressionResult = subCompiler.compile(node.args[1]);
    
    // Handle delimiter for STRING_AGG functions
    let delimiterResult = null;
    if (funcName === 'STRING_AGG' || funcName === 'STRING_AGG_DISTINCT') {
      delimiterResult = this.compile(node.args[2]); // Compile in main context
      if (delimiterResult.returnType !== 'string') {
        this.error(`${funcName}() delimiter must be string, got ${delimiterResult.returnType}`, node.position);
      }
    }
    
    // Determine return type
    let returnType;
    if (funcName.startsWith('STRING_AGG')) {
      returnType = 'string';
    } else if (['AND_AGG', 'OR_AGG'].includes(funcName)) {
      returnType = 'boolean';
    } else {
      returnType = 'number';
    }
    
    // Generate aggregate intent
    const aggSemanticId = this.generateSemanticId('aggregate', `${funcName}[${expressionResult.semanticId}]`);
    
    const aggregateIntent = {
      semanticId: aggSemanticId,
      aggregateFunction: funcName,
      sourceRelation: matchingKey,
      expression: expressionResult,
      delimiter: delimiterResult,
      internalJoins: Array.from(subCompiler.joinIntents.values()),
      returnType: returnType
    };
    
    // Track aggregate intent
    this.aggregateIntents.set(aggSemanticId, aggregateIntent);
        
        return {
      type: 'AGGREGATE_FUNCTION',
      semanticId: aggSemanticId,
      dependentJoins: [], // Aggregates don't create main query joins
      returnType: returnType,
      compilationContext: this.compilationContext,
      value: { 
        aggregateSemanticId: aggSemanticId,
        aggregateIntent: aggregateIntent
      }
    };
  }

  getJoinIntents() {
    return Array.from(this.joinIntents.values());
  }

  getAggregateIntents() {
    return Array.from(this.aggregateIntents.values());
  }
}

/**
 * Main API function - Now returns intent representation only
 * @param {string} formula - The formula string to compile
 * @param {Object} context - Context object with tableName and columnList
 * @returns {CompilationResult} Intent representation
 */
function evaluateFormula(formula, context) {
  try {
    // Lexer stage
    const lexer = new Lexer(formula);
    
    // Parser stage
    const parser = new Parser(lexer);
    const ast = parser.parse();
    
    // Compiler stage - generates intents, not SQL
    const compiler = new Compiler(context);
    const result = compiler.compile(ast);
        
        return {
      expression: result,
      joinIntents: compiler.getJoinIntents(),
      aggregateIntents: compiler.getAggregateIntents(),
      returnType: result.returnType
    };
  } catch (error) {
    // Re-throw with consistent error format
    throw {
      message: error.message,
      position: error.position || 0
    };
  }
}

/**
 * @typedef {Object} SQLResult
 * @property {string} sql - Generated SQL query
 * @property {Object<string, string>} fieldAliases - Mapping of field names to SQL aliases
 * @property {Array<string>} selectExpressions - SQL expressions for each field
 * @property {string} fromClause - FROM clause with joins
 * @property {Array<string>} aggregateSubqueries - Subquery expressions for aggregates
 */

/**
 * Generate optimized SQL from multiple compilation results
 * Deduplicates joins and aggregates across all formulas
 * 
 * @param {Object<string, CompilationResult>} namedResults - Map of field names to compilation results
 * @param {string} baseTableName - Base table name for the query
 * @returns {SQLResult} Optimized SQL result
 */
function generateSQL(namedResults, baseTableName) {
  // Collect all unique intents across all formulas
  const allJoinIntents = new Map(); // semanticId -> JoinIntent
  const allAggregateIntents = new Map(); // semanticId -> AggregateIntent
  
  // Collect intents from all compilation results
  for (const [fieldName, result] of Object.entries(namedResults)) {
    // Collect join intents
    for (const joinIntent of result.joinIntents) {
      allJoinIntents.set(joinIntent.semanticId, joinIntent);
    }
    
    // Collect aggregate intents and their internal joins
    for (const aggIntent of result.aggregateIntents) {
      allAggregateIntents.set(aggIntent.semanticId, aggIntent);
      
      // Also collect internal joins from aggregates
      for (const internalJoin of aggIntent.internalJoins) {
        allJoinIntents.set(internalJoin.semanticId, internalJoin);
      }
    }
  }
  
  // Group aggregates by relationship for consolidation
  const aggregateGroups = new Map(); // relationshipKey -> Array<AggregateIntent>
  
  for (const [semanticId, aggIntent] of allAggregateIntents) {
    // Create a key that represents the relationship context
    const relationshipKey = `${aggIntent.sourceRelation}`;
    
    if (!aggregateGroups.has(relationshipKey)) {
      aggregateGroups.set(relationshipKey, []);
    }
    aggregateGroups.get(relationshipKey).push(aggIntent);
  }
  
  // Generate alias mappings for joins
  const joinAliases = new Map(); // semanticId -> SQL alias
  let aliasCounter = 1;
  
  for (const [semanticId, joinIntent] of allJoinIntents) {
    // Extract context from semantic ID for context-aware aliasing
    const contextMatch = semanticId.match(/@(.+)$/);
    const context = contextMatch ? contextMatch[1] : 'main';
    
    if (context === 'main') {
      joinAliases.set(semanticId, `t${aliasCounter++}`);
    } else {
      // For aggregate contexts, use descriptive aliases
      joinAliases.set(semanticId, `agg_t${aliasCounter++}`);
    }
  }
  
  // Generate consolidated aggregate JOINs and alias mappings
  const aggregateJoinAliases = new Map(); // relationshipKey -> SQL alias
  const aggregateColumnMappings = new Map(); // aggregateSemanticId -> {alias, column}
  let aggGroupCounter = 1;
  
  for (const [relationshipKey, aggIntents] of aggregateGroups) {
    const groupAlias = `sr${aggGroupCounter++}`;
    aggregateJoinAliases.set(relationshipKey, groupAlias);
    
    // Map each aggregate to its column in the consolidated subquery
    aggIntents.forEach((aggIntent, index) => {
      let columnAlias;
      if (aggIntent.aggregateFunction.startsWith('STRING_AGG')) {
        columnAlias = `rep_names`;
      } else if (aggIntent.aggregateFunction === 'COUNT_AGG') {
        columnAlias = `rep_count`;
      } else {
        columnAlias = `agg_col_${index + 1}`;
      }
      
      aggregateColumnMappings.set(aggIntent.semanticId, {
        alias: groupAlias,
        column: columnAlias
      });
    });
  }
  
  // Build FROM clause with joins
  let fromClause = `${baseTableName} s`;
  
  // Add main context joins
  for (const [semanticId, joinIntent] of allJoinIntents) {
    if (joinIntent.compilationContext === 'main') {
      const alias = joinAliases.get(semanticId);
      if (joinIntent.relationshipType === 'direct_relationship') {
        fromClause += `\n  LEFT JOIN ${joinIntent.targetTable} ${alias} ON s.${joinIntent.joinField} = ${alias}.id`;
      }
    }
  }
  
  // Add consolidated aggregate JOINs
  for (const [relationshipKey, aggIntents] of aggregateGroups) {
    const groupAlias = aggregateJoinAliases.get(relationshipKey);
    const consolidatedSubquery = generateConsolidatedAggregateSubquery(aggIntents, joinAliases, baseTableName);
    fromClause += `\n  LEFT JOIN (\n${consolidatedSubquery}\n  ) ${groupAlias} ON ${groupAlias}.submission = s.id`;
  }
  
  // Generate SELECT expressions for each field
  const selectExpressions = [];
  const fieldAliases = {};
  
  for (const [fieldName, result] of Object.entries(namedResults)) {
    const sqlExpr = generateExpressionSQL(result.expression, joinAliases, aggregateColumnMappings, 's');
    selectExpressions.push(`${sqlExpr} AS ${fieldName}`);
    fieldAliases[fieldName] = fieldName;
  }
  
  // Combine into final SQL
  let sql = `SELECT\n  ${selectExpressions.join(',\n  ')}\nFROM ${fromClause}`;
        
        return {
    sql: sql,
    fieldAliases: fieldAliases,
    selectExpressions: selectExpressions,
    fromClause: fromClause,
    aggregateSubqueries: []
  };
}

/**
 * Generate consolidated SQL subquery for multiple aggregate intents on the same relationship
 * @param {Array<AggregateIntent>} aggIntents - Array of aggregate intents to consolidate
 * @param {Map<string, string>} joinAliases - Join semantic ID to SQL alias mapping
 * @param {string} baseTableName - Base table name
 * @returns {string} SQL subquery
 */
function generateConsolidatedAggregateSubquery(aggIntents, joinAliases, baseTableName) {
  if (aggIntents.length === 0) {
    throw new Error('Cannot generate consolidated subquery for empty aggregate intents');
  }
  
  // Use the first aggregate intent to determine the relationship structure
  const firstIntent = aggIntents[0];
  
  // Build subquery FROM clause with internal joins
  let subFromClause = firstIntent.expression.compilationContext.match(/agg:.*?→(.*?)\[/)[1];
  
  // Collect all unique internal joins from all intents
  const allInternalJoins = new Map();
  for (const aggIntent of aggIntents) {
    for (const joinIntent of aggIntent.internalJoins) {
      allInternalJoins.set(joinIntent.semanticId, joinIntent);
    }
  }
  
  // Add internal joins within the subquery
  for (const joinIntent of allInternalJoins.values()) {
    const alias = joinAliases.get(joinIntent.semanticId);
    if (alias && joinIntent.relationshipType === 'direct_relationship') {
      subFromClause += `\n    JOIN ${joinIntent.targetTable} ${alias} ON ${subFromClause.split(' ')[0]}.${joinIntent.joinField} = ${alias}.id`;
    }
  }
  
  // Generate SELECT clause with multiple aggregate functions
  const selectExpressions = [];
  
  for (const aggIntent of aggIntents) {
    // Generate expression SQL for the aggregate
    const exprSQL = generateExpressionSQL(aggIntent.expression, joinAliases, new Map(), subFromClause.split(' ')[0]);
    
    // Build aggregate function SQL
    let aggSQL;
    let columnAlias;
    
    switch (aggIntent.aggregateFunction) {
      case 'STRING_AGG':
        const delimiterSQL = generateExpressionSQL(aggIntent.delimiter, new Map(), new Map(), baseTableName);
        aggSQL = `STRING_AGG(${exprSQL}, ${delimiterSQL})`;
        columnAlias = 'rep_names';
        break;
      case 'STRING_AGG_DISTINCT':
        const delimiterSQL2 = generateExpressionSQL(aggIntent.delimiter, new Map(), new Map(), baseTableName);
        aggSQL = `STRING_AGG(DISTINCT ${exprSQL}, ${delimiterSQL2})`;
        columnAlias = 'rep_names';
        break;
      case 'COUNT_AGG':
        aggSQL = `COUNT(*)`;
        columnAlias = 'rep_count';
        break;
      case 'SUM_AGG':
        aggSQL = `SUM(${exprSQL})`;
        columnAlias = 'sum_value';
        break;
      case 'AVG_AGG':
        aggSQL = `AVG(${exprSQL})`;
        columnAlias = 'avg_value';
        break;
      case 'MIN_AGG':
        aggSQL = `MIN(${exprSQL})`;
        columnAlias = 'min_value';
        break;
      case 'MAX_AGG':
        aggSQL = `MAX(${exprSQL})`;
        columnAlias = 'max_value';
        break;
      case 'AND_AGG':
        aggSQL = `BOOL_AND(${exprSQL})`;
        columnAlias = 'and_value';
        break;
      case 'OR_AGG':
        aggSQL = `BOOL_OR(${exprSQL})`;
        columnAlias = 'or_value';
        break;
      default:
        throw new Error(`Unknown aggregate function: ${aggIntent.aggregateFunction}`);
    }
    
    selectExpressions.push(`${aggSQL} AS ${columnAlias}`);
  }
  
  // Extract join column from semantic ID
  const joinColumnMatch = firstIntent.expression.compilationContext.match(/\[([^\]]+)\]$/);
  const joinColumn = joinColumnMatch ? joinColumnMatch[1] : 'id';
  
  // Add the grouping column to the SELECT clause
  selectExpressions.unshift(`${subFromClause.split(' ')[0]}.${joinColumn} AS submission`);
  
  return `    SELECT\n      ${selectExpressions.join(',\n      ')}\n    FROM ${subFromClause}\n    GROUP BY ${subFromClause.split(' ')[0]}.${joinColumn}`;
}

/**
 * Generate SQL subquery for an aggregate intent (legacy - kept for compatibility)
 * @param {AggregateIntent} aggIntent - Aggregate intent to convert
 * @param {Map<string, string>} joinAliases - Join semantic ID to SQL alias mapping
 * @param {string} baseTableName - Base table name
 * @returns {string} SQL subquery
 */
function generateAggregateSubquery(aggIntent, joinAliases, baseTableName) {
  // Get inverse relationship info from the aggregate intent
  const sourceTable = baseTableName;
  
  // Build subquery FROM clause with internal joins
  let subFromClause = aggIntent.expression.compilationContext.match(/agg:.*?→(.*?)\[/)[1];
  
  // Add internal joins within the subquery
  for (const joinIntent of aggIntent.internalJoins) {
    const alias = joinAliases.get(joinIntent.semanticId);
    if (alias && joinIntent.relationshipType === 'direct_relationship') {
      subFromClause += `\n    LEFT JOIN ${joinIntent.targetTable} ${alias} ON ${subFromClause.split(' ')[0]}.${joinIntent.joinField} = ${alias}.id`;
    }
  }
  
  // Generate expression SQL for the aggregate
  const exprSQL = generateExpressionSQL(aggIntent.expression, joinAliases, new Map(), subFromClause.split(' ')[0]);
  
  // Build aggregate function SQL
  let aggSQL;
  switch (aggIntent.aggregateFunction) {
    case 'STRING_AGG':
      const delimiterSQL = generateExpressionSQL(aggIntent.delimiter, new Map(), new Map(), sourceTable);
      aggSQL = `STRING_AGG(${exprSQL}, ${delimiterSQL})`;
            break;
    case 'STRING_AGG_DISTINCT':
      const delimiterSQL2 = generateExpressionSQL(aggIntent.delimiter, new Map(), new Map(), sourceTable);
      aggSQL = `STRING_AGG(DISTINCT ${exprSQL}, ${delimiterSQL2})`;
            break;
    case 'SUM_AGG':
      aggSQL = `SUM(${exprSQL})`;
      break;
    case 'COUNT_AGG':
      aggSQL = `COUNT(${exprSQL})`;
      break;
    case 'AVG_AGG':
      aggSQL = `AVG(${exprSQL})`;
      break;
    case 'MIN_AGG':
      aggSQL = `MIN(${exprSQL})`;
      break;
    case 'MAX_AGG':
      aggSQL = `MAX(${exprSQL})`;
      break;
    case 'AND_AGG':
      aggSQL = `BOOL_AND(${exprSQL})`;
      break;
    case 'OR_AGG':
      aggSQL = `BOOL_OR(${exprSQL})`;
            break;
          default:
      throw new Error(`Unknown aggregate function: ${aggIntent.aggregateFunction}`);
  }
  
  // Extract join column from semantic ID
  const joinColumnMatch = aggIntent.expression.compilationContext.match(/\[([^\]]+)\]$/);
  const joinColumn = joinColumnMatch ? joinColumnMatch[1] : 'id';
  
  return `SELECT ${aggSQL}\n  FROM ${subFromClause}\n  WHERE ${subFromClause.split(' ')[0]}.${joinColumn} = ${sourceTable}.id`;
}

/**
 * Generate SQL expression from an expression intent
 * @param {ExpressionIntent} expr - Expression intent to convert
 * @param {Map<string, string>} joinAliases - Join semantic ID to SQL alias mapping
 * @param {Map<string, Object>} aggregateColumnMappings - Aggregate semantic ID to {alias, column} mapping
 * @param {string} baseTableName - Base table name or alias
 * @returns {string} SQL expression
 */
function generateExpressionSQL(expr, joinAliases, aggregateColumnMappings, baseTableName) {
  switch (expr.type) {
    case 'NUMBER':
      return expr.value.toString();
      
    case 'STRING_LITERAL':
      return `'${expr.value.replace(/'/g, "''")}'`; // Escape single quotes
      
    case 'BOOLEAN_LITERAL':
      return expr.value === 'TRUE' ? 'TRUE' : 'FALSE';
      
    case 'NULL_LITERAL':
      return 'NULL';
      
    case 'DATE_LITERAL':
      return `'${expr.value}'::date`;
      
    case 'IDENTIFIER':
      return `"${baseTableName}"."${expr.value.toLowerCase()}"`;
      
    case 'RELATIONSHIP_REF':
      // Find the appropriate join alias
      const joinSemanticId = expr.dependentJoins[0];
      const joinAlias = joinAliases.get(joinSemanticId);
      if (!joinAlias) {
        throw new Error(`No alias found for join: ${joinSemanticId}`);
      }
      return `"${joinAlias}"."${expr.value.fieldName}"`;
      
    case 'UNARY_OP':
      const operandSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `${expr.value.op}${operandSQL}`;
      
    case 'BINARY_OP':
      const leftSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const rightSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      
      if (expr.value.op === '&') {
        return `(${leftSQL} || ${rightSQL})`;
      } else if (expr.value.op === '=') {
        return `(${leftSQL} = ${rightSQL})`;
      } else if (expr.value.op === '!=' || expr.value.op === '<>') {
        return `(${leftSQL} != ${rightSQL})`;
      } else if (expr.value.op === '*') {
        return `(${leftSQL} * ${rightSQL})`;
      } else {
        return `(${leftSQL} ${expr.value.op} ${rightSQL})`;
      }
      
    case 'FUNCTION_CALL':
      return generateFunctionSQL(expr, joinAliases, aggregateColumnMappings, baseTableName);
      
    case 'AGGREGATE_FUNCTION':
      // For aggregate functions, reference the consolidated JOIN column
      const aggMapping = aggregateColumnMappings.get(expr.semanticId);
      if (!aggMapping) {
        throw new Error(`No column mapping found for aggregate: ${expr.semanticId}`);
      }
      return `COALESCE(${aggMapping.alias}.${aggMapping.column}, ${getDefaultValueForAggregateType(expr.returnType)})`;
      
    default:
      throw new Error(`Unknown expression type: ${expr.type}`);
  }
}

/**
 * Get default value for aggregate return type when result is NULL
 * @param {string} returnType - The return type (string, number, boolean)
 * @returns {string} Default SQL value
 */
function getDefaultValueForAggregateType(returnType) {
  switch (returnType) {
    case 'string':
      return "''";
    case 'number':
      return '0';
    case 'boolean':
      return 'FALSE';
    default:
      return 'NULL';
  }
}

/**
 * Generate SQL for function calls
 * @param {ExpressionIntent} expr - Function expression intent
 * @param {Map<string, string>} joinAliases - Join aliases
 * @param {Map<string, Object>} aggregateColumnMappings - Aggregate column mappings
 * @param {string} baseTableName - Base table name
 * @returns {string} SQL function call
 */
function generateFunctionSQL(expr, joinAliases, aggregateColumnMappings, baseTableName) {
  const funcName = expr.value.name;
  
  switch (funcName) {
    case 'TODAY':
      return 'current_date';
      
    case 'ME':
      return '(select auth().uid())';
      
    case 'DATE':
      const dateArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `DATE(${dateArgSQL})`;
      
    case 'STRING':
      const argSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `CAST(${argSQL} AS TEXT)`;
      
    case 'UPPER':
      const upperArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `UPPER(${upperArgSQL})`;
      
    case 'LOWER':
      const lowerArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `LOWER(${lowerArgSQL})`;
      
    case 'IF':
      const conditionSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const trueSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      
      if (expr.children.length === 3) {
        const falseSQL = generateExpressionSQL(expr.children[2], joinAliases, aggregateColumnMappings, baseTableName);
        return `CASE WHEN ${conditionSQL} THEN ${trueSQL} ELSE ${falseSQL} END`;
      } else {
        return `CASE WHEN ${conditionSQL} THEN ${trueSQL} END`;
      }
      
    case 'NOT':
      const notArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `NOT (${notArgSQL})`;
      
    case 'AND':
      const andArgs = expr.children.map(child => 
        generateExpressionSQL(child, joinAliases, aggregateColumnMappings, baseTableName)
      );
      return `(${andArgs.join(' AND ')})`;
      
    case 'OR':
      const orArgs = expr.children.map(child => 
        generateExpressionSQL(child, joinAliases, aggregateColumnMappings, baseTableName)
      );
      return `(${orArgs.join(' OR ')})`;
      
    default:
      throw new Error(`Unknown function: ${funcName}`);
  }
}

// Export for ES modules
export { evaluateFormula, generateSQL, mapPostgresType };

// Export for Node.js/CommonJS (but don't use require/import in this file)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { evaluateFormula, generateSQL, mapPostgresType };
}

// Export for browser/global scope
if (typeof window !== 'undefined') {
  window.evaluateFormula = evaluateFormula;
  window.generateSQL = generateSQL;
  window.mapPostgresType = mapPostgresType;
} 