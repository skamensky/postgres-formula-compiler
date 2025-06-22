# Multi-Level Aggregate Functions Requirements & Analysis

## Overview

Multi-level aggregate functions allow aggregation across multiple relationship levels in a single formula, enabling complex data analysis across chained inverse relationships. This document captures the requirements, challenges, and key learnings from experimental implementation efforts.

## Requirements

### Core Functionality
- **Multi-level relationship traversal**: Support aggregation across 2+ levels of inverse relationships
- **Dot notation syntax**: Use `.` as separator between relationship levels (e.g., `table1.table2.field`)
- **All aggregate functions**: Support all existing aggregate functions (STRING_AGG, SUM_AGG, COUNT_AGG, etc.)
- **Complex expressions**: Second arguments should support complex expressions evaluated in the correct context
- **Backward compatibility**: Existing single-level aggregates must continue working unchanged

### Syntax Design
```
AGGREGATE_FUNCTION(relationship_chain.target_table, expression, separator)
```

Where:
- `relationship_chain`: Dot-separated chain of inverse relationships
- `target_table`: Final table in the relationship chain
- `expression`: Expression evaluated in the context of the target table
- `separator`: Delimiter for string aggregation functions

## Success Criteria

The following formula must compile successfully from the **merchant** table as root:

```
STRING_AGG(submissions_merchant.rep_links_submission,rep_rel.name,",")
```

**Expected behavior:**
1. Traverse from `merchant` → `submission` (via `submissions_merchant` inverse relationship)
2. Traverse from `submission` → `rep_link` (via `rep_links_submission` inverse relationship)  
3. Evaluate `rep_rel.name` in the context of the `rep_link` table
4. Generate appropriate SQL with multi-level joins and subqueries

## Major Challenges Discovered

### 1. Context Evaluation Complexity
**Challenge**: In multi-level aggregation, different parts of the formula must be evaluated in different table contexts.

**Specific Issue**: 
- First argument (`submissions_merchant.rep_links_submission`) needs to be parsed as a relationship chain
- Second argument (`rep_rel.name`) must be evaluated in the context of the **final table** (`rep_link`), not the base table (`merchant`)

**Complexity**: The compiler needs to maintain and switch between multiple table contexts within a single function call.

### 2. Parser State Management
**Challenge**: Aggregate functions require special parsing logic that differs from regular functions.

**Issues Discovered**:
- Dot-separated identifiers in first argument need special tokenization
- Lexer case-sensitivity handling affects relationship name parsing
- Token consumption must be carefully managed to avoid parser state corruption

### 3. Relationship Chain Resolution
**Challenge**: Multi-level chains require complex validation and traversal logic.

**Subtleties**:
- Each level in the chain must be validated against the current table's available relationships
- Relationship metadata must be loaded for all tables in potential chains, not just the base table
- Error messages need to provide context about which level in the chain failed

### 4. SQL Generation Complexity
**Challenge**: Multi-level aggregation requires sophisticated SQL generation with nested subqueries.

**Requirements**:
- Multiple JOIN operations across relationship chain
- Subquery nesting for aggregation context
- Proper alias management for multi-level table references
- Deduplication of shared relationship paths

## Key Subtleties & Learnings

### 1. Database Metadata Loading Strategy
**Learning**: Multi-level aggregation requires loading inverse relationships for **all tables** that could be part of multi-level chains, not just the base table.

**Implication**: The exec-formula script (or any runtime) needs to preload metadata for:
- Base table
- All tables directly related to base table  
- All tables that have inverse relationships with base table
- All tables in the relationship graph reachable from base table

### 2. Lexer Token Handling
**Learning**: Standard identifier tokenization rules may not work for relationship chains.

**Issues Found**:
- Underscore handling in identifiers affects relationship name parsing
- Case conversion in lexer can break relationship name matching
- Dot-separated parsing requires special handling in aggregate function contexts

### 3. Dual Compilation Context Problem
**Learning**: Multi-level aggregates require maintaining **two distinct compilation contexts**:

1. **Chain Resolution Context**: For parsing and validating the relationship chain
2. **Expression Evaluation Context**: For evaluating expressions in the target table context

**Challenge**: The compiler needs to seamlessly switch between these contexts within a single function call.

### 4. Relationship Name Ambiguity
**Learning**: Relationship names can be ambiguous depending on traversal direction.

**Examples**:
- `submissions_merchant` (inverse: submission → merchant)
- `merchant_submissions` (forward: merchant → submission)  

**Requirement**: The syntax must clearly distinguish between forward and inverse relationships.

### 5. Error Message Context
**Learning**: Multi-level relationship errors need sophisticated error reporting.

**Requirements**:
- Show which level in the chain failed
- Display available relationships for the current table context
- Provide clear indication of expected vs. actual relationship names

## Data Structure Requirements

### Context Information Architecture

Multi-level aggregation requires well-structured table and relationship metadata. The experimental implementation identified optimal data structures that should be reused.

#### tableInfos Format
**Structure**: Array of table information objects
```javascript
[
  {
    tableName: 'merchant',
    columnList: {
      id: 'number',
      name: 'string', 
      created_at: 'date'
      // ... all columns with their types
    }
  },
  {
    tableName: 'submission',
    columnList: {
      id: 'number',
      merchant: 'number',
      status: 'string',
      amount: 'number'
      // ... all columns with their types  
    }
  }
  // ... additional tables
]
```

**Required Tables for Multi-Level Aggregation**:
- **Base table** (e.g., `merchant`)
- **All directly related tables** (tables that base table has forward relationships to)
- **All inverse relationship source tables** (tables that have foreign keys pointing to base table)
- **All tables reachable in relationship graph** (tables that could be part of multi-level chains)

