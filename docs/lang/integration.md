# Compiler Integration Guide

This guide explains how to integrate the metadata-driven function system.

## Using Function Metadata

### Basic Function Validation

```javascript
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
```

### Using Function Constants

Replace magic strings with constants:

```javascript
// Instead of:
if (funcName === 'STRING_AGG') { ... }

// Use:
import { FUNCTIONS } from './function-metadata.js';
if (funcName === FUNCTIONS.STRING_AGG) { ... }
```

### Handling Special Cases

Functions with `requiresSpecialHandling: true` need custom logic:

```javascript
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
```

## Benefits of Metadata-Driven Approach

1. **Single Source of Truth** - Function definitions in one place
2. **Automatic Validation** - Consistent argument checking across all functions
3. **Better Error Messages** - Use parameter names from metadata
4. **Easy Documentation** - Auto-generate docs from metadata
5. **Reduced Duplication** - No magic strings scattered throughout code
6. **Type Safety** - Consistent type checking logic

*Documentation generated on 2025-06-22T21:40:57.303Z*
