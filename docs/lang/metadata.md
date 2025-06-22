# Function Metadata Reference

This documentation shows the internal structure of function metadata used by the compiler.

## Metadata Structure

Each function is defined with the following metadata:

```javascript
{
  name: string,              // Function name constant
  category: string,          // Function category
  description: string,       // Human-readable description
  arguments: Array<{         // Argument specifications
    name: string,            // Argument name
    type: string,            // Expected type
    description: string,     // Argument description
    optional?: boolean,      // Whether argument is optional
    variadic?: boolean       // Whether argument accepts multiple values
  }>,
  returnType: string,        // Return type
  testRefs: Array<string>,   // Test file references
  requiresSpecialHandling: boolean, // Whether function has custom logic
  minArgs?: number,          // Minimum argument count (for variadic)
  maxArgs?: number|null      // Maximum argument count (null = unlimited)
}
```

## Type Constants

```javascript
STRING: 'string'
NUMBER: 'number'
BOOLEAN: 'boolean'
DATE: 'date'
NULL: 'null'
```

## Function Constants

```javascript
ROUND: 'ROUND'
ABS: 'ABS'
CEIL: 'CEIL'
CEILING: 'CEILING'
FLOOR: 'FLOOR'
POWER: 'POWER'
SQRT: 'SQRT'
LOG: 'LOG'
LOG10: 'LOG10'
EXP: 'EXP'
SIN: 'SIN'
COS: 'COS'
TAN: 'TAN'
RANDOM: 'RANDOM'
MIN: 'MIN'
MAX: 'MAX'
MOD: 'MOD'
SIGN: 'SIGN'
LENGTH: 'LENGTH'
LEN: 'LEN'
UPPER: 'UPPER'
LOWER: 'LOWER'
TRIM: 'TRIM'
LEFT: 'LEFT'
RIGHT: 'RIGHT'
MID: 'MID'
SUBSTR: 'SUBSTR'
CONCAT: 'CONCAT'
REPLACE: 'REPLACE'
SUBSTITUTE: 'SUBSTITUTE'
CONTAINS: 'CONTAINS'
STARTS_WITH: 'STARTS_WITH'
ENDS_WITH: 'ENDS_WITH'
NOW: 'NOW'
TODAY: 'TODAY'
YEAR: 'YEAR'
MONTH: 'MONTH'
DAY: 'DAY'
HOUR: 'HOUR'
MINUTE: 'MINUTE'
SECOND: 'SECOND'
WEEKDAY: 'WEEKDAY'
ADDMONTHS: 'ADDMONTHS'
ADDDAYS: 'ADDDAYS'
DATEDIF: 'DATEDIF'
DATE_ADD: 'DATE_ADD'
DATE_DIFF: 'DATE_DIFF'
FORMAT_DATE: 'FORMAT_DATE'
IF: 'IF'
AND: 'AND'
OR: 'OR'
NOT: 'NOT'
ISNULL: 'ISNULL'
ISBLANK: 'ISBLANK'
NULLVALUE: 'NULLVALUE'
COALESCE: 'COALESCE'
COUNT: 'COUNT'
SUM: 'SUM'
AVG: 'AVG'
MIN_AGG: 'MIN_AGG'
MAX_AGG: 'MAX_AGG'
STRING_AGG: 'STRING_AGG'
STRING_AGG_DISTINCT: 'STRING_AGG_DISTINCT'
SUM_AGG: 'SUM_AGG'
COUNT_AGG: 'COUNT_AGG'
AVG_AGG: 'AVG_AGG'
AND_AGG: 'AND_AGG'
OR_AGG: 'OR_AGG'
ME: 'ME'
STRING: 'STRING'
DATE: 'DATE'
EVAL: 'EVAL'
```

## Category Constants

```javascript
MATH: 'Math'
STRING: 'String'
DATE: 'Date'
LOGICAL: 'Logical'
NULL_HANDLING: 'Null Handling'
AGGREGATE: 'Aggregate'
CORE: 'Core'
```

## Complete Function Metadata

