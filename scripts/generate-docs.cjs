#!/usr/bin/env node

/**
 * Documentation Generator for Formula Language
 * Auto-generates comprehensive documentation from compiler metadata
 */

const fs = require('fs');
const path = require('path');

// Import the compiler metadata
const {
  FUNCTION_METADATA,
  OPERATOR_METADATA,
  AST_NODE_METADATA,
  TOKEN_METADATA,
  TYPES,
  RETURN_TYPES,
  DOC_LINKS
} = require('../formula-compiler.js');

// Simple templating system (no external dependencies)
class SimpleTemplate {
  constructor(templateString) {
    this.template = templateString;
  }

  render(data) {
    let result = this.template;

    // Handle {{#each collection}} blocks
    result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, collection, content) => {
      const items = data[collection] || [];
      return items.map(item => {
        let itemContent = content;
        // Replace {{this}} with the item itself for primitives
        itemContent = itemContent.replace(/\{\{this\}\}/g, item);
        // Replace {{property}} with item.property for objects
        itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (propMatch, propName) => {
          return item[propName] !== undefined ? item[propName] : propMatch;
        });
        return itemContent;
      }).join('');
    });

    // Handle {{#if condition}} blocks
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)(\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g, (match, condition, trueContent, elseBlock, falseContent) => {
      return data[condition] ? trueContent : (falseContent || '');
    });

    // Handle simple {{variable}} replacements
    result = result.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return data[varName] !== undefined ? data[varName] : match;
    });

    return result;
  }
}

// Utility functions
function validateTestReference(testRef) {
  const [filePath] = testRef.split(':');
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

function groupByCategory(metadata) {
  const grouped = {};
  for (const [name, info] of Object.entries(metadata)) {
    const category = info.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = {};
    }
    grouped[category][name] = info;
  }
  return grouped;
}

function formatArguments(args) {
  return args.map(arg => {
    if (arg.linkTo) {
      return `[${arg.name}](${arg.linkTo})`;
    }
    return arg.name;
  }).join(', ');
}

function formatArgumentsList(args) {
  return args.map(arg => {
    let line = `- \`${arg.name}\` (${arg.type}): ${arg.description}`;
    if (arg.linkTo) {
      line += ` ([Learn more](${arg.linkTo}))`;
    }
    return line;
  }).join('\n');
}

function formatTestRefs(testRefs) {
  if (!testRefs || testRefs.length === 0) return '';
  const validRefs = testRefs.filter(ref => {
    const isValid = validateTestReference(ref);
    if (!isValid) {
      console.warn(`⚠️  Warning: Test reference not found: ${ref}`);
    }
    return isValid;
  });
  
  return validRefs.map(ref => `[${ref}](../${ref})`).join(', ');
}

// Generate Functions documentation
function generateFunctionsDoc() {
  const groupedFunctions = groupByCategory(FUNCTION_METADATA);
  
  let content = `# Functions Reference

This document provides a comprehensive reference for all available functions in the Formula Language.

## Table of Contents

`;

  // Generate table of contents
  for (const category of Object.keys(groupedFunctions).sort()) {
    content += `- [${category} Functions](#${category.toLowerCase().replace(/\s+/g, '-')}-functions)\n`;
  }

  content += '\n---\n\n';

  // Generate function documentation by category
  for (const [category, functions] of Object.entries(groupedFunctions)) {
    content += `## ${category} Functions\n\n`;
    
    for (const [name, info] of Object.entries(functions)) {
      content += `### ${name}\n\n`;
      content += `**Signature:** \`${name}(${formatArguments(info.arguments)})\`  \n`;
      content += `**Return Type:** ${info.returnType}  \n`;
      content += `**Description:** ${info.description}\n\n`;
      
      if (info.arguments && info.arguments.length > 0) {
        content += `**Arguments:**\n${formatArgumentsList(info.arguments)}\n\n`;
      }
      
      const testRefs = formatTestRefs(info.testRefs);
      if (testRefs) {
        content += `**Examples:** ${testRefs}\n\n`;
      }
      
      content += '---\n\n';
    }
  }

  return content;
}

