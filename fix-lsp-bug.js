const fs = require('fs');

// Read the LSP file
const lspContent = fs.readFileSync('web/public/lsp.js', 'utf8');

// Find and replace the buggy line
const fixedContent = lspContent.replace(
  'if (!relationships) return [];',
  'if (!relationships) return null;'
);

// Write back the fixed content
fs.writeFileSync('web/public/lsp.js', fixedContent);

console.log('✅ Fixed LSP bug: changed empty array return to null');
