/**
 * Language Server Protocol (LSP) Implementation
 * Provides autocomplete, error detection, and contextual help for formula language
 */

import { Lexer, TokenType } from '../src/lexer.js';
import { Parser } from '../src/parser.js';
import { FUNCTION_METADATA, FUNCTIONS, CATEGORIES } from '../src/function-metadata.js';
import { TYPE } from '../src/types-unified.js';

// LSP Response Types (Monaco/VS Code compatible)
const CompletionItemKind = {
  FUNCTION: 1,        // monaco.languages.CompletionItemKind.Function
  KEYWORD: 17,        // monaco.languages.CompletionItemKind.Keyword  
  FIELD: 5,          // monaco.languages.CompletionItemKind.Field
  RELATIONSHIP: 9,    // monaco.languages.CompletionItemKind.Reference
  LITERAL: 12,       // monaco.languages.CompletionItemKind.Value
  OPERATOR: 11       // monaco.languages.CompletionItemKind.Operator
};

// String versions for non-Monaco environments
const CompletionItemKindString = {
  FUNCTION: 'function',
  KEYWORD: 'keyword',
  FIELD: 'field',
  RELATIONSHIP: 'relationship',
  LITERAL: 'literal',
  OPERATOR: 'operator'
};

const DiagnosticSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  HINT: 'hint'
};

/**
 * Language Server for Formula Language
 */
export class FormulaLanguageServer {
  constructor(databaseSchema = null) {
    this.schema = databaseSchema;
    this.keywords = ['TRUE', 'FALSE', 'NULL', 'AND', 'OR', 'NOT'];
    this.operators = ['+', '-', '*', '/', '&', '>', '>=', '<', '<=', '=', '!=', '<>'];
  }

  /**
   * Update database schema for relationship resolution
   */
  updateSchema(schema) {
    this.schema = schema;
  }

  /**
   * Get completion suggestions at cursor position (Monaco/VS Code compatible)
   */
  getCompletions(text, position, tableName = null, useMonacoFormat = true) {
    try {
      const context = this.analyzeContext(text, position);
      const completions = [];

      // Check if we're in relationship navigation context
      if (context.relationshipNavigation && (context.expectingIdentifier || context.relationshipNavigation.hasRelationshipNavigation)) {
        // We're after a relationship like "assigned_rep_id_rel."
        // Get completions from the target table
        const targetTable = this.resolveTargetTable(context.relationshipNavigation, tableName);
        
        if (targetTable) {
          console.log(`🔗 Relationship navigation: ${tableName} → ${targetTable} via ${context.relationshipNavigation.relationshipChain.join(' → ')}`);
          console.log(`🔍 Context prefix: "${context.prefix}"`);
          
          // Get related field completions from target table
          const relatedFields = this.getRelatedFieldCompletions(targetTable, context.prefix, context.relationshipNavigation, useMonacoFormat);
          console.log(`📊 Related fields found: ${relatedFields.length}`);
          completions.push(...relatedFields);
          
          // Also get relationship completions from target table (for nested navigation)
          const nestedRels = this.getRelationshipCompletions(targetTable, context.prefix, useMonacoFormat);
          console.log(`📊 Nested relationships found: ${nestedRels.length}`);
          completions.push(...nestedRels);
        } else {
          console.warn(`⚠️ Could not resolve target table for relationship navigation: ${context.relationshipNavigation.relationshipChain.join(' → ')}`);
        }
      } else {
        // Normal completion context (not in relationship navigation)
        
        // Function completions
        if (context.expectingFunction || context.expectingIdentifier) {
          completions.push(...this.getFunctionCompletions(context.prefix, useMonacoFormat));
        }

        // Column completions (for current table)
        if (context.expectingIdentifier && tableName && this.schema) {
          completions.push(...this.getColumnCompletions(tableName, context.prefix, useMonacoFormat));
          
          // Relationship completions
          completions.push(...this.getRelationshipCompletions(tableName, context.prefix, useMonacoFormat));
        }

        // Keyword completions
        if (context.expectingIdentifier || context.expectingKeyword) {
          completions.push(...this.getKeywordCompletions(context.prefix, useMonacoFormat));
        }

        // Operator completions (when appropriate)
        if (context.expectingOperator) {
          completions.push(...this.getOperatorCompletions(context.prefix, useMonacoFormat));
        }
      }

      return this.filterAndRankCompletions(completions, context.prefix);
    } catch (error) {
      console.error('LSP completion error:', error);
      return [];
    }
  }