// Generate Operators documentation
function generateOperatorsDoc() {
  const groupedOperators = groupByCategory(OPERATOR_METADATA);
  
  let content = `# Operators Reference

This document provides a comprehensive reference for all available operators in the Formula Language.

## Operator Precedence

Operators are evaluated in the following order (highest to lowest precedence):

| Precedence | Operators | Associativity | Description |
|------------|-----------|---------------|-------------|
`;

  // Group operators by precedence
  const precedenceGroups = {};
  for (const [op, info] of Object.entries(OPERATOR_METADATA)) {
    const prec = info.precedence;
    if (!precedenceGroups[prec]) {
      precedenceGroups[prec] = [];
    }
    precedenceGroups[prec].push({ op, ...info });
  }

  // Sort by precedence (highest first)
  const sortedPrecedence = Object.keys(precedenceGroups).sort((a, b) => b - a);
  
  for (const prec of sortedPrecedence) {
    const ops = precedenceGroups[prec];
    const opList = ops.map(o => `\`${o.op}\``).join(', ');
    const associativity = ops[0].associativity;
    const description = ops.map(o => o.description).join(', ');
    content += `| ${prec} | ${opList} | ${associativity} | ${description} |\n`;
  }

  content += '\n## Operator Details\n\n';

  // Generate detailed operator documentation by category
  for (const [category, operators] of Object.entries(groupedOperators)) {
    content += `### ${category} Operators\n\n`;
    
    for (const [op, info] of Object.entries(operators)) {
      content += `#### \`${op}\`\n\n`;
      content += `**Description:** ${info.description}  \n`;
      content += `**Precedence:** ${info.precedence}  \n`;
      content += `**Associativity:** ${info.associativity}\n\n`;
      
      const testRefs = formatTestRefs(info.testRefs);
      if (testRefs) {
        content += `**Examples:** ${testRefs}\n\n`;
      }
      
      content += '---\n\n';
    }
  }

  return content;
}

// Generate Syntax documentation
function generateSyntaxDoc() {
  return `# Syntax Reference

This document describes the syntax rules and patterns for the Formula Language.

## Basic Syntax

### Literals

The Formula Language supports several types of literal values:

- **Numbers:** \`42\`, \`3.14\`, \`-5\`
- **Strings:** \`"Hello World"\`, \`"Test"\`
- **Booleans:** \`TRUE\`, \`FALSE\`
- **Dates:** \`DATE("2023-12-25")\`
- **NULL:** \`NULL\`

### Identifiers

Identifiers are used to reference columns and define function names. They must start with a letter or underscore, followed by letters, numbers, or underscores.

Examples: \`amount\`, \`customer_name\`, \`date_created\`

### Comments

The Formula Language supports both line and block comments:

- **Line comments:** \`// This is a comment\`
- **Block comments:** \`/* This is a multi-line comment */\`

## Expressions

### Arithmetic Expressions

Basic mathematical operations with standard precedence rules:

\`\`\`
amount + lender_fee        // Addition
amount - discount          // Subtraction  
amount * rate             // Multiplication
amount / count            // Division
-amount                   // Unary negation
\`\`\`

### String Expressions

String concatenation using the \`&\` operator:

\`\`\`
first_name & " " & last_name
"Total: " & STRING(amount)
\`\`\`

### Comparison Expressions

Comparison operators return boolean values:

\`\`\`
amount > 1000             // Greater than
status = "approved"       // Equality
date_created < TODAY()    // Less than with function
amount >= minimum_amount  // Greater than or equal
status != "declined"      // Inequality
\`\`\`

### Logical Expressions

Logical operations using function syntax:

\`\`\`
AND(amount > 1000, status = "approved")
OR(priority = "high", amount > 50000)
NOT(ISNULL(customer_name))
\`\`\`

## Function Calls

Functions are called using parentheses syntax:

\`\`\`
TODAY()                              // No arguments
STRING(amount)                       // Single argument
IF(amount > 1000, "High", "Low")    // Multiple arguments
\`\`\`

## Relationship References

Access fields from related tables using the \`_rel\` suffix:

\`\`\`
customer_rel.business_name          // Direct relationship
customer_rel.main_rep_rel.name      // Nested relationship (future feature)
\`\`\`

## Aggregate Functions

Aggregate functions operate on inverse relationships:

\`\`\`
STRING_AGG(orders_customer, product_name, ", ")
SUM_AGG(payments_invoice, amount)
COUNT_AGG(line_items_order, id)
\`\`\`

## Operator Precedence

Expressions are evaluated according to operator precedence. Use parentheses to override default precedence:

1. **Unary operators:** \`-\` (negation)
2. **Multiplicative:** \`*\`, \`/\`
3. **Additive:** \`+\`, \`-\`
4. **Comparison:** \`=\`, \`!=\`, \`<\`, \`<=\`, \`>\`, \`>=\`
5. **String concatenation:** \`&\`

## Error Handling

The Formula Language provides clear error messages with position information:

- **Syntax errors:** Invalid syntax or unexpected tokens
- **Type errors:** Mismatched argument types for functions
- **Reference errors:** Unknown column or relationship names
- **Argument errors:** Wrong number of function arguments

## Best Practices

1. **Use parentheses** for clarity in complex expressions
2. **Validate relationships** exist in your database schema
3. **Handle NULL values** explicitly using \`ISNULL()\` or \`NULLVALUE()\`
4. **Group related conditions** using logical functions
5. **Use meaningful comments** to document complex formulas
`;
}

