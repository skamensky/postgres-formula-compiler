/**
 * Syntax Highlighter for Formula Language
 * Provides token-based highlighting using the existing lexer
 * Now Monaco/VS Code compatible
 */

import { Lexer, TokenType } from '../src/lexer.js';
import { FUNCTION_METADATA } from '../src/function-metadata.js';

// Token style mapping
const TokenStyles = {
  [TokenType.NUMBER]: 'number',
  [TokenType.STRING]: 'string',
  [TokenType.IDENTIFIER]: 'identifier',
  [TokenType.FUNCTION]: 'function',
  [TokenType.PLUS]: 'operator',
  [TokenType.MINUS]: 'operator',
  [TokenType.MULTIPLY]: 'operator',
  [TokenType.DIVIDE]: 'operator',
  [TokenType.AMPERSAND]: 'operator',
  [TokenType.GT]: 'operator',
  [TokenType.GTE]: 'operator',
  [TokenType.LT]: 'operator',
  [TokenType.LTE]: 'operator',
  [TokenType.EQ]: 'operator',
  [TokenType.NEQ]: 'operator',
  [TokenType.LPAREN]: 'punctuation',
  [TokenType.RPAREN]: 'punctuation',
  [TokenType.COMMA]: 'punctuation',
  [TokenType.DOT]: 'punctuation',
  [TokenType.AND]: 'keyword',
  [TokenType.OR]: 'keyword',
  [TokenType.NOT]: 'keyword'
};

// Semantic token types for richer highlighting
const SemanticTokenType = {
  FUNCTION: 'function',
  KEYWORD: 'keyword',
  NUMBER: 'number',
  STRING: 'string',
  OPERATOR: 'operator',
  PUNCTUATION: 'punctuation',
  IDENTIFIER: 'identifier',
  COLUMN: 'column',
  RELATIONSHIP: 'relationship',
  LITERAL: 'literal',
  COMMENT: 'comment',
  ERROR: 'error'
};

// Default color scheme (CSS class names)
const DefaultTheme = {
  [SemanticTokenType.FUNCTION]: 'formula-function',
  [SemanticTokenType.KEYWORD]: 'formula-keyword',
  [SemanticTokenType.NUMBER]: 'formula-number',
  [SemanticTokenType.STRING]: 'formula-string',
  [SemanticTokenType.OPERATOR]: 'formula-operator',
  [SemanticTokenType.PUNCTUATION]: 'formula-punctuation',
  [SemanticTokenType.IDENTIFIER]: 'formula-identifier',
  [SemanticTokenType.COLUMN]: 'formula-column',
  [SemanticTokenType.RELATIONSHIP]: 'formula-relationship',
  [SemanticTokenType.LITERAL]: 'formula-literal',
  [SemanticTokenType.COMMENT]: 'formula-comment',
  [SemanticTokenType.ERROR]: 'formula-error'
};

/**
 * Syntax Highlighter for Formula Language
 */
export class FormulaSyntaxHighlighter {
  constructor(theme = DefaultTheme) {
    this.theme = theme;
    this.databaseSchema = null;
  }

  /**
   * Get Monaco Monarch tokenizer configuration
   */
  getMonacoTokenizer() {
    // Extract function names from metadata
    const functionNames = Object.keys(FUNCTION_METADATA);
    
    return {
      // Set defaultToken to invalid to see what we're missing
      defaultToken: 'invalid',
      
      keywords: ['TRUE', 'FALSE', 'NULL', 'AND', 'OR', 'NOT'],
      
      functions: functionNames,
      
      // Operators
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
        '%=', '<<=', '>>=', '>>>='
      ],

      // Common regular expressions
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      
      // Tokenizer rules
      tokenizer: {
        root: [
          // Identifiers and keywords
          [/[A-Z][A-Z0-9_]*/, {
            cases: {
              '@functions': 'function',
              '@keywords': 'keyword',
              '@default': 'function' // Assume uppercase identifiers are functions
            }
          }],
          
          // Column names (lowercase identifiers) - better highlighting
          [/[a-z][a-zA-Z0-9_]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],
          
          // Mixed case identifiers (could be columns)
          [/[a-zA-Z][a-zA-Z0-9_]*/, {
            cases: {
              '@functions': 'function',
              '@keywords': 'keyword', 
              '@default': 'identifier'
            }
          }],
          
          // Relationship references (ending with _REL or _rel)
          [/[a-zA-Z][a-zA-Z0-9_]*_[rR][eE][lL]/, 'relationship'],
          
          // Numbers
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number'],
          
          // Strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'], // Non-terminated string
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
          [/'([^'\\]|\\.)*$/, 'string.invalid'], // Non-terminated string
          [/'/, { token: 'string.quote', bracket: '@open', next: '@singleQuoteString' }],
          
          // Delimiters and operators
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],
          
          // Whitespace
          { include: '@whitespace' },
          
          // Delimiters
          [/,/, 'delimiter.comma'],
          [/\./, 'delimiter.dot'],
          [/;/, 'delimiter.semicolon'],
        ],

