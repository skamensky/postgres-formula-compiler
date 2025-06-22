import { TYPE, typeToString, TOKEN_TO_OPERATION, getOperationRule, getOperationResultType } from './types-unified.js';
import { compileRelationshipRef } from './relationship-compiler.js';
import { compileFunction } from './function-dispatcher.js';
import { TokenValue } from './lexer.js';

/**
 * Intent-based Formula Compiler
 * Generates semantic intent representations instead of SQL
 * 
 * NOTE: Assumes no special characters in table/column names for semantic ID generation
 * Uses hierarchical semantic IDs to maintain context across compilations
 */

/**
 * @typedef {Object} ExpressionIntent
 * @property {Symbol} type - Expression type (from unified TYPE system)
 * @property {string} semanticId - Hierarchical human-readable identifier
 * @property {Array<string>} dependentJoins - Required join semanticIds
 * @property {Symbol} returnType - Result type (from unified TYPE system)
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
 * @property {Symbol} returnType - Result type of aggregate (from unified TYPE system)
 */

/**
 * @typedef {Object} CompilationResult
 * @property {ExpressionIntent} expression - Root expression intent
 * @property {Array<JoinIntent>} joinIntents - Required joins
 * @property {Array<AggregateIntent>} aggregateIntents - Required aggregates
 * @property {Symbol} returnType - Overall result type (from unified TYPE system)
 */

class Compiler {
  constructor(context, options = {}) {
    this.context = context;
    this.tableName = context.tableName;
    this.columnList = {};
    this.joinIntents = new Map(); // semanticId -> JoinIntent
    this.aggregateIntents = new Map(); // semanticId -> AggregateIntent
    this.compilationContext = 'main'; // Track current compilation context
    this.idCounter = 1; // For generating unique IDs
    this.maxRelationshipDepth = options.maxRelationshipDepth || 3; // Configurable max depth
    
    // Initialize column list from primary table
    this.initializeColumnList();
  }

  /**
   * Initialize column list for the primary table
   */
  initializeColumnList() {
    // Support both old format (direct columnList) and new format (tableInfos)
    if (this.context.columnList) {
      // Old format - direct columnList property
      for (const [name, type] of Object.entries(this.context.columnList)) {
        this.columnList[name.toUpperCase()] = type;
      }
    } else if (this.context.tableInfos) {
      // New format - find primary table in tableInfos array
      const primaryTable = this.context.tableInfos.find(table => table.tableName === this.tableName);
      if (primaryTable && primaryTable.columnList) {
        for (const [name, type] of Object.entries(primaryTable.columnList)) {
          this.columnList[name.toUpperCase()] = type;
        }
      }
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
    return this.stringTypeToSymbol(this.columnList[upperName]);
  }

  /**
   * Convert string type to Symbol type for consistency
   * @param {string} stringType - String type from column list
   * @returns {Symbol} Corresponding Symbol type
   */
  stringTypeToSymbol(stringType) {
    switch (stringType) {
      case 'string': return TYPE.STRING;
      case 'number': return TYPE.NUMBER;
      case 'boolean': return TYPE.BOOLEAN;
      case 'date': return TYPE.DATE;
      case 'null': return TYPE.NULL;
      default: return stringType; // Return as-is if not a known string type
    }
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
      case TYPE.NUMBER_LITERAL:
        return {
          type: TYPE.NUMBER_LITERAL,
          semanticId: this.generateSemanticId('number', node.value.toString()),
          dependentJoins: [],
          returnType: TYPE.NUMBER,
          compilationContext: this.compilationContext,
          value: node.value
        };

      case TYPE.IDENTIFIER:
        return this.compileIdentifier(node);

      case TYPE.BOOLEAN_LITERAL:
        return {
          type: TYPE.BOOLEAN_LITERAL,
          semanticId: this.generateSemanticId('boolean', node.value),
          dependentJoins: [],
          returnType: TYPE.BOOLEAN,
          compilationContext: this.compilationContext,
          value: node.value
        };

      case TYPE.NULL_LITERAL:
        return {
          type: TYPE.NULL_LITERAL,
          semanticId: this.generateSemanticId('null', 'NULL'),
          dependentJoins: [],
          returnType: TYPE.NULL,
          compilationContext: this.compilationContext,
          value: null
        };

      case TYPE.STRING_LITERAL:
        return {
          type: TYPE.STRING_LITERAL,
          semanticId: this.generateSemanticId('string', `'${node.value}'`),
          dependentJoins: [],
          returnType: TYPE.STRING,
          compilationContext: this.compilationContext,
          value: node.value
        };

      case TYPE.DATE_LITERAL:
        return {
          type: TYPE.DATE_LITERAL,
          semanticId: this.generateSemanticId('date', node.value),
          dependentJoins: [],
          returnType: TYPE.DATE,
          compilationContext: this.compilationContext,
          value: node.value
        };

      case TYPE.UNARY_OP:
        return this.compileUnaryOp(node);

      case TYPE.BINARY_OP:
        return this.compileBinaryOp(node);

      case TYPE.FUNCTION_CALL:
        return compileFunction(this, node);

      case TYPE.RELATIONSHIP_REF:
        return compileRelationshipRef(this, node);

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
      type: TYPE.IDENTIFIER,
      semanticId: this.generateSemanticId('column', `${this.tableName}.${node.value.toLowerCase()}`),
      dependentJoins: [],
      returnType: columnType,
      compilationContext: this.compilationContext,
      value: node.value.toLowerCase()
    };
  }