// Generate Data Types documentation
function generateDataTypesDoc() {
  return `# Data Types Reference

This document describes the data type system used by the Formula Language.

## Core Data Types

### string
- **Description:** Text values and character sequences
- **Literals:** \`"Hello"\`, \`"123"\`, \`""\` (empty string)
- **Operations:** Concatenation (\`&\`), comparison (\`=\`, \`!=\`)
- **Functions:** \`UPPER()\`, \`LOWER()\`, \`TRIM()\`, \`LEN()\`, \`LEFT()\`, \`RIGHT()\`, \`MID()\`

### number
- **Description:** Numeric values (integers and decimals)
- **Literals:** \`42\`, \`3.14\`, \`-5\`, \`0\`
- **Operations:** Arithmetic (\`+\`, \`-\`, \`*\`, \`/\`), comparison (\`<\`, \`>\`, \`<=\`, \`>=\`)
- **Functions:** \`ABS()\`, \`ROUND()\`, \`MIN()\`, \`MAX()\`, \`MOD()\`, \`CEILING()\`, \`FLOOR()\`

### boolean
- **Description:** True/false values
- **Literals:** \`TRUE\`, \`FALSE\`
- **Operations:** Logical functions (\`AND()\`, \`OR()\`, \`NOT()\`), comparison (\`=\`, \`!=\`)
- **Functions:** Logical functions and comparison operators return boolean values

### date
- **Description:** Date values without time components
- **Literals:** \`DATE("2023-12-25")\`, \`TODAY()\`
- **Operations:** Comparison (\`<\`, \`>\`, etc.), arithmetic with numbers (date + days)
- **Functions:** \`YEAR()\`, \`MONTH()\`, \`DAY()\`, \`WEEKDAY()\`, \`ADDDAYS()\`, \`ADDMONTHS()\`, \`DATEDIF()\`

### null
- **Description:** Represents missing or undefined values
- **Literal:** \`NULL\`
- **Operations:** Special handling with \`ISNULL()\`, \`ISBLANK()\`, \`NULLVALUE()\`
- **Behavior:** NULL values propagate through most operations

## Type Conversion

### Automatic Conversion
The Formula Language performs automatic type conversion in certain contexts:

- **String concatenation:** All values converted to strings when using \`&\`
- **Numeric operations:** Compatible types promoted to numbers
- **Comparison operations:** Types must match or be compatible

### Explicit Conversion
Use conversion functions for explicit type conversion:

- **STRING(value):** Convert any value to string representation
- **DATE(string):** Convert ISO date string to date value

## Type Checking

The Formula Language performs strict type checking at compile time:

- **Function arguments:** Must match expected types
- **Operator operands:** Must be compatible types  
- **Comparison operations:** Both sides must have compatible types
- **Return type validation:** Function return types are validated

## Null Handling

The Formula Language provides comprehensive null handling:

### Null-Safe Functions
- **ISNULL(value):** Check if a value is NULL
- **ISBLANK(value):** Check if a value is NULL or empty string
- **NULLVALUE(value, default):** Return default if value is NULL

### Null Propagation
Most operations with NULL values return NULL:

\`\`\`
NULL + 5          // Returns NULL
NULL & "text"     // Returns NULL  
NULL = NULL       // Returns NULL (use ISNULL for comparison)
\`\`\`

### Aggregate Null Handling
Aggregate functions handle NULL values according to SQL semantics:

- **STRING_AGG:** Ignores NULL values in concatenation
- **SUM_AGG:** Ignores NULL values, returns 0 if all NULL
- **COUNT_AGG:** Counts non-NULL values only
- **MIN_AGG/MAX_AGG:** Ignores NULL values

## PostgreSQL Mapping

Formula Language types map to PostgreSQL types as follows:

| Formula Type | PostgreSQL Types |
|--------------|------------------|
| string | text, varchar, char |
| number | numeric, integer, bigint, decimal, real, double precision |
| boolean | boolean |
| date | date, timestamp, timestamptz |
| null | NULL value |

## Type Compatibility

### Compatible Types
These type combinations work in operations:

- **number + number:** Arithmetic operations
- **string & any:** String concatenation (converts right side)
- **date + number:** Date arithmetic (number treated as days)
- **date - number:** Date arithmetic (number treated as days)
- **any = any:** Equality comparison (types must match)

### Incompatible Types
These combinations cause type errors:

- **string + number:** Use STRING() to convert first
- **date * number:** Use ADDDAYS() or ADDMONTHS() instead
- **boolean + number:** No automatic conversion

## Error Messages

Type-related errors provide clear guidance:

\`\`\`
"LEFT() first argument must be string, got number"
"Cannot compare string with date"
"IF() true and false values must be the same type"
\`\`\`
`;
}