```javascript
{
  "ROUND": {
    "name": "ROUND",
    "category": "Math",
    "description": "Rounds a number to specified decimal places",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "number",
        "description": "Number to round"
      },
      {
        "name": "decimals",
        "description": "Number of decimal places"
      }
    ]
  },
  "ABS": {
    "name": "ABS",
    "category": "Math",
    "description": "Returns the absolute value of a number",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "number",
        "description": "Number to get absolute value of"
      }
    ]
  },
  "CEIL": {
    "name": "CEIL",
    "category": "Math",
    "description": "Rounds a number up to the nearest integer",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "number",
        "description": "Number to round up"
      }
    ]
  },
  "CEILING": {
    "name": "CEILING",
    "category": "Math",
    "description": "Rounds a number up to the nearest integer",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "number",
        "description": "Number to round up"
      }
    ]
  },
  "FLOOR": {
    "name": "FLOOR",
    "category": "Math",
    "description": "Rounds a number down to the nearest integer",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "number",
        "description": "Number to round down"
      }
    ]
  },
  "POWER": {
    "name": "POWER",
    "category": "Math",
    "description": "Raises a number to a power",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "base",
        "description": "Base number"
      },
      {
        "name": "exponent",
        "description": "Exponent"
      }
    ]
  },
  "SQRT": {
    "name": "SQRT",
    "category": "Math",
    "description": "Returns the square root of a number",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "value",
        "description": "Number to get square root of"
      }
    ]
  },
  "LOG": {
    "name": "LOG",
    "category": "Math",
    "description": "Returns the natural logarithm of a number",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "value",
        "description": "Number to get natural logarithm of"
      }
    ]
  },
  "LOG10": {
    "name": "LOG10",
    "category": "Math",
    "description": "Returns the base-10 logarithm of a number",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "value",
        "description": "Number to get base-10 logarithm of"
      }
    ]
  },
  "EXP": {
    "name": "EXP",
    "category": "Math",
    "description": "Returns e raised to the power of a number",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "value",
        "description": "Exponent"
      }
    ]
  },
  "SIN": {
    "name": "SIN",
    "category": "Math",
    "description": "Returns the sine of an angle in radians",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "angle",
        "description": "Angle in radians"
      }
    ]
  },
  "COS": {
    "name": "COS",
    "category": "Math",
    "description": "Returns the cosine of an angle in radians",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "angle",
        "description": "Angle in radians"
      }
    ]
  },
  "TAN": {
    "name": "TAN",
    "category": "Math",
    "description": "Returns the tangent of an angle in radians",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "angle",
        "description": "Angle in radians"
      }
    ]
  },
  "RANDOM": {
    "name": "RANDOM",
    "category": "Math",
    "description": "Returns a random number between 0 and 1",
    "minArgs": 0,
    "maxArgs": 0,
    "arguments": []
  },
  "MIN": {
    "name": "MIN",
    "category": "Math",
    "description": "Returns the minimum of two numbers",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "num1",
        "description": "First number"
      },
      {
        "name": "num2",
        "description": "Second number"
      }
    ]
  },
  "MAX": {
    "name": "MAX",
    "category": "Math",
    "description": "Returns the maximum of two numbers",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "num1",
        "description": "First number"
      },
      {
        "name": "num2",
        "description": "Second number"
      }
    ]
  },
  "MOD": {
    "name": "MOD",
    "category": "Math",
    "description": "Returns the remainder of division",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "dividend",
        "description": "Number to divide"
      },
      {
        "name": "divisor",
        "description": "Number to divide by"
      }
    ]
  },
  "SIGN": {
    "name": "SIGN",
    "category": "Math",
    "description": "Returns the sign of a number (-1, 0, or 1)",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "value",
        "description": "Number to get sign of"
      }
    ]
  },
  "LENGTH": {
    "name": "LENGTH",
    "category": "String",
    "description": "Returns the length of a string",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "text",
        "description": "String to get length of"
      }
    ]
  },
  "UPPER": {
    "name": "UPPER",
    "category": "String",
    "description": "Converts a string to uppercase",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "requires string argument",
        "description": "String to convert to uppercase"
      }
    ]
  },
  "LOWER": {
    "name": "LOWER",
    "category": "String",
    "description": "Converts a string to lowercase",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "requires string argument",
        "description": "String to convert to lowercase"
      }
    ]
  },
  "TRIM": {
    "name": "TRIM",
    "category": "String",
    "description": "Removes whitespace from both ends of a string",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "requires string argument",
        "description": "String to trim"
      }
    ]
  },
  "SUBSTR": {
    "name": "SUBSTR",
    "category": "String",
    "description": "Extracts a substring from a string",
    "minArgs": 2,
    "maxArgs": 3,
    "arguments": [
      {
        "name": "text",
        "description": "Source string"
      },
      {
        "name": "start",
        "description": "Starting position (1-based)"
      },
      {
        "name": "length",
        "description": "Length of substring (optional)",
        "optional": true
      }
    ]
  },
  "CONCAT": {
    "name": "CONCAT",
    "category": "String",
    "description": "Concatenates two or more strings",
    "minArgs": 2,
    "maxArgs": null,
    "variadic": true,
    "arguments": [
      {
        "name": "strings",
        "description": "Strings to concatenate",
        "variadic": true
      }
    ]
  },
  "REPLACE": {
    "name": "REPLACE",
    "category": "String",
    "description": "Replaces occurrences of a substring with another string",
    "minArgs": 3,
    "maxArgs": 3,
    "arguments": [
      {
        "name": "text",
        "description": "Source string"
      },
      {
        "name": "search",
        "description": "String to search for"
      },
      {
        "name": "replacement",
        "description": "Replacement string"
      }
    ]
  },
  "CONTAINS": {
    "name": "CONTAINS",
    "category": "String",
    "description": "Checks if a string contains a substring",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "text",
        "description": "String to search in"
      },
      {
        "name": "second argument",
        "description": "Substring to search for"
      }
    ]
  },
  "STARTS_WITH": {
    "name": "STARTS_WITH",
    "category": "String",
    "description": "Checks if a string starts with a substring",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "text",
        "description": "String to check"
      },
      {
        "name": "prefix",
        "description": "Prefix to check for"
      }
    ]
  },
  "LEN": {
    "name": "LEN",
    "category": "String",
    "description": "Returns the length of a string",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "requires string argument",
        "description": "String to get length of"
      }
    ]
  },
  "LEFT": {
    "name": "LEFT",
    "category": "String",
    "description": "Returns the leftmost characters from a string",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "first argument",
        "description": "Source string"
      },
      {
        "name": "second argument",
        "description": "Number of characters to extract"
      }
    ]
  },
  "RIGHT": {
    "name": "RIGHT",
    "category": "String",
    "description": "Returns the rightmost characters from a string",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "first argument",
        "description": "Source string"
      },
      {
        "name": "numChars",
        "description": "Number of characters to extract"
      }
    ]
  },
  "MID": {
    "name": "MID",
    "category": "String",
    "description": "Returns characters from the middle of a string",
    "minArgs": 3,
    "maxArgs": 3,
    "arguments": [
      {
        "name": "first argument",
        "description": "Source string"
      },
      {
        "name": "start",
        "description": "Starting position (1-based)"
      },
      {
        "name": "length",
        "description": "Number of characters to extract"
      }
    ]
  },
  "SUBSTITUTE": {
    "name": "SUBSTITUTE",
    "category": "String",
    "description": "Replaces occurrences of a substring with another string",
    "minArgs": 3,
    "maxArgs": 3,
    "arguments": [
      {
        "name": "first argument",
        "description": "Source string"
      },
      {
        "name": "second argument",
        "description": "Text to replace"
      },
      {
        "name": "third argument",
        "description": "Replacement text"
      }
    ]
  },
  "ENDS_WITH": {
    "name": "ENDS_WITH",
    "category": "String",
    "description": "Checks if a string ends with a substring",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "text",
        "description": "String to check"
      },
      {
        "name": "suffix",
        "description": "Suffix to check for"
      }
    ]
  },
  "NOW": {
    "name": "NOW",
    "category": "Date",
    "description": "Returns the current date and time",
    "minArgs": 0,
    "maxArgs": 0,
    "arguments": []
  },
  "TODAY": {
    "name": "TODAY",
    "category": "Date",
    "description": "Returns the current date (without time)",
    "minArgs": 0,
    "maxArgs": 0,
    "arguments": []
  },
  "YEAR": {
    "name": "YEAR",
    "category": "Date",
    "description": "Extracts the year from a date",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "date",
        "description": "Date to extract year from"
      }
    ]
  },
  "MONTH": {
    "name": "MONTH",
    "category": "Date",
    "description": "Extracts the month from a date (1-12)",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "date",
        "description": "Date to extract month from"
      }
    ]
  },
  "DAY": {
    "name": "DAY",
    "category": "Date",
    "description": "Extracts the day from a date (1-31)",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "date",
        "description": "Date to extract day from"
      }
    ]
  },
  "HOUR": {
    "name": "HOUR",
    "category": "Date",
    "description": "Extracts the hour from a date (0-23)",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "date",
        "description": "Date to extract hour from"
      }
    ]
  },
  "MINUTE": {
    "name": "MINUTE",
    "category": "Date",
    "description": "Extracts the minute from a date (0-59)",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "date",
        "description": "Date to extract minute from"
      }
    ]
  },
  "SECOND": {
    "name": "SECOND",
    "category": "Date",
    "description": "Extracts the second from a date (0-59)",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "date",
        "description": "Date to extract second from"
      }
    ]
  },
  "DATE_ADD": {
    "name": "DATE_ADD",
    "category": "Date",
    "description": "Adds a specified amount of time to a date",
    "minArgs": 3,
    "maxArgs": 3,
    "arguments": [
      {
        "name": "date",
        "description": "Base date"
      },
      {
        "name": "amount",
        "description": "Amount to add"
      },
      {
        "name": "unit",
        "description": "Time unit (day, month, year, hour, minute, second)"
      }
    ]
  },
  "DATE_DIFF": {
    "name": "DATE_DIFF",
    "category": "Date",
    "description": "Calculates the difference between two dates",
    "minArgs": 3,
    "maxArgs": 3,
    "arguments": [
      {
        "name": "date1",
        "description": "First date"
      },
      {
        "name": "date2",
        "description": "Second date"
      },
      {
        "name": "unit",
        "description": "Time unit (day, month, year, hour, minute, second)"
      }
    ]
  },
  "FORMAT_DATE": {
    "name": "FORMAT_DATE",
    "category": "Date",
    "description": "Formats a date as a string",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "date",
        "description": "Date to format"
      },
      {
        "name": "format",
        "description": "Format string"
      }
    ]
  },
  "WEEKDAY": {
    "name": "WEEKDAY",
    "category": "Date",
    "description": "Returns the day of the week as a number (1=Sunday)",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "date",
        "description": "Date to get weekday from"
      }
    ]
  },
  "ADDMONTHS": {
    "name": "ADDMONTHS",
    "category": "Date",
    "description": "Adds months to a date",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "date",
        "description": "Starting date"
      },
      {
        "name": "months",
        "description": "Number of months to add"
      }
    ]
  },
  "ADDDAYS": {
    "name": "ADDDAYS",
    "category": "Date",
    "description": "Adds days to a date",
    "minArgs": 2,
    "maxArgs": 2,
    "arguments": [
      {
        "name": "date",
        "description": "Starting date"
      },
      {
        "name": "days",
        "description": "Number of days to add"
      }
    ]
  },
  "DATEDIF": {
    "name": "DATEDIF",
    "category": "Date",
    "description": "Returns the difference between two dates in specified units",
    "minArgs": 3,
    "maxArgs": 3,
    "specialHandling": "datedif",
    "arguments": [
      {
        "name": "date1",
        "description": "First date"
      },
      {
        "name": "date2",
        "description": "Second date"
      },
      {
        "name": "unit",
        "description": "Time unit (\"days\", \"months\", or \"years\")"
      }
    ]
  },
  "ME": {
    "name": "ME",
    "category": "Core",
    "description": "Returns the current user identifier",
    "minArgs": 0,
    "maxArgs": 0,
    "arguments": []
  },
  "STRING": {
    "name": "STRING",
    "category": "Core",
    "description": "Converts a value to a string",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "value",
        "description": "Value to convert to string"
      }
    ]
  },
  "DATE": {
    "name": "DATE",
    "category": "Core",
    "description": "Creates a date from a string literal",
    "minArgs": 1,
    "maxArgs": 1,
    "specialHandling": "string_literal",
    "arguments": [
      {
        "name": "dateString",
        "description": "Date string in ISO format"
      }
    ]
  },
  "IF": {
    "name": "IF",
    "category": "Core",
    "description": "Returns one value if condition is true, another if false",
    "minArgs": 3,
    "maxArgs": 3,
    "specialHandling": "conditional",
    "arguments": [
      {
        "name": "condition",
        "description": "Condition to evaluate"
      },
      {
        "name": "trueValue",
        "description": "Value to return if condition is true"
      },
      {
        "name": "falseValue",
        "description": "Value to return if condition is false"
      }
    ]
  },
  "AND": {
    "name": "AND",
    "category": "Logical",
    "description": "Returns true if all arguments are true",
    "minArgs": 2,
    "maxArgs": null,
    "variadic": true,
    "arguments": [
      {
        "name": "argument",
        "description": "Boolean conditions to check",
        "variadic": true
      }
    ]
  },
  "OR": {
    "name": "OR",
    "category": "Logical",
    "description": "Returns true if any argument is true",
    "minArgs": 2,
    "maxArgs": null,
    "variadic": true,
    "arguments": [
      {
        "name": "argument",
        "description": "Boolean conditions to check",
        "variadic": true
      }
    ]
  },
  "NOT": {
    "name": "NOT",
    "category": "Logical",
    "description": "Returns the opposite of a boolean value",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "requires boolean argument",
        "description": "Boolean condition to negate"
      }
    ]
  },
  "ISNULL": {
    "name": "ISNULL",
    "category": "Null Handling",
    "description": "Returns true if the value is null",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "value",
        "description": "Value to check for null"
      }
    ]
  },
  "ISBLANK": {
    "name": "ISBLANK",
    "category": "Null Handling",
    "description": "Returns true if the value is null or empty string",
    "minArgs": 1,
    "maxArgs": 1,
    "arguments": [
      {
        "name": "value",
        "description": "Value to check for blank"
      }
    ]
  },
  "NULLVALUE": {
    "name": "NULLVALUE",
    "category": "Null Handling",
    "description": "Returns the first value if not null, otherwise returns the second value",
    "minArgs": 2,
    "maxArgs": 2,
    "specialHandling": "nullvalue",
    "arguments": [
      {
        "name": "value",
        "description": "Value to check for null"
      },
      {
        "name": "defaultValue",
        "description": "Value to return if first is null"
      }
    ]
  },
  "COALESCE": {
    "name": "COALESCE",
    "category": "Null Handling",
    "description": "Returns the first non-null value from a list of expressions",
    "minArgs": 2,
    "maxArgs": null,
    "variadic": true,
    "specialHandling": "coalesce",
    "arguments": [
      {
        "name": "values",
        "description": "Values to check (returns first non-null)",
        "variadic": true
      }
    ]
  },
  "COUNT": {
    "name": "COUNT",
    "category": "Aggregate",
    "description": "Counts the number of non-null values",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Expression to count"
      }
    ]
  },
  "SUM": {
    "name": "SUM",
    "category": "Aggregate",
    "description": "Sums numeric values",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Numeric expression to sum"
      }
    ]
  },
  "AVG": {
    "name": "AVG",
    "category": "Aggregate",
    "description": "Calculates the average of numeric values",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Numeric expression to average"
      }
    ]
  },
  "MIN_AGG": {
    "name": "MIN_AGG",
    "category": "Aggregate",
    "description": "Finds the minimum value",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Expression to find minimum of"
      }
    ]
  },
  "MAX_AGG": {
    "name": "MAX_AGG",
    "category": "Aggregate",
    "description": "Finds the maximum value",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Expression to find maximum of"
      }
    ]
  },
  "STRING_AGG": {
    "name": "STRING_AGG",
    "category": "Aggregate",
    "description": "Concatenates string values with a separator",
    "minArgs": 3,
    "maxArgs": 3,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "String expression to concatenate"
      },
      {
        "name": "separator",
        "description": "Separator between values"
      }
    ]
  },
  "STRING_AGG_DISTINCT": {
    "name": "STRING_AGG_DISTINCT",
    "category": "Aggregate",
    "description": "Concatenates unique string values with a separator",
    "minArgs": 3,
    "maxArgs": 3,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "String expression to concatenate"
      },
      {
        "name": "separator",
        "description": "Separator between values"
      }
    ]
  },
  "SUM_AGG": {
    "name": "SUM_AGG",
    "category": "Aggregate",
    "description": "Sums numeric values",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Numeric expression to sum"
      }
    ]
  },
  "COUNT_AGG": {
    "name": "COUNT_AGG",
    "category": "Aggregate",
    "description": "Counts the number of non-null values",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Expression to count"
      }
    ]
  },
  "AVG_AGG": {
    "name": "AVG_AGG",
    "category": "Aggregate",
    "description": "Calculates the average of numeric values",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Numeric expression to average"
      }
    ]
  },
  "AND_AGG": {
    "name": "AND_AGG",
    "category": "Aggregate",
    "description": "Returns true if all boolean values are true",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Boolean expression to check"
      }
    ]
  },
  "OR_AGG": {
    "name": "OR_AGG",
    "category": "Aggregate",
    "description": "Returns true if any boolean value is true",
    "minArgs": 2,
    "maxArgs": 2,
    "aggregateFunction": true,
    "arguments": [
      {
        "name": "relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "value",
        "description": "Boolean expression to check"
      }
    ]
  },
  "EVAL": {
    "name": "EVAL",
    "category": "Core",
    "description": "Evaluates an expression from another table",
    "minArgs": 1,
    "maxArgs": 1,
    "specialHandling": "relationship",
    "arguments": [
      {
        "name": "relationshipRef",
        "description": "Reference to relationship and expression"
      }
    ]
  }
}
```

*Documentation generated on 2025-06-22T20:49:39.498Z*
