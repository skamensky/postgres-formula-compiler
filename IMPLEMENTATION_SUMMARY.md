# Hierarchical Semantic IDs and Context Annotation Implementation

## Overview

Successfully implemented the intent-based compiler architecture with hierarchical semantic IDs and context annotation as requested. This is a major architectural improvement that separates compilation concerns from SQL generation while enabling sophisticated cross-formula optimizations.

## Key Features Implemented

### 1. Hierarchical Semantic IDs

**Purpose**: Maintain semantic context and expression structure across compilations

**Format**: `type:details[child1,child2,...]@context`

**Examples**:
- Simple: `column:submission.amount@main`
- Binary: `binary_op:+[column:submission.amount@main,number:100@main]@main`
- Complex: `function:IF[condition,true_value,false_value]@main`

### 2. Context Annotation

**Purpose**: Track compilation contexts to enable proper scoping and optimization

**Contexts**:
- `main` - Primary query context
- `agg:source→target[joinField]` - Aggregate sub-context

**Benefits**:
- Proper context isolation between main and aggregate expressions
- Enables context-aware SQL generation
- Prevents context pollution across different compilation scopes

### 3. Intent-Based Architecture

**Components**:
- `evaluateFormula()` - Generates intent representations (CPU-bound)
- `generateSQL()` - Optimizes intents into SQL (separate concern)

**Intent Types**:
- `ExpressionIntent` - Core expression representation
- `JoinIntent` - Join requirements with semantic IDs
- `AggregateIntent` - Aggregate operations with sub-contexts

### 4. Cross-Formula Optimization

**Deduplication**:
- Identical join intents share semantic IDs
- Identical aggregate intents share semantic IDs
- SQL generation creates optimized queries with minimal joins/subqueries

**Example**: 5 formulas using merchant relationships → 1 JOIN in final SQL

## Implementation Details

### Semantic ID Generation

```javascript
generateSemanticId(type, details, childIds = []) {
  if (childIds.length === 0) {
    return `${type}:${details}@${this.compilationContext}`;
  }
  return `${type}:${details}[${childIds.join(',')}]@${this.compilationContext}`;
}
```

### Context Management

- **Main Context**: Default compilation context for primary expressions
- **Aggregate Context**: Sub-compiler with isolated context for aggregate expressions
- **Context Inheritance**: Child expressions inherit parent context
- **Context Annotation**: All semantic IDs annotated with compilation context

### SQL Generation Strategy

1. **Intent Collection**: Gather all intents across formulas
2. **Deduplication**: Use semantic IDs to deduplicate joins/aggregates
3. **Alias Generation**: Create SQL aliases for unique intents
4. **SQL Assembly**: Generate optimized SQL with shared components

## Test Results

✅ **All 11 hierarchical semantic ID tests passing**

Test Coverage:
- Intent generation with hierarchical IDs
- Context annotation for relationships and aggregates
- Intent deduplication across multiple formulas
- SQL generation with optimization
- Error handling with semantic context

## Example Output

### Simple Expression
```
Formula: amount + 100
Semantic ID: binary_op:+[column:submission.amount@main,number:100@main]@main
```

### Relationship Reference
```
Formula: merchant_rel.name
Semantic ID: relationship_ref:merchant.NAME[direct:submission→merchant[merchant_id]@main]@main
Join Intent: direct:submission→merchant[merchant_id]@main
```

### Aggregate with Sub-Context
```
Formula: STRING_AGG(rep_links, rep_rel.name, ", ")
Aggregate Context: agg:submission→rep_link[submission_id]
Sub-expression ID: relationship_ref:rep.NAME[...]@agg:submission→rep_link[submission_id]
```

### Optimized SQL Generation
```sql
-- 5 formulas with shared merchant references → 1 JOIN
SELECT
  t1.name AS merchant_name,
  t1.category AS merchant_category,
  (submission.amount * t1.commission_rate) AS total_with_commission,
  agg1 AS rep_summary,
  CASE WHEN (submission.amount > 1000) THEN 'HIGH' ELSE 'NORMAL' END AS high_value_indicator,
  (SELECT STRING_AGG(...) FROM rep_link ...) AS agg1
FROM submission
  LEFT JOIN merchant t1 ON submission.merchant_id = t1.id
```

## Architectural Benefits

### 1. Separation of Concerns
- **Compilation**: Pure CPU-bound intent generation
- **Optimization**: SQL generation with cross-formula optimizations
- **No I/O**: Compiler receives all metadata upfront

### 2. Semantic Consistency
- Identical expressions generate identical semantic IDs
- Enables reliable deduplication across compilations
- Maintains expression structure information

### 3. Context Safety
- Aggregate expressions properly isolated
- Context annotation prevents scope confusion
- Hierarchical IDs maintain parent-child relationships

### 4. Optimization Opportunities
- Cross-formula JOIN deduplication
- Aggregate subquery sharing
- Context-aware alias generation
- Minimal SQL output

## Breaking Changes

⚠️ **Intentional API Change**: `evaluateFormula()` now returns intent objects instead of SQL strings

**Migration Path**:
```javascript
// Old approach
const sql = evaluateFormula(formula, context);

// New approach
const result = evaluateFormula(formula, context);
const namedResults = { field1: result };
const sqlResult = generateSQL(namedResults, 'table_name');
const sql = sqlResult.sql;
```

## Future Enhancements

The hierarchical semantic ID foundation enables:
- Advanced expression analysis
- Query plan optimization
- Cross-compilation caching
- Incremental compilation
- Expression dependency tracking

## Conclusion

Successfully implemented a clean, modular compiler architecture with hierarchical semantic IDs and context annotation. The system maintains semantic context across compilations while enabling sophisticated cross-formula optimizations through intent-based compilation and separate SQL generation. 