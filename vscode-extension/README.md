# Formula Language Support for VSCode

This VSCode extension provides syntax highlighting for JavaScript-to-SQL Formula Language (`.formula` files).

## Features

- **Syntax Highlighting** - Color-coded syntax for formula language elements:
  - Built-in functions (TODAY, ME, STRING_AGG, etc.)
  - Boolean/null literals (TRUE, FALSE, NULL)
  - String literals
  - Numeric literals
  - Operators (arithmetic, comparison, string concatenation)
  - Comments (line and block)
  - Column references and identifiers

- **Language Configuration** - Basic language support:
  - Comment toggle (Ctrl+/)
  - Auto-closing brackets and quotes
  - Bracket matching

## Supported Functions

The extension recognizes these built-in functions:

### Core Functions
- `TODAY()`, `ME()`, `DATE()`, `STRING()`, `IF()`

### Null Handling
- `ISNULL()`, `NULLVALUE()`, `ISBLANK()`

### Logical Functions  
- `AND()`, `OR()`, `NOT()`

### Math Functions
- `ABS()`, `ROUND()`, `MIN()`, `MAX()`, `MOD()`, `CEILING()`, `FLOOR()`

### Text Functions
- `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, `LEFT()`, `RIGHT()`, `MID()`, `CONTAINS()`, `SUBSTITUTE()`

### Date Functions
- `YEAR()`, `MONTH()`, `DAY()`, `WEEKDAY()`, `ADDMONTHS()`, `ADDDAYS()`, `DATEDIF()`

### Aggregate Functions
- `STRING_AGG()`, `STRING_AGG_DISTINCT()`, `SUM_AGG()`, `COUNT_AGG()`, `AVG_AGG()`, `MIN_AGG()`, `MAX_AGG()`, `AND_AGG()`, `OR_AGG()`

## Installation

### Local Development Installation

1. Open the VSCode extension directory:
   ```bash
   cd vscode-extension
   ```

2. Generate the TextMate grammar (if not already generated):
   ```bash
   npm run generate-grammar
   ```

3. Install the extension locally:
   ```bash
   # Copy the extension to VSCode extensions directory
   # On macOS/Linux:
   cp -r . ~/.vscode/extensions/formula-language-support-1.0.0/
   
   # On Windows:
   # xcopy . "%USERPROFILE%\.vscode\extensions\formula-language-support-1.0.0\" /E /I
   ```

4. Restart VSCode

5. Open any `.formula` file to see syntax highlighting in action!

## Usage

1. Create or open a `.formula` file
2. Write formula expressions using the supported syntax
3. Enjoy syntax highlighting!

### Example Formula

```formula
// Calculate business summary with rep information
merchant_rel.business_name & " - $" & STRING(ROUND(amount, 2)) & 
" - Commission: " & STRING_AGG(rep_links_submission, STRING(commission_percentage) & "%", ", ")
```

## Grammar Generation

The syntax highlighting grammar is auto-generated from the lexer token definitions in the main project. To regenerate:

```bash
npm run generate-grammar
```

This keeps the syntax highlighting in sync with the actual formula language lexer.

## Development

The extension is structured as follows:

- `package.json` - Extension manifest
- `language-configuration.json` - Language configuration (comments, brackets, etc.)
- `syntaxes/formula.tmGrammar.json` - TextMate grammar (auto-generated)
- `extension.js` - Extension activation code
- `README.md` - This file

## Limitations

- **Syntax highlighting only** - No semantic analysis or error checking
- **Local installation only** - Not published to VS Code Marketplace
- **Basic language features** - No IntelliSense, go-to-definition, or other advanced features

## Future Enhancements

For advanced features like IntelliSense and error checking, consider implementing a Language Server Protocol (LSP) extension (see TODO.md in the main project).