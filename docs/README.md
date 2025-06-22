# Formula Language Documentation

Welcome to the Formula Language documentation. This language provides a powerful, Excel-like syntax for creating computed fields with database integration.

## Quick Start

### Basic Example
```
amount + lender_fee
```

### With Relationships
```
customer_rel.business_name & " - " & STRING(amount)
```

### With Aggregates
```
STRING_AGG(orders_customer, product_name, ", ")
```

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
- **Arithmetic Operations:** `+`, `-`, `*`, `/`
- **String Operations:** `&` (concatenation), text functions
- **Comparison Operations:** `=`, `!=`, `<`, `>`, `<=`, `>=`
- **Logical Functions:** `AND()`, `OR()`, `NOT()`
- **Conditional Logic:** `IF()` function
- **Null Handling:** `ISNULL()`, `NULLVALUE()`, `ISBLANK()`
- **Text Functions:** `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, `LEFT()`, `RIGHT()`, `MID()`
- **Math Functions:** `ABS()`, `ROUND()`, `MIN()`, `MAX()`, `MOD()`, `CEILING()`, `FLOOR()`
- **Date Functions:** `TODAY()`, `YEAR()`, `MONTH()`, `DAY()`, `ADDDAYS()`, `ADDMONTHS()`
- **Direct Relationships:** `customer_rel.name`
- **Aggregate Functions:** `STRING_AGG()`, `SUM_AGG()`, `COUNT_AGG()`, etc.
- **Comments:** Line (`//`) and block (`/* */`) comments

### 🚧 Planned Features
- **Multi-level Relationships:** `customer_rel.rep_rel.name`
- **Advanced Date Functions:** More date manipulation functions
- **String Pattern Matching:** Regular expressions
- **Mathematical Functions:** `SIN()`, `COS()`, `LOG()`, etc.

## Examples

### Basic Calculations
```
// Simple arithmetic
amount + lender_fee + source_fee

// Percentage calculation  
amount * (commission_rate / 100)

// Conditional calculation
IF(amount > 1000, amount * 0.05, amount * 0.03)
```

### String Operations
```
// String concatenation
first_name & " " & last_name

// Conditional text
IF(ISNULL(note), "No note available", note)

// Text formatting
UPPER(LEFT(business_name, 3)) & "-" & STRING(id)
```

### Working with Relationships
```
// Access related data
customer_rel.business_name

// Combine with operations
customer_rel.business_name & " (" & customer_rel.status & ")"

// Null-safe relationship access
NULLVALUE(merchant_rel.business_name, "No merchant")
```

### Aggregate Operations
```
// String aggregation
STRING_AGG(rep_links_submission, rep_rel.name, ", ")

// Numeric aggregation
SUM_AGG(line_items_order, amount)

// Complex aggregation
"Total: " & STRING(SUM_AGG(payments_invoice, amount)) & 
" from " & STRING(COUNT_AGG(payments_invoice, id)) & " payments"
```

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
