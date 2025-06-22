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
      // For main context, generate aliases based on relationship structure
      if (joinIntent.relationshipType === 'direct_relationship') {
        if (joinIntent.relationshipChain && joinIntent.relationshipChain.length > 1) {
          // Multi-level relationship: create alias from chain
          const chainAlias = joinIntent.relationshipChain.join('_');
          joinAliases.set(semanticId, `rel_${chainAlias}`);
        } else {
          // Single-level relationship: use simple alias
          joinAliases.set(semanticId, `rel_${joinIntent.targetTable}`);
        }
      } else {
        joinAliases.set(semanticId, `t${aliasCounter++}`);
      }
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
    const usedAliases = new Set();
    
    aggIntents.forEach((aggIntent, index) => {
      let columnAlias;
      if (aggIntent.aggregateFunction.startsWith('STRING_AGG')) {
        columnAlias = `rep_names`;
      } else if (aggIntent.aggregateFunction === 'COUNT_AGG') {
        columnAlias = `rep_count`;
      } else if (aggIntent.aggregateFunction === 'SUM_AGG') {
        columnAlias = `sum_value`;
      } else if (aggIntent.aggregateFunction === 'AVG_AGG') {
        columnAlias = `avg_value`;
      } else if (aggIntent.aggregateFunction === 'MIN_AGG') {
        columnAlias = `min_value`;
      } else if (aggIntent.aggregateFunction === 'MAX_AGG') {
        columnAlias = `max_value`;
      } else if (aggIntent.aggregateFunction === 'AND_AGG') {
        columnAlias = `and_value`;
      } else if (aggIntent.aggregateFunction === 'OR_AGG') {
        columnAlias = `or_value`;
      } else {
        columnAlias = `agg_col_${index + 1}`;
      }
      
      // Make column alias unique by finding the next available number
      let finalColumnAlias = columnAlias;
      let counter = 1;
      while (usedAliases.has(finalColumnAlias)) {
        finalColumnAlias = `${columnAlias}_${counter}`;
        counter++;
      }
      usedAliases.add(finalColumnAlias);
      
      aggregateColumnMappings.set(aggIntent.semanticId, {
        alias: groupAlias,
        column: finalColumnAlias
      });
    });
  }
  
  // Build FROM clause with joins
  let fromClause = `${baseTableName} s`;
  
  // Add main context joins - handle both single and multi-level relationships
  for (const [semanticId, joinIntent] of allJoinIntents) {
    if (joinIntent.compilationContext === 'main') {
      const alias = joinAliases.get(semanticId);
      if (joinIntent.relationshipType === 'direct_relationship') {
        if (joinIntent.relationshipChain && joinIntent.relationshipChain.length > 1) {
          // Multi-level relationship: determine source table/alias for this JOIN
          const chainIndex = joinIntent.relationshipChain.length - 1;
          if (chainIndex === 0) {
            // First level: join from base table
            fromClause += `\n  LEFT JOIN ${joinIntent.targetTable} ${alias} ON s.${joinIntent.joinField} = ${alias}.id`;
          } else {
            // Subsequent levels: join from previous relationship in chain
            const parentChain = joinIntent.relationshipChain.slice(0, chainIndex);
            
            // Find the parent join intent to get the correct join field
            const parentJoinSemanticId = allJoinIntents.keys().find(semanticId => {
              const parentJoinIntent = allJoinIntents.get(semanticId);
              return parentJoinIntent.relationshipChain && 
                     parentJoinIntent.relationshipChain.length === chainIndex &&
                     parentJoinIntent.relationshipChain.every((rel, i) => rel === parentChain[i]);
            });
            
            if (parentJoinSemanticId) {
              const parentAlias = joinAliases.get(parentJoinSemanticId);
              if (parentAlias) {
                fromClause += `\n  LEFT JOIN ${joinIntent.targetTable} ${alias} ON ${parentAlias}.${joinIntent.joinField} = ${alias}.id`;
              } else {
                // Fallback: construct the full parent alias name
                const parentAliasName = `rel_${baseTableName}_${parentChain.join('_')}`;
                fromClause += `\n  LEFT JOIN ${joinIntent.targetTable} ${alias} ON ${parentAliasName}.${joinIntent.joinField} = ${alias}.id`;
              }
            } else {
              // Fallback: construct the full parent alias name
              const parentAliasName = `rel_${baseTableName}_${parentChain.join('_')}`;
              fromClause += `\n  LEFT JOIN ${joinIntent.targetTable} ${alias} ON ${parentAliasName}.${joinIntent.joinField} = ${alias}.id`;
            }
          }
        } else {
          // Single-level relationship: use simple JOIN
          fromClause += `\n  LEFT JOIN ${joinIntent.targetTable} ${alias} ON s.${joinIntent.joinField} = ${alias}.id`;
        }
      }
    }
  }
  
  // Add consolidated aggregate JOINs
  for (const [relationshipKey, aggIntents] of aggregateGroups) {
    const groupAlias = aggregateJoinAliases.get(relationshipKey);
    const consolidatedSubquery = generateConsolidatedAggregateSubquery(aggIntents, joinAliases, baseTableName, aggregateColumnMappings);
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
 * @param {Map<string, Object>} aggregateColumnMappings - Aggregate semantic ID to {alias, column} mapping
 * @returns {string} SQL subquery
 */
function generateConsolidatedAggregateSubquery(aggIntents, joinAliases, baseTableName, aggregateColumnMappings) {
  if (aggIntents.length === 0) {
    throw new Error('Cannot generate consolidated subquery for empty aggregate intents');
  }
  
  // Use the first aggregate intent to determine the relationship structure
  const firstIntent = aggIntents[0];
  
  // Build subquery FROM clause with internal joins
  const baseTableName_sub = firstIntent.expression.compilationContext.match(/agg:.*?→(.*?)\[/)[1];
  let subFromClause = baseTableName_sub;
  
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
      subFromClause += `\n    JOIN ${joinIntent.targetTable} ${alias} ON ${baseTableName_sub}.${joinIntent.joinField} = ${alias}.id`;
    }
  }
  
  // Generate SELECT clause with multiple aggregate functions
  const selectExpressions = [];
  
  for (const aggIntent of aggIntents) {
    // Generate expression SQL for the aggregate
    const exprSQL = generateExpressionSQL(aggIntent.expression, joinAliases, new Map(), baseTableName_sub);
    
    // Get the pre-assigned column alias from the mappings
    const columnMapping = aggregateColumnMappings.get(aggIntent.semanticId);
    if (!columnMapping) {
      throw new Error(`No column mapping found for aggregate: ${aggIntent.semanticId}`);
    }
    const columnAlias = columnMapping.column;
    
    // Build aggregate function SQL
    let aggSQL;
    
    switch (aggIntent.aggregateFunction) {
      case 'STRING_AGG':
        const delimiterSQL = generateExpressionSQL(aggIntent.delimiter, new Map(), new Map(), baseTableName);
        aggSQL = `STRING_AGG(${exprSQL}, ${delimiterSQL})`;
        break;
      case 'STRING_AGG_DISTINCT':
        const delimiterSQL2 = generateExpressionSQL(aggIntent.delimiter, new Map(), new Map(), baseTableName);
        aggSQL = `STRING_AGG(DISTINCT ${exprSQL}, ${delimiterSQL2})`;
        break;
      case 'COUNT_AGG':
        aggSQL = `COUNT(*)`;
        break;
      case 'SUM_AGG':
        aggSQL = `SUM(${exprSQL})`;
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
    
    selectExpressions.push(`${aggSQL} AS ${columnAlias}`);
  }
  
  // Extract join column from semantic ID
  const joinColumnMatch = firstIntent.expression.compilationContext.match(/\[([^\]]+)\]$/);
  const joinColumn = joinColumnMatch ? joinColumnMatch[1] : 'id';
  
  // Add the grouping column to the SELECT clause
  selectExpressions.unshift(`${baseTableName_sub}.${joinColumn} AS submission`);
  
  return `    SELECT\n      ${selectExpressions.join(',\n      ')}\n    FROM ${subFromClause}\n    GROUP BY ${baseTableName_sub}.${joinColumn}`;
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
      // For multi-level relationships, use the final table alias
      // The last join in dependentJoins represents the final table in the chain
      const finalJoinSemanticId = expr.dependentJoins[expr.dependentJoins.length - 1];
      const finalJoinAlias = joinAliases.get(finalJoinSemanticId);
      if (!finalJoinAlias) {
        throw new Error(`No alias found for join: ${finalJoinSemanticId}`);
      }
      return `"${finalJoinAlias}"."${expr.value.fieldName}"`;
      
    case 'UNARY_OP':
      const operandSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `${expr.value.op}${operandSQL}`;
      
    case 'BINARY_OP':
      const leftSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const rightSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      const leftType = expr.children[0].returnType;
      const rightType = expr.children[1].returnType;
      
      if (expr.value.op === '&') {
        return `(${leftSQL} || ${rightSQL})`;
      } else if (expr.value.op === '=') {
        return `(${leftSQL} = ${rightSQL})`;
      } else if (expr.value.op === '!=' || expr.value.op === '<>') {
        return `(${leftSQL} <> ${rightSQL})`;
      } else if (expr.value.op === '+') {
        // Handle date arithmetic for addition
        if (leftType === 'date' && rightType === 'number') {
          return `(${leftSQL} + INTERVAL '${rightSQL} days')`;
        } else if (leftType === 'number' && rightType === 'date') {
          return `(${rightSQL} + INTERVAL '${leftSQL} days')`;
        } else {
          return `(${leftSQL} + ${rightSQL})`;
        }
      } else if (expr.value.op === '-') {
        // Handle date arithmetic for subtraction
        if (leftType === 'date' && rightType === 'number') {
          return `(${leftSQL} - INTERVAL '${rightSQL} days')`;
        } else {
          return `(${leftSQL} - ${rightSQL})`;
        }
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
      return "(select auth().uid())";
      
    case 'DATE':
      // Use the string value stored during compilation
      return `DATE('${expr.value.stringValue}')`;
      
    case 'STRING':
      const argSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `CAST(${argSQL} AS TEXT)`;
      
    case 'UPPER':
      const upperArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `UPPER(${upperArgSQL})`;
      
    case 'LOWER':
      const lowerArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `LOWER(${lowerArgSQL})`;
      
    case 'TRIM':
      const trimArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `TRIM(${trimArgSQL})`;
      
    case 'LEN':
      const lenArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `LENGTH(${lenArgSQL})`;
      
    case 'LEFT':
      const leftTextSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const leftNumSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `LEFT(${leftTextSQL}, ${leftNumSQL})`;
      
    case 'RIGHT':
      const rightTextSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const rightNumSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `RIGHT(${rightTextSQL}, ${rightNumSQL})`;
      
    case 'MID':
      const midTextSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const midStartSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      const midLengthSQL = generateExpressionSQL(expr.children[2], joinAliases, aggregateColumnMappings, baseTableName);
      return `SUBSTRING(${midTextSQL}, ${midStartSQL}, ${midLengthSQL})`;
      
    case 'IF':
      const conditionSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const trueSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      
      if (expr.children.length === 3) {
        const falseSQL = generateExpressionSQL(expr.children[2], joinAliases, aggregateColumnMappings, baseTableName);
        return `CASE WHEN ${conditionSQL} THEN ${trueSQL} ELSE ${falseSQL} END`;
      } else {
        return `CASE WHEN ${conditionSQL} THEN ${trueSQL} ELSE NULL END`;
      }
      
    case 'ISNULL':
      const isnullArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `(${isnullArgSQL} IS NULL)`;
      
    case 'NULLVALUE':
      const nullvalue1SQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const nullvalue2SQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `COALESCE(${nullvalue1SQL}, ${nullvalue2SQL})`;
      
    case 'ISBLANK':
      const isblankArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `(${isblankArgSQL} IS NULL OR ${isblankArgSQL} = '')`;
      
    case 'AND':
      const andArgSQLs = expr.children.map(child => 
        generateExpressionSQL(child, joinAliases, aggregateColumnMappings, baseTableName)
      );
      return `(${andArgSQLs.join(' AND ')})`;

    case 'OR':
      const orArgSQLs = expr.children.map(child => 
        generateExpressionSQL(child, joinAliases, aggregateColumnMappings, baseTableName)
      );
      return `(${orArgSQLs.join(' OR ')})`;

    case 'NOT':
      const notArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `NOT (${notArgSQL})`;
      
    case 'CONTAINS':
      const containsTextSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const containsSubstringSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `(POSITION(${containsSubstringSQL} IN ${containsTextSQL}) > 0)`;
      
    case 'SUBSTITUTE':
      const subTextSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const subOldSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      const subNewSQL = generateExpressionSQL(expr.children[2], joinAliases, aggregateColumnMappings, baseTableName);
      return `REPLACE(${subTextSQL}, ${subOldSQL}, ${subNewSQL})`;
      
    case 'ABS':
      const absArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `ABS(${absArgSQL})`;
      
    case 'ROUND':
      const roundNumSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const roundDecSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `ROUND(${roundNumSQL}, ${roundDecSQL})`;
      
    case 'MIN':
      const minArg1SQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const minArg2SQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `LEAST(${minArg1SQL}, ${minArg2SQL})`;
      
    case 'MAX':
      const maxArg1SQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const maxArg2SQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `GREATEST(${maxArg1SQL}, ${maxArg2SQL})`;
      
    case 'MOD':
      const modArg1SQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const modArg2SQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `MOD(${modArg1SQL}, ${modArg2SQL})`;
      
    case 'CEILING':
      const ceilingArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `CEILING(${ceilingArgSQL})`;
      
    case 'FLOOR':
      const floorArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `FLOOR(${floorArgSQL})`;
      
    case 'YEAR':
      const yearArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `EXTRACT(YEAR FROM ${yearArgSQL})`;
      
    case 'MONTH':
      const monthArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `EXTRACT(MONTH FROM ${monthArgSQL})`;
      
    case 'DAY':
      const dayArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `EXTRACT(DAY FROM ${dayArgSQL})`;
      
    case 'WEEKDAY':
      const weekdayArgSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      return `EXTRACT(DOW FROM ${weekdayArgSQL}) + 1`;
      
    case 'ADDMONTHS':
      const addMonthsDateSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const addMonthsNumSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `(${addMonthsDateSQL} + INTERVAL '${addMonthsNumSQL} months')`;
      
    case 'ADDDAYS':
      const addDaysDateSQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const addDaysNumSQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      return `(${addDaysDateSQL} + INTERVAL '${addDaysNumSQL} days')`;
      
    case 'DATEDIF':
      const datedifDate1SQL = generateExpressionSQL(expr.children[0], joinAliases, aggregateColumnMappings, baseTableName);
      const datedifDate2SQL = generateExpressionSQL(expr.children[1], joinAliases, aggregateColumnMappings, baseTableName);
      const unit = expr.value.unit;
      
      switch (unit) {
        case 'days':
          return `EXTRACT(EPOCH FROM (${datedifDate2SQL} - ${datedifDate1SQL})) / 86400`;
        case 'months':
          return `((EXTRACT(YEAR FROM ${datedifDate2SQL}) - EXTRACT(YEAR FROM ${datedifDate1SQL})) * 12 + (EXTRACT(MONTH FROM ${datedifDate2SQL}) - EXTRACT(MONTH FROM ${datedifDate1SQL})))`;
        case 'years':
          return `(EXTRACT(YEAR FROM ${datedifDate2SQL}) - EXTRACT(YEAR FROM ${datedifDate1SQL}))`;
        default:
          throw new Error(`Unknown DATEDIF unit: ${unit}`);
      }
      
    default:
      throw new Error(`Unknown function: ${funcName}`);
  }
}

// Export for ES modules
export { generateSQL, generateExpressionSQL, generateFunctionSQL, generateAggregateSubquery, generateConsolidatedAggregateSubquery };