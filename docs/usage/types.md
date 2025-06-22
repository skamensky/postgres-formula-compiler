# Data Types

This document describes all the data types used in the formula language.

## Basic Data Types

### string {#string}
**Description:** Text data type for representing textual information.

**Examples:**
- `"Hello World"`
- `"Invoice #12345"`
- `merchant_rel.business_name`

**Operations:**
- String concatenation using `&` operator: `"Hello" & " World"`
- String functions: `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, etc.
- Comparison operators: `=`, `!=`, `<>`, `<`, `>`, `<=`, `>=`

**Literals:**
String literals are enclosed in double quotes: `"text content"`

---

### number {#number}
**Description:** Numeric data type for representing integers and decimal numbers.

**Examples:**
- `42`
- `3.14159`
- `amount`
- `COUNT_AGG(reps_relationship, id)`

**Operations:**
- Arithmetic operators: `+`, `-`, `*`, `/`
- Comparison operators: `=`, `!=`, `<>`, `<`, `>`, `<=`, `>=`
- Math functions: `ROUND()`, `ABS()`, `CEILING()`, `FLOOR()`, etc.

**Literals:**
Numeric literals can be integers or decimals: `123`, `45.67`

---

### boolean {#boolean}
**Description:** Logical data type representing true or false values.

**Examples:**
- `TRUE`
- `FALSE`
- `amount > 1000`
- `CONTAINS(business_name, "LLC")`

**Operations:**
- Logical operators: `AND`, `OR`, `NOT`
- Comparison operations result in boolean values
- Conditional functions: `IF()`, `AND()`, `OR()`, `NOT()`

**Literals:**
Boolean literals are the keywords `TRUE` and `FALSE`

---

### date {#date}
**Description:** Date data type for representing calendar dates and timestamps.

**Examples:**
- `TODAY()`
- `created_at`
- `DATE("2023-12-25")`
- `ADDDAYS(created_at, 30)`

**Operations:**
- Date arithmetic: `date + number` (adds days), `date - number` (subtracts days)
- Date comparison: `=`, `!=`, `<>`, `<`, `>`, `<=`, `>=`
- Date functions: `YEAR()`, `MONTH()`, `DAY()`, `WEEKDAY()`, `DATEDIF()`, etc.

**Literals:**
Date literals are created using the `DATE()` function: `DATE("2023-12-25")`

---

### null {#null}
**Description:** Special type representing the absence of a value.

**Examples:**
- `NULL`
- Unset or missing data fields
- Result of invalid operations

**Operations:**
- Null checking: `ISNULL()`, `ISBLANK()`
- Null handling: `NULLVALUE()`, `COALESCE()`
- Any operation with null typically results in null

**Literals:**
The null literal is the keyword `NULL`

## Special Types

### expression {#expression}
**Description:** A meta-type representing any valid formula expression that can be evaluated.

**Usage:** Used in function parameters that accept any type of expression, such as:
- Conditional expressions in `IF(condition, trueValue, falseValue)`
- Value expressions in aggregate functions
- Type conversion functions like `STRING(expression)`

**Examples:**
- `amount * 1.1` (arithmetic expression)
- `business_name & " - " & status` (string concatenation)
- `IF(amount > 1000, "Large", "Small")` (conditional expression)

**Note:** This type indicates that the parameter accepts any valid expression, and the actual return type depends on what the expression evaluates to.

---

### inverse_relationship {#inverse_relationship}
**Description:** A special type representing a relationship traversal for aggregate functions.

**Usage:** Used as the first parameter in aggregate functions to specify which related records to aggregate over.

**Syntax:** `table_relationship` or `table_relationship.field` for multi-level relationships

**Examples:**
- `reps_relationship` - aggregates over all rep records related to the current record
- `submissions_merchant` - aggregates over all submission records for the current merchant
- `reps_relationship.user_rel` - multi-level relationship traversal

**Functions that use this type:**
- `STRING_AGG(relationship, expression, delimiter)`
- `COUNT_AGG(relationship, expression)`
- `SUM_AGG(relationship, expression)`
- `AVG_AGG(relationship, expression)`
- `MIN_AGG(relationship, expression)`
- `MAX_AGG(relationship, expression)`
- `AND_AGG(relationship, expression)`
- `OR_AGG(relationship, expression)`

## Type Conversion

The formula language supports automatic type conversion in many contexts:

### Implicit Conversions
- Numbers can be automatically converted to strings in string contexts
- Boolean values convert to strings as "TRUE" or "FALSE"
- Null values propagate through most operations

### Explicit Conversions
- `STRING(expression)` - converts any value to string
- Date parsing through `DATE(string)` function

## Type Compatibility

### Arithmetic Operations (`+`, `-`, `*`, `/`)
- `number + number` → `number`
- `date + number` → `date` (adds days)
- `date - number` → `date` (subtracts days)
- `date - date` → `number` (difference in days)

### String Operations
- `string & string` → `string` (concatenation)
- `string & number` → `string` (number converted to string)
- `string & boolean` → `string` (boolean converted to string)

### Comparison Operations
- Same types can always be compared
- `null` is equal only to `null`
- Cross-type comparisons may use implicit conversion

### Logical Operations
- Only `boolean` values can be used with `AND`, `OR`, `NOT`
- Comparison operations always return `boolean`

*Documentation generated on 2025-06-22T20:49:39.495Z*