// Generate Relationships documentation  
function generateRelationshipsDoc() {
  return `# Relationships Reference

This document explains how to work with relationships between tables in the Formula Language.

## Direct Relationships

Direct relationships allow you to access fields from related tables using the \`_rel\` suffix.

### Syntax
\`\`\`
related_table_rel.field_name
\`\`\`

### Examples
\`\`\`
customer_rel.business_name      // Access customer's business name
merchant_rel.status            // Access merchant's status  
rep_rel.name                   // Access rep's name
\`\`\`

### How It Works
1. **Relationship Detection:** The compiler identifies \`_rel\` suffix
2. **Foreign Key Lookup:** Finds the foreign key column (removes \`_rel\`)
3. **JOIN Generation:** Creates appropriate LEFT JOIN in SQL
4. **Field Access:** References the field in the joined table

### Generated SQL
\`\`\`
-- Formula: customer_rel.business_name
SELECT rel_customer.business_name
FROM submission s
LEFT JOIN customer rel_customer ON s.customer = rel_customer.id
\`\`\`

## Inverse Relationships (Aggregates)

Inverse relationships work in the opposite direction, allowing you to aggregate data from tables that reference your current table.

### Naming Convention
Format: \`{table_name}s_{field_name}\`

Examples:
- \`orders_customer\` - Order records that reference this customer
- \`payments_invoice\` - Payment records that reference this invoice
- \`rep_links_submission\` - Rep link records that reference this submission

### Aggregate Functions

#### STRING_AGG
Concatenate values from related records:
\`\`\`
STRING_AGG(orders_customer, product_name, ", ")
STRING_AGG_DISTINCT(payments_invoice, payment_method, " | ")
\`\`\`

#### Numeric Aggregates
\`\`\`
SUM_AGG(line_items_order, amount)        // Sum amounts
COUNT_AGG(orders_customer, id)           // Count records
AVG_AGG(reviews_product, rating)         // Average rating
MIN_AGG(payments_invoice, amount)        // Minimum payment
MAX_AGG(orders_customer, total)          // Maximum order total
\`\`\`

#### Boolean Aggregates
\`\`\`
AND_AGG(line_items_order, is_taxable)    // All items taxable?
OR_AGG(orders_customer, is_priority)     // Any priority orders?
\`\`\`

### Generated SQL
\`\`\`
-- Formula: STRING_AGG(orders_customer, product_name, ", ")
SELECT agg1.string_agg_result
FROM customer c
LEFT JOIN (
  SELECT 
    o.customer,
    STRING_AGG(o.product_name, ', ') as string_agg_result
  FROM order o 
  GROUP BY o.customer
) agg1 ON c.id = agg1.customer
\`\`\`

## Nested Relationships

### Current Support
Nested relationships work within aggregate expressions:
\`\`\`
STRING_AGG(rep_links_submission, rep_rel.name, ", ")
\`\`\`

This accesses the \`name\` field from the \`rep\` table through the \`rep_link\` relationship.

### Future Enhancement
Multi-level relationships in main expressions (planned):
\`\`\`
customer_rel.main_rep_rel.user_rel.email
\`\`\`

## Relationship Metadata

The Formula Language loads relationship information from your database schema:

### Direct Relationships
- **Source:** Foreign key constraints in database
- **Loading:** Automatic discovery from \`information_schema\`
- **Caching:** Relationship info cached per compilation context

### Inverse Relationships  
- **Source:** \`relationship_lookups\` table or computed from schema
- **Format:** Maps relationship names to table and join column info
- **Validation:** Compiler validates relationship existence

## Error Handling

### Common Errors
\`\`\`
"Unknown relationship: customer_rel"
"Unknown inverse relationship: invalid_orders_customer"
"Field 'invalid_field' not found in related table"
\`\`\`

### Troubleshooting
1. **Check relationship name:** Ensure \`_rel\` suffix for direct relationships
2. **Verify foreign keys:** Database must have proper foreign key constraints
3. **Validate field names:** Referenced fields must exist in target table
4. **Case sensitivity:** Relationship names are case-insensitive

## Performance Considerations

### JOIN Optimization
- **Automatic deduplication:** Same relationships share JOINs across formulas
- **LEFT JOINs:** Used to handle missing relationships gracefully
- **Alias management:** Unique aliases prevent conflicts

### Aggregate Optimization
- **Consolidated subqueries:** Multiple aggregates on same relationship share subqueries
- **Efficient grouping:** Proper GROUP BY clauses for aggregation
- **NULL handling:** Appropriate default values when no related records

## Best Practices

### Direct Relationships
1. **Validate existence:** Ensure relationships exist in your schema
2. **Handle NULLs:** Use \`ISNULL()\` to check for missing relationships
3. **Performance:** Consider index on foreign key columns

### Inverse Relationships
1. **Meaningful names:** Use descriptive relationship names
2. **Aggregate appropriately:** Choose right aggregate function for data
3. **Handle empty results:** Aggregates return appropriate defaults for no matches
4. **Complex expressions:** Use sub-expressions within aggregates for flexibility

### General
1. **Document relationships:** Comment complex relationship chains
2. **Test with real data:** Verify relationships work with actual database
3. **Monitor performance:** Watch for slow queries with many JOINs
`;
}

