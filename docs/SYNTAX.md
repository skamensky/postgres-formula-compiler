# Syntax Reference

This document describes the syntax rules and patterns for the Formula Language.

## Basic Syntax

### Literals

The Formula Language supports several types of literal values:

- **Numbers:** `42`, `3.14`, `-5`
- **Strings:** `"Hello World"`, `"Test"`
- **Booleans:** `TRUE`, `FALSE`
- **Dates:** `DATE("2023-12-25")`
- **NULL:** `NULL`

### Identifiers

Identifiers are used to reference columns and define function names. They must start with a letter or underscore, followed by letters, numbers, or underscores.

Examples: `amount`, `customer_name`, `date_created`

### Comments

The Formula Language supports both line and block comments:

- **Line comments:** `// This is a comment`
- **Block comments:** `/* This is a multi-line comment */`

## Expressions

### Arithmetic Expressions

Basic mathematical operations with standard precedence rules:

```
amount + lender_fee        // Addition
amount - discount          // Subtraction  
amount * rate             // Multiplication
amount / count            // Division
-amount                   // Unary negation
```

### String Expressions

String concatenation using the `&` operator:

```
first_name & " " & last_name
"Total: " & STRING(amount)
```

### Comparison Expressions

Comparison operators return boolean values:

```
amount > 1000             // Greater than
status = "approved"       // Equality
date_created < TODAY()    // Less than with function
amount >= minimum_amount  // Greater than or equal
status != "declined"      // Inequality
```

### Logical Expressions

Logical operations using function syntax:

```
AND(amount > 1000, status = "approved")
OR(priority = "high", amount > 50000)
NOT(ISNULL(customer_name))
```

## Function Calls

Functions are called using parentheses syntax:

```
TODAY()                              // No arguments
STRING(amount)                       // Single argument
IF(amount > 1000, "High", "Low")    // Multiple arguments
```

## Relationship References

Access fields from related tables using the `_rel` suffix:

```
customer_rel.business_name          // Direct relationship
customer_rel.main_rep_rel.name      // Nested relationship (future feature)
```

## Aggregate Functions

Aggregate functions operate on inverse relationships:

```
STRING_AGG(orders_customer, product_name, ", ")
SUM_AGG(payments_invoice, amount)
COUNT_AGG(line_items_order, id)
```

## Operator Precedence

Expressions are evaluated according to operator precedence. Use parentheses to override default precedence:

1. **Unary operators:** `-` (negation)
2. **Multiplicative:** `*`, `/`
3. **Additive:** `+`, `-`
4. **Comparison:** `=`, `!=`, `<`, `<=`, `>`, `>=`
5. **String concatenation:** `&`

## Error Handling

The Formula Language provides clear error messages with position information:

- **Syntax errors:** Invalid syntax or unexpected tokens
- **Type errors:** Mismatched argument types for functions
- **Reference errors:** Unknown column or relationship names
- **Argument errors:** Wrong number of function arguments

## Best Practices

1. **Use parentheses** for clarity in complex expressions
2. **Validate relationships** exist in your database schema
3. **Handle NULL values** explicitly using `ISNULL()` or `NULLVALUE()`
4. **Group related conditions** using logical functions
5. **Use meaningful comments** to document complex formulas
