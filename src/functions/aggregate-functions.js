/**
 * Aggregate Functions
 * Handles STRING_AGG, STRING_AGG_DISTINCT, SUM_AGG, COUNT_AGG, AVG_AGG, MIN_AGG, MAX_AGG, AND_AGG, OR_AGG functions
 * Now supports multi-level aggregate functions with chained inverse relationships
 */

/**
 * Parse multi-level relationship chain from aggregate function first argument
 * @param {string} relationshipName - Dot-separated relationship chain
 * @returns {Array<string>} Array of individual relationship names
 */
function parseMultiLevelChain(relationshipName) {
  // Multi-level chains use dot notation to separate relationship levels
  // Pattern: {rel1}.{rel2}[.{rel3}...] where each rel is a complete relationship name
  // Examples:
  //   Single-level: "rep_links_submission"
  //   Multi-level: "submissions_merchant.rep_links_submission"
  //   Three-level: "submissions_merchant.locations_merchant.staff_location"
  
  // Split by dots to get individual relationship names
  const parts = relationshipName.split('.');
  
  // If there's no dot, it's a single-level relationship
  if (parts.length === 1) {
    return [relationshipName];
  }
  
  // Multi-level: return the array of relationship names
  return parts;
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
    chainSemanticId: relationshipChain.join('.')
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

  // First argument must be an inverse relationship identifier or dot-separated chain
  const relationshipArg = node.args[0];
  
  let relationshipName;
  
  // Handle both single identifier and dot-separated chain
  if (relationshipArg.type === 'IDENTIFIER') {
    relationshipName = relationshipArg.value.toLowerCase();
  } else if (relationshipArg.type === 'RELATIONSHIP_REF') {
    // For multi-level chains, reconstruct the full dot-separated path
    const relationshipChain = relationshipArg.relationshipChain || [relationshipArg.relationName];
    relationshipName = relationshipChain.join('.').toLowerCase();
  } else {
    compiler.error(`${funcName}() first argument must be an inverse relationship name or chain`, node.position);
  }
  
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