  compileUnaryOp(node) {
    const operand = this.compile(node.operand);
    
    if (operand.returnType !== TYPE.NUMBER) {
      this.error(`Unary ${node.op} requires numeric operand`, node.position);
    }

    return {
      type: TYPE.UNARY_OP,
      semanticId: this.generateSemanticId('unary_op', node.op, [operand.semanticId]),
      dependentJoins: operand.dependentJoins,
      returnType: TYPE.NUMBER,
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
    
    // Convert token value to operation symbol
    const operation = TOKEN_TO_OPERATION[node.op];
    if (!operation) {
      this.error(`Unknown binary operator: ${node.op}`, node.position);
    }
    
    // Check if operation is valid for these types
    const operationRule = getOperationRule(left.returnType, operation, right.returnType);
    
    // Handle special case for number + date where we need to check left operand type
    if (!operationRule && operation === TOKEN_TO_OPERATION['+'] && 
        left.returnType === TYPE.NUMBER && right.returnType === TYPE.DATE) {
      // Only allow number + date if the number is a direct operand (not an expression result)
      if (left.type === TYPE.NUMBER_LITERAL || left.type === TYPE.IDENTIFIER) {
        // This is valid, treat as date + number
        const reverseRule = getOperationRule(right.returnType, operation, left.returnType);
        if (reverseRule) {
          return {
            type: TYPE.BINARY_OP,
            semanticId: this.generateSemanticId('binary_op', node.op, [left.semanticId, right.semanticId]),
            dependentJoins: dependentJoins,
            returnType: reverseRule.result,
            compilationContext: this.compilationContext,
            value: { op: node.op },
            children: [left, right]
          };
        }
      }
    }
    
    if (!operationRule) {
      // Special error message for string concatenation
      if (operation === TOKEN_TO_OPERATION['&']) {
        this.error(`String concatenation operator & requires both operands to be strings, got ${typeToString(left.returnType)} and ${typeToString(right.returnType)}. Use STRING() function to cast values to strings.`, node.position);
      } else {
        this.error(`Invalid operand types for ${node.op}: ${typeToString(left.returnType)} and ${typeToString(right.returnType)}`, node.position);
      }
    }
    
    return {
      type: TYPE.BINARY_OP,
      semanticId: this.generateSemanticId('binary_op', node.op, [left.semanticId, right.semanticId]),
      dependentJoins: dependentJoins,
      returnType: operationRule.result,
      compilationContext: this.compilationContext,
      value: { op: node.op },
      children: [left, right]
    };
  }



  getJoinIntents() {
    return Array.from(this.joinIntents.values());
  }

  getAggregateIntents() {
    return Array.from(this.aggregateIntents.values());
  }


}

// Export for ES modules
export { Compiler };