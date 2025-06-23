# JavaScript-to-SQL Formula Compiler

A JavaScript-based Excel-like formula compiler that converts formulas to PostgreSQL SQL. This project implements a complete lexer, parser, and compiler pipeline with comprehensive function support and optimized SQL generation.

## 🌟 Features

### Core Compiler
- **No Dependencies**: Pure JavaScript implementation
- **Three-Stage Compilation**: Lexer → Parser → Compiler
- **Comprehensive Function Library**: 36+ functions including math, text, date, and logical operations
- **Multi-Level Relationships**: Navigate up to 3 levels deep with automatic JOIN generation
- **Advanced SQL Optimization**: Consolidates aggregate subqueries into efficient JOINs with expression-level deduplication
- **Relationship Support**: Handles table relationships with proper alias generation
- **Type Safety**: Validates column types and operations at compile time
- **Precise Error Reporting**: Errors include exact character positions

### Live Execution & Developer Experience ⚡
- **Live Formula Execution**: Formulas execute automatically as you type (800ms debounce)
- **Real-time Validation**: Immediate syntax error detection with visual indicators
- **Smart Autocomplete**: Field names, relationships, and functions with Tab completion
- **Intelligent Status Display**: Color-coded status indicators (🟡 Validating, 🔵 Executing, 🟢 Success, 🔴 Error)
- **Error Prevention**: Clear error messages in prominent display panels
- **Toggle Modes**: Switch between live and manual execution
- **Performance Optimized**: Smart caching and debounced execution

## 🎯 Live Demo & Screenshots