// Generate AST Nodes documentation
function generateASTNodesDoc() {
  let content = `# AST Nodes Reference

This document describes the Abstract Syntax Tree (AST) node types used internally by the Formula Language compiler.

> **Note:** This is technical documentation for developers working on the compiler itself.

## Node Types

`;

  for (const [nodeType, info] of Object.entries(AST_NODE_METADATA)) {
    content += `### ${nodeType}\n\n`;
    content += `**Description:** ${info.description}\n\n`;
    content += `**Properties:**\n`;
    
    for (const prop of info.properties) {
      content += `- \`${prop}\`\n`;
    }
    content += '\n';
    
    const testRefs = formatTestRefs(info.testRefs);
    if (testRefs) {
      content += `**Examples:** ${testRefs}\n\n`;
    }
    
    content += '---\n\n';
  }

  return content;
}

// Generate Tokens documentation
function generateTokensDoc() {
  let content = `# Tokens Reference

This document describes the lexical tokens recognized by the Formula Language lexer.

> **Note:** This is technical documentation for developers working on language tooling.

## Token Types

| Token | Pattern | Description | TextMate Scope |
|-------|---------|-------------|----------------|
`;

  for (const [tokenType, info] of Object.entries(TOKEN_METADATA)) {
    const scope = info.textMateScope || '';
    content += `| \`${tokenType}\` | \`${info.pattern}\` | ${info.description} | \`${scope}\` |\n`;
  }

  content += '\n## Usage in VSCode Extension\n\n';
  content += 'The TextMate scopes are used for syntax highlighting in the VSCode extension.\n\n';
  content += '## Pattern Details\n\n';
  
  for (const [tokenType, info] of Object.entries(TOKEN_METADATA)) {
    if (info.pattern !== 'END_OF_INPUT') {
      content += `### ${tokenType}\n`;
      content += `**Pattern:** \`${info.pattern}\`  \n`;
      content += `**Description:** ${info.description}\n\n`;
    }
  }

  return content;
}

