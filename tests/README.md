# Formula Compiler Test Suite

This directory contains the organized test suite for the Formula Compiler, split into focused test files by category.

## Test Structure

### Individual Test Files
Each test file focuses on a specific category of functionality:

- `basic-arithmetic-literals.test.js` - Basic arithmetic operations and literals
- `core-functions.test.js` - Core functions (TODAY, ME, DATE)
- `date-arithmetic.test.js` - Date arithmetic operations
- `parentheses-precedence.test.js` - Parentheses and operator precedence
- `string-functions-concatenation.test.js` - String functions and concatenation
- `comments.test.js` - Line and block comments
- `multiplication-division.test.js` - Multiplication and division operators
- `null-handling.test.js` - NULL handling functions (ISNULL, NULLVALUE, ISBLANK)

### Shared Utilities
- `test-utils.js` - Shared test utilities, helper functions, and test context
- `run-all-tests.js` - Main test runner that executes all test files

## Running Tests

### Run All Tests
```bash
node tests/run-all-tests.js
```

### Run Individual Test File
```bash
node tests/basic-arithmetic-literals.test.js
node tests/core-functions.test.js
# ... etc
```

### Run Original Monolithic Test (Legacy)
```bash
node tests/test-formula-compiler.js
```

## Test Organization Principles

1. **Test Isolation** - Each test file can be run independently
2. **Category Focus** - Tests are grouped by logical functionality
3. **Error Coverage** - Each test file includes relevant error test cases
4. **Shared Utilities** - Common test infrastructure is centralized
5. **Maintainability** - Easy to add new tests to appropriate categories

## Adding New Tests

1. Identify the appropriate test category file
2. Add your test using the `test()` function from `test-utils.js`
3. Include both positive and negative (error) test cases
4. Ensure the test file can still run independently
5. Update `run-all-tests.js` if you create a new test file

## Test Categories

Based on the original monolithic test file, tests are organized into these categories:

- **Basic Arithmetic & Literals** - Numbers, addition, subtraction, column references
- **Core Functions** - TODAY(), ME(), DATE() functions
- **Date Arithmetic** - Date + number, date - number, date - date operations
- **Parentheses & Precedence** - Grouping and operator precedence
- **String Functions & Concatenation** - STRING() function and & operator
- **Comments** - Line (//) and block (/* */) comments
- **Multiplication & Division** - * and / operators with precedence
- **NULL Handling** - ISNULL(), NULLVALUE(), ISBLANK(), NULL literal

## Future Test Categories (TODO)

These categories from the original test file still need to be extracted:

- Column References
- Error Handling (Basic)
- Relationships
- IF Function
- Comparison Operators
- Logical Operators
- Boolean Literals
- Text Functions
- Math Functions
- Date Functions 