**Loading Strategy**: For a base table, load `tableInfos` for all tables within N degrees of relationship separation (where N = maximum allowed chain depth).

#### relationshipInfos Format  
**Structure**: Array of relationship objects representing ALL relationships in the system
```javascript
[
  {
    name: 'merchant',           // relationship name (foreign key without _id suffix)
    fromTable: 'submission',    // source table (has the foreign key)
    toTable: 'merchant',        // target table (referenced by foreign key)
    joinColumn: 'merchant'      // foreign key column name
  },
  {
    name: 'rep_rel', 
    fromTable: 'rep_link',
    toTable: 'rep',
    joinColumn: 'rep_rel'
  }
  // ... all relationships in database
]
```

**Required Relationships for Multi-Level Aggregation**:
- **All forward relationships** originating from any table in `tableInfos`
- **All inverse relationships** targeting any table in `tableInfos` 
- **Complete relationship graph** to enable chain validation and traversal

**Key Insight**: Relationship data should be **comprehensive** rather than filtered by base table, as multi-level chains can traverse through multiple relationship types.

#### Inverse Relationship Naming Convention
**Pattern**: `{source_table_plural}_{foreign_key_column}`

**Examples**:
- `submission.merchant → merchant.id` becomes inverse relationship `submissions_merchant`
- `rep_link.submission → submission.id` becomes inverse relationship `rep_links_submission`

**Requirement**: This naming pattern must be predictable and consistently applied for relationship discovery.

#### Context Loading Performance Considerations
- **Bulk Loading**: Load all required `tableInfos` and `relationshipInfos` in single database queries
- **Caching Strategy**: Cache relationship metadata across multiple formula compilations
- **Lazy Loading**: Consider loading additional table metadata on-demand for deeper chains

## Database Schema Considerations

### 1. Inverse Relationship Discovery
**Requirement**: The system must be able to discover and load inverse relationships dynamically.

**Challenge**: Database metadata systems need to provide:
- Forward relationships (table A → table B via foreign key)
- Inverse relationships (table B ← table A via foreign key)
- Relationship naming conventions that work in both directions

### 2. Relationship Naming Convention
**Critical Decision**: How to name inverse relationships consistently.

**Current Pattern**: `{source_table_plural}_{foreign_key_field}`
- Example: `submissions_merchant` for `submission.merchant → merchant.id`

**Consideration**: This naming must be predictable and discoverable from database schema.

### 3. Circular Relationship Handling
**Consideration**: Multi-level chains could potentially create circular references.

**Requirement**: Need safeguards against infinite relationship traversal.

## Context Switching Architecture Challenge

### The Core Problem
Multi-level aggregates require the compiler to handle **context switching** within a single expression:

1. **Parse Phase**: Relationship chain parsing in base table context
2. **Resolution Phase**: Chain traversal and validation across multiple table contexts  
3. **Expression Phase**: Expression evaluation in target table context
4. **SQL Generation Phase**: Multi-context SQL generation with proper joins

### Context Types Required
- **Base Context**: Starting table and its relationships
- **Chain Context**: Current position in relationship traversal
- **Target Context**: Final table context for expression evaluation
- **Compilation Context**: Overall compilation state and join tracking

## Parser Architecture Considerations

### 1. Special Function Argument Parsing
**Finding**: Aggregate functions need fundamentally different argument parsing than regular functions.

**Requirements**:
- First argument: Dot-separated identifier chain parsing
- Subsequent arguments: Expression parsing in different table context
- Context-aware validation and error reporting

### 2. Token Lookahead Requirements
**Finding**: Multi-level parsing may require token lookahead to determine parsing strategy.

**Challenge**: Distinguishing between:
- `table.field` (regular relationship reference)
- `table1.table2` (multi-level chain)
- `table1.table2.field` (multi-level chain with field access)

### 3. Expression Context Isolation
**Requirement**: Expressions in different arguments must be evaluated in completely isolated contexts.

**Challenge**: The parser must maintain separate symbol tables and relationship contexts for different parts of the same function call.

## Testing & Validation Challenges

### 1. Comprehensive Test Coverage Requirements
**Learning**: Multi-level aggregation requires testing at multiple levels:
- Individual relationship traversal
- Chain validation with invalid relationships
- Expression evaluation in different contexts
- SQL generation and execution
- Error handling and reporting

### 2. Mock Context Complexity
**Challenge**: Testing requires sophisticated mock contexts that accurately represent:
- Multi-table relationship networks
- Inverse relationship metadata
- Column information for all tables in chains

### 3. Integration Testing Requirements
**Finding**: Multi-level aggregation cannot be fully validated without integration with actual database metadata.

**Requirement**: Test infrastructure must support loading real database schema for validation.

## Future Solution Considerations

### 1. Architecture Questions
- Should multi-level aggregation be a completely separate compilation path?
- How can context switching be made more explicit and manageable?
- What level of relationship chain caching is needed for performance?

### 2. Syntax Alternatives
- Is dot notation the clearest syntax for multi-level chains?
- Should there be explicit context switching syntax?
- How to handle relationship name conflicts or ambiguities?

### 3. Performance Considerations
- How deep should multi-level chains be allowed?
- What caching strategies are needed for relationship metadata?
- How to optimize SQL generation for complex multi-level queries?

### 4. Error Handling Strategy
- How to provide clear error messages for complex chain failures?
- What level of error recovery is needed during parsing?
- How to validate chains without full database access during compilation?

## Conclusion

Multi-level aggregate functions represent a significant enhancement to the formula system, but they introduce substantial complexity in parsing, context management, and SQL generation. The core challenge lies in managing multiple compilation contexts within a single expression while maintaining backward compatibility and providing clear error reporting.

Any future implementation must carefully consider the context switching architecture and develop a clean separation between relationship chain resolution and expression evaluation phases.