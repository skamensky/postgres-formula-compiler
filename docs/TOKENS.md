# Tokens Reference

This document describes the lexical tokens recognized by the Formula Language lexer.

> **Note:** This is technical documentation for developers working on language tooling.

## Token Types

| Token | Pattern | Description | TextMate Scope |
|-------|---------|-------------|----------------|
| `NUMBER` | `/\d+(\.\d+)?/` | Numeric literals (integers and decimals) | `constant.numeric.formula` |
| `IDENTIFIER` | `/[a-zA-Z_]\w*/` | Column names, function names, and keywords | `variable.other.formula` |
| `FUNCTION` | `/\b(TODAY|ME|DATE|STRING|...)\b/` | Built-in formula function names | `keyword.function.formula` |
| `STRING` | `/"[^"]*"/` | String literals enclosed in double quotes | `string.quoted.double.formula` |
| `PLUS` | `/\+/` | Addition operator | `keyword.operator.arithmetic.formula` |
| `MINUS` | `/\-/` | Subtraction or negation operator | `keyword.operator.arithmetic.formula` |
| `MULTIPLY` | `/\*/` | Multiplication operator | `keyword.operator.arithmetic.formula` |
| `DIVIDE` | `/\//` | Division operator | `keyword.operator.arithmetic.formula` |
| `AMPERSAND` | `/&/` | String concatenation operator | `keyword.operator.string.formula` |
| `LPAREN` | `/\(/` | Left parenthesis for grouping | `punctuation.definition.group.begin.formula` |
| `RPAREN` | `/\)/` | Right parenthesis for grouping | `punctuation.definition.group.end.formula` |
| `COMMA` | `/,/` | Comma separator for function arguments | `punctuation.separator.formula` |
| `DOT` | `/\./` | Dot operator for relationship field access | `punctuation.accessor.formula` |
| `GT` | `/>/` | Greater than comparison operator | `keyword.operator.comparison.formula` |
| `GTE` | `/>=/` | Greater than or equal comparison operator | `keyword.operator.comparison.formula` |
| `LT` | `/</` | Less than comparison operator | `keyword.operator.comparison.formula` |
| `LTE` | `/<=/` | Less than or equal comparison operator | `keyword.operator.comparison.formula` |
| `EQ` | `/=/` | Equality comparison operator | `keyword.operator.comparison.formula` |
| `NEQ` | `/!=|<>/` | Inequality comparison operator | `keyword.operator.comparison.formula` |
| `EOF` | `END_OF_INPUT` | End of formula input | `` |

## Usage in VSCode Extension

The TextMate scopes are used for syntax highlighting in the VSCode extension.

## Pattern Details

### NUMBER
**Pattern:** `/\d+(\.\d+)?/`  
**Description:** Numeric literals (integers and decimals)

### IDENTIFIER
**Pattern:** `/[a-zA-Z_]\w*/`  
**Description:** Column names, function names, and keywords

### FUNCTION
**Pattern:** `/\b(TODAY|ME|DATE|STRING|...)\b/`  
**Description:** Built-in formula function names

### STRING
**Pattern:** `/"[^"]*"/`  
**Description:** String literals enclosed in double quotes

### PLUS
**Pattern:** `/\+/`  
**Description:** Addition operator

### MINUS
**Pattern:** `/\-/`  
**Description:** Subtraction or negation operator

### MULTIPLY
**Pattern:** `/\*/`  
**Description:** Multiplication operator

### DIVIDE
**Pattern:** `/\//`  
**Description:** Division operator

### AMPERSAND
**Pattern:** `/&/`  
**Description:** String concatenation operator

### LPAREN
**Pattern:** `/\(/`  
**Description:** Left parenthesis for grouping

### RPAREN
**Pattern:** `/\)/`  
**Description:** Right parenthesis for grouping

### COMMA
**Pattern:** `/,/`  
**Description:** Comma separator for function arguments

### DOT
**Pattern:** `/\./`  
**Description:** Dot operator for relationship field access

### GT
**Pattern:** `/>/`  
**Description:** Greater than comparison operator

### GTE
**Pattern:** `/>=/`  
**Description:** Greater than or equal comparison operator

### LT
**Pattern:** `/</`  
**Description:** Less than comparison operator

### LTE
**Pattern:** `/<=/`  
**Description:** Less than or equal comparison operator

### EQ
**Pattern:** `/=/`  
**Description:** Equality comparison operator

### NEQ
**Pattern:** `/!=|<>/`  
**Description:** Inequality comparison operator

