# Formula Language Reference

Welcome to the Formula Language Reference! This documentation is automatically generated from the compiler metadata to ensure accuracy and completeness.

## Quick Navigation

- [Functions by Category](#functions-by-category)
- [All Functions A-Z](#all-functions-a-z)
- [Data Types](#data-types)
- [Operators](#operators)

## Functions by Category


### Core Functions

- [`TODAY()`](./functions/core.md#today) - Returns the current date
- [`ME()`](./functions/core.md#me) - Returns the current user identifier
- [`DATE(dateString)`](./functions/core.md#date) - Converts a string literal to a date
- [`STRING(value)`](./functions/core.md#string) - Converts any value to string representation
- [`IF(condition, trueValue, [falseValue])`](./functions/core.md#if) - Conditional expression with optional else clause


### Null handling Functions

- [`ISNULL(value)`](./functions/null-handling.md#isnull) - Returns true if the value is NULL
- [`NULLVALUE(value, defaultValue)`](./functions/null-handling.md#nullvalue) - Returns default value if first value is NULL
- [`ISBLANK(value)`](./functions/null-handling.md#isblank) - Returns true if the value is NULL or empty string


### Logical Functions

- [`AND(condition...)`](./functions/logical.md#and) - Returns true if all conditions are true
- [`OR(condition...)`](./functions/logical.md#or) - Returns true if any condition is true
- [`NOT(condition)`](./functions/logical.md#not) - Returns the logical negation of the condition


### Math Functions

- [`ABS(number)`](./functions/math.md#abs) - Returns the absolute value of a number
- [`ROUND(number, decimals)`](./functions/math.md#round) - Rounds a number to specified decimal places
- [`MIN(num1, num2)`](./functions/math.md#min) - Returns the smaller of two numbers
- [`MAX(num1, num2)`](./functions/math.md#max) - Returns the larger of two numbers
- [`MOD(dividend, divisor)`](./functions/math.md#mod) - Returns the remainder after division
- [`CEILING(number)`](./functions/math.md#ceiling) - Rounds a number up to the nearest integer
- [`FLOOR(number)`](./functions/math.md#floor) - Rounds a number down to the nearest integer


### String Functions

- [`UPPER(text)`](./functions/string.md#upper) - Converts text to uppercase
- [`LOWER(text)`](./functions/string.md#lower) - Converts text to lowercase
- [`TRIM(text)`](./functions/string.md#trim) - Removes leading and trailing whitespace
- [`LEN(text)`](./functions/string.md#len) - Returns the length of text
- [`LEFT(text, count)`](./functions/string.md#left) - Returns the leftmost characters from text
- [`RIGHT(text, count)`](./functions/string.md#right) - Returns the rightmost characters from text
- [`MID(text, start, length)`](./functions/string.md#mid) - Returns characters from the middle of text
- [`CONTAINS(text, searchText)`](./functions/string.md#contains) - Returns true if text contains the search string
- [`SUBSTITUTE(text, oldText, newText)`](./functions/string.md#substitute) - Replaces old text with new text in a string


### Date Functions

- [`YEAR(date)`](./functions/date.md#year) - Extracts the year from a date
- [`MONTH(date)`](./functions/date.md#month) - Extracts the month from a date
- [`DAY(date)`](./functions/date.md#day) - Extracts the day from a date
- [`WEEKDAY(date)`](./functions/date.md#weekday) - Returns the day of the week as a number (1=Sunday)
- [`ADDMONTHS(date, months)`](./functions/date.md#addmonths) - Adds months to a date
- [`ADDDAYS(date, days)`](./functions/date.md#adddays) - Adds days to a date
- [`DATEDIF(startDate, endDate, unit)`](./functions/date.md#datedif) - Returns the difference between two dates in specified units


### Aggregate Functions

- [`STRING_AGG(relationship, expression, delimiter)`](./functions/aggregate.md#string_agg) - Concatenates values from related records with delimiter
- [`STRING_AGG_DISTINCT(relationship, expression, delimiter)`](./functions/aggregate.md#string_agg_distinct) - Concatenates distinct values from related records with delimiter
- [`SUM_AGG(relationship, expression)`](./functions/aggregate.md#sum_agg) - Sums numeric values from related records
- [`COUNT_AGG(relationship, expression)`](./functions/aggregate.md#count_agg) - Counts related records
- [`AVG_AGG(relationship, expression)`](./functions/aggregate.md#avg_agg) - Averages numeric values from related records
- [`MIN_AGG(relationship, expression)`](./functions/aggregate.md#min_agg) - Finds minimum value from related records
- [`MAX_AGG(relationship, expression)`](./functions/aggregate.md#max_agg) - Finds maximum value from related records
- [`AND_AGG(relationship, expression)`](./functions/aggregate.md#and_agg) - Returns true if all values from related records are true
- [`OR_AGG(relationship, expression)`](./functions/aggregate.md#or_agg) - Returns true if any value from related records is true


## All Functions A-Z

- [`ABS(number)`](./functions/math.md#abs) - Returns the absolute value of a number
- [`ADDDAYS(date, days)`](./functions/date.md#adddays) - Adds days to a date
- [`ADDMONTHS(date, months)`](./functions/date.md#addmonths) - Adds months to a date
- [`AND(condition...)`](./functions/logical.md#and) - Returns true if all conditions are true
- [`AND_AGG(relationship, expression)`](./functions/aggregate.md#and_agg) - Returns true if all values from related records are true
- [`AVG_AGG(relationship, expression)`](./functions/aggregate.md#avg_agg) - Averages numeric values from related records
- [`CEILING(number)`](./functions/math.md#ceiling) - Rounds a number up to the nearest integer
- [`CONTAINS(text, searchText)`](./functions/string.md#contains) - Returns true if text contains the search string
- [`COUNT_AGG(relationship, expression)`](./functions/aggregate.md#count_agg) - Counts related records
- [`DATE(dateString)`](./functions/core.md#date) - Converts a string literal to a date
- [`DATEDIF(startDate, endDate, unit)`](./functions/date.md#datedif) - Returns the difference between two dates in specified units
- [`DAY(date)`](./functions/date.md#day) - Extracts the day from a date
- [`FLOOR(number)`](./functions/math.md#floor) - Rounds a number down to the nearest integer
- [`IF(condition, trueValue, [falseValue])`](./functions/core.md#if) - Conditional expression with optional else clause
- [`ISBLANK(value)`](./functions/null-handling.md#isblank) - Returns true if the value is NULL or empty string
- [`ISNULL(value)`](./functions/null-handling.md#isnull) - Returns true if the value is NULL
- [`LEFT(text, count)`](./functions/string.md#left) - Returns the leftmost characters from text
- [`LEN(text)`](./functions/string.md#len) - Returns the length of text
- [`LOWER(text)`](./functions/string.md#lower) - Converts text to lowercase
- [`MAX(num1, num2)`](./functions/math.md#max) - Returns the larger of two numbers
- [`MAX_AGG(relationship, expression)`](./functions/aggregate.md#max_agg) - Finds maximum value from related records
- [`ME()`](./functions/core.md#me) - Returns the current user identifier
- [`MID(text, start, length)`](./functions/string.md#mid) - Returns characters from the middle of text
- [`MIN(num1, num2)`](./functions/math.md#min) - Returns the smaller of two numbers
- [`MIN_AGG(relationship, expression)`](./functions/aggregate.md#min_agg) - Finds minimum value from related records
- [`MOD(dividend, divisor)`](./functions/math.md#mod) - Returns the remainder after division
- [`MONTH(date)`](./functions/date.md#month) - Extracts the month from a date
- [`NOT(condition)`](./functions/logical.md#not) - Returns the logical negation of the condition
- [`NULLVALUE(value, defaultValue)`](./functions/null-handling.md#nullvalue) - Returns default value if first value is NULL
- [`OR(condition...)`](./functions/logical.md#or) - Returns true if any condition is true
- [`OR_AGG(relationship, expression)`](./functions/aggregate.md#or_agg) - Returns true if any value from related records is true
- [`RIGHT(text, count)`](./functions/string.md#right) - Returns the rightmost characters from text
- [`ROUND(number, decimals)`](./functions/math.md#round) - Rounds a number to specified decimal places
- [`STRING(value)`](./functions/core.md#string) - Converts any value to string representation
- [`STRING_AGG(relationship, expression, delimiter)`](./functions/aggregate.md#string_agg) - Concatenates values from related records with delimiter
- [`STRING_AGG_DISTINCT(relationship, expression, delimiter)`](./functions/aggregate.md#string_agg_distinct) - Concatenates distinct values from related records with delimiter
- [`SUBSTITUTE(text, oldText, newText)`](./functions/string.md#substitute) - Replaces old text with new text in a string
- [`SUM_AGG(relationship, expression)`](./functions/aggregate.md#sum_agg) - Sums numeric values from related records
- [`TODAY()`](./functions/core.md#today) - Returns the current date
- [`TRIM(text)`](./functions/string.md#trim) - Removes leading and trailing whitespace
- [`UPPER(text)`](./functions/string.md#upper) - Converts text to uppercase
- [`WEEKDAY(date)`](./functions/date.md#weekday) - Returns the day of the week as a number (1=Sunday)
- [`YEAR(date)`](./functions/date.md#year) - Extracts the year from a date

## Data Types

The formula language supports the following data types:

- **string** - Text values, must be enclosed in double quotes
- **number** - Numeric values (integers and decimals)
- **boolean** - TRUE or FALSE values
- **date** - Date values, created with DATE("YYYY-MM-DD") or TODAY()
- **null** - NULL literal for missing values

## Operators

### Arithmetic Operators
- `+` - Addition (numbers) or date arithmetic
- `-` - Subtraction (numbers) or date arithmetic  
- `*` - Multiplication
- `/` - Division

### String Operators
- `&` - String concatenation (both sides must be strings)

### Comparison Operators
- `=` - Equal to
- `!=` or `<>` - Not equal to
- `>` - Greater than
- `>=` - Greater than or equal to
- `<` - Less than
- `<=` - Less than or equal to

### Logical Functions
Logical operations are implemented as functions rather than operators:
- `AND(condition1, condition2, ...)` - All conditions must be true
- `OR(condition1, condition2, ...)` - Any condition must be true
- `NOT(condition)` - Negates the condition

*Documentation generated on 2025-06-22T17:41:34.478Z*
