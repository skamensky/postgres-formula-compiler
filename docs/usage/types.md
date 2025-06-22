# Data Types

This document describes all the data types used in the formula language.

> 📖 **Examples:** For comprehensive usage examples of these types, see the [function documentation](./functions/) where each parameter links back to its type definition.

## Basic Data Types

### boolean

**Description:** Logical data type representing true or false values.

<details>
<summary><strong>Operations</strong> (8 operations)</summary>

- Logical functions: `AND()`, `OR()`, `NOT()`
- Conditional functions: `IF()` conditions
- `boolean = boolean` → `boolean`
- `boolean = null` → `boolean`
- `boolean != boolean` → `boolean`
- `boolean != null` → `boolean`
- `null = boolean` → `boolean`
- `null != boolean` → `boolean`
</details>


**Literals:** Boolean literals are the keywords `TRUE` and `FALSE`


<details>
<summary><strong>Functions that use this type</strong> (11 functions)</summary>

- [`AND()`](./functions/logical.md#and) - Returns true if all arguments are true
- [`AND_AGG()`](./functions/aggregate.md#and_agg) - Returns true if all boolean values are true
- [`CONTAINS()`](./functions/string.md#contains) - Checks if a string contains a substring
- [`ENDS_WITH()`](./functions/string.md#ends_with) - Checks if a string ends with a substring
- [`IF()`](./functions/core.md#if) - Returns one value if condition is true, another if false
- [`ISBLANK()`](./functions/null-handling.md#isblank) - Returns true if the value is null or empty string
- [`ISNULL()`](./functions/null-handling.md#isnull) - Returns true if the value is null
- [`NOT()`](./functions/logical.md#not) - Returns the opposite of a boolean value
- [`OR()`](./functions/logical.md#or) - Returns true if any argument is true
- [`OR_AGG()`](./functions/aggregate.md#or_agg) - Returns true if any boolean value is true
- [`STARTS_WITH()`](./functions/string.md#starts_with) - Checks if a string starts with a substring
</details>

---

### date

**Description:** Date data type for representing calendar dates and timestamps.

<details>
<summary><strong>Operations</strong> (14 operations)</summary>

- Date functions: `YEAR()`, `MONTH()`, `DAY()`, `WEEKDAY()`, `DATEDIF()`, etc.
- `date + number` → `date` (adds days)
- `date - number` → `date` (subtracts days)
- `date - date` → `number` (difference in days)
- `date = date` → `boolean`
- `date = null` → `boolean`
- `date != date` → `boolean`
- `date != null` → `boolean`
- `date > date` → `boolean`
- `date >= date` → `boolean`
- `date < date` → `boolean`
- `date <= date` → `boolean`
- `null = date` → `boolean`
- `null != date` → `boolean`
</details>


**Literals:** Date literals are created using the `DATE()` function: `DATE("2023-12-25")`


<details>
<summary><strong>Functions that use this type</strong> (16 functions)</summary>

- [`ADDDAYS()`](./functions/date.md#adddays) - Adds days to a date
- [`ADDMONTHS()`](./functions/date.md#addmonths) - Adds months to a date
- [`DATE()`](./functions/core.md#date) - Creates a date from a string literal
- [`DATEDIF()`](./functions/date.md#datedif) - Returns the difference between two dates in specified units
- [`DATE_ADD()`](./functions/date.md#date_add) - Adds a specified amount of time to a date
- [`DATE_DIFF()`](./functions/date.md#date_diff) - Calculates the difference between two dates
- [`DAY()`](./functions/date.md#day) - Extracts the day from a date (1-31)
- [`FORMAT_DATE()`](./functions/date.md#format_date) - Formats a date as a string
- [`HOUR()`](./functions/date.md#hour) - Extracts the hour from a date (0-23)
- [`MINUTE()`](./functions/date.md#minute) - Extracts the minute from a date (0-59)
- [`MONTH()`](./functions/date.md#month) - Extracts the month from a date (1-12)
- [`NOW()`](./functions/date.md#now) - Returns the current date and time
- [`SECOND()`](./functions/date.md#second) - Extracts the second from a date (0-59)
- [`TODAY()`](./functions/date.md#today) - Returns the current date (without time)
- [`WEEKDAY()`](./functions/date.md#weekday) - Returns the day of the week as a number (1=Sunday)
- [`YEAR()`](./functions/date.md#year) - Extracts the year from a date
</details>

---

### null

**Description:** Special type representing the absence of a value.

<details>
<summary><strong>Operations</strong> (21 operations)</summary>

- Null checking: `ISNULL()`, `ISBLANK()`
- Null handling: `NULLVALUE()`, `COALESCE()`
- Any operation with null typically results in null
- `null = null` → `boolean`
- `null = string` → `boolean`
- `null = number` → `boolean`
- `null = boolean` → `boolean`
- `null = date` → `boolean`
- `null != null` → `boolean`
- `null != string` → `boolean`
- `null != number` → `boolean`
- `null != boolean` → `boolean`
- `null != date` → `boolean`
- `string = null` → `boolean`
- `number = null` → `boolean`
- `boolean = null` → `boolean`
- `date = null` → `boolean`
- `string != null` → `boolean`
- `number != null` → `boolean`
- `boolean != null` → `boolean`
- `date != null` → `boolean`
</details>


**Literals:** The null literal is the keyword `NULL`

**Type Compatibility:**
- `null` is equal only to `null`
- Cross-type comparisons may use implicit conversion
- Null values propagate through most operations

<details>
<summary><strong>Functions that use this type</strong> (0 functions)</summary>

No functions currently use this type.
</details>

---

### number

**Description:** Numeric data type for representing integers and decimal numbers.

<details>
<summary><strong>Operations</strong> (17 operations)</summary>

- Math functions: `ROUND()`, `ABS()`, `CEILING()`, `FLOOR()`, etc.
- `number + number` → `number`
- `number - number` → `number`
- `number * number` → `number`
- `number / number` → `number`
- `number = number` → `boolean`
- `number = null` → `boolean`
- `number != number` → `boolean`
- `number != null` → `boolean`
- `number > number` → `boolean`
- `number >= number` → `boolean`
- `number < number` → `boolean`
- `number <= number` → `boolean`
- `date + number` → `date` (adds days)
- `date - number` → `date` (subtracts days)
- `null = number` → `boolean`
- `null != number` → `boolean`
</details>


**Literals:** Numeric literals can be integers or decimals: `123`, `45.67`


<details>
<summary><strong>Functions that use this type</strong> (42 functions)</summary>

- [`ABS()`](./functions/math.md#abs) - Returns the absolute value of a number
- [`ADDDAYS()`](./functions/date.md#adddays) - Adds days to a date
- [`ADDMONTHS()`](./functions/date.md#addmonths) - Adds months to a date
- [`AVG()`](./functions/aggregate.md#avg) - Calculates the average of numeric values
- [`AVG_AGG()`](./functions/aggregate.md#avg_agg) - Calculates the average of numeric values
- [`CEIL()`](./functions/math.md#ceil) - Rounds a number up to the nearest integer
- [`CEILING()`](./functions/math.md#ceiling) - Rounds a number up to the nearest integer
- [`COS()`](./functions/math.md#cos) - Returns the cosine of an angle in radians
- [`COUNT()`](./functions/aggregate.md#count) - Counts the number of non-null values
- [`COUNT_AGG()`](./functions/aggregate.md#count_agg) - Counts the number of non-null values
- [`DATEDIF()`](./functions/date.md#datedif) - Returns the difference between two dates in specified units
- [`DATE_ADD()`](./functions/date.md#date_add) - Adds a specified amount of time to a date
- [`DATE_DIFF()`](./functions/date.md#date_diff) - Calculates the difference between two dates
- [`DAY()`](./functions/date.md#day) - Extracts the day from a date (1-31)
- [`EXP()`](./functions/math.md#exp) - Returns e raised to the power of a number
- [`FLOOR()`](./functions/math.md#floor) - Rounds a number down to the nearest integer
- [`HOUR()`](./functions/date.md#hour) - Extracts the hour from a date (0-23)
- [`LEFT()`](./functions/string.md#left) - Returns the leftmost characters from a string
- [`LEN()`](./functions/string.md#len) - Returns the length of a string
- [`LENGTH()`](./functions/string.md#length) - Returns the length of a string
- [`LOG()`](./functions/math.md#log) - Returns the natural logarithm of a number
- [`LOG10()`](./functions/math.md#log10) - Returns the base-10 logarithm of a number
- [`MAX()`](./functions/math.md#max) - Returns the maximum of two numbers
- [`MID()`](./functions/string.md#mid) - Returns characters from the middle of a string
- [`MIN()`](./functions/math.md#min) - Returns the minimum of two numbers
- [`MINUTE()`](./functions/date.md#minute) - Extracts the minute from a date (0-59)
- [`MOD()`](./functions/math.md#mod) - Returns the remainder of division
- [`MONTH()`](./functions/date.md#month) - Extracts the month from a date (1-12)
- [`POWER()`](./functions/math.md#power) - Raises a number to a power
- [`RANDOM()`](./functions/math.md#random) - Returns a random number between 0 and 1
- [`RIGHT()`](./functions/string.md#right) - Returns the rightmost characters from a string
- [`ROUND()`](./functions/math.md#round) - Rounds a number to specified decimal places
- [`SECOND()`](./functions/date.md#second) - Extracts the second from a date (0-59)
- [`SIGN()`](./functions/math.md#sign) - Returns the sign of a number (-1, 0, or 1)
- [`SIN()`](./functions/math.md#sin) - Returns the sine of an angle in radians
- [`SQRT()`](./functions/math.md#sqrt) - Returns the square root of a number
- [`SUBSTR()`](./functions/string.md#substr) - Extracts a substring from a string
- [`SUM()`](./functions/aggregate.md#sum) - Sums numeric values
- [`SUM_AGG()`](./functions/aggregate.md#sum_agg) - Sums numeric values
- [`TAN()`](./functions/math.md#tan) - Returns the tangent of an angle in radians
- [`WEEKDAY()`](./functions/date.md#weekday) - Returns the day of the week as a number (1=Sunday)
- [`YEAR()`](./functions/date.md#year) - Extracts the year from a date
</details>

---

### string

**Description:** Text data type for representing textual information.

<details>
<summary><strong>Operations</strong> (13 operations)</summary>

- String functions: `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, etc.
- `string & string` → `string` (concatenation)
- `string = string` → `boolean`
- `string = null` → `boolean`
- `string != string` → `boolean`
- `string != null` → `boolean`
- `string > string` → `boolean` (lexicographic)
- `string >= string` → `boolean` (lexicographic)
- `string < string` → `boolean` (lexicographic)
- `string <= string` → `boolean` (lexicographic)
- `null = string` → `boolean`
- `null != string` → `boolean`
- Implicit string conversion: numbers and booleans convert to strings in string contexts
</details>


**Literals:** String literals are enclosed in double quotes: `"text content"`


<details>
<summary><strong>Functions that use this type</strong> (20 functions)</summary>

- [`CONCAT()`](./functions/string.md#concat) - Concatenates two or more strings
- [`CONTAINS()`](./functions/string.md#contains) - Checks if a string contains a substring
- [`ENDS_WITH()`](./functions/string.md#ends_with) - Checks if a string ends with a substring
- [`FORMAT_DATE()`](./functions/date.md#format_date) - Formats a date as a string
- [`LEFT()`](./functions/string.md#left) - Returns the leftmost characters from a string
- [`LEN()`](./functions/string.md#len) - Returns the length of a string
- [`LENGTH()`](./functions/string.md#length) - Returns the length of a string
- [`LOWER()`](./functions/string.md#lower) - Converts a string to lowercase
- [`ME()`](./functions/core.md#me) - Returns the current user identifier
- [`MID()`](./functions/string.md#mid) - Returns characters from the middle of a string
- [`REPLACE()`](./functions/string.md#replace) - Replaces occurrences of a substring with another string
- [`RIGHT()`](./functions/string.md#right) - Returns the rightmost characters from a string
- [`STARTS_WITH()`](./functions/string.md#starts_with) - Checks if a string starts with a substring
- [`STRING()`](./functions/core.md#string) - Converts a value to a string
- [`STRING_AGG()`](./functions/aggregate.md#string_agg) - Concatenates string values with a separator
- [`STRING_AGG_DISTINCT()`](./functions/aggregate.md#string_agg_distinct) - Concatenates unique string values with a separator
- [`SUBSTITUTE()`](./functions/string.md#substitute) - Replaces occurrences of a substring with another string
- [`SUBSTR()`](./functions/string.md#substr) - Extracts a substring from a string
- [`TRIM()`](./functions/string.md#trim) - Removes whitespace from both ends of a string
- [`UPPER()`](./functions/string.md#upper) - Converts a string to uppercase
</details>

## Special Types

### expression

**Description:** A meta-type representing any valid formula expression that can be evaluated.

**Usage:**
Used in function parameters that accept any type of expression, such as:
- Conditional expressions in `IF(condition, trueValue, falseValue)`
- Value expressions in aggregate functions
- Type conversion functions like `STRING(expression)`

**Note:** This type indicates that the parameter accepts any valid expression, and the actual return type depends on what the expression evaluates to.

**Literals:** N/A - this is a meta-type for function signatures

**Type Compatibility:**
- Accepts any valid expression type

<details>
<summary><strong>Functions that use this type</strong> (11 functions)</summary>

- [`COALESCE()`](./functions/null-handling.md#coalesce) - Returns the first non-null value from a list of expressions
- [`COUNT()`](./functions/aggregate.md#count) - Counts the number of non-null values
- [`COUNT_AGG()`](./functions/aggregate.md#count_agg) - Counts the number of non-null values
- [`EVAL()`](./functions/core.md#eval) - Evaluates an expression from another table
- [`IF()`](./functions/core.md#if) - Returns one value if condition is true, another if false
- [`ISBLANK()`](./functions/null-handling.md#isblank) - Returns true if the value is null or empty string
- [`ISNULL()`](./functions/null-handling.md#isnull) - Returns true if the value is null
- [`MAX_AGG()`](./functions/aggregate.md#max_agg) - Finds the maximum value
- [`MIN_AGG()`](./functions/aggregate.md#min_agg) - Finds the minimum value
- [`NULLVALUE()`](./functions/null-handling.md#nullvalue) - Returns the first value if not null, otherwise returns the second value
- [`STRING()`](./functions/core.md#string) - Converts a value to a string
</details>

---

### inverse_relationship

**Description:** A special type representing a relationship traversal for aggregate functions.

**Usage:**
Used as the first parameter in aggregate functions to specify which related records to aggregate over.
**Syntax:** `table_relationship` or `table_relationship.field` for multi-level relationships

**Literals:** N/A - this refers to relationship definitions in your data model

**Type Compatibility:**
- Only used in aggregate function contexts

<details>
<summary><strong>Functions that use this type</strong> (13 functions)</summary>

- [`AND_AGG()`](./functions/aggregate.md#and_agg) - Returns true if all boolean values are true
- [`AVG()`](./functions/aggregate.md#avg) - Calculates the average of numeric values
- [`AVG_AGG()`](./functions/aggregate.md#avg_agg) - Calculates the average of numeric values
- [`COUNT()`](./functions/aggregate.md#count) - Counts the number of non-null values
- [`COUNT_AGG()`](./functions/aggregate.md#count_agg) - Counts the number of non-null values
- [`EVAL()`](./functions/core.md#eval) - Evaluates an expression from another table
- [`MAX_AGG()`](./functions/aggregate.md#max_agg) - Finds the maximum value
- [`MIN_AGG()`](./functions/aggregate.md#min_agg) - Finds the minimum value
- [`OR_AGG()`](./functions/aggregate.md#or_agg) - Returns true if any boolean value is true
- [`STRING_AGG()`](./functions/aggregate.md#string_agg) - Concatenates string values with a separator
- [`STRING_AGG_DISTINCT()`](./functions/aggregate.md#string_agg_distinct) - Concatenates unique string values with a separator
- [`SUM()`](./functions/aggregate.md#sum) - Sums numeric values
- [`SUM_AGG()`](./functions/aggregate.md#sum_agg) - Sums numeric values
</details>

## Type Conversion

The formula language supports automatic type conversion in many contexts:

### Implicit Conversions
- Numbers can be automatically converted to strings in string contexts
- Boolean values convert to strings as "TRUE" or "FALSE"
- Null values propagate through most operations

### Explicit Conversions
- `STRING(expression)` - converts any value to string
- Date parsing through `DATE(string)` function

*Documentation generated on 2025-06-22T21:53:46.181Z*
