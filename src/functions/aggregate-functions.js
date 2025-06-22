/**
 * Aggregate Functions
 * Handles STRING_AGG, STRING_AGG_DISTINCT, SUM_AGG, COUNT_AGG, AVG_AGG, MIN_AGG, MAX_AGG, AND_AGG, OR_AGG functions
 */

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

  // First argument must be an inverse relationship identifier
  const relationshipArg = node.args[0];
  if (relationshipArg.type !== 'IDENTIFIER') {
    compiler.error(`${funcName}() first argument must be an inverse relationship name`, node.position);
  }

  const relationshipName = relationshipArg.value.toLowerCase();
  
  // Check if inverse relationship info exists
  const inverseRelKeys = Object.keys(compiler.context.inverseRelationshipInfo || {});
  const matchingKey = inverseRelKeys.find(key => key.toLowerCase() === relationshipName);
  
  if (!matchingKey) {
    const availableRelationships = inverseRelKeys.slice(0, 10);
    const suggestionText = availableRelationships.length > 0 
      ? ` Available inverse relationships: ${availableRelationships.join(', ')}${inverseRelKeys.length > 10 ? ' (and ' + (inverseRelKeys.length - 10) + ' more)' : ''}`
      : '';
    compiler.error(`Unknown inverse relationship: ${relationshipArg.value}.${suggestionText}`, node.position);
  }

  const inverseRelInfo = compiler.context.inverseRelationshipInfo[matchingKey];
  
  // Create sub-compilation context for aggregate expression
  // Build tableInfos and relationshipInfos for the sub-context from the nested structure
  const subTableInfos = [
    {
      tableName: inverseRelInfo.tableName,
      columnList: inverseRelInfo.columnList
    }
  ];
  
  const subRelationshipInfos = [];
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
  
  const subContext = {
    tableName: inverseRelInfo.tableName,
    tableInfos: subTableInfos,
    relationshipInfos: subRelationshipInfos
  };
  
  const subCompiler = new compiler.constructor(subContext, { maxRelationshipDepth: compiler.maxRelationshipDepth });
  subCompiler.compilationContext = `agg:${compiler.tableName}→${inverseRelInfo.tableName}[${inverseRelInfo.joinColumn}]`;
  
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
    sourceRelation: matchingKey,
    expression: expressionResult,
    delimiter: delimiterResult,
    internalJoins: Array.from(subCompiler.joinIntents.values()),
    returnType: returnType
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