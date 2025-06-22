#!/usr/bin/env node

/**
 * Documentation Generator
 * Auto-generates comprehensive documentation from function metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  FUNCTION_METADATA, 
  CATEGORIES, 
  FUNCTIONS
} from '../src/function-metadata.js';
import { TYPE, typeToString } from '../src/types-unified.js';

// Create TYPES mapping for backward compatibility
const TYPES = {
  STRING: typeToString(TYPE.STRING),
  NUMBER: typeToString(TYPE.NUMBER),
  BOOLEAN: typeToString(TYPE.BOOLEAN),
  DATE: typeToString(TYPE.DATE),
  NULL: typeToString(TYPE.NULL)
};

// Build FUNCTION_CATEGORIES from metadata
const FUNCTION_CATEGORIES = {};
Object.values(FUNCTION_METADATA).forEach(metadata => {
  const category = metadata.category.toLowerCase().replace(/\s+/g, '-');
  if (!FUNCTION_CATEGORIES[category]) {
    FUNCTION_CATEGORIES[category] = [];
  }
  FUNCTION_CATEGORIES[category].push(metadata.name);
});

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Documentation directories
const docsDir = path.join(rootDir, 'docs');
const usageDir = path.join(docsDir, 'usage');
const langDir = path.join(docsDir, 'lang');

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Convert type symbol to linked type name for documentation
 */
function formatTypeLink(typeSymbol, isUsageDoc = true) {
  const typeString = typeToString(typeSymbol);
  
  if (isUsageDoc) {
    // Link to types documentation with proper anchor formatting
    const anchor = typeString.toLowerCase().replace(/\s+/g, '_');
    return `[${typeString}](../types.md#${anchor})`;
  } else {
    // Just return the type string for language docs
    return typeString;
  }
}

/**
 * Generate function signature from metadata
 */
function generateSignature(metadata) {
  if (metadata.arguments.length === 0) {
    return `${metadata.name}()`;
  }
  
  const args = metadata.arguments.map(arg => {
    let argStr = arg.name;
    if (arg.optional) {
      argStr = `[${argStr}]`;
    }
    if (arg.variadic) {
      argStr = `${argStr}...`;
    }
    return argStr;
  });
  
  return `${metadata.name}(${args.join(', ')})`;
}

/**
 * Generate usage documentation for functions
 */
function generateUsageDocs() {
  ensureDir(usageDir);
  
  // Generate overview/index
  const overviewContent = `# Formula Language Reference

Welcome to the Formula Language Reference! This documentation is automatically generated from the compiler metadata to ensure accuracy and completeness.

## Quick Navigation

- [Functions by Category](#functions-by-category)
- [All Functions A-Z](#all-functions-a-z)
- [Data Types](./types.md) - Complete type reference
- [Operators](#operators)

## Functions by Category

${Object.entries(FUNCTION_CATEGORIES).map(([category, functions]) => `
### ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Functions

${functions.map(funcName => {
  const metadata = FUNCTION_METADATA[funcName];
  return `- [\`${generateSignature(metadata)}\`](./functions/${category}.md#${funcName.toLowerCase()}) - ${metadata.description}`;
}).join('\n')}
`).join('\n')}

## All Functions A-Z

${Object.keys(FUNCTION_METADATA).sort().map(funcName => {
  const metadata = FUNCTION_METADATA[funcName];
  return `- [\`${generateSignature(metadata)}\`](./functions/${metadata.category}.md#${funcName.toLowerCase()}) - ${metadata.description}`;
}).join('\n')}

## Data Types

The formula language supports several data types including basic types (string, number, boolean, date, null) and special types (expression, inverse_relationship).

📖 **[Complete Data Types Reference](./types.md)** - Detailed information about all types, their operations, conversions, and compatibility rules.

## Operators

### Arithmetic Operators
- \`+\` - Addition (numbers) or date arithmetic
- \`-\` - Subtraction (numbers) or date arithmetic  
- \`*\` - Multiplication
- \`/\` - Division

### String Operators
- \`&\` - String concatenation (both sides must be strings)

### Comparison Operators
- \`=\` - Equal to
- \`!=\` or \`<>\` - Not equal to
- \`>\` - Greater than
- \`>=\` - Greater than or equal to
- \`<\` - Less than
- \`<=\` - Less than or equal to

### Logical Functions
Logical operations are implemented as functions rather than operators:
- \`AND(condition1, condition2, ...)\` - All conditions must be true
- \`OR(condition1, condition2, ...)\` - Any condition must be true
- \`NOT(condition)\` - Negates the condition

*Documentation generated on ${new Date().toISOString()}*
`;

  fs.writeFileSync(path.join(usageDir, 'README.md'), overviewContent);
  
  // Generate category-specific function documentation
  const functionsDir = path.join(usageDir, 'functions');
  ensureDir(functionsDir);
  
  Object.entries(FUNCTION_CATEGORIES).forEach(([category, functions]) => {
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
    
    const categoryContent = `# ${categoryTitle} Functions

${functions.map(funcName => {
  const metadata = FUNCTION_METADATA[funcName];
  
  return `
## ${funcName}

**Signature:** \`${generateSignature(metadata)}\`  
**Returns:** ${formatTypeLink(metadata.returnType)}  
**Description:** ${metadata.description}

${metadata.arguments.length > 0 ? `**Arguments:**
${metadata.arguments.map(arg => `- \`${arg.name}\` (${formatTypeLink(arg.type)}): ${arg.description}${arg.optional ? ' *(optional)*' : ''}${arg.variadic ? ' *(variadic)*' : ''}`).join('\n')}
` : '**Arguments:** None\n'}
**Test References:** ${metadata.testRefs ? metadata.testRefs.map(ref => `[${ref}](../../${ref})`).join(', ') : 'Not specified'}

**Example Usage:**
\`\`\`
// TODO: Add usage examples from test files
\`\`\`
`;
}).join('\n---\n')}

