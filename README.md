# JavaScript-to-SQL Formula Compiler

A JavaScript-based Excel-like formula compiler that converts formulas to PostgreSQL SQL. Write formulas like `ROUND(revenue / cost, 2)` and get optimized SQL output.

## 🌟 Key Features

- **36+ Functions**: Math, text, date, logical, and aggregate operations
- **Multi-Level Relationships**: Navigate table relationships with automatic JOIN generation  
- **Live Execution**: Real-time formula validation and execution as you type
- **Smart Autocomplete**: Field names, relationships, and functions
- **SQL Optimization**: Intelligent query consolidation and deduplication
- **No Dependencies**: Pure JavaScript implementation

## 🎯 Live Demo

> **🚀 [Try it live](https://skamensky.github.io/js-to-sql/)** - Interactive formula editor with examples

### Screenshots

![Formula Compiler](tests/playwright/screenshots/compiler-tab.png)
*Interactive formula editor with live execution*

![Language Tooling](tests/playwright/screenshots/language-tooling-test.png)
*Smart autocomplete and error handling*

![Examples Gallery](tests/playwright/screenshots/examples-tab.png)
*Rich collection of formula examples*

## 📚 Documentation

- **[Formula Language Reference](docs/usage/README.md)** - Complete function guide with examples
- **[Function Documentation](docs/usage/functions/)** - Detailed docs for each function category
- **[Data Types](docs/usage/types.md)** - Type system and operations
- **[Integration Guide](docs/lang/integration.md)** - For developers extending the compiler

## 🚀 Quick Start

```javascript
import { evaluateFormula } from './formula-compiler.js';

const context = {
  tableName: 'sales',
  columnList: { 'revenue': 'number', 'cost': 'number' }
};

const result = evaluateFormula('ROUND(revenue / cost, 2)', context);
console.log(result.sql); // Generated PostgreSQL
```

## 🏗️ Architecture

The compiler is modular with a three-stage pipeline: lexer → parser → compiler. Multiple compiler results can be combined into a single query with multiple fields, enabling complex dashboard-style queries with optimized performance.

## � SQL Optimization

Navigate complex table relationships up to 3 levels deep with automatic JOIN generation. The compiler consolidates aggregate subqueries, deduplicates identical expressions, and optimizes query structure for maximum database performance.

## 🧪 Testing

**325/325 tests passing** across three test types:
- **Compiler Tests**: Formula compilation and SQL generation
- **exec-formula Tests**: Command-line execution  
- **E2E Browser Tests**: Frontend functionality

```bash
npm test  # Run all tests
```

## 🚀 Development

```bash
npm install
npm run build    # Build frontend modules
npm run dev      # Start development server
```

## 📄 License

MIT License 