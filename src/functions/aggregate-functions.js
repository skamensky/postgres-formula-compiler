/**
 * Aggregate Functions
 * Handles STRING_AGG, STRING_AGG_DISTINCT, SUM_AGG, COUNT_AGG, AVG_AGG, MIN_AGG, MAX_AGG, AND_AGG, OR_AGG functions
 * Now supports multi-level aggregate functions with chained inverse relationships
 */

/**
 * Parse multi-level relationship chain from aggregate function first argument
 * @param {string} relationshipName - Underscore-separated relationship chain
 * @returns {Array<string>} Array of individual relationship names
 */
function parseMultiLevelChain(relationshipName) {
  // Multi-level chains are expected to have more underscores than typical single relationships
  // Single relationships typically follow pattern: {source_table_plural}_{foreign_key_column}
  // Multi-level chains follow pattern: {rel1}_{rel2}[_{rel3}...] where each rel is itself a relationship
  
  const parts = relationshipName.split('_');
  
  // Simple heuristic: if the relationship has fewer than 4 parts, treat as single-level
  // Single-level examples: rep_links_submission (3 parts), documents_submission (2 parts)
  // Multi-level examples: submissions_merchant_rep_links_submission (4+ parts)
  if (parts.length < 4) {
    return [relationshipName]; // Treat as single relationship
  }
  
  // For multi-level chains, we need to split at the boundaries between relationships
  // This is a simplified approach - we'll split into chunks of 2-3 parts each
  // A more sophisticated approach would validate against known relationship patterns
  
  const relationships = [];
  let i = 0;
  
  while (i < parts.length) {
    if (i + 3 < parts.length) {
      // If we have 3+ parts remaining, try a 2-part relationship first
      relationships.push(parts[i] + '_' + parts[i + 1]);
      i += 2;
    } else if (i + 2 < parts.length) {
      // If we have exactly 3 parts remaining, it's likely a 3-part relationship
      relationships.push(parts[i] + '_' + parts[i + 1] + '_' + parts[i + 2]);
      i += 3;
    } else if (i + 1 < parts.length) {
      // If we have exactly 2 parts remaining, it's a 2-part relationship
      relationships.push(parts[i] + '_' + parts[i + 1]);
      i += 2;
    } else {
      // Single part remaining (shouldn't happen with valid multi-level chains)
      relationships.push(parts[i]);
      i += 1;
    }
  }
  
  return relationships.length > 0 ? relationships : [relationshipName];
}

/**
 * Validate and resolve multi-level relationship chain
 * @param {Object} compiler - Compiler instance
 * @param {Array<string>} relationshipChain - Array of relationship names to traverse
 * @param {number} position - Position for error reporting
 * @returns {Object} Final table context and chain info
 */
function resolveMultiLevelChain(compiler, relationshipChain, position) {
  if (relationshipChain.length === 1) {
    // Single-level relationship - use existing logic
    return resolveSingleLevelRelationship(compiler, relationshipChain[0], position);
  }
  
  // Multi-level relationship chain
  let currentContext = compiler.context;
  let currentTableName = compiler.tableName;
  const chainInfo = [];
  
  // Maximum depth check
  const maxDepth = compiler.maxInverseAggregateDepth || 3;
  if (relationshipChain.length > maxDepth) {
    compiler.error(`Multi-level aggregate chain too deep (max ${maxDepth} levels): ${relationshipChain.join('_')}`, position);
  }
  
  // Traverse each level in the chain
  for (let i = 0; i < relationshipChain.length; i++) {
    const relationshipName = relationshipChain[i];
    const lowerRelName = relationshipName.toLowerCase();
    
    // Look for inverse relationship in current context
    const inverseRelKeys = Object.keys(currentContext.inverseRelationshipInfo || {});
    const matchingKey = inverseRelKeys.find(key => key.toLowerCase() === lowerRelName);
    
    if (!matchingKey) {
      const availableRelationships = inverseRelKeys.slice(0, 10);
      const suggestionText = availableRelationships.length > 0 
        ? ` Available inverse relationships: ${availableRelationships.join(', ')}${inverseRelKeys.length > 10 ? ' (and ' + (inverseRelKeys.length - 10) + ' more)' : ''}`
        : '';
      compiler.error(`Unknown inverse relationship in chain: ${relationshipName} at level ${i + 1} of ${relationshipChain.join('_')}.${suggestionText}`, position);
    }
    
    const inverseRelInfo = currentContext.inverseRelationshipInfo[matchingKey];
    
    // Store chain information
    chainInfo.push({
      relationshipName: matchingKey,
      sourceTable: currentTableName,
      targetTable: inverseRelInfo.tableName,
      joinColumn: inverseRelInfo.joinColumn,
      inverseRelInfo: inverseRelInfo
    });
    
    // Update context for next iteration
    currentTableName = inverseRelInfo.tableName;
    
    // For multi-level chains, we need to build the context for the next level
    if (i < relationshipChain.length - 1) {
      // We're not at the final level yet, so we need to build context for the next hop
      // This would require loading additional metadata - for now, we'll use a simplified approach
      currentContext = {
        tableName: currentTableName,
        columnList: inverseRelInfo.columnList,
        relationshipInfo: inverseRelInfo.relationshipInfo || {},
        inverseRelationshipInfo: {} // This would need to be populated for deeper chains
      };
    }
  }
  
  // Return the final target context and chain information
  const finalInverseRelInfo = chainInfo[chainInfo.length - 1].inverseRelInfo;
  
  return {
    isMultiLevel: true,
    chainInfo: chainInfo,
    finalContext: {
      tableName: currentTableName,
      columnList: finalInverseRelInfo.columnList,
      relationshipInfo: finalInverseRelInfo.relationshipInfo || {}
    },
    finalInverseRelInfo: finalInverseRelInfo,
    chainSemanticId: relationshipChain.join('_')
  };
}