*Documentation generated on ${new Date().toISOString()}*
`;
    
    fs.writeFileSync(path.join(functionsDir, `${category}.md`), categoryContent);
  });
}

/**
 * Generate language/technical documentation
 */
function generateLangDocs() {
  ensureDir(langDir);
  
  // Generate metadata overview
  const metadataContent = `# Function Metadata Reference

This documentation shows the internal structure of function metadata used by the compiler.

## Metadata Structure

Each function is defined with the following metadata:

\`\`\`javascript
{
  name: string,              // Function name constant
  category: string,          // Function category
  description: string,       // Human-readable description
  arguments: Array<{         // Argument specifications
    name: string,            // Argument name
    type: string,            // Expected type
    description: string,     // Argument description
    optional?: boolean,      // Whether argument is optional
    variadic?: boolean       // Whether argument accepts multiple values
  }>,
  returnType: string,        // Return type
  testRefs: Array<string>,   // Test file references
  requiresSpecialHandling: boolean, // Whether function has custom logic
  minArgs?: number,          // Minimum argument count (for variadic)
  maxArgs?: number|null      // Maximum argument count (null = unlimited)
}
\`\`\`

## Type Constants

\`\`\`javascript
${Object.entries(TYPES).map(([key, value]) => `${key}: '${value}'`).join('\n')}
\`\`\`

## Function Constants

\`\`\`javascript
${Object.entries(FUNCTIONS).map(([key, value]) => `${key}: '${value}'`).join('\n')}
\`\`\`

## Category Constants

\`\`\`javascript
${Object.entries(CATEGORIES).map(([key, value]) => `${key}: '${value}'`).join('\n')}
\`\`\`

## Complete Function Metadata

\`\`\`javascript
${JSON.stringify(FUNCTION_METADATA, null, 2)}
\`\`\`

*Documentation generated on ${new Date().toISOString()}*
`;

  fs.writeFileSync(path.join(langDir, 'metadata.md'), metadataContent);
  
  // Generate compiler integration guide
  const integrationContent = `# Compiler Integration Guide

This guide explains how to integrate the metadata-driven function system.

## Using Function Metadata

### Basic Function Validation

\`\`\`javascript
import { validateFunctionArgs, FUNCTIONS } from './function-metadata.js';

// In your function compilation logic:
export function compileMyFunction(compiler, node) {
  const funcName = node.name;
  
  // Compile arguments first
  const compiledArgs = node.args.map(arg => compiler.compile(arg));
  
  // Validate using metadata
  const { metadata, validatedArgs } = validateFunctionArgs(funcName, compiledArgs, compiler, node);
  
  // Function is valid, proceed with compilation
  return {
    type: 'FUNCTION_CALL',
    semanticId: compiler.generateSemanticId('function', funcName, validatedArgs.map(a => a.semanticId)),
    dependentJoins: validatedArgs.flatMap(a => a.dependentJoins),
    returnType: metadata.returnType,
    compilationContext: compiler.compilationContext,
    value: { name: funcName },
    children: validatedArgs
  };
}
\`\`\`

### Using Function Constants

Replace magic strings with constants:

\`\`\`javascript
// Instead of:
if (funcName === 'STRING_AGG') { ... }

// Use:
import { FUNCTIONS } from './function-metadata.js';
if (funcName === FUNCTIONS.STRING_AGG) { ... }
\`\`\`

### Handling Special Cases

Functions with \`requiresSpecialHandling: true\` need custom logic:

\`\`\`javascript
import { getFunctionMetadata, FUNCTIONS } from './function-metadata.js';

export function compileFunction(compiler, node) {
  const metadata = getFunctionMetadata(node.name);
  
  if (metadata.requiresSpecialHandling) {
    // Custom logic for complex functions like IF, DATEDIF, etc.
    switch (node.name) {
      case FUNCTIONS.IF:
        return compileIfFunction(compiler, node);
      case FUNCTIONS.DATEDIF:
        return compileDateDifFunction(compiler, node);
      // ... other special cases
    }
  } else {
    // Standard metadata-driven compilation
    return compileStandardFunction(compiler, node);
  }
}
\`\`\`

## Benefits of Metadata-Driven Approach

1. **Single Source of Truth** - Function definitions in one place
2. **Automatic Validation** - Consistent argument checking across all functions
3. **Better Error Messages** - Use parameter names from metadata
4. **Easy Documentation** - Auto-generate docs from metadata
5. **Reduced Duplication** - No magic strings scattered throughout code
6. **Type Safety** - Consistent type checking logic

*Documentation generated on ${new Date().toISOString()}*
`;

  fs.writeFileSync(path.join(langDir, 'integration.md'), integrationContent);
}

/**
 * Main documentation generation
 */
function main() {
  console.log('🏗️  Generating Formula Language Documentation...');
  
  try {
    generateUsageDocs();
    console.log('✅ Generated usage documentation');
    
    generateLangDocs();
    console.log('✅ Generated language/technical documentation');
    
    console.log(`\n📚 Documentation generated successfully!`);
    console.log(`   Usage docs: ${usageDir}`);
    console.log(`   Language docs: ${langDir}`);
    
  } catch (error) {
    console.error('❌ Documentation generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as generateDocs };