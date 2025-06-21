# JavaScript-to-SQL Formula Compiler

A JavaScript-based Excel-like formula compiler that converts formulas to PostgreSQL SQL. The system has no external dependencies and implements a complete lexer, parser, and compiler pipeline.

## 🌟 Features

- **No Dependencies**: Pure JavaScript implementation with no external libraries
- **Three-Stage Compilation**: Lexer → Parser → Compiler
- **Case-Insensitive**: Supports case-insensitive column names and function names
- **Space-Insensitive**: Flexible whitespace handling
- **Type-Safe**: Validates column types and operations at compile time
- **Precise Error Reporting**: Errors include exact character positions
- **PostgreSQL Target**: Generates valid PostgreSQL SQL

## 🚀 Quick Start

### Basic Usage

```javascript
import { evaluateFormula } from './formula-compiler.js';

const context = {
  tableName: 'sales',
  columnList: {
    'revenue': 'number',
    'cost': 'number',
    'sale_date': 'date'
  }
};

// Basic arithmetic
const sql1 = evaluateFormula('revenue - cost', context);
// Result: ("revenue" - "cost")

// Date operations
const sql2 = evaluateFormula('sale_date + 30', context);
// Result: ("sale_date" + INTERVAL '30 days')

// Functions
const sql3 = evaluateFormula('TODAY()', context);
// Result: current_date
```

### Running Tests

```bash
npm test
```

### Running Demo

```bash
npm run demo
```

## 📖 Supported Syntax

### Literals

- **Numbers**: `42`, `3.14`
- **Strings**: `"Hello World"`
- **Date Literals**: `DATE("2023-01-01")`

### Operators

- **Addition**: `+` (numbers, date + number, string concatenation)
- **Subtraction**: `-` (numbers, date - number, date - date)
- **Unary Plus/Minus**: `+value`, `-value`
- **Parentheses**: `()` (arbitrary nesting, user-defined precedence)

### Functions

- **TODAY()**: Returns `current_date`
- **ME()**: Returns `(select auth().uid())`
- **DATE(string)**: Creates date literal from string
- **STRING(value)**: Converts any value to string

### Column References

- Case-insensitive: `revenue`, `REVENUE`, `Revenue` all work
- Must be defined in `context.columnList`

## 🔧 API Reference

### `evaluateFormula(formula, context)`

Compiles a formula string to PostgreSQL SQL.

**Parameters:**

- `formula` (string): The formula to compile
- `context` (object):
  - `tableName` (string): Name of the database table
  - `columnList` (object): Column definitions `{ columnName: "number" | "date" }`

**Returns:**

- (string): Valid PostgreSQL SQL

**Throws:**

- Error object with `message` and `position` properties

## 📝 Examples

### Numeric Operations

```javascript
evaluateFormula('10 + 5', context)
// → "(10 + 5)"

evaluateFormula('revenue - cost + 100', context)
// → (("revenue" - "cost") + 100)"

evaluateFormula('-cost', context)
// → '-"cost"'
```

### Date Operations

```javascript
evaluateFormula('sale_date + 7', context)
// → '("sale_date" + INTERVAL \'7 days\')'

evaluateFormula('end_date - start_date', context)
// → '("end_date" - "start_date")'

evaluateFormula('TODAY() - 30', context)
// → '(current_date - INTERVAL \'30 days\')'
```

### Complex Expressions

```javascript
evaluateFormula('(revenue - cost) + 100', context)
// → '(("revenue" - "cost") + 100)'

evaluateFormula('DATE("2023-01-01") + 365', context)
// → '(DATE(\'2023-01-01\') + INTERVAL \'365 days\')'
```

### Parentheses and Precedence

```javascript
// Without parentheses (left-to-right evaluation)
evaluateFormula('revenue - cost + 100', context)
// → '(("revenue" - "cost") + 100)'

// With parentheses (user-defined precedence)
evaluateFormula('revenue - (cost + 100)', context)
// → '("revenue" - ("cost" + 100))'

// Nested parentheses
evaluateFormula('((revenue - cost) + 50)', context)
// → '(("revenue" - "cost") + 50)'

// Complex nesting
evaluateFormula('(revenue + (cost - 200)) + 150', context)
// → '(("revenue" + ("cost" - 200)) + 150)'
```

### String Operations

```javascript
// String literals
evaluateFormula('"Hello World"', context)
// → "'Hello World'"

// String conversion
evaluateFormula('STRING(revenue)', context)
// → 'CAST("revenue" AS TEXT)'

// String concatenation
evaluateFormula('STRING(revenue) + " dollars"', context)
// → '(CAST("revenue" AS TEXT) || ' dollars')'

// Auto-casting for concatenation
evaluateFormula('revenue + " total"', context)
// → '(CAST("revenue" AS TEXT) || ' total')'
```

## ⚠️ Error Handling

The compiler provides detailed error messages with character positions:

```javascript
try {
  evaluateFormula('unknown_column', context);
} catch (error) {
  console.log(error.message); // "Compiler error: Unknown column: UNKNOWN_COLUMN"
  console.log(error.position); // 0
}
```

### Common Errors

- **Unknown Column**: Column not found in `columnList`
- **Type Mismatch**: Invalid operation for column types
- **Syntax Error**: Invalid formula syntax
- **Function Errors**: Wrong number of arguments or invalid arguments

## 🏗️ Architecture

### Lexer

Converts the input formula string into tokens:

- Numbers, identifiers, operators, parentheses, strings
- Handles whitespace and case normalization
- Reports lexical errors with positions

### Parser

Converts tokens into an Abstract Syntax Tree (AST):

- Recursive descent parser
- Handles operator precedence
- Supports unary and binary operations
- Function call parsing

### Compiler

Converts AST to PostgreSQL SQL:

- Type checking and validation
- Column reference resolution
- SQL generation with proper escaping
- Type-specific operation handling

## 🧪 Testing

The project includes comprehensive tests covering:

- ✅ Numeric operations and literals
- ✅ Date operations and literals  
- ✅ Column references and case-insensitivity
- ✅ Function calls (TODAY, ME, DATE)
- ✅ Arbitrary parentheses and precedence control
- ✅ Complex nested expressions
- ✅ Error cases and validation
- ✅ Edge cases and boundary conditions

Run tests with:

```bash
npm test
```

## 📄 License

MIT License

## 🤝 Contributing

This is a self-contained implementation with no external dependencies. The code is designed to be easily readable and extensible for additional operators, functions, or SQL targets. 