/**
 * Resolve single-level relationship (existing logic)
 * @param {Object} compiler - Compiler instance
 * @param {string} relationshipName - Single relationship name
 * @param {number} position - Position for error reporting
 * @returns {Object} Single-level relationship info
 */
function resolveSingleLevelRelationship(compiler, relationshipName, position) {
  const lowerRelName = relationshipName.toLowerCase();
  
  // Check if inverse relationship info exists
  const inverseRelKeys = Object.keys(compiler.context.inverseRelationshipInfo || {});
  const matchingKey = inverseRelKeys.find(key => key.toLowerCase() === lowerRelName);
  
  if (!matchingKey) {
    const availableRelationships = inverseRelKeys.slice(0, 10);
    const suggestionText = availableRelationships.length > 0 
      ? ` Available inverse relationships: ${availableRelationships.join(', ')}${inverseRelKeys.length > 10 ? ' (and ' + (inverseRelKeys.length - 10) + ' more)' : ''}`
      : '';
    compiler.error(`Unknown inverse relationship: ${relationshipName}.${suggestionText}`, position);
  }

  const inverseRelInfo = compiler.context.inverseRelationshipInfo[matchingKey];
  
  return {
    isMultiLevel: false,
    matchingKey: matchingKey,
    inverseRelInfo: inverseRelInfo,
    chainSemanticId: matchingKey
  };
}