        comment: [
          [/[^\/*]+/, 'comment'],
          [/\/\*/, 'comment', '@push'],    // nested comment
          ["\\*/", 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],

        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape.invalid'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        singleQuoteString: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape.invalid'],
          [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment'],
        ],
      },
    };
  }

  /**
   * Get Monaco language configuration
   */
  getMonacoLanguageConfig() {
    return {
      comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      folding: {
        markers: {
          start: new RegExp("^\\s*//\\s*#?region\\b"),
          end: new RegExp("^\\s*//\\s*#?endregion\\b")
        }
      }
    };
  }

  /**
   * Get Monaco theme configuration
   */
  getMonacoTheme() {
    return {
      base: 'vs', // can also be vs-dark or hc-black
      inherit: true, // can also be false to completely replace the builtin rules
      rules: [
        { token: 'function', foreground: '0066cc', fontStyle: 'bold' },
        { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'number', foreground: '059669' },
        { token: 'number.float', foreground: '059669' },
        { token: 'string', foreground: 'dc2626' },
        { token: 'string.quote', foreground: 'dc2626' },
        { token: 'operator', foreground: '7c2d12', fontStyle: 'bold' },
        { token: 'delimiter', foreground: '6b7280' },
        { token: 'delimiter.comma', foreground: '6b7280' },
        { token: 'delimiter.dot', foreground: '6b7280' },
        { token: 'identifier', foreground: '374151' },
        { token: 'relationship', foreground: 'be185d', fontStyle: 'italic' },
        { token: 'invalid', foreground: 'dc2626', background: 'fef2f2' },
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#FFFFFF',
        'editorCursor.foreground': '#000000',
        'editor.lineHighlightBackground': '#f8fafc',
        'editorLineNumber.foreground': '#9ca3af',
        'editor.selectionBackground': '#b3d4fc',
        'editor.inactiveSelectionBackground': '#e1e9f4'
      }
    };
  }

  /**
   * Update database schema for enhanced highlighting
   */
  updateSchema(schema) {
    this.databaseSchema = schema;
  }

  /**
   * Highlight formula text and return token information
   * @param {string} text - Formula text to highlight
   * @param {string} tableName - Current table name for column validation
   * @returns {Array} Array of highlighted tokens
   */
  highlight(text, tableName = null) {
    try {
      const lexer = new Lexer(text);
      const tokens = [];
      let token;

      do {
        try {
          token = lexer.getNextToken();
          if (token.type !== TokenType.EOF) {
            const highlightedToken = this.enhanceToken(token, tableName, text);
            tokens.push(highlightedToken);
          }
        } catch (lexError) {
          // Handle lexer errors by creating an error token
          tokens.push({
            type: SemanticTokenType.ERROR,
            value: text.substring(lexer.position, lexer.position + 1),
            position: lexer.position,
            length: 1,
            cssClass: this.theme[SemanticTokenType.ERROR],
            error: lexError.message
          });
          // Try to advance past the error
          try {
            lexer.advance();
            token = { type: TokenType.EOF };
          } catch {
            break;
          }
        }
      } while (token.type !== TokenType.EOF);

      return this.postProcessTokens(tokens, text);
    } catch (error) {
      console.error('Syntax highlighting error:', error);
      return [{
        type: SemanticTokenType.ERROR,
        value: text,
        position: 0,
        length: text.length,
        cssClass: this.theme[SemanticTokenType.ERROR],
        error: error.message
      }];
    }
  }

  /**
   * Enhance token with semantic information
   */
  enhanceToken(token, tableName, fullText) {
    const length = this.calculateTokenLength(token, fullText);
    let semanticType = this.getSemanticType(token, tableName);
    
    // Enhance with database schema information
    if (this.databaseSchema && tableName) {
      semanticType = this.enhanceWithSchema(token, semanticType, tableName);
    }

    return {
      type: semanticType,
      value: token.value,
      position: token.position,
      length: length,
      cssClass: this.theme[semanticType],
      originalTokenType: token.type,
      metadata: this.getTokenMetadata(token, semanticType, tableName)
    };
  }

  /**
   * Get semantic type for token
   */
  getSemanticType(token, tableName) {
    switch (token.type) {
      case TokenType.NUMBER:
        return SemanticTokenType.NUMBER;
      
      case TokenType.STRING:
        return SemanticTokenType.STRING;
      
      case TokenType.IDENTIFIER:
        // Check if it's a function
        if (FUNCTION_METADATA[token.value]) {
          return SemanticTokenType.FUNCTION;
        }
        
        // Check if it's a keyword/literal
        if (['TRUE', 'FALSE', 'NULL'].includes(token.value)) {
          return SemanticTokenType.LITERAL;
        }
        
        if (['AND', 'OR', 'NOT'].includes(token.value)) {
          return SemanticTokenType.KEYWORD;
        }
        
        // Check if it's a relationship
        if (token.value.endsWith('_REL')) {
          return SemanticTokenType.RELATIONSHIP;
        }
        
        return SemanticTokenType.IDENTIFIER;
      
      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.MULTIPLY:
      case TokenType.DIVIDE:
      case TokenType.AMPERSAND:
      case TokenType.GT:
      case TokenType.GTE:
      case TokenType.LT:
      case TokenType.LTE:
      case TokenType.EQ:
      case TokenType.NEQ:
        return SemanticTokenType.OPERATOR;
      
      case TokenType.LPAREN:
      case TokenType.RPAREN:
      case TokenType.COMMA:
      case TokenType.DOT:
        return SemanticTokenType.PUNCTUATION;
      
      default:
        return SemanticTokenType.IDENTIFIER;
    }
  }

  /**
   * Enhance token type using database schema
   */
  enhanceWithSchema(token, currentType, tableName) {
    if (!this.databaseSchema || !this.databaseSchema[tableName]) {
      return currentType;
    }

    // If it's an identifier, check if it's a column
    if (currentType === SemanticTokenType.IDENTIFIER) {
      const columns = this.databaseSchema[tableName].columns || [];
      const column = columns.find(col => 
        col.column_name.toLowerCase() === token.value.toLowerCase()
      );
      
      if (column) {
        return SemanticTokenType.COLUMN;
      }
    }

    // If it's a relationship, validate it exists
    if (currentType === SemanticTokenType.RELATIONSHIP) {
      const relationshipName = token.value.slice(0, -4).toLowerCase();
      const relationships = this.databaseSchema[tableName].directRelationships || [];
      const relationship = relationships.find(rel => 
        rel.relationship_name.toLowerCase() === relationshipName
      );
      
      if (!relationship) {
        return SemanticTokenType.ERROR;
      }
    }

    return currentType;
  }

  /**
   * Get additional metadata for token
   */
  getTokenMetadata(token, semanticType, tableName) {
    const metadata = {};

    switch (semanticType) {
      case SemanticTokenType.FUNCTION:
        const funcMetadata = FUNCTION_METADATA[token.value];
        if (funcMetadata) {
          metadata.description = funcMetadata.description;
          metadata.category = funcMetadata.category;
          metadata.returnType = funcMetadata.returnType;
          metadata.arguments = funcMetadata.arguments;
        }
        break;

      case SemanticTokenType.COLUMN:
        if (this.databaseSchema && tableName) {
          const columns = this.databaseSchema[tableName].columns || [];
          const column = columns.find(col => 
            col.column_name.toLowerCase() === token.value.toLowerCase()
          );
          if (column) {
            metadata.dataType = column.data_type;
            metadata.tableName = tableName;
          }
        }
        break;

      case SemanticTokenType.RELATIONSHIP:
        if (this.databaseSchema && tableName) {
          const relationshipName = token.value.slice(0, -4).toLowerCase();
          const relationships = this.databaseSchema[tableName].directRelationships || [];
          const relationship = relationships.find(rel => 
            rel.relationship_name.toLowerCase() === relationshipName
          );
          if (relationship) {
            metadata.targetTable = relationship.target_table_name;
            metadata.relationshipName = relationship.relationship_name;
          }
        }
        break;

      case SemanticTokenType.LITERAL:
        metadata.literalType = token.value;
        break;
    }

    return metadata;
  }

  /**
   * Calculate token length in source text
   */
  calculateTokenLength(token, fullText) {
    if (token.type === TokenType.STRING) {
      // Include quotes
      return token.value.length + 2;
    }
    
    if (typeof token.value === 'string') {
      return token.value.length;
    }
    
    // For numbers and other types, find the actual text representation
    const remaining = fullText.substring(token.position);
    const match = remaining.match(/^[^\s\(\),\.]+/);
    return match ? match[0].length : 1;
  }

  /**
   * Post-process tokens to handle edge cases and add missing information
   */
  postProcessTokens(tokens, text) {
    // Handle parentheses matching
    const parenStack = [];
    const parenPairs = new Map();

    tokens.forEach((token, index) => {
      if (token.type === SemanticTokenType.PUNCTUATION) {
        if (token.value === '(') {
          parenStack.push(index);
        } else if (token.value === ')') {
          const openIndex = parenStack.pop();
          if (openIndex !== undefined) {
            parenPairs.set(openIndex, index);
            parenPairs.set(index, openIndex);
          }
        }
      }
    });

    // Add parentheses matching information
    tokens.forEach((token, index) => {
      if (parenPairs.has(index)) {
        token.matchingParen = parenPairs.get(index);
      }
    });

    // Handle unmatched parentheses
    if (parenStack.length > 0) {
      parenStack.forEach(index => {
        tokens[index].type = SemanticTokenType.ERROR;
        tokens[index].cssClass = this.theme[SemanticTokenType.ERROR];
        tokens[index].error = 'Unmatched opening parenthesis';
      });
    }

    return tokens;
  }

  /**
   * Generate HTML with syntax highlighting
   * @param {string} text - Formula text
   * @param {string} tableName - Current table name
   * @returns {string} HTML with syntax highlighting
   */
  toHTML(text, tableName = null) {
    const tokens = this.highlight(text, tableName);
    let html = '';
    let currentPos = 0;

    tokens.forEach(token => {
      // Add any unhighlighted text before this token
      if (token.position > currentPos) {
        const unhighlighted = text.substring(currentPos, token.position);
        html += this.escapeHtml(unhighlighted);
      }

      // Add the highlighted token
      const tokenText = text.substring(token.position, token.position + token.length);
      const title = token.metadata?.description || token.error || '';
      const dataAttrs = this.getDataAttributes(token);
      
      html += `<span class="${token.cssClass}" title="${this.escapeHtml(title)}"${dataAttrs}>${this.escapeHtml(tokenText)}</span>`;
      
      currentPos = token.position + token.length;
    });

    // Add any remaining unhighlighted text
    if (currentPos < text.length) {
      html += this.escapeHtml(text.substring(currentPos));
    }

    return html;
  }

  /**
   * Generate data attributes for token
   */
  getDataAttributes(token) {
    let attrs = ` data-token-type="${token.type}"`;
    
    if (token.metadata) {
      Object.entries(token.metadata).forEach(([key, value]) => {
        attrs += ` data-${key}="${this.escapeHtml(String(value))}"`;
      });
    }

    if (token.matchingParen !== undefined) {
      attrs += ` data-matching-paren="${token.matchingParen}"`;
    }

    return attrs;
  }

  /**
   * Get tokens for bracket matching
   */
  getBracketPairs(text, tableName = null) {
    const tokens = this.highlight(text, tableName);
    const pairs = [];
    const stack = [];

    tokens.forEach(token => {
      if (token.value === '(') {
        stack.push(token);
      } else if (token.value === ')') {
        const open = stack.pop();
        if (open) {
          pairs.push({
            open: { start: open.position, end: open.position + open.length },
            close: { start: token.position, end: token.position + token.length }
          });
        }
      }
    });

    return pairs;
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// CSS classes for default theme (to be included in CSS)
export const DefaultHighlightCSS = `
.formula-function {
  color: #0066cc;
  font-weight: bold;
}

.formula-keyword {
  color: #7c3aed;
  font-weight: bold;
}

.formula-number {
  color: #059669;
}

.formula-string {
  color: #dc2626;
}

.formula-operator {
  color: #7c2d12;
  font-weight: bold;
}

.formula-punctuation {
  color: #6b7280;
}

.formula-identifier {
  color: #374151;
}

.formula-column {
  color: #0891b2;
  font-weight: 500;
}

.formula-relationship {
  color: #be185d;
  font-style: italic;
}

.formula-literal {
  color: #7c3aed;
  font-weight: 500;
}

.formula-comment {
  color: #6b7280;
  font-style: italic;
}

.formula-error {
  color: #dc2626;
  background-color: #fef2f2;
  text-decoration: underline wavy #dc2626;
}

/* Hover effects */
.formula-function:hover,
.formula-column:hover,
.formula-relationship:hover {
  background-color: #f3f4f6;
  border-radius: 2px;
}

/* Parentheses matching */
.formula-punctuation.paren-matched {
  background-color: #dbeafe;
  border-radius: 2px;
}
`;

// Export token types and theme
export { SemanticTokenType, DefaultTheme };