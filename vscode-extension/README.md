# Formula Language Support for VSCode

Syntax highlighting support for Formula language files (`.formula` extension).

## Features

✨ **Comprehensive Syntax Highlighting** for Formula language with distinct colors for:

### Function Categories
- **Core Functions**: `TODAY()`, `ME()`, `DATE()`, `STRING()`, `IF()`
- **String Functions**: `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, `LEFT()`, `RIGHT()`, `MID()`, `CONTAINS()`, `SUBSTITUTE()`
- **Null Handling**: `ISNULL()`, `NULLVALUE()`, `ISBLANK()`
- **Logical Functions**: `AND()`, `OR()`, `NOT()`
- **Math Functions**: `ABS()`, `ROUND()`, `MIN()`, `MAX()`, `MOD()`, `CEILING()`, `FLOOR()`
- **Date Functions**: `YEAR()`, `MONTH()`, `DAY()`, `WEEKDAY()`, `ADDMONTHS()`, `ADDDAYS()`, `DATEDIF()`
- **Aggregate Functions**: `STRING_AGG()`, `SUM_AGG()`, `COUNT_AGG()`, `AVG_AGG()`, `MIN_AGG()`, `MAX_AGG()`, etc.

### Language Elements
- **String Literals**: `"text values"`
- **Numbers**: `123`, `45.67`
- **Boolean Values**: `TRUE`, `FALSE`
- **NULL Value**: `NULL`
- **Operators**: `+`, `-`, `*`, `/`, `&`, `=`, `<`, `>`, `<=`, `>=`, `!=`, `<>`
- **Column References**: `column_name`
- **Relationship References**: `table_rel.field_name`
- **Comments**: `// line comments` and `/* block comments */`

### Editor Features
- **Bracket Matching**: Automatic parentheses matching
- **Auto-closing Pairs**: Parentheses and quotes
- **Comment Toggle**: Support for line and block comments
- **Basic Indentation**: Smart indentation for function calls

## Color Themes

The extension includes two optimized color themes:

- **Formula Dark**: Dark theme with vibrant function colors
- **Formula Light**: Light theme with clear contrast

## Usage

1. Create a new file with `.formula` extension
2. Start writing Formula language code
3. Enjoy syntax highlighting!

### Example Formula

```formula
// Calculate business metrics with relationship data
IF(
  amount > 1000,
  "High Value: " & merchant_rel.business_name & " - $" & STRING(amount),
  "Standard: " & UPPER(LEFT(merchant_rel.business_name, 10))
) & 
" | Reps: " & STRING_AGG(rep_links_submission, rep_rel.name, ", ") &
" | Total Commission: " & STRING(SUM_AGG(rep_links_submission, commission_percentage))
```

## Installation

This extension is for local development use only.

### Automatic Installation
```bash
npm run install-vscode-extension
```

### Manual Installation
1. Run `npm run vscode-extension` to generate the grammar
2. Copy the `vscode-extension` folder to your VSCode extensions directory:
   - **macOS/Linux**: `~/.vscode/extensions/`
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`
3. Restart VSCode

## Development

The syntax highlighting grammar is auto-generated from the Formula compiler's lexer token definitions. To update:

1. Modify token definitions in `formula-compiler.js`
2. Run `npm run vscode-extension` to regenerate the grammar
3. Reinstall the extension

## File Association

The extension automatically provides syntax highlighting for files with the `.formula` extension.

## Contributing

This extension is part of the Formula Language project and is auto-generated from the compiler codebase to ensure consistency between the language implementation and editor support.

---

**Note**: This extension provides syntax highlighting only. For full language server features (autocomplete, error checking, etc.), see the Formula Language Server Protocol implementation (future feature).