// Generate Errors documentation
function generateErrorsDoc() {
  return `# Error Reference

This document describes error handling and common error messages in the Formula Language.

## Error Types

### Lexer Errors
Errors that occur during tokenization:

- **Invalid character:** Unrecognized character in input
- **Unterminated string:** String literal missing closing quote
- **Unterminated comment:** Block comment missing closing \`*/\`

### Parser Errors  
Errors that occur during parsing:

- **Unexpected token:** Token doesn't match expected syntax
- **Unexpected EOF:** Input ends unexpectedly
- **Consecutive operators:** Two operators without operand between them

### Compiler Errors
Errors that occur during compilation:

- **Unknown function:** Function name not recognized
- **Unknown relationship:** Relationship reference not found
- **Type mismatch:** Argument type doesn't match function requirement
- **Wrong argument count:** Function called with wrong number of arguments

## Error Format

All errors include:
- **Message:** Human-readable description
- **Position:** Character position in formula where error occurred

\`\`\`json
{
  "message": "Unknown function: INVALID",
  "position": 15
}
\`\`\`

## Common Error Messages

### Function Errors
\`\`\`
"Unknown function: INVALID"
"TODAY() takes no arguments"
"STRING() takes exactly one argument"
"IF() takes 2 or 3 arguments"
\`\`\`

### Type Errors
\`\`\`
"LEFT() first argument must be string, got number"
"ROUND() requires number argument, got string"
"IF() condition must be boolean, got string"
"AND() argument 1 must be boolean, got number"
\`\`\`

### Relationship Errors
\`\`\`
"Unknown relationship: invalid_rel"
"Unknown inverse relationship: invalid_orders_customer"
"Field 'invalid_field' not found in related table 'customer'"
\`\`\`

### Syntax Errors
\`\`\`
"Expected RPAREN, got EOF"
"Unexpected token: COMMA"
"Consecutive operators are not allowed"
"Unary plus operator is not supported"
\`\`\`

## Error Recovery

The Formula Language compiler stops at the first error encountered and does not attempt error recovery. This ensures:

- **Clear error reporting:** Single, specific error message
- **Fast compilation:** No time spent on recovery attempts
- **Predictable behavior:** Consistent error handling

## Debugging Tips

### Position Information
Use the position information to locate errors:
1. Count characters from start of formula
2. Position is 0-based
3. Whitespace and comments count toward position

### Common Mistakes
1. **Missing quotes:** \`hello\` should be \`"hello"\`
2. **Wrong function name:** \`LENGTH()\` should be \`LEN()\`
3. **Missing relationship suffix:** \`customer.name\` should be \`customer_rel.name\`
4. **Type mismatches:** \`"5" + 5\` should be \`5 + 5\` or \`"5" & STRING(5)\`

### Validation Strategy
1. **Start simple:** Build formula incrementally
2. **Test components:** Validate individual parts first
3. **Check references:** Ensure all columns and relationships exist
4. **Verify types:** Check argument types match function requirements
`;
}

