import { NodeType } from './types.js';

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
        if (left.returnType === 'date' && right.returnType === 'number') {
          resultType = 'date'; // date + number = date (allow for both direct dates and date expressions)
        } else if (left.returnType === 'number' && right.returnType === 'date') {
          // Only allow number + date if the number is a direct operand (not an expression result)
          if (left.type === 'NUMBER' || left.type === 'IDENTIFIER') {
            resultType = 'date'; // number + date = date
          } else {
            this.error(`Invalid operand types for +: ${left.returnType} and ${right.returnType}`, node.position);
          }
        } else if (left.returnType === 'date' && right.returnType === 'date') {
          this.error('Invalid operand types for +: date and date', node.position);
        } else if (left.returnType !== 'number' || right.returnType !== 'number') {
          this.error(`Invalid operand types for +: ${left.returnType} and ${right.returnType}`, node.position);
        } else {
          resultType = 'number'; // number + number = number
        }
      } else if (node.op === '-') {
        if (left.returnType === 'date' && right.returnType === 'number') {
          resultType = 'date'; // date - number = date (allow for both direct dates and date expressions)
        } else if (left.returnType === 'date' && right.returnType === 'date') {
          resultType = 'number'; // date - date = interval (treated as number)
        } else if (left.returnType !== 'number' || right.returnType !== 'number') {
          this.error(`Invalid operand types for -: ${left.returnType} and ${right.returnType}`, node.position);
        } else {
          resultType = 'number'; // number - number = number
        }
      } else if (['*', '/'].includes(node.op)) {
        // Multiplication and division only work with numbers
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
    // Handle both single-level (backward compatibility) and multi-level relationships
    const relationshipChain = node.relationshipChain || [node.relationName];
    
    if (relationshipChain.length > this.maxRelationshipDepth) {
      this.error(`Relationship chain too deep (max ${this.maxRelationshipDepth} levels): ${relationshipChain.join('.')}.${node.fieldName}`, node.position);
    }
    
    return this.compileMultiLevelRelationship(relationshipChain, node.fieldName, node.position);
  }

  /**
   * Compile multi-level relationship chains
   * @param {Array<string>} relationshipChain - Array of relationship names
   * @param {string} fieldName - Final field name to access
   * @param {number} position - Position for error reporting
   * @returns {Object} Compiled relationship reference
   */
  compileMultiLevelRelationship(relationshipChain, fieldName, position) {
    let currentTable = this.tableName;
    const allJoinSemanticIds = [];
    const joinIntents = [];
    
    // Build a lookup map of relationships for efficient access
    const relationshipLookup = new Map();
    if (this.context.relationshipInfos) {
      for (const rel of this.context.relationshipInfos) {
        const key = `${rel.fromTable}:${rel.name}`;
        relationshipLookup.set(key, rel);
      }
    }
    
    // Build a lookup map of table infos for efficient access
    const tableLookup = new Map();
    if (this.context.tableInfos) {
      for (const table of this.context.tableInfos) {
        tableLookup.set(table.tableName, table);
      }
    }
    
    // Validate and traverse the relationship chain
    for (let i = 0; i < relationshipChain.length; i++) {
      const relationName = relationshipChain[i];
      const lookupKey = `${currentTable}:${relationName}`;
      
      // Check if relationship exists from current table
      const relInfo = relationshipLookup.get(lookupKey);
      if (!relInfo) {
        // Get available relationships for current table for error message
        const availableRelationships = Array.from(relationshipLookup.keys())
          .filter(key => key.startsWith(`${currentTable}:`))
          .map(key => key.split(':')[1])
          .slice(0, 10);
        const suggestionText = availableRelationships.length > 0 
          ? ` Available relationships from ${currentTable}: ${availableRelationships.join(', ')}`
          : ` No relationships available from ${currentTable}`;
        const chainSoFar = relationshipChain.slice(0, i + 1).join('.');
        this.error(`Unknown relationship: ${chainSoFar}.${suggestionText}`, position);
      }
      
      const targetTable = relInfo.toTable;
      
      // Generate join semantic ID for this level
      const joinSemanticId = this.generateMultiLevelJoinSemanticId(
        this.tableName, 
        relationshipChain.slice(0, i + 1), 
        relInfo.joinColumn
      );
      
      // Create join intent for this relationship level
      const joinIntent = {
        relationshipType: 'direct_relationship',
        sourceTable: currentTable,
        targetTable: targetTable,
        joinField: relInfo.joinColumn,
        semanticId: joinSemanticId,
        compilationContext: this.compilationContext,
        relationshipChain: relationshipChain.slice(0, i + 1) // Track the chain up to this point
      };
      
      // Track join intent (deduplicated by semanticId)
      if (!this.joinIntents.has(joinSemanticId)) {
        this.joinIntents.set(joinSemanticId, joinIntent);
      }
      
      allJoinSemanticIds.push(joinSemanticId);
      joinIntents.push(joinIntent);
      
      // Update current table for next iteration
      currentTable = targetTable;
    }
    
    // Validate final field exists in the target table
    const finalTableInfo = tableLookup.get(currentTable);
    if (!finalTableInfo) {
      // If using old format, fall back to checking relationshipInfo
      if (this.context.relationshipInfo) {
        // Try to find the field type through old relationship traversal
        const fieldType = this.getFieldTypeFromOldFormat(relationshipChain, fieldName);
        if (fieldType) {
          // Generate semantic ID for backward compatibility
          const relationshipRefSemanticId = this.generateSemanticId(
            'multi_relationship_ref', 
            `${relationshipChain.join('.')}.${fieldName}`, 
            allJoinSemanticIds
          );
          
          return {
            type: 'RELATIONSHIP_REF',
            semanticId: relationshipRefSemanticId,
            dependentJoins: allJoinSemanticIds,
            returnType: fieldType,
            compilationContext: this.compilationContext,
            value: { 
              relationshipChain: relationshipChain,
              fieldName: fieldName.toLowerCase(),
              finalTable: currentTable
            }
          };
        }
      }
      this.error(`Unknown target table: ${currentTable}`, position);
    }
    
    const fieldType = finalTableInfo.columnList[fieldName.toLowerCase()];
    if (!fieldType) {
      const availableFields = Object.keys(finalTableInfo.columnList).slice(0, 10);
      const suggestionText = availableFields.length > 0 
        ? ` Available fields: ${availableFields.join(', ')}`
        : '';
      const fullChain = relationshipChain.join('.') + '.' + fieldName;
      this.error(`Unknown field ${fieldName} in relationship chain ${fullChain}.${suggestionText}`, position);
    }
    
    // Generate semantic ID for the entire relationship reference
    const relationshipRefSemanticId = this.generateSemanticId(
      'multi_relationship_ref', 
      `${relationshipChain.join('.')}.${fieldName}`, 
      allJoinSemanticIds
    );
    
    return {
      type: 'RELATIONSHIP_REF',
      semanticId: relationshipRefSemanticId,
      dependentJoins: allJoinSemanticIds,
      returnType: fieldType,
      compilationContext: this.compilationContext,
      value: { 
        relationshipChain: relationshipChain,
        fieldName: fieldName.toLowerCase(),
        finalTable: currentTable
      }
    };
  }

  /**
   * Generate semantic ID for multi-level join intent
   * @param {string} baseTable - Base table name
   * @param {Array<string>} chainSoFar - Relationship chain up to this point
   * @param {string} joinField - Join field for this level
   * @returns {string} Semantic ID for this join level
   */
  generateMultiLevelJoinSemanticId(baseTable, chainSoFar, joinField) {
    const chainPath = chainSoFar.join('→');
    return `direct:${baseTable}→${chainPath}[${joinField}]@${this.compilationContext}`;
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

  getJoinIntents() {
    return Array.from(this.joinIntents.values());
  }

  getAggregateIntents() {
    return Array.from(this.aggregateIntents.values());
  }

  /**
   * Get field type from old nested relationship format (fallback)
   * @param {Array<string>} relationshipChain - Chain of relationship names
   * @param {string} fieldName - Final field name
   * @returns {string|null} Field type or null if not found
   */
  getFieldTypeFromOldFormat(relationshipChain, fieldName) {
    let currentRelationshipInfo = this.context.relationshipInfo;
    
    // Traverse the relationship chain using old format
    for (let i = 0; i < relationshipChain.length; i++) {
      const relationName = relationshipChain[i];
      
      if (!currentRelationshipInfo || !currentRelationshipInfo[relationName]) {
        return null; // Relationship not found
      }
      
      const relInfo = currentRelationshipInfo[relationName];
      
      if (i === relationshipChain.length - 1) {
        // Last relationship in chain - check for field in target table
        return relInfo.columnList ? relInfo.columnList[fieldName.toLowerCase()] : null;
      } else {
        // Continue traversing - move to nested relationships
        currentRelationshipInfo = relInfo.relationshipInfo || {};
      }
    }
    
    return null;
  }
}

// Export for ES modules
export { Compiler };