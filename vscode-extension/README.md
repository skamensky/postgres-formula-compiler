# Formula Language Support

VSCode syntax highlighting extension for Formula language files (.formula).

## Features

- Syntax highlighting for Formula language
- Function name highlighting
- String, number, and operator highlighting  
- Comment support (// and /* */)
- Basic bracket matching and auto-closing
- Indentation support

## Installation

1. Copy the `vscode-extension` folder to your local VSCode extensions directory
2. Reload VSCode
3. Open any `.formula` file to see syntax highlighting

## Supported File Extensions

- `.formula`

## Grammar Features

- **Functions**: All built-in functions (TODAY, STRING, IF, etc.)
- **Literals**: Numbers, strings, booleans (TRUE/FALSE/NULL)
- **Operators**: Arithmetic (+, -, *, /), comparison (>, <, =, etc.), concatenation (&)
- **Comments**: Line comments (//) and block comments (/* */)
- **Punctuation**: Parentheses, commas, dots for relationship access

## Generated Files

This extension is auto-generated from the Formula compiler's lexer metadata.
To regenerate, run:

```bash
npm run generate-vscode-extension
```
