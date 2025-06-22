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
EXPRESSION: 'expression'
INVERSE_RELATIONSHIP: 'inverse_relationship'
STRING_LITERAL: 'string_literal'
```

## Function Constants

```javascript
TODAY: 'TODAY'
ME: 'ME'
DATE: 'DATE'
STRING: 'STRING'
IF: 'IF'
ISNULL: 'ISNULL'
NULLVALUE: 'NULLVALUE'
ISBLANK: 'ISBLANK'
AND: 'AND'
OR: 'OR'
NOT: 'NOT'
ABS: 'ABS'
ROUND: 'ROUND'
MIN: 'MIN'
MAX: 'MAX'
MOD: 'MOD'
CEILING: 'CEILING'
FLOOR: 'FLOOR'
UPPER: 'UPPER'
LOWER: 'LOWER'
TRIM: 'TRIM'
LEN: 'LEN'
LEFT: 'LEFT'
RIGHT: 'RIGHT'
MID: 'MID'
CONTAINS: 'CONTAINS'
SUBSTITUTE: 'SUBSTITUTE'
YEAR: 'YEAR'
MONTH: 'MONTH'
DAY: 'DAY'
WEEKDAY: 'WEEKDAY'
ADDMONTHS: 'ADDMONTHS'
ADDDAYS: 'ADDDAYS'
DATEDIF: 'DATEDIF'
STRING_AGG: 'STRING_AGG'
STRING_AGG_DISTINCT: 'STRING_AGG_DISTINCT'
SUM_AGG: 'SUM_AGG'
COUNT_AGG: 'COUNT_AGG'
AVG_AGG: 'AVG_AGG'
MIN_AGG: 'MIN_AGG'
MAX_AGG: 'MAX_AGG'
AND_AGG: 'AND_AGG'
OR_AGG: 'OR_AGG'
```

## Category Constants

```javascript
CORE: 'core'
NULL_HANDLING: 'null-handling'
LOGICAL: 'logical'
MATH: 'math'
STRING: 'string'
DATE: 'date'
AGGREGATE: 'aggregate'
```

## Complete Function Metadata

```javascript
{
  "TODAY": {
    "name": "TODAY",
    "category": "core",
    "description": "Returns the current date",
    "arguments": [],
    "returnType": "date",
    "testRefs": [
      "tests/core-functions.test.js:15"
    ],
    "requiresSpecialHandling": false
  },
  "ME": {
    "name": "ME",
    "category": "core",
    "description": "Returns the current user identifier",
    "arguments": [],
    "returnType": "string",
    "testRefs": [
      "tests/core-functions.test.js:23"
    ],
    "requiresSpecialHandling": false
  },
  "DATE": {
    "name": "DATE",
    "category": "core",
    "description": "Converts a string literal to a date",
    "arguments": [
      {
        "name": "dateString",
        "type": "string_literal",
        "description": "String representation of date"
      }
    ],
    "returnType": "date",
    "testRefs": [
      "tests/core-functions.test.js:31"
    ],
    "requiresSpecialHandling": true
  },
  "STRING": {
    "name": "STRING",
    "category": "core",
    "description": "Converts any value to string representation",
    "arguments": [
      {
        "name": "value",
        "type": "expression",
        "description": "Value to convert to string"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/string-functions-concatenation.test.js:15"
    ],
    "requiresSpecialHandling": false
  },
  "IF": {
    "name": "IF",
    "category": "core",
    "description": "Conditional expression with optional else clause",
    "arguments": [
      {
        "name": "condition",
        "type": "boolean",
        "description": "Boolean condition to evaluate"
      },
      {
        "name": "trueValue",
        "type": "expression",
        "description": "Value when condition is true"
      },
      {
        "name": "falseValue",
        "type": "expression",
        "description": "Value when condition is false",
        "optional": true
      }
    ],
    "returnType": "expression",
    "testRefs": [
      "tests/if-function.test.js:15"
    ],
    "requiresSpecialHandling": true,
    "minArgs": 2,
    "maxArgs": 3
  },
  "ISNULL": {
    "name": "ISNULL",
    "category": "null-handling",
    "description": "Returns true if the value is NULL",
    "arguments": [
      {
        "name": "value",
        "type": "expression",
        "description": "Value to check for NULL"
      }
    ],
    "returnType": "boolean",
    "testRefs": [
      "tests/null-handling.test.js:15"
    ],
    "requiresSpecialHandling": false
  },
  "NULLVALUE": {
    "name": "NULLVALUE",
    "category": "null-handling",
    "description": "Returns default value if first value is NULL",
    "arguments": [
      {
        "name": "value",
        "type": "expression",
        "description": "Value to check for NULL"
      },
      {
        "name": "defaultValue",
        "type": "expression",
        "description": "Default value if first is NULL"
      }
    ],
    "returnType": "expression",
    "testRefs": [
      "tests/null-handling.test.js:33"
    ],
    "requiresSpecialHandling": false
  },
  "ISBLANK": {
    "name": "ISBLANK",
    "category": "null-handling",
    "description": "Returns true if the value is NULL or empty string",
    "arguments": [
      {
        "name": "value",
        "type": "expression",
        "description": "Value to check for blank"
      }
    ],
    "returnType": "boolean",
    "testRefs": [
      "tests/null-handling.test.js:55"
    ],
    "requiresSpecialHandling": false
  },
  "AND": {
    "name": "AND",
    "category": "logical",
    "description": "Returns true if all conditions are true",
    "arguments": [
      {
        "name": "condition",
        "type": "boolean",
        "description": "Boolean condition",
        "variadic": true
      }
    ],
    "returnType": "boolean",
    "testRefs": [
      "tests/logical-operators-functions.test.js:15"
    ],
    "requiresSpecialHandling": true,
    "minArgs": 2,
    "maxArgs": null
  },
  "OR": {
    "name": "OR",
    "category": "logical",
    "description": "Returns true if any condition is true",
    "arguments": [
      {
        "name": "condition",
        "type": "boolean",
        "description": "Boolean condition",
        "variadic": true
      }
    ],
    "returnType": "boolean",
    "testRefs": [
      "tests/logical-operators-functions.test.js:45"
    ],
    "requiresSpecialHandling": true,
    "minArgs": 2,
    "maxArgs": null
  },
  "NOT": {
    "name": "NOT",
    "category": "logical",
    "description": "Returns the logical negation of the condition",
    "arguments": [
      {
        "name": "condition",
        "type": "boolean",
        "description": "Boolean condition to negate"
      }
    ],
    "returnType": "boolean",
    "testRefs": [
      "tests/logical-operators-functions.test.js:73"
    ],
    "requiresSpecialHandling": false
  },
  "ABS": {
    "name": "ABS",
    "category": "math",
    "description": "Returns the absolute value of a number",
    "arguments": [
      {
        "name": "number",
        "type": "number",
        "description": "Number to get absolute value of"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/math-functions.test.js:35"
    ],
    "requiresSpecialHandling": false
  },
  "ROUND": {
    "name": "ROUND",
    "category": "math",
    "description": "Rounds a number to specified decimal places",
    "arguments": [
      {
        "name": "number",
        "type": "number",
        "description": "Number to round"
      },
      {
        "name": "decimals",
        "type": "number",
        "description": "Number of decimal places"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/math-functions.test.js:15"
    ],
    "requiresSpecialHandling": false
  },
  "MIN": {
    "name": "MIN",
    "category": "math",
    "description": "Returns the smaller of two numbers",
    "arguments": [
      {
        "name": "num1",
        "type": "number",
        "description": "First number"
      },
      {
        "name": "num2",
        "type": "number",
        "description": "Second number"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/math-functions.test.js:60"
    ],
    "requiresSpecialHandling": false
  },
  "MAX": {
    "name": "MAX",
    "category": "math",
    "description": "Returns the larger of two numbers",
    "arguments": [
      {
        "name": "num1",
        "type": "number",
        "description": "First number"
      },
      {
        "name": "num2",
        "type": "number",
        "description": "Second number"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/math-functions.test.js:85"
    ],
    "requiresSpecialHandling": false
  },
  "MOD": {
    "name": "MOD",
    "category": "math",
    "description": "Returns the remainder after division",
    "arguments": [
      {
        "name": "dividend",
        "type": "number",
        "description": "Number to divide"
      },
      {
        "name": "divisor",
        "type": "number",
        "description": "Number to divide by"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/math-functions.test.js:110"
    ],
    "requiresSpecialHandling": false
  },
  "CEILING": {
    "name": "CEILING",
    "category": "math",
    "description": "Rounds a number up to the nearest integer",
    "arguments": [
      {
        "name": "number",
        "type": "number",
        "description": "Number to round up"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/math-functions.test.js:135"
    ],
    "requiresSpecialHandling": false
  },
  "FLOOR": {
    "name": "FLOOR",
    "category": "math",
    "description": "Rounds a number down to the nearest integer",
    "arguments": [
      {
        "name": "number",
        "type": "number",
        "description": "Number to round down"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/math-functions.test.js:155"
    ],
    "requiresSpecialHandling": false
  },
  "UPPER": {
    "name": "UPPER",
    "category": "string",
    "description": "Converts text to uppercase",
    "arguments": [
      {
        "name": "text",
        "type": "string",
        "description": "Text to convert to uppercase"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/text-functions.test.js:15"
    ],
    "requiresSpecialHandling": false
  },
  "LOWER": {
    "name": "LOWER",
    "category": "string",
    "description": "Converts text to lowercase",
    "arguments": [
      {
        "name": "text",
        "type": "string",
        "description": "Text to convert to lowercase"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/text-functions.test.js:16"
    ],
    "requiresSpecialHandling": false
  },
  "TRIM": {
    "name": "TRIM",
    "category": "string",
    "description": "Removes leading and trailing whitespace",
    "arguments": [
      {
        "name": "text",
        "type": "string",
        "description": "Text to trim whitespace from"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/text-functions.test.js:17"
    ],
    "requiresSpecialHandling": false
  },
  "LEN": {
    "name": "LEN",
    "category": "string",
    "description": "Returns the length of text",
    "arguments": [
      {
        "name": "text",
        "type": "string",
        "description": "Text to measure length of"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/text-functions.test.js:20"
    ],
    "requiresSpecialHandling": false
  },
  "LEFT": {
    "name": "LEFT",
    "category": "string",
    "description": "Returns the leftmost characters from text",
    "arguments": [
      {
        "name": "text",
        "type": "string",
        "description": "Text to extract from"
      },
      {
        "name": "count",
        "type": "number",
        "description": "Number of characters to extract"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/text-functions.test.js:40"
    ],
    "requiresSpecialHandling": false
  },
  "RIGHT": {
    "name": "RIGHT",
    "category": "string",
    "description": "Returns the rightmost characters from text",
    "arguments": [
      {
        "name": "text",
        "type": "string",
        "description": "Text to extract from"
      },
      {
        "name": "count",
        "type": "number",
        "description": "Number of characters to extract"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/text-functions.test.js:65"
    ],
    "requiresSpecialHandling": false
  },
  "MID": {
    "name": "MID",
    "category": "string",
    "description": "Returns characters from the middle of text",
    "arguments": [
      {
        "name": "text",
        "type": "string",
        "description": "Text to extract from"
      },
      {
        "name": "start",
        "type": "number",
        "description": "Starting position (1-based)"
      },
      {
        "name": "length",
        "type": "number",
        "description": "Number of characters to extract"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/text-functions.test.js:90"
    ],
    "requiresSpecialHandling": false
  },
  "CONTAINS": {
    "name": "CONTAINS",
    "category": "string",
    "description": "Returns true if text contains the search string",
    "arguments": [
      {
        "name": "text",
        "type": "string",
        "description": "Text to search in"
      },
      {
        "name": "searchText",
        "type": "string",
        "description": "Text to search for"
      }
    ],
    "returnType": "boolean",
    "testRefs": [
      "tests/text-functions.test.js:119"
    ],
    "requiresSpecialHandling": false
  },
  "SUBSTITUTE": {
    "name": "SUBSTITUTE",
    "category": "string",
    "description": "Replaces old text with new text in a string",
    "arguments": [
      {
        "name": "text",
        "type": "string",
        "description": "Text to perform substitution in"
      },
      {
        "name": "oldText",
        "type": "string",
        "description": "Text to replace"
      },
      {
        "name": "newText",
        "type": "string",
        "description": "Replacement text"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/text-functions.test.js:144"
    ],
    "requiresSpecialHandling": false
  },
  "YEAR": {
    "name": "YEAR",
    "category": "date",
    "description": "Extracts the year from a date",
    "arguments": [
      {
        "name": "date",
        "type": "date",
        "description": "Date to extract year from"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/date-functions.test.js:15"
    ],
    "requiresSpecialHandling": false
  },
  "MONTH": {
    "name": "MONTH",
    "category": "date",
    "description": "Extracts the month from a date",
    "arguments": [
      {
        "name": "date",
        "type": "date",
        "description": "Date to extract month from"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/date-functions.test.js:35"
    ],
    "requiresSpecialHandling": false
  },
  "DAY": {
    "name": "DAY",
    "category": "date",
    "description": "Extracts the day from a date",
    "arguments": [
      {
        "name": "date",
        "type": "date",
        "description": "Date to extract day from"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/date-functions.test.js:55"
    ],
    "requiresSpecialHandling": false
  },
  "WEEKDAY": {
    "name": "WEEKDAY",
    "category": "date",
    "description": "Returns the day of the week as a number (1=Sunday)",
    "arguments": [
      {
        "name": "date",
        "type": "date",
        "description": "Date to get weekday from"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/date-functions.test.js:75"
    ],
    "requiresSpecialHandling": false
  },
  "ADDMONTHS": {
    "name": "ADDMONTHS",
    "category": "date",
    "description": "Adds months to a date",
    "arguments": [
      {
        "name": "date",
        "type": "date",
        "description": "Starting date"
      },
      {
        "name": "months",
        "type": "number",
        "description": "Number of months to add"
      }
    ],
    "returnType": "date",
    "testRefs": [
      "tests/date-functions.test.js:95"
    ],
    "requiresSpecialHandling": false
  },
  "ADDDAYS": {
    "name": "ADDDAYS",
    "category": "date",
    "description": "Adds days to a date",
    "arguments": [
      {
        "name": "date",
        "type": "date",
        "description": "Starting date"
      },
      {
        "name": "days",
        "type": "number",
        "description": "Number of days to add"
      }
    ],
    "returnType": "date",
    "testRefs": [
      "tests/date-functions.test.js:120"
    ],
    "requiresSpecialHandling": false
  },
  "DATEDIF": {
    "name": "DATEDIF",
    "category": "date",
    "description": "Returns the difference between two dates in specified units",
    "arguments": [
      {
        "name": "startDate",
        "type": "date",
        "description": "Starting date"
      },
      {
        "name": "endDate",
        "type": "date",
        "description": "Ending date"
      },
      {
        "name": "unit",
        "type": "string_literal",
        "description": "Unit: \"days\", \"months\", or \"years\""
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/date-functions.test.js:145"
    ],
    "requiresSpecialHandling": true
  },
  "STRING_AGG": {
    "name": "STRING_AGG",
    "category": "aggregate",
    "description": "Concatenates values from related records with delimiter",
    "arguments": [
      {
        "name": "relationship",
        "type": "inverse_relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "expression",
        "type": "expression",
        "description": "Expression to evaluate for each record"
      },
      {
        "name": "delimiter",
        "type": "string",
        "description": "String delimiter to separate values"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/aggregate-functions.test.js:15"
    ],
    "requiresSpecialHandling": true
  },
  "STRING_AGG_DISTINCT": {
    "name": "STRING_AGG_DISTINCT",
    "category": "aggregate",
    "description": "Concatenates distinct values from related records with delimiter",
    "arguments": [
      {
        "name": "relationship",
        "type": "inverse_relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "expression",
        "type": "expression",
        "description": "Expression to evaluate for each record"
      },
      {
        "name": "delimiter",
        "type": "string",
        "description": "String delimiter to separate values"
      }
    ],
    "returnType": "string",
    "testRefs": [
      "tests/aggregate-functions.test.js:33"
    ],
    "requiresSpecialHandling": true
  },
  "SUM_AGG": {
    "name": "SUM_AGG",
    "category": "aggregate",
    "description": "Sums numeric values from related records",
    "arguments": [
      {
        "name": "relationship",
        "type": "inverse_relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "expression",
        "type": "expression",
        "description": "Numeric expression to sum"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/aggregate-functions.test.js:45"
    ],
    "requiresSpecialHandling": true
  },
  "COUNT_AGG": {
    "name": "COUNT_AGG",
    "category": "aggregate",
    "description": "Counts related records",
    "arguments": [
      {
        "name": "relationship",
        "type": "inverse_relationship",
        "description": "Inverse relationship to count"
      },
      {
        "name": "expression",
        "type": "expression",
        "description": "Expression to evaluate (value ignored)"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/aggregate-functions.test.js:55"
    ],
    "requiresSpecialHandling": true
  },
  "AVG_AGG": {
    "name": "AVG_AGG",
    "category": "aggregate",
    "description": "Averages numeric values from related records",
    "arguments": [
      {
        "name": "relationship",
        "type": "inverse_relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "expression",
        "type": "expression",
        "description": "Numeric expression to average"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/aggregate-functions.test.js:65"
    ],
    "requiresSpecialHandling": true
  },
  "MIN_AGG": {
    "name": "MIN_AGG",
    "category": "aggregate",
    "description": "Finds minimum value from related records",
    "arguments": [
      {
        "name": "relationship",
        "type": "inverse_relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "expression",
        "type": "expression",
        "description": "Expression to find minimum of"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/aggregate-functions.test.js:75"
    ],
    "requiresSpecialHandling": true
  },
  "MAX_AGG": {
    "name": "MAX_AGG",
    "category": "aggregate",
    "description": "Finds maximum value from related records",
    "arguments": [
      {
        "name": "relationship",
        "type": "inverse_relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "expression",
        "type": "expression",
        "description": "Expression to find maximum of"
      }
    ],
    "returnType": "number",
    "testRefs": [
      "tests/aggregate-functions.test.js:85"
    ],
    "requiresSpecialHandling": true
  },
  "AND_AGG": {
    "name": "AND_AGG",
    "category": "aggregate",
    "description": "Returns true if all values from related records are true",
    "arguments": [
      {
        "name": "relationship",
        "type": "inverse_relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "expression",
        "type": "expression",
        "description": "Boolean expression to evaluate"
      }
    ],
    "returnType": "boolean",
    "testRefs": [
      "tests/aggregate-functions.test.js:95"
    ],
    "requiresSpecialHandling": true
  },
  "OR_AGG": {
    "name": "OR_AGG",
    "category": "aggregate",
    "description": "Returns true if any value from related records is true",
    "arguments": [
      {
        "name": "relationship",
        "type": "inverse_relationship",
        "description": "Inverse relationship to aggregate"
      },
      {
        "name": "expression",
        "type": "expression",
        "description": "Boolean expression to evaluate"
      }
    ],
    "returnType": "boolean",
    "testRefs": [
      "tests/aggregate-functions.test.js:105"
    ],
    "requiresSpecialHandling": true
  }
}
```

*Documentation generated on 2025-06-22T17:41:34.480Z*