> **🚀 [Live Demo Available](https://skamensky.github.io/js-to-sql/)** - Automatically deployed via GitHub Actions

### Formula Compiler Interface
![Formula Compiler](tests/playwright/screenshots/compiler-tab.png)
*Interactive formula editor with live execution and autocomplete*

### Language Tooling & Autocomplete  
![Language Tooling](tests/playwright/screenshots/language-tooling-test.png)
*Smart autocomplete with field names, relationships, and functions*

![Autocomplete Details](tests/playwright/screenshots/autocomplete-final-test.png)
*Advanced autocomplete showing function suggestions and documentation*

### Live Execution & Error Handling
![Live Execution](tests/playwright/screenshots/live-execution-test.png)
*Real-time formula execution with immediate results*

![Error Handling](tests/playwright/screenshots/live-execution-error.png)
*Clear error messages with syntax highlighting*

### Schema Browser & Examples
![Schema Browser](tests/playwright/screenshots/schema-tab.png)
*Interactive schema browser showing table relationships*

![Examples Gallery](tests/playwright/screenshots/examples-tab.png)
*Rich collection of formula examples organized by table*

![Examples Functionality](tests/playwright/screenshots/examples-functionality.png)
*One-click example loading with full context*

## � Documentation

The project includes comprehensive documentation that's automatically generated and maintained:

### 📖 **[Formula Language Reference](docs/usage/README.md)**
Complete guide to the formula language with:
- **[Function Reference by Category](docs/usage/README.md#functions-by-category)**: Math, String, Date, Logical, Null Handling, Aggregate, and Core functions
- **[Alphabetical Function Index](docs/usage/README.md#all-functions-a-z)**: Quick lookup for all 36+ functions
- **[Data Types](docs/usage/types.md)**: Complete type system with operations and compatibility
- **[Operators](docs/usage/README.md#operators)**: Arithmetic, comparison, and logical operators

### 🔧 **[Detailed Function Documentation](docs/usage/functions/)**
In-depth documentation for each function category:
- **[Math Functions](docs/usage/functions/math.md)**: ROUND, ABS, CEILING, FLOOR, trigonometric, etc.
- **[String Functions](docs/usage/functions/string.md)**: UPPER, LOWER, TRIM, SUBSTR, CONCAT, etc.
- **[Date Functions](docs/usage/functions/date.md)**: NOW, TODAY, YEAR, MONTH, DATEDIF, etc.
- **[Logical Functions](docs/usage/functions/logical.md)**: AND, OR, NOT operations
- **[Aggregate Functions](docs/usage/functions/aggregate.md)**: COUNT_AGG, SUM_AGG, STRING_AGG, etc.
- **[Core Functions](docs/usage/functions/core.md)**: IF, STRING, DATE, ME, EVAL
- **[Null Handling](docs/usage/functions/null-handling.md)**: ISNULL, ISBLANK, NULLVALUE, COALESCE

### 🏗️ **[Technical Documentation](docs/lang/)**
For developers integrating or extending the compiler:
- **[Integration Guide](docs/lang/integration.md)**: How to integrate the metadata-driven function system
- **[Function Metadata Reference](docs/lang/metadata.md)**: Complete metadata structure and function constants

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

## 🔗 Multi-Level Relationships

The compiler supports navigating complex table relationships up to 3 levels deep with automatic JOIN generation:

### Basic Relationship Navigation
```javascript
// Single level: submission → merchant → name
merchant_rel.name

// Multi-level: submission → merchant → main_rep → name  
merchant_rel.main_rep_rel.name

// Deep relationships: submission → merchant → main_rep → app_user → email
merchant_rel.main_rep_rel.app_user_rel.email
```

### Generated SQL
```sql
-- For: merchant_rel.main_rep_rel.app_user_rel.name
SELECT "rel_merchant_main_rep_app_user"."name" AS field_name
FROM submission s
  LEFT JOIN merchant rel_merchant ON s.merchant = rel_merchant.id
  LEFT JOIN rep rel_merchant_main_rep ON rel_merchant.main_rep = rel_merchant_main_rep.id
  LEFT JOIN app_user rel_merchant_main_rep_app_user ON rel_merchant_main_rep.app_user = rel_merchant_main_rep_app_user.id
```

### Relationship Configuration
Configure maximum relationship depth:
```javascript
const result = evaluateFormula('merchant_rel.main_rep_rel.name', context, {
  maxRelationshipDepth: 5  // Default is 3
});
```

### Multi-Level Aggregates
Combine multi-level relationships with aggregate functions - see [Aggregate Functions documentation](docs/usage/functions/aggregate.md) for complete details.

### Performance Optimization
- **JOIN Deduplication**: Shared relationship paths are consolidated
- **Bulkified Metadata Loading**: All table schemas loaded in single queries
- **Intelligent Alias Generation**: Hierarchical aliases prevent conflicts
- **Context Structure**: Flat relationship format for improved startup performance

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

### Expression-Level Deduplication
The optimizer detects **identical SQL expressions** and consolidates them, even when derived from different formula inputs:

**Before (Multiple Identical Expressions):**
```javascript
// Multiple COUNT_AGG calls with different columns
STRING(COUNT_AGG(rep_links, rep)) + " | " + 
STRING(COUNT_AGG(rep_links, commission_percentage)) + " | " + 
STRING(COUNT_AGG(rep_links, id))
```

```sql
-- Generated redundant expressions
COUNT(*) AS rep_count,
COUNT(*) AS rep_count_2,  -- Duplicate!
COUNT(*) AS rep_count_3   -- Duplicate!
```

**After (Single Optimized Expression):**
```sql
-- Deduplicated to single expression
COUNT(*) AS rep_count
```

```sql
-- All references use the same column
COALESCE(sr1.rep_count, 0) || ' | ' || 
COALESCE(sr1.rep_count, 0) || ' | ' || 
COALESCE(sr1.rep_count, 0)
```

### Key Optimization Features
- **Aggregate Deduplication**: Identical aggregate expressions consolidated into single SQL
- **JOIN Consolidation**: Shared relationships deduplicated across formulas
- **Subquery Merging**: Multiple aggregates on same relationship combined into one subquery
- **Expression Reuse**: Same SQL expressions referenced multiple times use single calculation
- **Semantic ID Matching**: Intelligent detection of functionally equivalent expressions

### Performance Benefits
- **Reduced Query Complexity**: Fewer subqueries and duplicate expressions
- **Database Optimization**: Single aggregation instead of multiple identical calculations  
- **Memory Efficiency**: Consolidated results cached and reused
- **Execution Speed**: Significant performance improvement for complex multi-aggregate formulas

## 🧪 Testing

The project includes a comprehensive test suite with **325/325 tests passing (100% success rate)**:

### Test Types
- **Compiler Tests**: Core formula compilation, functions, operators, and SQL generation
- **exec-formula Tests**: Command-line formula execution and validation  
- **E2E Browser Tests**: Frontend functionality, autocomplete, live execution, and user interface

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

## 🚀 Deployment

### GitHub Pages (Automated)

This project is configured for automatic deployment to GitHub Pages using GitHub Actions:

1. **Automatic Deployment**: Push to `main` branch triggers deployment
2. **Build Process**: Runs `npm run build` to compile frontend modules
3. **Live Demo**: Available at `https://skamensky.github.io/js-to-sql/`

### Manual Deployment Setup

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to main branch or manually trigger workflow

### Local Development

```bash
# Install dependencies
npm install

# Build frontend modules
npm run build

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📄 License

MIT License

## 🤝 Contributing

This is a self-contained implementation designed to be easily readable and extensible for additional operators, functions, or SQL targets. 