# Functions Reference

This document provides a comprehensive reference for all available functions in the Formula Language.

## Table of Contents

- [Aggregate Functions](#aggregate-functions)
- [Conditional Functions](#conditional-functions)
- [Core Functions](#core-functions)
- [Date Functions](#date-functions)
- [Logical Functions](#logical-functions)
- [Math Functions](#math-functions)
- [Null Handling Functions](#null-handling-functions)
- [Text Functions](#text-functions)

---

## Core Functions

### TODAY

**Signature:** `TODAY()`  
**Return Type:** date  
**Description:** Returns the current date

**Examples:** [tests/core-functions.test.js:12](../tests/core-functions.test.js:12), [tests/core-functions.test.js:18](../tests/core-functions.test.js:18)

---

### ME

**Signature:** `ME()`  
**Return Type:** string  
**Description:** Returns the current user identifier

**Examples:** [tests/core-functions.test.js:24](../tests/core-functions.test.js:24), [tests/core-functions.test.js:30](../tests/core-functions.test.js:30)

---

### DATE

**Signature:** `DATE(date_string)`  
**Return Type:** date  
**Description:** Converts a string to a date value

**Arguments:**
- `date_string` (string): Date string in ISO format (YYYY-MM-DD)

**Examples:** [tests/core-functions.test.js:36](../tests/core-functions.test.js:36), [tests/core-functions.test.js:42](../tests/core-functions.test.js:42)

---

### STRING

**Signature:** `STRING([value](docs/SYNTAX.md#expressions))`  
**Return Type:** string  
**Description:** Converts a value to a string representation

**Arguments:**
- `value` (expression): Expression to convert to string ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/core-functions.test.js:48](../tests/core-functions.test.js:48), [tests/core-functions.test.js:54](../tests/core-functions.test.js:54)

---

## Text Functions

### UPPER

**Signature:** `UPPER(text)`  
**Return Type:** string  
**Description:** Converts text to uppercase

**Arguments:**
- `text` (string): Text to convert to uppercase

**Examples:** [tests/text-functions.test.js:12](../tests/text-functions.test.js:12), [tests/text-functions.test.js:18](../tests/text-functions.test.js:18)

---

### LOWER

**Signature:** `LOWER(text)`  
**Return Type:** string  
**Description:** Converts text to lowercase

**Arguments:**
- `text` (string): Text to convert to lowercase

**Examples:** [tests/text-functions.test.js:24](../tests/text-functions.test.js:24), [tests/text-functions.test.js:30](../tests/text-functions.test.js:30)

---

### TRIM

**Signature:** `TRIM(text)`  
**Return Type:** string  
**Description:** Removes leading and trailing whitespace from text

**Arguments:**
- `text` (string): Text to remove leading and trailing spaces from

**Examples:** [tests/text-functions.test.js:36](../tests/text-functions.test.js:36), [tests/text-functions.test.js:42](../tests/text-functions.test.js:42)

---

### LEN

**Signature:** `LEN(text)`  
**Return Type:** number  
**Description:** Returns the length of text in characters

**Arguments:**
- `text` (string): Text to measure length of

**Examples:** [tests/text-functions.test.js:48](../tests/text-functions.test.js:48), [tests/text-functions.test.js:54](../tests/text-functions.test.js:54)

---

### LEFT

**Signature:** `LEFT(text, num_chars)`  
**Return Type:** string  
**Description:** Returns the leftmost characters from text

**Arguments:**
- `text` (string): Source text
- `num_chars` (number): Number of characters to extract from the left

**Examples:** [tests/text-functions.test.js:60](../tests/text-functions.test.js:60), [tests/text-functions.test.js:66](../tests/text-functions.test.js:66)

---

### RIGHT

**Signature:** `RIGHT(text, num_chars)`  
**Return Type:** string  
**Description:** Returns the rightmost characters from text

**Arguments:**
- `text` (string): Source text
- `num_chars` (number): Number of characters to extract from the right

**Examples:** [tests/text-functions.test.js:72](../tests/text-functions.test.js:72), [tests/text-functions.test.js:78](../tests/text-functions.test.js:78)

---

### MID

**Signature:** `MID(text, start_pos, length)`  
**Return Type:** string  
**Description:** Returns characters from the middle of text

**Arguments:**
- `text` (string): Source text
- `start_pos` (number): Starting position (1-based)
- `length` (number): Number of characters to extract

**Examples:** [tests/text-functions.test.js:84](../tests/text-functions.test.js:84), [tests/text-functions.test.js:90](../tests/text-functions.test.js:90)

---

### CONTAINS

**Signature:** `CONTAINS(text, search_text)`  
**Return Type:** boolean  
**Description:** Returns true if text contains the search text

**Arguments:**
- `text` (string): Text to search within
- `search_text` (string): Text to search for

**Examples:** [tests/text-functions.test.js:96](../tests/text-functions.test.js:96), [tests/text-functions.test.js:102](../tests/text-functions.test.js:102)

---

### SUBSTITUTE

**Signature:** `SUBSTITUTE(text, old_text, new_text)`  
**Return Type:** string  
**Description:** Replaces old text with new text in a string

**Arguments:**
- `text` (string): Original text
- `old_text` (string): Text to replace
- `new_text` (string): Replacement text

**Examples:** [tests/text-functions.test.js:108](../tests/text-functions.test.js:108), [tests/text-functions.test.js:114](../tests/text-functions.test.js:114)

---

## Math Functions

### ABS

**Signature:** `ABS(number)`  
**Return Type:** number  
**Description:** Returns the absolute value of a number

**Arguments:**
- `number` (number): Number to get absolute value of

**Examples:** [tests/math-functions.test.js:12](../tests/math-functions.test.js:12), [tests/math-functions.test.js:18](../tests/math-functions.test.js:18)

---

### ROUND

**Signature:** `ROUND(number, decimals)`  
**Return Type:** number  
**Description:** Rounds a number to specified decimal places

**Arguments:**
- `number` (number): Number to round
- `decimals` (number): Number of decimal places

**Examples:** [tests/math-functions.test.js:24](../tests/math-functions.test.js:24), [tests/math-functions.test.js:30](../tests/math-functions.test.js:30)

---

### MIN

**Signature:** `MIN(num1, num2)`  
**Return Type:** number  
**Description:** Returns the smaller of two numbers

**Arguments:**
- `num1` (number): First number
- `num2` (number): Second number

**Examples:** [tests/math-functions.test.js:36](../tests/math-functions.test.js:36), [tests/math-functions.test.js:42](../tests/math-functions.test.js:42)

---

### MAX

**Signature:** `MAX(num1, num2)`  
**Return Type:** number  
**Description:** Returns the larger of two numbers

**Arguments:**
- `num1` (number): First number
- `num2` (number): Second number

**Examples:** [tests/math-functions.test.js:48](../tests/math-functions.test.js:48), [tests/math-functions.test.js:54](../tests/math-functions.test.js:54)

---

### MOD

**Signature:** `MOD(dividend, divisor)`  
**Return Type:** number  
**Description:** Returns the remainder after division

**Arguments:**
- `dividend` (number): Number to divide
- `divisor` (number): Number to divide by

**Examples:** [tests/math-functions.test.js:60](../tests/math-functions.test.js:60), [tests/math-functions.test.js:66](../tests/math-functions.test.js:66)

---

### CEILING

**Signature:** `CEILING(number)`  
**Return Type:** number  
**Description:** Rounds a number up to the nearest integer

**Arguments:**
- `number` (number): Number to round up

**Examples:** [tests/math-functions.test.js:72](../tests/math-functions.test.js:72), [tests/math-functions.test.js:78](../tests/math-functions.test.js:78)

---

### FLOOR

**Signature:** `FLOOR(number)`  
**Return Type:** number  
**Description:** Rounds a number down to the nearest integer

**Arguments:**
- `number` (number): Number to round down

**Examples:** [tests/math-functions.test.js:84](../tests/math-functions.test.js:84), [tests/math-functions.test.js:90](../tests/math-functions.test.js:90)

---

## Date Functions

### YEAR

**Signature:** `YEAR(date)`  
**Return Type:** number  
**Description:** Returns the year component of a date

**Arguments:**
- `date` (date): Date to extract year from

**Examples:** [tests/date-functions.test.js:12](../tests/date-functions.test.js:12), [tests/date-functions.test.js:18](../tests/date-functions.test.js:18)

---

### MONTH

**Signature:** `MONTH(date)`  
**Return Type:** number  
**Description:** Returns the month component of a date (1-12)

**Arguments:**
- `date` (date): Date to extract month from

**Examples:** [tests/date-functions.test.js:24](../tests/date-functions.test.js:24), [tests/date-functions.test.js:30](../tests/date-functions.test.js:30)

---

### DAY

**Signature:** `DAY(date)`  
**Return Type:** number  
**Description:** Returns the day component of a date (1-31)

**Arguments:**
- `date` (date): Date to extract day from

**Examples:** [tests/date-functions.test.js:36](../tests/date-functions.test.js:36), [tests/date-functions.test.js:42](../tests/date-functions.test.js:42)

---

### WEEKDAY

**Signature:** `WEEKDAY(date)`  
**Return Type:** number  
**Description:** Returns the day of week (1=Sunday, 7=Saturday)

**Arguments:**
- `date` (date): Date to get weekday for

**Examples:** [tests/date-functions.test.js:48](../tests/date-functions.test.js:48), [tests/date-functions.test.js:54](../tests/date-functions.test.js:54)

---

### ADDMONTHS

**Signature:** `ADDMONTHS(date, months)`  
**Return Type:** date  
**Description:** Adds months to a date

**Arguments:**
- `date` (date): Starting date
- `months` (number): Number of months to add (can be negative)

**Examples:** [tests/date-functions.test.js:60](../tests/date-functions.test.js:60), [tests/date-functions.test.js:66](../tests/date-functions.test.js:66)

---

### ADDDAYS

**Signature:** `ADDDAYS(date, days)`  
**Return Type:** date  
**Description:** Adds days to a date

**Arguments:**
- `date` (date): Starting date
- `days` (number): Number of days to add (can be negative)

**Examples:** [tests/date-functions.test.js:72](../tests/date-functions.test.js:72), [tests/date-functions.test.js:78](../tests/date-functions.test.js:78)

---

### DATEDIF

**Signature:** `DATEDIF(start_date, end_date, unit)`  
**Return Type:** number  
**Description:** Calculates the difference between two dates

**Arguments:**
- `start_date` (date): Starting date
- `end_date` (date): Ending date
- `unit` (string): Unit of measurement: "days", "months", or "years"

**Examples:** [tests/date-functions.test.js:84](../tests/date-functions.test.js:84), [tests/date-functions.test.js:90](../tests/date-functions.test.js:90)

---

## Null Handling Functions

### ISNULL

**Signature:** `ISNULL([value](docs/SYNTAX.md#expressions))`  
**Return Type:** boolean  
**Description:** Returns true if the value is NULL

**Arguments:**
- `value` (expression): Expression to check for NULL ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/null-handling.test.js:12](../tests/null-handling.test.js:12), [tests/null-handling.test.js:18](../tests/null-handling.test.js:18)

---

### NULLVALUE

**Signature:** `NULLVALUE([value](docs/SYNTAX.md#expressions), [default_value](docs/SYNTAX.md#expressions))`  
**Return Type:** varies  
**Description:** Returns the default value if the first argument is NULL, otherwise returns the first argument

**Arguments:**
- `value` (expression): Expression that might be NULL ([Learn more](docs/SYNTAX.md#expressions))
- `default_value` (expression): Value to return if first argument is NULL ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/null-handling.test.js:24](../tests/null-handling.test.js:24), [tests/null-handling.test.js:30](../tests/null-handling.test.js:30)

---

### ISBLANK

**Signature:** `ISBLANK([value](docs/SYNTAX.md#expressions))`  
**Return Type:** boolean  
**Description:** Returns true if the value is NULL or an empty string

**Arguments:**
- `value` (expression): Expression to check for NULL or empty string ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/null-handling.test.js:36](../tests/null-handling.test.js:36), [tests/null-handling.test.js:42](../tests/null-handling.test.js:42)

---

## Logical Functions

### AND

**Signature:** `AND(condition1, condition2, ...)`  
**Return Type:** boolean  
**Description:** Returns true if all conditions are true

**Arguments:**
- `condition1` (boolean): First boolean condition
- `condition2` (boolean): Second boolean condition
- `...` (boolean): Additional boolean conditions (variadic)

**Examples:** [tests/logical-operators-functions.test.js:12](../tests/logical-operators-functions.test.js:12), [tests/logical-operators-functions.test.js:18](../tests/logical-operators-functions.test.js:18)

---

### OR

**Signature:** `OR(condition1, condition2, ...)`  
**Return Type:** boolean  
**Description:** Returns true if any condition is true

**Arguments:**
- `condition1` (boolean): First boolean condition
- `condition2` (boolean): Second boolean condition
- `...` (boolean): Additional boolean conditions (variadic)

**Examples:** [tests/logical-operators-functions.test.js:24](../tests/logical-operators-functions.test.js:24), [tests/logical-operators-functions.test.js:30](../tests/logical-operators-functions.test.js:30)

---

### NOT

**Signature:** `NOT(condition)`  
**Return Type:** boolean  
**Description:** Returns the opposite boolean value

**Arguments:**
- `condition` (boolean): Boolean condition to negate

**Examples:** [tests/logical-operators-functions.test.js:36](../tests/logical-operators-functions.test.js:36), [tests/logical-operators-functions.test.js:42](../tests/logical-operators-functions.test.js:42)

---

## Conditional Functions

### IF

**Signature:** `IF(condition, [true_value](docs/SYNTAX.md#expressions), [false_value](docs/SYNTAX.md#expressions))`  
**Return Type:** varies  
**Description:** Returns one value if condition is true, another if false

**Arguments:**
- `condition` (boolean): Boolean condition to test
- `true_value` (expression): Value to return if condition is true ([Learn more](docs/SYNTAX.md#expressions))
- `false_value` (expression): Value to return if condition is false (optional) ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/if-function.test.js:12](../tests/if-function.test.js:12), [tests/if-function.test.js:18](../tests/if-function.test.js:18)

---

## Aggregate Functions

### STRING_AGG

**Signature:** `STRING_AGG([relationship](docs/RELATIONSHIPS.md#inverse-relationships), [expression](docs/SYNTAX.md#expressions), delimiter)`  
**Return Type:** string  
**Description:** Concatenates values from related records using specified delimiter

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate ([Learn more](docs/RELATIONSHIPS.md#inverse-relationships))
- `expression` (expression): Formula expression to evaluate for each record ([Learn more](docs/SYNTAX.md#expressions))
- `delimiter` (string): String to separate concatenated values

**Examples:** [tests/aggregate-functions.test.js:12](../tests/aggregate-functions.test.js:12), [tests/aggregate-functions.test.js:18](../tests/aggregate-functions.test.js:18)

---

### STRING_AGG_DISTINCT

**Signature:** `STRING_AGG_DISTINCT([relationship](docs/RELATIONSHIPS.md#inverse-relationships), [expression](docs/SYNTAX.md#expressions), delimiter)`  
**Return Type:** string  
**Description:** Concatenates unique values from related records using specified delimiter

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate ([Learn more](docs/RELATIONSHIPS.md#inverse-relationships))
- `expression` (expression): Formula expression to evaluate for each record ([Learn more](docs/SYNTAX.md#expressions))
- `delimiter` (string): String to separate concatenated values

**Examples:** [tests/aggregate-functions.test.js:24](../tests/aggregate-functions.test.js:24), [tests/aggregate-functions.test.js:30](../tests/aggregate-functions.test.js:30)

---

### SUM_AGG

**Signature:** `SUM_AGG([relationship](docs/RELATIONSHIPS.md#inverse-relationships), [expression](docs/SYNTAX.md#expressions))`  
**Return Type:** number  
**Description:** Sums numeric values from related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate ([Learn more](docs/RELATIONSHIPS.md#inverse-relationships))
- `expression` (expression): Numeric expression to sum ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/aggregate-functions.test.js:36](../tests/aggregate-functions.test.js:36), [tests/aggregate-functions.test.js:42](../tests/aggregate-functions.test.js:42)

---

### COUNT_AGG

**Signature:** `COUNT_AGG([relationship](docs/RELATIONSHIPS.md#inverse-relationships), [expression](docs/SYNTAX.md#expressions))`  
**Return Type:** number  
**Description:** Counts non-null values from related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate ([Learn more](docs/RELATIONSHIPS.md#inverse-relationships))
- `expression` (expression): Expression to count ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/aggregate-functions.test.js:48](../tests/aggregate-functions.test.js:48), [tests/aggregate-functions.test.js:54](../tests/aggregate-functions.test.js:54)

---

### AVG_AGG

**Signature:** `AVG_AGG([relationship](docs/RELATIONSHIPS.md#inverse-relationships), [expression](docs/SYNTAX.md#expressions))`  
**Return Type:** number  
**Description:** Calculates the average of numeric values from related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate ([Learn more](docs/RELATIONSHIPS.md#inverse-relationships))
- `expression` (expression): Numeric expression to average ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/aggregate-functions.test.js:60](../tests/aggregate-functions.test.js:60), [tests/aggregate-functions.test.js:66](../tests/aggregate-functions.test.js:66)

---

### MIN_AGG

**Signature:** `MIN_AGG([relationship](docs/RELATIONSHIPS.md#inverse-relationships), [expression](docs/SYNTAX.md#expressions))`  
**Return Type:** number  
**Description:** Finds the minimum value from related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate ([Learn more](docs/RELATIONSHIPS.md#inverse-relationships))
- `expression` (expression): Expression to find minimum of ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/aggregate-functions.test.js:72](../tests/aggregate-functions.test.js:72), [tests/aggregate-functions.test.js:78](../tests/aggregate-functions.test.js:78)

---

### MAX_AGG

**Signature:** `MAX_AGG([relationship](docs/RELATIONSHIPS.md#inverse-relationships), [expression](docs/SYNTAX.md#expressions))`  
**Return Type:** number  
**Description:** Finds the maximum value from related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate ([Learn more](docs/RELATIONSHIPS.md#inverse-relationships))
- `expression` (expression): Expression to find maximum of ([Learn more](docs/SYNTAX.md#expressions))

**Examples:** [tests/aggregate-functions.test.js:84](../tests/aggregate-functions.test.js:84), [tests/aggregate-functions.test.js:90](../tests/aggregate-functions.test.js:90)

---

### AND_AGG

**Signature:** `AND_AGG([relationship](docs/RELATIONSHIPS.md#inverse-relationships), expression)`  
**Return Type:** boolean  
**Description:** Returns true if all boolean values from related records are true

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate ([Learn more](docs/RELATIONSHIPS.md#inverse-relationships))
- `expression` (boolean): Boolean expression to aggregate with AND

**Examples:** [tests/aggregate-functions.test.js:96](../tests/aggregate-functions.test.js:96), [tests/aggregate-functions.test.js:102](../tests/aggregate-functions.test.js:102)

---

### OR_AGG

**Signature:** `OR_AGG([relationship](docs/RELATIONSHIPS.md#inverse-relationships), expression)`  
**Return Type:** boolean  
**Description:** Returns true if any boolean value from related records is true

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate ([Learn more](docs/RELATIONSHIPS.md#inverse-relationships))
- `expression` (boolean): Boolean expression to aggregate with OR

**Examples:** [tests/aggregate-functions.test.js:108](../tests/aggregate-functions.test.js:108), [tests/aggregate-functions.test.js:114](../tests/aggregate-functions.test.js:114)

---