  /**
   * Get diagnostics (errors, warnings) for the formula
   */
  getDiagnostics(text, tableName = null) {
    const diagnostics = [];

    try {
      // Lexical analysis
      const lexer = new Lexer(text);
      const tokens = [];
      
      try {
        let token;
        do {
          token = lexer.getNextToken();
          tokens.push(token);
        } while (token.type !== TokenType.EOF);
      } catch (lexError) {
        diagnostics.push({
          severity: DiagnosticSeverity.ERROR,
          message: lexError.message,
          range: {
            start: lexError.position || 0,
            end: (lexError.position || 0) + 1
          },
          source: 'lexer'
        });
        return diagnostics; // Can't continue without valid tokens
      }

      // Syntax analysis
      try {
        const parser = new Parser(new Lexer(text));
        const ast = parser.parse();
        
        // Semantic analysis
        diagnostics.push(...this.validateSemantics(ast, tableName, tokens));
        
      } catch (parseError) {
        diagnostics.push({
          severity: DiagnosticSeverity.ERROR,
          message: parseError.message,
          range: {
            start: parseError.position || 0,
            end: (parseError.position || 0) + 1
          },
          source: 'parser'
        });
      }

    } catch (error) {
      diagnostics.push({
        severity: DiagnosticSeverity.ERROR,
        message: `Analysis error: ${error.message}`,
        range: { start: 0, end: text.length },
        source: 'lsp'
      });
    }

    return diagnostics;
  }

