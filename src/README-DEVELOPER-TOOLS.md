# Formula Language Developer Tools

A comprehensive suite of developer tools for the Formula Language, providing LSP functionality, syntax highlighting, and code formatting.

## Overview

The developer tools consist of three main components:

1. **LSP (Language Server Protocol)** - Provides autocomplete, error detection, and contextual help
2. **Syntax Highlighter** - Token-based highlighting with semantic information
3. **Formatter** - Opinionated, idempotent code formatting

## Quick Start

```javascript
import { createDeveloperTools } from './developer-tools.js';

// Create tools with default configuration
const tools = createDeveloperTools('default');

// Or with database schema for enhanced features
const tools = createDeveloperTools('default', databaseSchema);

// Format code
const formatted = tools.format('IF(amount>100000,"High","Low")');
// Result: 'IF(AMOUNT > 100000, "High", "Low")'

// Get syntax highlighting tokens
const tokens = tools.highlight('SUM(amount, 100)');
// Returns array of semantic tokens with positions and metadata

// Get diagnostics (errors/warnings)
const diagnostics = tools.getDiagnostics('INVALID_FUNC(test)');
// Returns array of diagnostic messages

// Get autocomplete suggestions
const completions = tools.getCompletions('SUM(', 4, 'tableName');
// Returns array of completion suggestions
```

## Components

### 1. Language Server Protocol (LSP)

The LSP provides intelligent code assistance:

#### Features
- **Autocomplete**: Function names, column names, relationships, keywords
- **Error Detection**: Syntax errors, unknown functions, invalid relationships
- **Hover Information**: Function documentation, column types, relationship info
- **Context Analysis**: Understands cursor position and expected input

#### Usage
```javascript
import { FormulaLanguageServer } from './lsp.js';

const lsp = new FormulaLanguageServer(databaseSchema);

// Get completions at cursor position
const completions = lsp.getCompletions(text, cursorPosition, tableName);

// Get diagnostics
const diagnostics = lsp.getDiagnostics(text, tableName);

// Get hover information
const hover = lsp.getHover(text, position);
```

#### Completion Types
- `function`: Built-in functions (IF, SUM, COUNT, etc.)
- `field`: Table columns
- `relationship`: Table relationships (ending with _REL)
- `keyword`: Language keywords (TRUE, FALSE, NULL, AND, OR, NOT)
- `operator`: Operators (+, -, *, /, >, <, =, etc.)

### 2. Syntax Highlighter

Provides rich syntax highlighting with semantic information:

#### Features
- **Token Classification**: Functions, keywords, strings, numbers, operators
- **Schema Integration**: Validates columns and relationships
- **Parentheses Matching**: Tracks matching brackets
- **Error Highlighting**: Visual indication of syntax errors
- **HTML Generation**: Creates highlighted HTML output

#### Usage
```javascript
import { FormulaSyntaxHighlighter } from './syntax-highlighter.js';

const highlighter = new FormulaSyntaxHighlighter();
highlighter.updateSchema(databaseSchema);

// Get highlighted tokens
const tokens = highlighter.highlight(text, tableName);

// Generate HTML
const html = highlighter.toHTML(text, tableName);

// Get bracket pairs
const brackets = highlighter.getBracketPairs(text, tableName);
```

#### Token Types
- `function`: Built-in functions
- `keyword`: Language keywords
- `number`: Numeric literals
- `string`: String literals
- `operator`: Mathematical and logical operators
- `punctuation`: Parentheses, commas, dots
- `column`: Database columns (when schema provided)
- `relationship`: Table relationships
- `literal`: Boolean and null literals
- `error`: Invalid syntax

### 3. Formatter

Provides consistent, opinionated code formatting:

#### Features
- **AST-Based Formatting**: Uses parser for intelligent formatting
- **Configurable Options**: Spacing, case, line breaks
- **Idempotent**: Multiple format passes produce same result
- **Fallback Mode**: Token-level formatting when parsing fails
- **Multiple Styles**: Predefined formatting presets

#### Usage
```javascript
import { FormulaFormatter } from './formatter.js';

const formatter = new FormulaFormatter();

// Format with default options
const formatted = formatter.format(text);

// Check if already formatted
const isFormatted = formatter.isFormatted(text);

// Format with custom options
const customFormatted = formatter.formatWith(text, {
  spaceAroundOperators: false,
  uppercaseFunctions: false
});
```