// Generate main documentation index
function generateIndexDoc() {
  return `# Formula Language Documentation

Welcome to the Formula Language documentation. This language provides a powerful, Excel-like syntax for creating computed fields with database integration.

## Quick Start

### Basic Example
\`\`\`
amount + lender_fee
\`\`\`

### With Relationships
\`\`\`
customer_rel.business_name & " - " & STRING(amount)
\`\`\`

### With Aggregates
\`\`\`
STRING_AGG(orders_customer, product_name, ", ")
\`\`\`

## Documentation Sections

### Language Reference
- **[Syntax](SYNTAX.md)** - Language syntax rules and patterns
- **[Functions](FUNCTIONS.md)** - Complete function reference
- **[Operators](OPERATORS.md)** - Operator precedence and usage
- **[Data Types](DATA_TYPES.md)** - Type system and conversions
- **[Relationships](RELATIONSHIPS.md)** - Working with table relationships
- **[Errors](ERRORS.md)** - Error messages and troubleshooting

### Technical Reference
- **[AST Nodes](AST_NODES.md)** - Internal AST structure (for compiler developers)
- **[Tokens](TOKENS.md)** - Lexical tokens (for tooling developers)

## Features

### ✅ Completed Features
- **Arithmetic Operations:** \`+\`, \`-\`, \`*\`, \`/\`
- **String Operations:** \`&\` (concatenation), text functions
- **Comparison Operations:** \`=\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`
- **Logical Functions:** \`AND()\`, \`OR()\`, \`NOT()\`
- **Conditional Logic:** \`IF()\` function
- **Null Handling:** \`ISNULL()\`, \`NULLVALUE()\`, \`ISBLANK()\`
- **Text Functions:** \`UPPER()\`, \`LOWER()\`, \`TRIM()\`, \`LEN()\`, \`LEFT()\`, \`RIGHT()\`, \`MID()\`
- **Math Functions:** \`ABS()\`, \`ROUND()\`, \`MIN()\`, \`MAX()\`, \`MOD()\`, \`CEILING()\`, \`FLOOR()\`
- **Date Functions:** \`TODAY()\`, \`YEAR()\`, \`MONTH()\`, \`DAY()\`, \`ADDDAYS()\`, \`ADDMONTHS()\`
- **Direct Relationships:** \`customer_rel.name\`
- **Aggregate Functions:** \`STRING_AGG()\`, \`SUM_AGG()\`, \`COUNT_AGG()\`, etc.
- **Comments:** Line (\`//\`) and block (\`/* */\`) comments

### 🚧 Planned Features
- **Multi-level Relationships:** \`customer_rel.rep_rel.name\`
- **Advanced Date Functions:** More date manipulation functions
- **String Pattern Matching:** Regular expressions
- **Mathematical Functions:** \`SIN()\`, \`COS()\`, \`LOG()\`, etc.

## Examples

### Basic Calculations
\`\`\`
// Simple arithmetic
amount + lender_fee + source_fee

// Percentage calculation  
amount * (commission_rate / 100)

// Conditional calculation
IF(amount > 1000, amount * 0.05, amount * 0.03)
\`\`\`

### String Operations
\`\`\`
// String concatenation
first_name & " " & last_name

// Conditional text
IF(ISNULL(note), "No note available", note)

// Text formatting
UPPER(LEFT(business_name, 3)) & "-" & STRING(id)
\`\`\`

### Working with Relationships
\`\`\`
// Access related data
customer_rel.business_name

// Combine with operations
customer_rel.business_name & " (" & customer_rel.status & ")"

// Null-safe relationship access
NULLVALUE(merchant_rel.business_name, "No merchant")
\`\`\`

### Aggregate Operations
\`\`\`
// String aggregation
STRING_AGG(rep_links_submission, rep_rel.name, ", ")

// Numeric aggregation
SUM_AGG(line_items_order, amount)

// Complex aggregation
"Total: " & STRING(SUM_AGG(payments_invoice, amount)) & 
" from " & STRING(COUNT_AGG(payments_invoice, id)) & " payments"
\`\`\`

## Integration

The Formula Language compiles to PostgreSQL SQL and integrates with:
- **Database schemas** for relationship discovery
- **Type checking** for compile-time validation  
- **Query optimization** for efficient SQL generation

## Getting Help

- Check the **[Error Reference](ERRORS.md)** for troubleshooting
- Review **[Examples](FUNCTIONS.md)** in the function documentation
- Validate your database schema has proper foreign key relationships
- Test formulas incrementally when building complex expressions

---

*This documentation is auto-generated from the compiler metadata and stays current with language changes.*
`;
}

