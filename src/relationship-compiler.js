import { TYPE } from './types-unified.js';

/**
 * Convert schema field type string to unified TYPE symbol
 * @param {string} schemaType - Schema type like 'string', 'number', etc.
 * @returns {Symbol} Unified TYPE symbol
 */
function convertSchemaTypeToUnifiedType(schemaType) {
  switch (schemaType) {
    case 'string': return TYPE.STRING;
    case 'number': return TYPE.NUMBER;
    case 'boolean': return TYPE.BOOLEAN;
    case 'date': return TYPE.DATE;
    default: return TYPE.STRING; // Default fallback
  }
}

/**
 * Relationship compilation utilities
 * Handles multi-level relationship chains, join intent generation, and field validation
 */

/**
 * Compile relationship reference node
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - AST node for relationship reference
 * @returns {Object} Compiled relationship reference
 */
export function compileRelationshipRef(compiler, node) {
  // Handle both single-level (backward compatibility) and multi-level relationships
  const relationshipChain = node.relationshipChain || [node.relationName];
  
  if (relationshipChain.length > compiler.maxRelationshipDepth) {
    compiler.error(`Relationship chain too deep (max ${compiler.maxRelationshipDepth} levels): ${relationshipChain.join('.')}.${node.fieldName}`, node.position);
  }
  
  return compileMultiLevelRelationship(compiler, relationshipChain, node.fieldName, node.position);
}

/**
 * Compile multi-level relationship chains
 * @param {Object} compiler - Compiler instance
 * @param {Array<string>} relationshipChain - Array of relationship names
 * @param {string} fieldName - Final field name to access
 * @param {number} position - Position for error reporting
 * @returns {Object} Compiled relationship reference
 */
export function compileMultiLevelRelationship(compiler, relationshipChain, fieldName, position) {
  let currentTable = compiler.tableName;
  const allJoinSemanticIds = [];
  const joinIntents = [];
  
  // Build a lookup map of relationships for efficient access
  const relationshipLookup = new Map();
  if (compiler.context.relationshipInfos) {
    for (const rel of compiler.context.relationshipInfos) {
      const key = `${rel.fromTable}:${rel.name}`;
      relationshipLookup.set(key, rel);
    }
  }
  
  // Build a lookup map of table infos for efficient access
  const tableLookup = new Map();
  if (compiler.context.tableInfos) {
    for (const table of compiler.context.tableInfos) {
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
      compiler.error(`Unknown relationship: ${chainSoFar}.${suggestionText}`, position);
    }
    
    const targetTable = relInfo.toTable;
    
    // Generate join semantic ID for this level
    const joinSemanticId = generateMultiLevelJoinSemanticId(
      compiler, 
      compiler.tableName, 
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
      compilationContext: compiler.compilationContext,
      relationshipChain: relationshipChain.slice(0, i + 1) // Track the chain up to this point
    };
    
    // Track join intent (deduplicated by semanticId)
    if (!compiler.joinIntents.has(joinSemanticId)) {
      compiler.joinIntents.set(joinSemanticId, joinIntent);
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
    if (compiler.context.relationshipInfo) {
      // Try to find the field type through old relationship traversal
      const fieldType = getFieldTypeFromOldFormat(compiler, relationshipChain, fieldName);
      if (fieldType) {
        // Generate semantic ID for backward compatibility
        const relationshipRefSemanticId = compiler.generateSemanticId(
          'multi_relationship_ref', 
          `${relationshipChain.join('.')}.${fieldName}`, 
          allJoinSemanticIds
        );
        
        return {
          type: TYPE.RELATIONSHIP_REF,
          semanticId: relationshipRefSemanticId,
          dependentJoins: allJoinSemanticIds,
          returnType: convertSchemaTypeToUnifiedType(fieldType),
          compilationContext: compiler.compilationContext,
          value: { 
            relationshipChain: relationshipChain,
            fieldName: fieldName.toLowerCase(),
            finalTable: currentTable
          }
        };
      }
    }
    compiler.error(`Unknown target table: ${currentTable}`, position);
  }
  
  const fieldType = finalTableInfo.columnList[fieldName.toLowerCase()];
  if (!fieldType) {
    const availableFields = Object.keys(finalTableInfo.columnList).slice(0, 10);
    const suggestionText = availableFields.length > 0 
      ? ` Available fields: ${availableFields.join(', ')}`
      : '';
    const fullChain = relationshipChain.join('.') + '.' + fieldName;
    compiler.error(`Unknown field ${fieldName} in relationship chain ${fullChain}.${suggestionText}`, position);
  }
  
  // Generate semantic ID for the entire relationship reference
  const relationshipRefSemanticId = compiler.generateSemanticId(
    'multi_relationship_ref', 
    `${relationshipChain.join('.')}.${fieldName}`, 
    allJoinSemanticIds
  );
  
  return {
    type: TYPE.RELATIONSHIP_REF,
    semanticId: relationshipRefSemanticId,
    dependentJoins: allJoinSemanticIds,
    returnType: convertSchemaTypeToUnifiedType(fieldType),
    compilationContext: compiler.compilationContext,
    value: { 
      relationshipChain: relationshipChain,
      fieldName: fieldName.toLowerCase(),
      finalTable: currentTable
    }
  };
}

/**
 * Generate semantic ID for multi-level join intent
 * @param {Object} compiler - Compiler instance
 * @param {string} baseTable - Base table name
 * @param {Array<string>} chainSoFar - Relationship chain up to this point
 * @param {string} joinField - Join field for this level
 * @returns {string} Semantic ID for this join level
 */
export function generateMultiLevelJoinSemanticId(compiler, baseTable, chainSoFar, joinField) {
  const chainPath = chainSoFar.join('→');
  return `direct:${baseTable}→${chainPath}[${joinField}]@${compiler.compilationContext}`;
}

/**
 * Generate semantic ID for join intent
 * @param {Object} compiler - Compiler instance
 * @param {string} relationshipType - Type of relationship ('direct_relationship' or 'inverse_relationship')
 * @param {string} sourceTable - Source table name
 * @param {string} targetTable - Target table name
 * @param {string} joinField - Join field name
 * @returns {string} Semantic ID for the join intent
 */
export function generateJoinSemanticId(compiler, relationshipType, sourceTable, targetTable, joinField) {
  if (relationshipType === 'direct_relationship') {
    return `direct:${sourceTable}→${targetTable}[${joinField}]@${compiler.compilationContext}`;
  } else {
    return `inverse:${sourceTable}←${targetTable}[${joinField}]@${compiler.compilationContext}`;
  }
}

/**
 * Get field type from old nested relationship format (fallback)
 * @param {Object} compiler - Compiler instance
 * @param {Array<string>} relationshipChain - Chain of relationship names
 * @param {string} fieldName - Final field name
 * @returns {string|null} Field type or null if not found
 */
export function getFieldTypeFromOldFormat(compiler, relationshipChain, fieldName) {
  let currentRelationshipInfo = compiler.context.relationshipInfo;
  
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