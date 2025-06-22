import { TokenType, TokenValue } from './lexer.js';
import { TYPE } from './types-unified.js';

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
      if (operand.type === TYPE.UNARY_OP) {
        this.error('Consecutive operators are not allowed (use parentheses for clarity)', token.position);
      }
      
      return {
        type: TYPE.UNARY_OP,
        op: TokenValue.MINUS,
        operand: operand,
        position: token.position
      };
    }

    if (token.type === TokenType.NUMBER) {
      this.eat(TokenType.NUMBER);
      return {
        type: TYPE.NUMBER_LITERAL,
        value: token.value,
        position: token.position
      };
    }

    if (token.type === TokenType.IDENTIFIER) {
      const identifier = token.value;
      const position = token.position;
      this.eat(TokenType.IDENTIFIER);
      
      // Check for relationship reference: identifier_rel.field or multi-level: merchant_rel.main_rep_rel.user_rel.name
      if (identifier.endsWith('_REL') && this.currentToken.type === TokenType.DOT) {
        return this.parseMultiLevelRelationship(identifier, position);
      }
      
      if (this.currentToken.type === TokenType.LPAREN) {
        // Function call
        this.eat(TokenType.LPAREN);
        const args = [];
        
        if (this.currentToken.type !== TokenType.RPAREN) {
          // Check if this is an aggregate function that needs special first argument parsing
          const isAggregateFunction = ['STRING_AGG', 'STRING_AGG_DISTINCT', 'SUM_AGG', 'COUNT_AGG', 'AVG_AGG', 'MIN_AGG', 'MAX_AGG', 'AND_AGG', 'OR_AGG'].includes(identifier);
          
          if (isAggregateFunction) {
            // Parse first argument with special dot-separated handling
            args.push(this.parseAggregateRelationshipArg());
          } else {
            args.push(this.comparison());
          }
          
          while (this.currentToken.type === TokenType.COMMA) {
            this.eat(TokenType.COMMA);
            args.push(this.comparison());
          }
        }
        
        this.eat(TokenType.RPAREN);
        
        return {
          type: TYPE.FUNCTION_CALL,
          name: identifier,
          args: args,
          position: position
        };
      } else {
        // Special identifiers: TRUE, FALSE, NULL
        if (identifier === 'TRUE' || identifier === 'FALSE') {
          return {
            type: TYPE.BOOLEAN_LITERAL,
            value: identifier,
            position: position
          };
        } else if (identifier === 'NULL') {
          return {
            type: TYPE.NULL_LITERAL,
            value: 'NULL',
            position: position
          };
        } else {
          // Regular identifier (column reference)
          return {
            type: TYPE.IDENTIFIER,
            value: identifier,
            position: position
          };
        }
      }
    }

    if (token.type === TokenType.STRING) {
      this.eat(TokenType.STRING);
      return {
        type: TYPE.STRING_LITERAL,
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
        type: TYPE.BINARY_OP,
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
        type: TYPE.BINARY_OP,
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
        type: TYPE.BINARY_OP,
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

  /**
   * Parse dot-separated relationship chain for aggregate function first argument
   * Handles both single relationships and multi-level chains like: rel1.rel2.rel3
   * @returns {Object} Relationship identifier or relationship reference AST node
   */
  parseAggregateRelationshipArg() {
    if (this.currentToken.type !== TokenType.IDENTIFIER) {
      this.error('Expected relationship identifier', this.currentToken.position);
    }
    
    const firstIdentifier = this.currentToken.value;
    const position = this.currentToken.position;
    this.eat(TokenType.IDENTIFIER);
    
    // Check if this is a dot-separated chain
    if (this.currentToken.type === TokenType.DOT) {
      const relationshipChain = [firstIdentifier.toLowerCase()];
      
      // Parse the chain of relationships
      while (this.currentToken.type === TokenType.DOT) {
        this.eat(TokenType.DOT);
        
        if (this.currentToken.type !== TokenType.IDENTIFIER) {
          this.error('Expected identifier after dot in relationship chain', this.currentToken.position);
        }
        
        relationshipChain.push(this.currentToken.value.toLowerCase());
        this.eat(TokenType.IDENTIFIER);
      }
      
      // Return as a relationship reference with chain
      return {
        type: TYPE.RELATIONSHIP_REF,
        relationshipChain: relationshipChain,
        fieldName: null, // No field name in aggregate context
        position: position
      };
    } else {
      // Single identifier - return as simple identifier
      return {
        type: TYPE.IDENTIFIER,
        value: firstIdentifier,
        position: position
      };
    }
  }

  /**
   * Parse multi-level relationship chains like merchant_rel.main_rep_rel.user_rel.name
   * @param {string} firstIdentifier - The first relationship identifier
   * @param {number} position - Position in source for error reporting
   * @returns {Object} Multi-level relationship AST node
   */
  parseMultiLevelRelationship(firstIdentifier, position) {
    const relationshipChain = [];
    let currentIdentifier = firstIdentifier;
    
    // Parse the chain of relationships
    while (currentIdentifier.endsWith('_REL') && this.currentToken.type === TokenType.DOT) {
      // Add current relationship to chain
      relationshipChain.push(currentIdentifier.slice(0, -4).toLowerCase()); // Remove '_REL' and normalize
      
      this.eat(TokenType.DOT); // consume the dot
      
      // Get next identifier
      if (this.currentToken.type !== TokenType.IDENTIFIER) {
        this.error('Expected identifier after relationship dot', this.currentToken.position);
      }
      
      currentIdentifier = this.currentToken.value;
      this.eat(TokenType.IDENTIFIER);
    }
    
    // The last identifier should be the field name (not ending with _REL)
    if (currentIdentifier.endsWith('_REL')) {
      this.error('Relationship chain must end with a field name, not another relationship', position);
    }
    
    if (relationshipChain.length === 0) {
      this.error('Invalid relationship syntax', position);
    }
    
    return {
      type: TYPE.RELATIONSHIP_REF,
      relationshipChain: relationshipChain,
      fieldName: currentIdentifier,
      position: position
    };
  }
}

// Export for ES modules
export { Parser };