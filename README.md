# JavaScript-to-SQL Formula Compiler

A JavaScript-based Excel-like formula compiler that converts formulas to PostgreSQL SQL. This project implements a complete lexer, parser, and compiler pipeline with comprehensive function support and optimized SQL generation.

## 🌟 Features

- **No Dependencies**: Pure JavaScript implementation
- **Three-Stage Compilation**: Lexer → Parser → Compiler
- **Comprehensive Function Library**: 36+ functions including math, text, date, and logical operations
- **SQL Optimization**: Consolidates aggregate subqueries into efficient JOINs
- **Relationship Support**: Handles table relationships with proper alias generation
- **Type Safety**: Validates column types and operations at compile time
- **Precise Error Reporting**: Errors include exact character positions

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

const result = evaluateFormula('revenue - cost', context);
console.log(result.sql); // Generated SQL
```

### Running Tests

```bash
npm test
```

### Running Individual Test Categories

```bash
node tests/basic-arithmetic-literals.test.js
node tests/math-functions.test.js
# ... etc
```

## 📖 Supported Functions

### Math Functions
- `ABS(number)` - Absolute value
- `ROUND(number, digits)` - Round to specified decimal places
- `MIN(a, b, ...)` - Minimum of values
- `MAX(a, b, ...)` - Maximum of values
- `MOD(number, divisor)` - Modulo operation
- `CEILING(number)` - Round up to nearest integer
- `FLOOR(number)` - Round down to nearest integer

### Text Functions
- `UPPER(text)` - Convert to uppercase
- `LOWER(text)` - Convert to lowercase
- `TRIM(text)` - Remove leading/trailing whitespace
- `LEN(text)` - String length
- `LEFT(text, count)` - Left substring
- `RIGHT(text, count)` - Right substring
- `MID(text, start, length)` - Middle substring
- `CONTAINS(text, search)` - Check if text contains substring
- `SUBSTITUTE(text, old, new)` - Replace text

### Date Functions
- `TODAY()` - Current date
- `DATE(string)` - Parse date from string
- `YEAR(date)` - Extract year
- `MONTH(date)` - Extract month
- `DAY(date)` - Extract day
- `WEEKDAY(date)` - Day of week (1=Sunday)
- `ADDMONTHS(date, months)` - Add months to date
- `ADDDAYS(date, days)` - Add days to date
- `DATEDIF(start, end, unit)` - Date difference

### Logical Functions
- `IF(condition, true_value, false_value)` - Conditional logic
- `AND(a, b, ...)` - Logical AND
- `OR(a, b, ...)` - Logical OR
- `NOT(value)` - Logical NOT

### Null Handling
- `ISNULL(value)` - Check if value is null
- `NULLVALUE(value, default)` - Return default if null
- `ISBLANK(value)` - Check if value is blank

### Utility Functions
- `ME()` - Current user ID
- `STRING(value)` - Convert to string

## 🔧 SQL Optimization

The compiler includes intelligent SQL optimization:

### Before Optimization
```sql
SELECT
  (SELECT STRING_AGG(name, ', ') FROM rep_link JOIN rep ON rep_link.rep = rep.id WHERE rep_link.submission = s.id),
  (SELECT COUNT(*) FROM rep_link WHERE rep_link.submission = s.id)
FROM submission s
```

### After Optimization
```sql
SELECT
  sr1.rep_names,
  sr1.rep_count
FROM submission s
LEFT JOIN (
  SELECT
    rep_link.submission AS submission,
    STRING_AGG(rep.name, ', ') AS rep_names,
    COUNT(*) AS rep_count
  FROM rep_link
  JOIN rep ON rep_link.rep = rep.id
  GROUP BY rep_link.submission
) sr1 ON sr1.submission = s.id
```

## 🧪 Test Organization

The project includes a comprehensive test suite organized into focused modules:

### Test Categories (309 total tests)
- **Basic Arithmetic & Literals** (14 tests)
- **Boolean Literals** (6 tests)
- **Comments** (6 tests)
- **Comparison Operators** (16 tests)
- **Core Functions** (10 tests)
- **Date Arithmetic** (7 tests)
- **Date Functions** (35 tests)
- **Error Handling** (15 tests)
- **IF Function** (17 tests)
- **Logical Operators** (28 tests)
- **Math Functions** (31 tests)
- **Multiplication & Division** (10 tests)
- **Null Handling** (25 tests)
- **Parentheses & Precedence** (15 tests)
- **String Functions** (11 tests)
- **Text Functions** (36 tests)
- **Aggregate Functions** (37 tests)

### Test Results
- **309/309 tests passing (100% success rate)**

### Test Utilities
- Centralized test contexts in `tests/test-utils.js`
- Comprehensive test runner in `tests/run-all-tests.js`
- Individual test files for focused testing

## 🏗️ Architecture

### Lexer
- Tokenizes formula strings
- Handles whitespace and case normalization
- Reports lexical errors with positions

### Parser
- Recursive descent parser
- Builds Abstract Syntax Tree (AST)
- Handles operator precedence and function calls

### Compiler
- Converts AST to PostgreSQL SQL
- Type checking and validation
- SQL optimization and relationship handling
- Aggregate consolidation

## 📝 Examples

### Basic Operations
```javascript
evaluateFormula('revenue - cost', context)
// → ("revenue" - "cost")

evaluateFormula('sale_date + 30', context)
// → ("sale_date" + INTERVAL '30 days')
```

### Function Usage
```javascript
evaluateFormula('ROUND(revenue / cost, 2)', context)
// → ROUND(("revenue" / "cost"), 2)

evaluateFormula('IF(revenue > 1000, "High", "Low")', context)
// → CASE WHEN ("revenue" > 1000) THEN 'High' ELSE 'Low' END
```

### Complex Expressions
```javascript
evaluateFormula('UPPER(LEFT(customer_name, 3)) + "-" + STRING(YEAR(sale_date))', context)
// → (UPPER(LEFT("customer_name", 3)) || ('-' || CAST(EXTRACT(year FROM "sale_date") AS TEXT)))
```

## ⚠️ Error Handling

Detailed error messages with character positions:

```javascript
try {
  evaluateFormula('unknown_column', context);
} catch (error) {
  console.log(error.message); // "Compiler error: Unknown column: UNKNOWN_COLUMN"
  console.log(error.position); // 0
}
```

## 📄 License

MIT License

## 🤝 Contributing

This is a self-contained implementation designed to be easily readable and extensible for additional operators, functions, or SQL targets. 