// Main generation function
function generateDocumentation() {
  console.log('🚀 Generating Formula Language Documentation...\n');

  const docs = [
    { filename: 'README.md', content: generateIndexDoc(), description: 'Main documentation index' },
    { filename: 'SYNTAX.md', content: generateSyntaxDoc(), description: 'Language syntax reference' },
    { filename: 'FUNCTIONS.md', content: generateFunctionsDoc(), description: 'Functions reference' },
    { filename: 'OPERATORS.md', content: generateOperatorsDoc(), description: 'Operators reference' },
    { filename: 'DATA_TYPES.md', content: generateDataTypesDoc(), description: 'Data types reference' },
    { filename: 'RELATIONSHIPS.md', content: generateRelationshipsDoc(), description: 'Relationships reference' },
    { filename: 'ERRORS.md', content: generateErrorsDoc(), description: 'Error messages reference' },
    { filename: 'AST_NODES.md', content: generateASTNodesDoc(), description: 'AST nodes reference (technical)' },
    { filename: 'TOKENS.md', content: generateTokensDoc(), description: 'Tokens reference (technical)' }
  ];

  let successCount = 0;
  let warningCount = 0;

  for (const doc of docs) {
    try {
      const filePath = path.join(__dirname, '..', 'docs', doc.filename);
      fs.writeFileSync(filePath, doc.content);
      console.log(`✅ Generated ${doc.filename} - ${doc.description}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate ${doc.filename}: ${error.message}`);
    }
  }

  // Summary
  console.log(`\n📊 Documentation Generation Summary:`);
  console.log(`   ✅ ${successCount} files generated successfully`);
  if (warningCount > 0) {
    console.log(`   ⚠️  ${warningCount} warnings (missing test references)`);
  }
  console.log(`   📁 Output directory: docs/`);
  
  // Validation summary
  console.log(`\n🔍 Validation Results:`);
  console.log(`   📝 ${Object.keys(FUNCTION_METADATA).length} functions documented`);
  console.log(`   🔧 ${Object.keys(OPERATOR_METADATA).length} operators documented`);
  console.log(`   🌳 ${Object.keys(AST_NODE_METADATA).length} AST node types documented`);
  console.log(`   🔤 ${Object.keys(TOKEN_METADATA).length} token types documented`);

  console.log('\n🎉 Documentation generation complete!');
}

// Run the generator
if (require.main === module) {
  generateDocumentation();
}

module.exports = {
  generateDocumentation,
  SimpleTemplate,
  validateTestReference,
  groupByCategory
};