# Data Types Reference

This document describes the data type system used by the Formula Language.

## Core Data Types

### string
- **Description:** Text values and character sequences
- **Literals:** `"Hello"`, `"123"`, `""` (empty string)
- **Operations:** Concatenation (`&`), comparison (`=`, `!=`)
- **Functions:** `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, `LEFT()`, `RIGHT()`, `MID()`

### number
- **Description:** Numeric values (integers and decimals)
- **Literals:** `42`, `3.14`, `-5`, `0`
- **Operations:** Arithmetic (`+`, `-`, `*`, `/`), comparison (`<`, `>`, `<=`, `>=`)
- **Functions:** `ABS()`, `ROUND()`, `MIN()`, `MAX()`, `MOD()`, `CEILING()`, `FLOOR()`

### boolean
- **Description:** True/false values
- **Literals:** `TRUE`, `FALSE`
- **Operations:** Logical functions (`AND()`, `OR()`, `NOT()`), comparison (`=`, `!=`)
- **Functions:** Logical functions and comparison operators return boolean values

### date
- **Description:** Date values without time components
- **Literals:** `DATE("2023-12-25")`, `TODAY()`
- **Operations:** Comparison (`<`, `>`, etc.), arithmetic with numbers (date + days)
- **Functions:** `YEAR()`, `MONTH()`, `DAY()`, `WEEKDAY()`, `ADDDAYS()`, `ADDMONTHS()`, `DATEDIF()`

### null
- **Description:** Represents missing or undefined values
- **Literal:** `NULL`
- **Operations:** Special handling with `ISNULL()`, `ISBLANK()`, `NULLVALUE()`
- **Behavior:** NULL values propagate through most operations

## Type Conversion

### Automatic Conversion
The Formula Language performs automatic type conversion in certain contexts:

- **String concatenation:** All values converted to strings when using `&`
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

```
NULL + 5          // Returns NULL
NULL & "text"     // Returns NULL  
NULL = NULL       // Returns NULL (use ISNULL for comparison)
```

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

```
"LEFT() first argument must be string, got number"
"Cannot compare string with date"
"IF() true and false values must be the same type"
```