  /**
   * Get hover information for position
   */
  getHover(text, position) {
    try {
      const context = this.analyzeContext(text, position);
      
      if (context.currentToken) {
        const token = context.currentToken;
        
        // Function hover
        if (token.type === TokenType.IDENTIFIER && FUNCTION_METADATA[token.value]) {
          const metadata = FUNCTION_METADATA[token.value];
          return {
            contents: this.formatFunctionHelp(metadata),
            range: {
              start: token.position,
              end: token.position + token.value.length
            }
          };
        }

        // Relationship hover (if schema available)  
        if (token.type === TokenType.IDENTIFIER && this.schema && token.value.toLowerCase().endsWith('_rel')) {
          const relationshipName = token.value.slice(0, -4).toLowerCase();
          const relationship = this.findRelationship(relationshipName);
          if (relationship) {
            return {
              contents: `**Relationship**: ${relationship.relationship_name}\n\n` +
                       `**Target Table**: ${relationship.target_table_name}\n\n` +
                       `**Description**: Links to ${relationship.target_table_name} records`,
              range: {
                start: token.position,
                end: token.position + token.value.length
              }
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('LSP hover error:', error);
      return null;
    }
  }

  /**
   * Analyze context at cursor position
   */
  analyzeContext(text, position) {
    const beforeCursor = text.substring(0, position);
    const afterCursor = text.substring(position);
    
    // Find the current word/token
    const currentWordMatch = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    const prefix = currentWordMatch ? currentWordMatch[0] : '';
    
    // Determine context based on preceding tokens
    const trimmedBefore = beforeCursor.trim();
    const lastChar = trimmedBefore[trimmedBefore.length - 1];
    
    // Tokenize what we have so far to understand context
    let expectingFunction = false;
    let expectingIdentifier = false;
    let expectingOperator = false;
    let expectingKeyword = false;
    let currentToken = null;

    try {
      const lexer = new Lexer(beforeCursor);
      const tokens = [];
      let token;
      
      do {
        token = lexer.getNextToken();
        if (token.type !== TokenType.EOF) {
          tokens.push(token);
        }
      } while (token.type !== TokenType.EOF);

      // Analyze the last few tokens to determine what's expected
      const lastToken = tokens[tokens.length - 1];
      const secondLastToken = tokens[tokens.length - 2];

      if (!lastToken || lastToken.type === TokenType.LPAREN || 
          lastToken.type === TokenType.COMMA) {
        expectingFunction = true;
        expectingIdentifier = true;
      } else if (lastToken.type === TokenType.IDENTIFIER) {
        currentToken = lastToken;
        // For autocomplete, if we're at the end of an identifier, we could be:
        // 1. Trying to complete the identifier (expecting identifier)
        // 2. Trying to add an operator after it (expecting operator)
        expectingOperator = true;
        expectingIdentifier = true; // Also allow identifier completion
      } else if ([TokenType.PLUS, TokenType.MINUS, TokenType.MULTIPLY, 
                 TokenType.DIVIDE, TokenType.GT, TokenType.LT, TokenType.EQ].includes(lastToken.type)) {
        expectingFunction = true;
        expectingIdentifier = true;
      } else if (lastToken.type === TokenType.DOT) {
        expectingIdentifier = true; // Field after relationship
      }

    } catch (error) {
      // If tokenization fails, assume we're at the beginning or after an error
      expectingFunction = true;
      expectingIdentifier = true;
    }

    return {
      prefix,
      expectingFunction,
      expectingIdentifier,
      expectingOperator,
      expectingKeyword,
      currentToken,
      beforeCursor,
      afterCursor,
      relationshipNavigation: this.parseRelationshipNavigation(beforeCursor)
    };
  }

  /**
   * Parse relationship navigation from text before cursor
   * Returns information about relationship chain and target table
   */
  parseRelationshipNavigation(beforeCursor) {
    // Look for patterns like "relationship_name_rel." or "rel1_rel.rel2_rel."
    const relationshipPattern = /([a-zA-Z_][a-zA-Z0-9_]*_rel\.)+$/;
    const match = beforeCursor.match(relationshipPattern);
    
    if (!match) {
      return null;
    }
    
    // Extract the relationship chain
    const chainText = match[0];
    const relationshipParts = chainText.split('.').filter(part => part.length > 0);
    
    // Remove "_rel" suffix from each part to get relationship names
    const relationshipChain = relationshipParts.map(part => 
      part.endsWith('_rel') ? part.slice(0, -4) : part
    );
    
    return {
      hasRelationshipNavigation: true,
      relationshipChain,
      fullMatch: chainText
    };
  }

  /**
   * Resolve target table from relationship navigation
   */
  resolveTargetTable(relationshipNavigation, startingTable) {
    if (!relationshipNavigation || !this.schema || !startingTable) {
      return null;
    }
    
    let currentTable = startingTable;
    
    for (const relationshipName of relationshipNavigation.relationshipChain) {
      const relationship = this.findRelationshipInTable(currentTable, relationshipName);
      if (!relationship) {
        // Relationship not found, can't resolve further
        return null;
      }
      currentTable = relationship.target_table_name;
    }
    
    return currentTable;
  }

  /**
   * Get function completions (Monaco/VS Code compatible)
   */
  getFunctionCompletions(prefix = '', useMonacoFormat = true) {
    const completions = [];
    const upperPrefix = prefix.toUpperCase();

    Object.values(FUNCTION_METADATA).forEach(func => {
      if (func.name.startsWith(upperPrefix)) {
        const args = func.arguments || [];
        const signature = args.length > 0 
          ? `${func.name}(${args.map(arg => arg.name).join(', ')})`
          : `${func.name}()`;

        if (useMonacoFormat) {
          // Monaco/VS Code format
          completions.push({
            label: func.name,
            kind: CompletionItemKind.FUNCTION,
            detail: signature,
            documentation: {
              value: this.formatFunctionMarkdown(func)
            },
            insertText: `${func.name}(\${1})`,
            insertTextRules: 4, // monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            sortText: `3_${func.name}`,
            filterText: func.name,
            range: null // Will be set by Monaco
          });
        } else {
          // Legacy format
          completions.push({
            label: func.name,
            kind: CompletionItemKindString.FUNCTION,
            detail: signature,
            documentation: func.description,
            insertText: `${func.name}($1)`,
            category: func.category,
            sortText: `3_${func.name}`
          });
        }
      }
    });

    return completions;
  }

  /**
   * Get column completions for a table (Monaco/VS Code compatible)
   */
  getColumnCompletions(tableName, prefix = '', useMonacoFormat = true) {
    if (!this.schema || !this.schema[tableName]) {
      return [];
    }

    const completions = [];
    const upperPrefix = prefix.toUpperCase();
    const columns = this.schema[tableName].columns || [];

    columns.forEach(column => {
      const columnName = column.column_name.toUpperCase();
      // Match if column starts with prefix OR if prefix is a substring of column name
      if (columnName.startsWith(upperPrefix) || columnName.includes(upperPrefix)) {
        if (useMonacoFormat) {
          completions.push({
            label: column.column_name,
            kind: CompletionItemKind.FIELD,
            detail: `${column.data_type} column`,
            documentation: {
              value: `**Column:** \`${column.column_name}\`\n\n**Type:** \`${column.data_type}\`\n\n**Table:** \`${tableName}\``
            },
            insertText: column.column_name,
            sortText: `1_${column.column_name}`,
            filterText: column.column_name,
            range: null
          });
        } else {
          completions.push({
            label: column.column_name,
            kind: CompletionItemKindString.FIELD,
            detail: `${column.data_type} column`,
            documentation: `Column from ${tableName} table`,
            insertText: column.column_name,
            sortText: `1_${column.column_name}`
          });
        }
      }
    });

    return completions;
  }

  /**
   * Get related field completions (fields from related table via relationship navigation)
   */
  getRelatedFieldCompletions(targetTableName, prefix = '', relationshipNavigation, useMonacoFormat = true) {
    if (!this.schema || !this.schema[targetTableName]) {
      return [];
    }

    const completions = [];
    const upperPrefix = prefix.toUpperCase();
    const columns = this.schema[targetTableName].columns || [];
    
    // Build relationship path for documentation
    const relationshipPath = relationshipNavigation.relationshipChain.join('_rel.') + '_rel';

    columns.forEach(column => {
      const columnName = column.column_name.toUpperCase();
      // Match if column starts with prefix OR if prefix is a substring of column name
      if (columnName.startsWith(upperPrefix) || columnName.includes(upperPrefix)) {
        if (useMonacoFormat) {
          completions.push({
            label: column.column_name,
            kind: CompletionItemKind.FIELD,
            detail: `${column.data_type} field from ${targetTableName}`,
            documentation: {
              value: `**Related Field:** \`${column.column_name}\`\n\n**Type:** \`${column.data_type}\`\n\n**From Table:** \`${targetTableName}\`\n\n**Via:** \`${relationshipPath}\`\n\n**Usage:** Field from related ${targetTableName} records`
            },
            insertText: column.column_name,
            sortText: `1_${column.column_name}`,
            filterText: column.column_name,
            range: null
          });
        } else {
          completions.push({
            label: column.column_name,
            kind: CompletionItemKindString.FIELD,
            detail: `${column.data_type} field from ${targetTableName}`,
            documentation: `Related field from ${targetTableName} table via ${relationshipPath}`,
            insertText: column.column_name,
            sortText: `1_${column.column_name}`
          });
        }
      }
    });

    return completions;
  }

  /**
   * Get relationship completions (Monaco/VS Code compatible)
   */
  getRelationshipCompletions(tableName, prefix = '', useMonacoFormat = true) {
    if (!this.schema || !this.schema[tableName]) {
      return [];
    }

    const completions = [];
    const upperPrefix = prefix.toUpperCase();
    const relationships = this.schema[tableName].directRelationships || [];

    relationships.forEach(rel => {
      const relName = `${rel.relationship_name}_rel`;
      const upperRelName = relName.toUpperCase();
      
      if (upperRelName.startsWith(upperPrefix) || upperRelName.includes(upperPrefix)) {
        if (useMonacoFormat) {
          completions.push({
            label: relName,
            kind: CompletionItemKind.RELATIONSHIP,
            detail: `→ ${rel.target_table_name}`,
            documentation: {
              value: `**Relationship:** \`${rel.relationship_name}\`\n\n**Target:** \`${rel.target_table_name}\`\n\n**Usage:** Access fields from related ${rel.target_table_name} records`
            },
            insertText: `${relName}.`,
            sortText: `2_${relName}`,
            filterText: relName,
            range: null
          });
        } else {
          completions.push({
            label: relName,
            kind: CompletionItemKindString.RELATIONSHIP,
            detail: `→ ${rel.target_table_name}`,
            documentation: `Relationship to ${rel.target_table_name} table`,
            insertText: `${relName}.`,
            sortText: `2_${relName}`
          });
        }
      }
    });

    return completions;
  }

  /**
   * Get keyword completions (Monaco/VS Code compatible)
   */
  getKeywordCompletions(prefix = '', useMonacoFormat = true) {
    const completions = [];
    const upperPrefix = prefix.toUpperCase();

    this.keywords.forEach(keyword => {
      if (keyword.startsWith(upperPrefix)) {
        if (useMonacoFormat) {
          completions.push({
            label: keyword,
            kind: CompletionItemKind.KEYWORD,
            detail: 'keyword',
            documentation: {
              value: `**Keyword:** \`${keyword}\`\n\nBoolean or logical keyword`
            },
            insertText: keyword,
            sortText: `4_${keyword}`,
            filterText: keyword,
            range: null
          });
        } else {
          completions.push({
            label: keyword,
            kind: CompletionItemKindString.KEYWORD,
            detail: 'keyword',
            insertText: keyword,
            sortText: `4_${keyword}`
          });
        }
      }
    });

    return completions;
  }

  /**
   * Get operator completions (Monaco/VS Code compatible)
   */
  getOperatorCompletions(prefix = '', useMonacoFormat = true) {
    const completions = [];

    this.operators.forEach(op => {
      if (op.startsWith(prefix)) {
        if (useMonacoFormat) {
          completions.push({
            label: op,
            kind: CompletionItemKind.OPERATOR,
            detail: 'operator',
            documentation: {
              value: `**Operator:** \`${op}\`\n\nMathematical or comparison operator`
            },
            insertText: ` ${op} `,
            sortText: `5_${op}`,
            filterText: op,
            range: null
          });
        } else {
          completions.push({
            label: op,
            kind: CompletionItemKindString.OPERATOR,
            detail: 'operator',
            insertText: ` ${op} `,
            sortText: `5_${op}`
          });
        }
      }
    });

    return completions;
  }

  /**
   * Filter and rank completions based on relevance
   */
  filterAndRankCompletions(completions, prefix) {
    if (!prefix) return completions;

    const upperPrefix = prefix.toUpperCase();
    
    return completions
      .filter(comp => comp.label.toUpperCase().includes(upperPrefix))
      .sort((a, b) => {
        // Exact matches first
        const aExact = a.label.toUpperCase() === upperPrefix;
        const bExact = b.label.toUpperCase() === upperPrefix;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then by prefix match
        const aStarts = a.label.toUpperCase().startsWith(upperPrefix);
        const bStarts = b.label.toUpperCase().startsWith(upperPrefix);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Then by category priority (functions first)
        return a.sortText.localeCompare(b.sortText);
      });
  }

  /**
   * Validate semantics of AST
   */
  validateSemantics(ast, tableName, tokens) {
    const diagnostics = [];

    try {
      this.validateNode(ast, tableName, diagnostics);
    } catch (error) {
      diagnostics.push({
        severity: DiagnosticSeverity.ERROR,
        message: `Semantic validation error: ${error.message}`,
        range: { start: 0, end: 1 },
        source: 'semantic'
      });
    }

    return diagnostics;
  }

  /**
   * Validate individual AST node
   */
  validateNode(node, tableName, diagnostics) {
    if (!node) return;

    switch (node.type) {
      case TYPE.FUNCTION_CALL:
        this.validateFunction(node, tableName, diagnostics);
        break;
      
      case TYPE.RELATIONSHIP_REF:
        this.validateRelationship(node, tableName, diagnostics);
        break;
      
      case TYPE.IDENTIFIER:
        this.validateIdentifier(node, tableName, diagnostics);
        break;
      
      case TYPE.BINARY_OP:
        this.validateNode(node.left, tableName, diagnostics);
        this.validateNode(node.right, tableName, diagnostics);
        break;
      
      case TYPE.UNARY_OP:
        this.validateNode(node.operand, tableName, diagnostics);
        break;
    }

    // Validate function arguments recursively
    if (node.args) {
      node.args.forEach(arg => this.validateNode(arg, tableName, diagnostics));
    }
  }

  /**
   * Validate function call
   */
  validateFunction(node, tableName, diagnostics) {
    const metadata = FUNCTION_METADATA[node.name];
    
    if (!metadata) {
      diagnostics.push({
        severity: DiagnosticSeverity.ERROR,
        message: `Unknown function: ${node.name}`,
        range: {
          start: node.position,
          end: node.position + node.name.length
        },
        source: 'semantic'
      });
      return;
    }

    // Validate argument count
    const argCount = node.args.length;
    if (argCount < metadata.minArgs) {
      diagnostics.push({
        severity: DiagnosticSeverity.ERROR,
        message: `${node.name} requires at least ${metadata.minArgs} arguments, got ${argCount}`,
        range: {
          start: node.position,
          end: node.position + node.name.length
        },
        source: 'semantic'
      });
    } else if (metadata.maxArgs && argCount > metadata.maxArgs) {
      diagnostics.push({
        severity: DiagnosticSeverity.ERROR,
        message: `${node.name} accepts at most ${metadata.maxArgs} arguments, got ${argCount}`,
        range: {
          start: node.position,
          end: node.position + node.name.length
        },
        source: 'semantic'
      });
    }
  }

  /**
   * Validate relationship reference
   */
  validateRelationship(node, tableName, diagnostics) {
    if (!this.schema || !tableName) return;

    // Validate relationship chain
    let currentTable = tableName;
    for (const relationshipName of node.relationshipChain) {
      const relationship = this.findRelationshipInTable(currentTable, relationshipName);
      if (!relationship) {
        diagnostics.push({
          severity: DiagnosticSeverity.ERROR,
          message: `Unknown relationship: ${relationshipName} from table ${currentTable}`,
          range: {
            start: node.position,
            end: node.position + 10 // approximate
          },
          source: 'semantic'
        });
        return;
      }
      currentTable = relationship.target_table_name;
    }

    // Validate final field if specified
    if (node.fieldName) {
      const finalTable = this.schema[currentTable];
      if (finalTable) {
        const column = finalTable.columns.find(col => 
          col.column_name.toLowerCase() === node.fieldName.toLowerCase()
        );
        if (!column) {
          diagnostics.push({
            severity: DiagnosticSeverity.WARNING,
            message: `Unknown column: ${node.fieldName} in table ${currentTable}`,
            range: {
              start: node.position,
              end: node.position + 10
            },
            source: 'semantic'
          });
        }
      }
    }
  }

  /**
   * Validate identifier (column reference)
   */
  validateIdentifier(node, tableName, diagnostics) {
    if (!this.schema || !tableName || !this.schema[tableName]) return;

    // Skip special identifiers
    if (['TRUE', 'FALSE', 'NULL'].includes(node.value)) return;

    const columns = this.schema[tableName].columns || [];
    const column = columns.find(col => 
      col.column_name.toLowerCase() === node.value.toLowerCase()
    );

    if (!column) {
      diagnostics.push({
        severity: DiagnosticSeverity.WARNING,
        message: `Unknown column: ${node.value}`,
        range: {
          start: node.position,
          end: node.position + node.value.length
        },
        source: 'semantic'
      });
    }
  }

  /**
   * Find relationship in table
   */
  findRelationshipInTable(tableName, relationshipName) {
    if (!this.schema || !this.schema[tableName]) return null;
    
    const relationships = this.schema[tableName].directRelationships || [];
    return relationships.find(rel => 
      rel.relationship_name.toLowerCase() === relationshipName.toLowerCase()
    );
  }

  /**
   * Find relationship by name across all tables
   */
  findRelationship(relationshipName) {
    if (!this.schema) return null;

    for (const table of Object.values(this.schema)) {
      const relationships = table.directRelationships || [];
      const found = relationships.find(rel => 
        rel.relationship_name.toLowerCase() === relationshipName.toLowerCase()
      );
      if (found) return found;
    }
    return null;
  }

  /**
   * Format function help text (legacy)
   */
  formatFunctionHelp(metadata) {
    let help = `**${metadata.name}** (${metadata.category})\n\n`;
    help += `${metadata.description}\n\n`;
    
    if (metadata.arguments && metadata.arguments.length > 0) {
      help += '**Parameters:**\n';
      metadata.arguments.forEach(arg => {
        const optional = arg.optional ? ' (optional)' : '';
        help += `- \`${arg.name}\`: ${arg.description}${optional}\n`;
      });
    }
    
    help += `\n**Returns:** ${metadata.returnType}`;
    return help;
  }

  /**
   * Format function markdown (Monaco/VS Code compatible)
   */
  formatFunctionMarkdown(metadata) {
    let markdown = `**${metadata.name}** *(${metadata.category})*\n\n`;
    markdown += `${metadata.description}\n\n`;
    
    if (metadata.arguments && metadata.arguments.length > 0) {
      markdown += '**Parameters:**\n\n';
      metadata.arguments.forEach(arg => {
        const optional = arg.optional ? ' *(optional)*' : '';
        markdown += `• \`${arg.name}\`: ${arg.description}${optional}\n`;
      });
    }
    
    // Fix Symbol conversion by properly converting to string
    const returnTypeStr = typeof metadata.returnType === 'symbol' 
      ? metadata.returnType.toString().replace('Symbol(', '').replace(')', '')
      : String(metadata.returnType);
    
    markdown += `\n**Returns:** \`${returnTypeStr}\``;
    return markdown;
  }
}

// Export completion item kinds and diagnostic severities for use by clients
export { CompletionItemKind, CompletionItemKindString, DiagnosticSeverity };