#### Formatting Options
```javascript
{
  indentSize: 2,                    // Spaces per indent level
  maxLineLength: 100,               // Maximum line length
  spaceAroundOperators: true,       // Space around +, -, etc.
  spaceAfterCommas: true,           // Space after commas
  spaceInsideParentheses: false,    // Space inside ()
  uppercaseFunctions: true,         // Uppercase function names
  uppercaseKeywords: true,          // Uppercase keywords
  breakLongExpressions: true        // Break long expressions
}
```

## Integration Examples

### Web Interface Integration

```javascript
// Initialize tools
const tools = createDeveloperTools('default', schema);

// Real-time validation as user types
textarea.addEventListener('input', () => {
  const diagnostics = tools.getDiagnostics(textarea.value, currentTable);
  displayDiagnostics(diagnostics);
});

// Format button
formatButton.addEventListener('click', () => {
  textarea.value = tools.format(textarea.value);
});

// Autocomplete on Ctrl+Space
textarea.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.code === 'Space') {
    const completions = tools.getCompletions(
      textarea.value, 
      textarea.selectionStart, 
      currentTable
    );
    showCompletions(completions);
  }
});
```

### Syntax Highlighting Display

```javascript
// Generate highlighted HTML
const result = tools.createFormattedHighlight(formula, tableName, true);

// Display in read-only element
syntaxDisplay.innerHTML = result.html;

// Add CSS classes for styling
syntaxDisplay.classList.add('formula-highlighted');
```

### Error Display

```javascript
const analysis = tools.analyze(formula, tableName);

if (analysis.hasErrors) {
  errorPanel.innerHTML = analysis.diagnostics
    .filter(d => d.severity === 'error')
    .map(d => `<div class="error">${d.message}</div>`)
    .join('');
}
```

## Configuration

### Preset Styles

```javascript
// Available presets: 'default', 'compact', 'expanded', 'minimal'
const tools = createDeveloperTools('compact', schema);

// Or customize manually
const tools = new FormulaDeveloperTools({
  schema: mySchema,
  formatting: {
    spaceAroundOperators: false,
    maxLineLength: 80
  },
  theme: customHighlightTheme
});
```

### Custom Themes

```javascript
const customTheme = {
  'function': 'my-function-class',
  'keyword': 'my-keyword-class',
  'string': 'my-string-class',
  // ... other token types
};

tools.setHighlightingTheme(customTheme);
```

## Schema Integration

For enhanced functionality, provide a database schema:

```javascript
const schema = {
  tableName: {
    columns: [
      { column_name: 'id', data_type: 'integer' },
      { column_name: 'name', data_type: 'varchar' }
    ],
    directRelationships: [
      { 
        relationship_name: 'orders', 
        target_table_name: 'order' 
      }
    ]
  }
};

tools.updateSchema(schema);
```

## CSS Styling

Include the default CSS for syntax highlighting:

```javascript
// Get the default CSS
const css = tools.generateHighlightCSS();

// Add to page
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
```

Or customize your own styles:

```css
.formula-function { color: #0066cc; font-weight: bold; }
.formula-keyword { color: #7c3aed; font-weight: bold; }
.formula-string { color: #dc2626; }
.formula-number { color: #059669; }
.formula-error { 
  color: #dc2626; 
  background: #fef2f2; 
  text-decoration: underline wavy #dc2626; 
}
```

## Performance Notes

- **LSP**: Optimized for real-time usage with 500ms debouncing
- **Highlighting**: Fast token-based approach, suitable for live updates
- **Formatting**: AST-based with fallback, may be slower on very large formulas
- **Schema**: Keep schema objects lightweight for better performance

## Error Handling

All tools gracefully handle errors:

```javascript
// Formatter falls back to token-level on parse errors
const formatted = tools.format(invalidSyntax); // Still attempts formatting

// Highlighter marks errors visually
const tokens = tools.highlight(invalidSyntax); // Includes error tokens

// LSP provides detailed error information
const diagnostics = tools.getDiagnostics(invalidSyntax); // Error details
```

## Future Enhancements

This is a primitive foundation that will be expanded with:

- **Full LSP Server**: WebSocket-based language server
- **Advanced IntelliSense**: Parameter hints, signature help
- **Refactoring Tools**: Rename symbols, extract expressions
- **Code Lens**: Inline evaluation results
- **Debugging Support**: Step-through evaluation
- **Plugin Architecture**: Custom function libraries
- **Performance Optimization**: Incremental parsing, caching
- **Advanced Formatting**: Custom rules, team presets

## Testing

Run the demo to see all features in action:

```javascript
import { runDemo } from './developer-tools-demo.js';
runDemo();
```

This will demonstrate:
- LSP completions and diagnostics
- Syntax highlighting tokens
- Formatting with different styles  
- Combined analysis features
- Configuration options