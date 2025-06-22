# Formula Language Reference

Welcome to the Formula Language Reference! This documentation is automatically generated from the compiler metadata to ensure accuracy and completeness.

## Quick Navigation

- [Functions by Category](#functions-by-category)
- [All Functions A-Z](#all-functions-a-z)
- [Data Types](./types.md) - Complete type reference
- [Operators](#operators)

## Functions by Category


### Math Functions

- [`ROUND(number, decimals)`](./functions/math.md#round) - Rounds a number to specified decimal places
- [`ABS(number)`](./functions/math.md#abs) - Returns the absolute value of a number
- [`CEIL(number)`](./functions/math.md#ceil) - Rounds a number up to the nearest integer
- [`CEILING(number)`](./functions/math.md#ceiling) - Rounds a number up to the nearest integer
- [`FLOOR(number)`](./functions/math.md#floor) - Rounds a number down to the nearest integer
- [`POWER(base, exponent)`](./functions/math.md#power) - Raises a number to a power
- [`SQRT(value)`](./functions/math.md#sqrt) - Returns the square root of a number
- [`LOG(value)`](./functions/math.md#log) - Returns the natural logarithm of a number
- [`LOG10(value)`](./functions/math.md#log10) - Returns the base-10 logarithm of a number
- [`EXP(value)`](./functions/math.md#exp) - Returns e raised to the power of a number
- [`SIN(angle)`](./functions/math.md#sin) - Returns the sine of an angle in radians
- [`COS(angle)`](./functions/math.md#cos) - Returns the cosine of an angle in radians
- [`TAN(angle)`](./functions/math.md#tan) - Returns the tangent of an angle in radians
- [`RANDOM()`](./functions/math.md#random) - Returns a random number between 0 and 1
- [`MIN(num1, num2)`](./functions/math.md#min) - Returns the minimum of two numbers
- [`MAX(num1, num2)`](./functions/math.md#max) - Returns the maximum of two numbers
- [`MOD(dividend, divisor)`](./functions/math.md#mod) - Returns the remainder of division
- [`SIGN(value)`](./functions/math.md#sign) - Returns the sign of a number (-1, 0, or 1)


### String Functions

- [`LENGTH(text)`](./functions/string.md#length) - Returns the length of a string
- [`UPPER(requires string argument)`](./functions/string.md#upper) - Converts a string to uppercase
- [`LOWER(requires string argument)`](./functions/string.md#lower) - Converts a string to lowercase
- [`TRIM(requires string argument)`](./functions/string.md#trim) - Removes whitespace from both ends of a string
- [`SUBSTR(text, start, [length])`](./functions/string.md#substr) - Extracts a substring from a string
- [`CONCAT(strings...)`](./functions/string.md#concat) - Concatenates two or more strings
- [`REPLACE(text, search, replacement)`](./functions/string.md#replace) - Replaces occurrences of a substring with another string
- [`CONTAINS(text, second argument)`](./functions/string.md#contains) - Checks if a string contains a substring
- [`STARTS_WITH(text, prefix)`](./functions/string.md#starts_with) - Checks if a string starts with a substring
- [`LEN(requires string argument)`](./functions/string.md#len) - Returns the length of a string
- [`LEFT(first argument, second argument)`](./functions/string.md#left) - Returns the leftmost characters from a string
- [`RIGHT(first argument, numChars)`](./functions/string.md#right) - Returns the rightmost characters from a string
- [`MID(first argument, start, length)`](./functions/string.md#mid) - Returns characters from the middle of a string
- [`SUBSTITUTE(first argument, second argument, third argument)`](./functions/string.md#substitute) - Replaces occurrences of a substring with another string
- [`ENDS_WITH(text, suffix)`](./functions/string.md#ends_with) - Checks if a string ends with a substring


### Date Functions

- [`NOW()`](./functions/date.md#now) - Returns the current date and time
- [`TODAY()`](./functions/date.md#today) - Returns the current date (without time)
- [`YEAR(date)`](./functions/date.md#year) - Extracts the year from a date
- [`MONTH(date)`](./functions/date.md#month) - Extracts the month from a date (1-12)
- [`DAY(date)`](./functions/date.md#day) - Extracts the day from a date (1-31)
- [`HOUR(date)`](./functions/date.md#hour) - Extracts the hour from a date (0-23)
- [`MINUTE(date)`](./functions/date.md#minute) - Extracts the minute from a date (0-59)
- [`SECOND(date)`](./functions/date.md#second) - Extracts the second from a date (0-59)
- [`DATE_ADD(date, amount, unit)`](./functions/date.md#date_add) - Adds a specified amount of time to a date
- [`DATE_DIFF(date1, date2, unit)`](./functions/date.md#date_diff) - Calculates the difference between two dates
- [`FORMAT_DATE(date, format)`](./functions/date.md#format_date) - Formats a date as a string
- [`WEEKDAY(date)`](./functions/date.md#weekday) - Returns the day of the week as a number (1=Sunday)
- [`ADDMONTHS(date, months)`](./functions/date.md#addmonths) - Adds months to a date
- [`ADDDAYS(date, days)`](./functions/date.md#adddays) - Adds days to a date
- [`DATEDIF(date1, date2, unit)`](./functions/date.md#datedif) - Returns the difference between two dates in specified units


### Core Functions

- [`ME()`](./functions/core.md#me) - Returns the current user identifier
- [`STRING(value)`](./functions/core.md#string) - Converts a value to a string
- [`DATE(dateString)`](./functions/core.md#date) - Creates a date from a string literal
- [`IF(condition, trueValue, falseValue)`](./functions/core.md#if) - Returns one value if condition is true, another if false
- [`EVAL(relationshipRef)`](./functions/core.md#eval) - Evaluates an expression from another table


### Logical Functions

- [`AND(argument...)`](./functions/logical.md#and) - Returns true if all arguments are true
- [`OR(argument...)`](./functions/logical.md#or) - Returns true if any argument is true
- [`NOT(requires boolean argument)`](./functions/logical.md#not) - Returns the opposite of a boolean value


### Null handling Functions

- [`ISNULL(value)`](./functions/null-handling.md#isnull) - Returns true if the value is null
- [`ISBLANK(value)`](./functions/null-handling.md#isblank) - Returns true if the value is null or empty string
- [`NULLVALUE(value, defaultValue)`](./functions/null-handling.md#nullvalue) - Returns the first value if not null, otherwise returns the second value
- [`COALESCE(values...)`](./functions/null-handling.md#coalesce) - Returns the first non-null value from a list of expressions


### Aggregate Functions

- [`COUNT(relationship, value)`](./functions/aggregate.md#count) - Counts the number of non-null values
- [`SUM(relationship, value)`](./functions/aggregate.md#sum) - Sums numeric values
- [`AVG(relationship, value)`](./functions/aggregate.md#avg) - Calculates the average of numeric values
- [`MIN_AGG(relationship, value)`](./functions/aggregate.md#min_agg) - Finds the minimum value
- [`MAX_AGG(relationship, value)`](./functions/aggregate.md#max_agg) - Finds the maximum value
- [`STRING_AGG(relationship, value, separator)`](./functions/aggregate.md#string_agg) - Concatenates string values with a separator
- [`STRING_AGG_DISTINCT(relationship, value, separator)`](./functions/aggregate.md#string_agg_distinct) - Concatenates unique string values with a separator
- [`SUM_AGG(relationship, value)`](./functions/aggregate.md#sum_agg) - Sums numeric values
- [`COUNT_AGG(relationship, value)`](./functions/aggregate.md#count_agg) - Counts the number of non-null values
- [`AVG_AGG(relationship, value)`](./functions/aggregate.md#avg_agg) - Calculates the average of numeric values
- [`AND_AGG(relationship, value)`](./functions/aggregate.md#and_agg) - Returns true if all boolean values are true
- [`OR_AGG(relationship, value)`](./functions/aggregate.md#or_agg) - Returns true if any boolean value is true


## All Functions A-Z

- [`ABS(number)`](./functions/Math.md#abs) - Returns the absolute value of a number
- [`ADDDAYS(date, days)`](./functions/Date.md#adddays) - Adds days to a date
- [`ADDMONTHS(date, months)`](./functions/Date.md#addmonths) - Adds months to a date
- [`AND(argument...)`](./functions/Logical.md#and) - Returns true if all arguments are true
- [`AND_AGG(relationship, value)`](./functions/Aggregate.md#and_agg) - Returns true if all boolean values are true
- [`AVG(relationship, value)`](./functions/Aggregate.md#avg) - Calculates the average of numeric values
- [`AVG_AGG(relationship, value)`](./functions/Aggregate.md#avg_agg) - Calculates the average of numeric values
- [`CEIL(number)`](./functions/Math.md#ceil) - Rounds a number up to the nearest integer
- [`CEILING(number)`](./functions/Math.md#ceiling) - Rounds a number up to the nearest integer
- [`COALESCE(values...)`](./functions/Null Handling.md#coalesce) - Returns the first non-null value from a list of expressions
- [`CONCAT(strings...)`](./functions/String.md#concat) - Concatenates two or more strings
- [`CONTAINS(text, second argument)`](./functions/String.md#contains) - Checks if a string contains a substring
- [`COS(angle)`](./functions/Math.md#cos) - Returns the cosine of an angle in radians
- [`COUNT(relationship, value)`](./functions/Aggregate.md#count) - Counts the number of non-null values
- [`COUNT_AGG(relationship, value)`](./functions/Aggregate.md#count_agg) - Counts the number of non-null values
- [`DATE(dateString)`](./functions/Core.md#date) - Creates a date from a string literal
- [`DATEDIF(date1, date2, unit)`](./functions/Date.md#datedif) - Returns the difference between two dates in specified units
- [`DATE_ADD(date, amount, unit)`](./functions/Date.md#date_add) - Adds a specified amount of time to a date
- [`DATE_DIFF(date1, date2, unit)`](./functions/Date.md#date_diff) - Calculates the difference between two dates
- [`DAY(date)`](./functions/Date.md#day) - Extracts the day from a date (1-31)
- [`ENDS_WITH(text, suffix)`](./functions/String.md#ends_with) - Checks if a string ends with a substring
- [`EVAL(relationshipRef)`](./functions/Core.md#eval) - Evaluates an expression from another table
- [`EXP(value)`](./functions/Math.md#exp) - Returns e raised to the power of a number
- [`FLOOR(number)`](./functions/Math.md#floor) - Rounds a number down to the nearest integer
- [`FORMAT_DATE(date, format)`](./functions/Date.md#format_date) - Formats a date as a string
- [`HOUR(date)`](./functions/Date.md#hour) - Extracts the hour from a date (0-23)
- [`IF(condition, trueValue, falseValue)`](./functions/Core.md#if) - Returns one value if condition is true, another if false
- [`ISBLANK(value)`](./functions/Null Handling.md#isblank) - Returns true if the value is null or empty string
- [`ISNULL(value)`](./functions/Null Handling.md#isnull) - Returns true if the value is null
- [`LEFT(first argument, second argument)`](./functions/String.md#left) - Returns the leftmost characters from a string
- [`LEN(requires string argument)`](./functions/String.md#len) - Returns the length of a string
- [`LENGTH(text)`](./functions/String.md#length) - Returns the length of a string
- [`LOG(value)`](./functions/Math.md#log) - Returns the natural logarithm of a number
- [`LOG10(value)`](./functions/Math.md#log10) - Returns the base-10 logarithm of a number
- [`LOWER(requires string argument)`](./functions/String.md#lower) - Converts a string to lowercase
- [`MAX(num1, num2)`](./functions/Math.md#max) - Returns the maximum of two numbers
- [`MAX_AGG(relationship, value)`](./functions/Aggregate.md#max_agg) - Finds the maximum value
- [`ME()`](./functions/Core.md#me) - Returns the current user identifier
- [`MID(first argument, start, length)`](./functions/String.md#mid) - Returns characters from the middle of a string
- [`MIN(num1, num2)`](./functions/Math.md#min) - Returns the minimum of two numbers
- [`MINUTE(date)`](./functions/Date.md#minute) - Extracts the minute from a date (0-59)
- [`MIN_AGG(relationship, value)`](./functions/Aggregate.md#min_agg) - Finds the minimum value
- [`MOD(dividend, divisor)`](./functions/Math.md#mod) - Returns the remainder of division
- [`MONTH(date)`](./functions/Date.md#month) - Extracts the month from a date (1-12)
- [`NOT(requires boolean argument)`](./functions/Logical.md#not) - Returns the opposite of a boolean value
- [`NOW()`](./functions/Date.md#now) - Returns the current date and time
- [`NULLVALUE(value, defaultValue)`](./functions/Null Handling.md#nullvalue) - Returns the first value if not null, otherwise returns the second value
- [`OR(argument...)`](./functions/Logical.md#or) - Returns true if any argument is true
- [`OR_AGG(relationship, value)`](./functions/Aggregate.md#or_agg) - Returns true if any boolean value is true
- [`POWER(base, exponent)`](./functions/Math.md#power) - Raises a number to a power
- [`RANDOM()`](./functions/Math.md#random) - Returns a random number between 0 and 1
- [`REPLACE(text, search, replacement)`](./functions/String.md#replace) - Replaces occurrences of a substring with another string
- [`RIGHT(first argument, numChars)`](./functions/String.md#right) - Returns the rightmost characters from a string
- [`ROUND(number, decimals)`](./functions/Math.md#round) - Rounds a number to specified decimal places
- [`SECOND(date)`](./functions/Date.md#second) - Extracts the second from a date (0-59)
- [`SIGN(value)`](./functions/Math.md#sign) - Returns the sign of a number (-1, 0, or 1)
- [`SIN(angle)`](./functions/Math.md#sin) - Returns the sine of an angle in radians
- [`SQRT(value)`](./functions/Math.md#sqrt) - Returns the square root of a number
- [`STARTS_WITH(text, prefix)`](./functions/String.md#starts_with) - Checks if a string starts with a substring
- [`STRING(value)`](./functions/Core.md#string) - Converts a value to a string
- [`STRING_AGG(relationship, value, separator)`](./functions/Aggregate.md#string_agg) - Concatenates string values with a separator
- [`STRING_AGG_DISTINCT(relationship, value, separator)`](./functions/Aggregate.md#string_agg_distinct) - Concatenates unique string values with a separator
- [`SUBSTITUTE(first argument, second argument, third argument)`](./functions/String.md#substitute) - Replaces occurrences of a substring with another string
- [`SUBSTR(text, start, [length])`](./functions/String.md#substr) - Extracts a substring from a string
- [`SUM(relationship, value)`](./functions/Aggregate.md#sum) - Sums numeric values
- [`SUM_AGG(relationship, value)`](./functions/Aggregate.md#sum_agg) - Sums numeric values
- [`TAN(angle)`](./functions/Math.md#tan) - Returns the tangent of an angle in radians
- [`TODAY()`](./functions/Date.md#today) - Returns the current date (without time)
- [`TRIM(requires string argument)`](./functions/String.md#trim) - Removes whitespace from both ends of a string
- [`UPPER(requires string argument)`](./functions/String.md#upper) - Converts a string to uppercase
- [`WEEKDAY(date)`](./functions/Date.md#weekday) - Returns the day of the week as a number (1=Sunday)
- [`YEAR(date)`](./functions/Date.md#year) - Extracts the year from a date

## Data Types

The formula language supports several data types including basic types (string, number, boolean, date, null) and special types (expression, inverse_relationship).

📖 **[Complete Data Types Reference](./types.md)** - Detailed information about all types, their operations, conversions, and compatibility rules.

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

*Documentation generated on 2025-06-22T20:49:39.496Z*
