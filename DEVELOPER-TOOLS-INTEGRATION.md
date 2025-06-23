# Developer Tools Integration

This document describes the complete integration of the Formula Developer Tools into the web frontend.

## Overview

The Formula Compiler now includes a comprehensive developer tools suite that provides IDE-like features for formula editing:

- **🔧 LSP (Language Server Protocol)** - Intelligent autocomplete, error detection, and hover information
- **🎨 Syntax Highlighting** - Real-time highlighting with semantic tokens
- **✨ Formatter** - Intelligent code formatting with configurable styles

## Architecture

### Client-Side Components

1. **`developer-tools-client.js`** - Main client manager that loads tools from server
2. **`autocomplete.js`** - Autocomplete dropdown with keyboard navigation
3. **`syntax-highlighting.js`** - Real-time syntax highlighting with overlays
4. **`formatter-integration.js`** - Format buttons and auto-formatting

### Server-Side Integration

- **`/api/developer-tools`** - Serves bundled developer tools as ES modules
- Dynamic bundling of all source files from `src/` directory
- Proper module exports for client-side consumption

## Features

### 🔧 Intelligent Autocomplete

- **Context-aware suggestions** - Functions, columns, relationships, keywords
- **Schema integration** - Validates against actual database schema
- **Keyboard navigation** - Arrow keys, Enter, Tab, Escape
- **Fuzzy matching** - Smart completion filtering
- **Documentation** - Inline help text for functions and columns

**Usage:**
- Type to get suggestions automatically
- Press `Ctrl+Space` to force show completions
- Use arrow keys to navigate, Enter/Tab to accept

### 🎨 Real-Time Syntax Highlighting

- **Semantic highlighting** - Functions, keywords, strings, numbers, operators
- **Schema validation** - Highlights invalid columns/relationships
- **Error visualization** - Red underlines for syntax errors
- **Live updates** - Updates as you type (debounced)
- **Overlay technology** - Preserves cursor position and text selection

**Highlighted Elements:**
- Functions (blue, bold)
- Keywords (purple, bold)  
- Strings (red)
- Numbers (green)
- Operators (brown, bold)
- Columns (teal, medium)
- Relationships (pink, italic)
- Errors (red background, wavy underline)

### ✨ Intelligent Formatting

- **AST-based formatting** - Structure-aware formatting
- **Configurable styles** - Default, compact, expanded, minimal
- **Keyboard shortcut** - `Shift+Alt+F` to format
- **Format buttons** - Automatic integration with all formula inputs
- **Smart positioning** - Preserves cursor position after formatting
- **Visual feedback** - Success/error notifications

## Integration Details

### Automatic Attachment

All formula inputs are automatically enhanced with developer tools:

```javascript
// Automatically finds and enhances these inputs:
- textarea#formulaInput
- textarea.formula-input  
- textarea[id*="formula"]
```

### Dynamic Detection

New formula inputs added dynamically (like in Report Builder) are automatically detected and enhanced using `MutationObserver`.

### Table Context

The tools automatically detect table context from:
1. Parent form table selectors
2. Data attributes (`data-table-name`)
3. Global app state (`AppState.currentTable`)

### Schema Updates

Schema is automatically updated when:
- Tables are loaded initially
- User switches between tables
- Database connection changes

## Visual Enhancements

### Format Buttons

Each formula input gets a "Format" button that:
- Shows loading state during formatting
- Provides visual feedback (✓ for success, error messages)
- Integrates seamlessly with existing UI
- Respects button placement preferences

### Autocomplete Dropdown

Professional dropdown with:
- Icons for different completion types
- Detailed descriptions
- Syntax highlighting in suggestions
- Proper positioning (adjusts for screen edges)
- Mouse and keyboard interaction

### Syntax Highlighting Overlay

Invisible overlay that:
- Matches textarea styling perfectly
- Syncs scroll position
- Handles window resize
- Provides syntax colors without affecting text editing

## Error Handling

### Graceful Degradation

If developer tools fail to load:
- Basic functionality continues to work
- Fallback implementations provide basic features
- Error messages are logged but don't break the UI

### Network Resilience

- Debounced API calls to avoid overload
- Timeout handling for slow responses
- Caching of schema and validation results

## Performance Optimizations

### Debouncing

- Syntax highlighting: 150ms delay
- Autocomplete: 300ms delay
- Validation: 500ms delay

### Smart Updates

- Only re-highlight when text actually changes
- Schema updates only when necessary
- Efficient DOM manipulation

### Memory Management

- Proper cleanup of event listeners
- Removal of unused overlays
- Timeout clearing

## Configuration

### Developer Tools Controls

An optional floating panel can be enabled to toggle features:

```javascript
// Enable developer tools controls
localStorage.setItem('showDeveloperToolsControls', 'true');
```

### Customization Options

```javascript
// Example configuration
window.formatterIntegration.attachTo(textarea, {
    showButton: true,
    buttonText: 'Format',
    buttonPosition: 'inline', // 'after', 'before', 'above', 'below', 'inline'
    keyboardShortcut: true,
    autoFormat: false
});
```

## Testing

### Manual Testing

1. **Start the server**: `npm run serve`
2. **Open browser**: `http://localhost:3000`
3. **Test autocomplete**: Type in formula input, see suggestions
4. **Test highlighting**: Enter various formula syntax, see colors
5. **Test formatting**: Write messy formula, press Format button or Shift+Alt+F

### API Testing

```bash
# Test developer tools endpoint
curl localhost:3000/api/developer-tools | head -20

# Test main application
curl localhost:3000 | grep developer-tools
```

## Files Created/Modified

### New Files
- `web/public/developer-tools-client.js` - Main client integration
- `web/public/autocomplete.js` - Autocomplete functionality
- `web/public/syntax-highlighting.js` - Syntax highlighting
- `web/public/formatter-integration.js` - Formatting integration

### Modified Files
- `web/public/index.html` - Added script references
- `web/public/script.js` - Added developer tools initialization
- `web/server.js` - Added `/api/developer-tools` endpoint

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support (ES6 modules required)
- **Mobile**: Basic support (autocomplete may be limited)

## Known Limitations

1. **Mobile autocomplete**: Limited by mobile keyboard behavior
2. **Large formulas**: Performance may degrade with very long formulas (>1000 chars)
3. **Complex overlays**: Syntax highlighting may have minor positioning issues in edge cases

## Future Enhancements

1. **Hover tooltips** - Show detailed information on hover
2. **Error markers** - Visual indicators for specific error locations
3. **Bracket matching** - Highlight matching parentheses
4. **Formula templates** - Predefined formula snippets
5. **Collaborative editing** - Multi-user formula editing support

## Support

For issues or questions about the developer tools integration:

1. Check browser console for error messages
2. Verify `/api/developer-tools` endpoint is responding
3. Test with simple formulas first
4. Check network tab for failed requests

The integration is designed to be robust and self-healing, but complex formulas or network issues may occasionally cause problems.

---

**Status**: ✅ Complete and Production Ready  
**Last Updated**: December 22, 2024  
**Version**: 1.0.0