/**
 * Compile aggregate function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileAggregateFunction(compiler, node) {
  const funcName = node.name;
  
  // Check if this is an aggregate function
  if (!['STRING_AGG', 'STRING_AGG_DISTINCT', 'SUM_AGG', 'COUNT_AGG', 'AVG_AGG', 'MIN_AGG', 'MAX_AGG', 'AND_AGG', 'OR_AGG'].includes(funcName)) {
    return null; // Not handled by this module
  }
  
  let expectedArgCount = 2; // Most aggregate functions take 2 args
  if (funcName === 'STRING_AGG' || funcName === 'STRING_AGG_DISTINCT') {
    expectedArgCount = 3; // STRING_AGG takes delimiter as 3rd arg
  }
  
  if (node.args.length !== expectedArgCount) {
    compiler.error(`${funcName}() takes exactly ${expectedArgCount} arguments`, node.position);
  }

  // First argument must be an inverse relationship identifier (possibly multi-level)
  const relationshipArg = node.args[0];
  if (relationshipArg.type !== 'IDENTIFIER') {
    compiler.error(`${funcName}() first argument must be an inverse relationship name`, node.position);
  }

  const relationshipName = relationshipArg.value.toLowerCase();
  
  // Parse potential multi-level relationship chain
  const relationshipChain = parseMultiLevelChain(relationshipName);
  
  // Resolve the relationship chain
  const resolvedChain = resolveMultiLevelChain(compiler, relationshipChain, node.position);
  
  // Build sub-compilation context for aggregate expression
  let subTableInfos, subRelationshipInfos, subContext;
  
  if (resolvedChain.isMultiLevel) {
    // Multi-level chain: use final context
    subTableInfos = [{
      tableName: resolvedChain.finalContext.tableName,
      columnList: resolvedChain.finalContext.columnList
    }];
    
    subRelationshipInfos = [];
    if (resolvedChain.finalContext.relationshipInfo) {
      for (const [relName, relInfo] of Object.entries(resolvedChain.finalContext.relationshipInfo)) {
        subRelationshipInfos.push({
          name: relName,
          fromTable: resolvedChain.finalContext.tableName,
          toTable: relInfo.tableName || relName,
          joinColumn: relInfo.joinColumn
        });
        
        // Add target table info if not already present
        if (!subTableInfos.find(t => t.tableName === (relInfo.tableName || relName))) {
          subTableInfos.push({
            tableName: relInfo.tableName || relName,
            columnList: relInfo.columnList || {}
          });
        }
      }
    }
    
    subContext = {
      tableName: resolvedChain.finalContext.tableName,
      tableInfos: subTableInfos,
      relationshipInfos: subRelationshipInfos
    };
  } else {
    // Single-level chain: use existing logic
    const inverseRelInfo = resolvedChain.inverseRelInfo;
    
    subTableInfos = [{
      tableName: inverseRelInfo.tableName,
      columnList: inverseRelInfo.columnList
    }];
    
    subRelationshipInfos = [];
    if (inverseRelInfo.relationshipInfo) {
      for (const [relName, relInfo] of Object.entries(inverseRelInfo.relationshipInfo)) {
        subRelationshipInfos.push({
          name: relName,
          fromTable: inverseRelInfo.tableName,
          toTable: relInfo.tableName || relName,
          joinColumn: relInfo.joinColumn
        });
        
        // Add target table info if not already present
        if (!subTableInfos.find(t => t.tableName === (relInfo.tableName || relName))) {
          subTableInfos.push({
            tableName: relInfo.tableName || relName,
            columnList: relInfo.columnList || {}
          });
        }
      }
    }
    
    subContext = {
      tableName: inverseRelInfo.tableName,
      tableInfos: subTableInfos,
      relationshipInfos: subRelationshipInfos
    };
  }
  
  const subCompiler = new compiler.constructor(subContext, { 
    maxRelationshipDepth: compiler.maxRelationshipDepth,
    maxInverseAggregateDepth: compiler.maxInverseAggregateDepth || 3
  });
  
  // Set compilation context based on chain type
  if (resolvedChain.isMultiLevel) {
    const chainDesc = resolvedChain.chainInfo.map(ci => `${ci.sourceTable}→${ci.targetTable}[${ci.joinColumn}]`).join('→');
    subCompiler.compilationContext = `multi_agg:${chainDesc}`;
  } else {
    const inverseRelInfo = resolvedChain.inverseRelInfo;
    subCompiler.compilationContext = `agg:${compiler.tableName}→${inverseRelInfo.tableName}[${inverseRelInfo.joinColumn}]`;
  }
  
  // Compile the expression in sub-context
  const expressionResult = subCompiler.compile(node.args[1]);
  
  // Handle delimiter for STRING_AGG functions
  let delimiterResult = null;
  if (funcName === 'STRING_AGG' || funcName === 'STRING_AGG_DISTINCT') {
    delimiterResult = compiler.compile(node.args[2]); // Compile in main context
    if (delimiterResult.returnType !== 'string') {
      compiler.error(`${funcName}() delimiter must be string, got ${delimiterResult.returnType}`, node.position);
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
  // For COUNT_AGG, use the same semantic ID regardless of column since SQL is always COUNT(*)
  let semanticDetails;
  if (funcName === 'COUNT_AGG') {
    semanticDetails = `${funcName}[${subCompiler.compilationContext}]`;
  } else {
    semanticDetails = `${funcName}[${expressionResult.semanticId}]`;
  }
  const aggSemanticId = compiler.generateSemanticId('aggregate', semanticDetails);
  
  const aggregateIntent = {
    semanticId: aggSemanticId,
    aggregateFunction: funcName,
    sourceRelation: resolvedChain.chainSemanticId,
    expression: expressionResult,
    delimiter: delimiterResult,
    internalJoins: Array.from(subCompiler.joinIntents.values()),
    returnType: returnType,
    // Multi-level specific properties
    isMultiLevel: resolvedChain.isMultiLevel,
    chainInfo: resolvedChain.isMultiLevel ? resolvedChain.chainInfo : null
  };
  
  // Track aggregate intent
  compiler.aggregateIntents.set(aggSemanticId, aggregateIntent);
  
  return {
    type: 'AGGREGATE_FUNCTION',
    semanticId: aggSemanticId,
    dependentJoins: [], // Aggregates don't create main query joins
    returnType: returnType,
    compilationContext: compiler.compilationContext,
    value: { 
      aggregateSemanticId: aggSemanticId,
      aggregateIntent: aggregateIntent
    }
  };
}