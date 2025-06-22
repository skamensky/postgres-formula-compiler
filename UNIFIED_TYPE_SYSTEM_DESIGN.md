# Unified Type System Design

## Current State Problem

We have 3 different type systems that represent overlapping concepts:

```javascript
// 1. Metadata types (our system)
TYPES.STRING = 'string'
TYPES.NUMBER = 'number'
TYPES.STRING_LITERAL = 'string_literal'

// 2. AST node types (parser)
arg.type === 'STRING_LITERAL'
arg.type === 'IDENTIFIER'
arg.type === 'FUNCTION_CALL'

// 3. Return types (type inference)
arg.returnType === 'string'
arg.returnType === 'number'
arg.returnType === 'boolean'
```

## Proposed Unified System

### Single Type Hierarchy Using Symbols

```javascript
// Core unified type system
export const TYPE = {
  // Literal/AST node types
  STRING_LITERAL: Symbol('STRING_LITERAL'),
  NUMBER_LITERAL: Symbol('NUMBER_LITERAL'),
  BOOLEAN_LITERAL: Symbol('BOOLEAN_LITERAL'),
  DATE_LITERAL: Symbol('DATE_LITERAL'),
  NULL_LITERAL: Symbol('NULL_LITERAL'),
  
  // AST structural types
  IDENTIFIER: Symbol('IDENTIFIER'),
  FUNCTION_CALL: Symbol('FUNCTION_CALL'),
  BINARY_OP: Symbol('BINARY_OP'),
  UNARY_OP: Symbol('UNARY_OP'),
  RELATIONSHIP_REF: Symbol('RELATIONSHIP_REF'),
  
  // Value types (for type inference)
  STRING: Symbol('STRING'),
  NUMBER: Symbol('NUMBER'),
  BOOLEAN: Symbol('BOOLEAN'),
  DATE: Symbol('DATE'),
  NULL: Symbol('NULL'),
  
  // Special metadata types
  EXPRESSION: Symbol('EXPRESSION'),
  INVERSE_RELATIONSHIP: Symbol('INVERSE_RELATIONSHIP')
};

// Type categories for easier grouping
export const TYPE_CATEGORY = {
  LITERAL: new Set([TYPE.STRING_LITERAL, TYPE.NUMBER_LITERAL, TYPE.BOOLEAN_LITERAL, TYPE.DATE_LITERAL, TYPE.NULL_LITERAL]),
  AST_NODE: new Set([TYPE.IDENTIFIER, TYPE.FUNCTION_CALL, TYPE.BINARY_OP, TYPE.UNARY_OP, TYPE.RELATIONSHIP_REF]),
  VALUE: new Set([TYPE.STRING, TYPE.NUMBER, TYPE.BOOLEAN, TYPE.DATE, TYPE.NULL]),
  METADATA: new Set([TYPE.EXPRESSION, TYPE.INVERSE_RELATIONSHIP])
};

// Helper functions
export function isLiteralType(type) {
  return TYPE_CATEGORY.LITERAL.has(type);
}

export function isValueType(type) {
  return TYPE_CATEGORY.VALUE.has(type);
}

export function getValueTypeForLiteral(literalType) {
  const mapping = {
    [TYPE.STRING_LITERAL]: TYPE.STRING,
    [TYPE.NUMBER_LITERAL]: TYPE.NUMBER,
    [TYPE.BOOLEAN_LITERAL]: TYPE.BOOLEAN,
    [TYPE.DATE_LITERAL]: TYPE.DATE,
    [TYPE.NULL_LITERAL]: TYPE.NULL
  };
  return mapping[literalType];
}
```

### Benefits of Symbol-Based System

1. **Performance**: Symbol comparison is faster than string comparison
2. **Type Safety**: Can't accidentally typo a symbol (runtime error)
3. **Immutable**: Symbols can't be modified
4. **Debuggable**: Symbols show up clearly in debugger
5. **Unique**: No chance of name collisions

### Backward Compatibility Layer

```javascript
// Legacy string mappings for gradual migration
export const LEGACY_STRINGS = {
  [TYPE.STRING_LITERAL]: 'STRING_LITERAL',
  [TYPE.STRING]: 'string',
  [TYPE.NUMBER]: 'number',
  // ... etc
};

export function toLegacyString(type) {
  return LEGACY_STRINGS[type] || type.toString();
}

export function fromLegacyString(str) {
  const reverseMap = Object.fromEntries(
    Object.entries(LEGACY_STRINGS).map(([sym, str]) => [str, sym])
  );
  return reverseMap[str];
}
```

## Migration Strategy

### Phase 1: Add Unified System Alongside Current (No Breaking Changes)
- Create new `TYPE` system
- Add adapter functions
- Update metadata to use new system internally
- All existing code continues working

### Phase 2: Update Core Systems (Controlled Breaking Changes)
- Update parser to emit new types (with legacy adapters)
- Update compiler type inference to use new types
- Update function validation to use new types
- Keep adapters for external APIs

### Phase 3: Update Function Modules (Module by Module)
- Update each function module to use new types
- Remove legacy string comparisons
- Clean up adapters as they become unused

### Phase 4: Final Cleanup (Major Version Release)
- Remove all legacy adapters
- Update all tests to use new types
- Update documentation
- Clean up old constants

## Example: Before and After

### Before (Current Fragmented System)
```javascript
// In function validation
if (expectedArg.type === TYPES.STRING_LITERAL && arg.type !== AST_TYPES.STRING_LITERAL) {
  // Different systems!
}

// In compiler
if (arg.returnType === RETURN_TYPES.BOOLEAN) {
  // Another different system!
}
```

### After (Unified System)
```javascript
// In function validation
if (expectedArg.type === TYPE.STRING_LITERAL && arg.type !== TYPE.STRING_LITERAL) {
  // Same system!
}

// In compiler
if (arg.returnType === TYPE.BOOLEAN) {
  // Same system!
}

// With type safety
function validateArgumentType(expected: TypeSymbol, actual: TypeSymbol) {
  return expected === actual;
}
```

## Implementation Timeline

- **Week 1-2**: Design and implement unified type system
- **Week 3-4**: Add backward compatibility adapters
- **Week 5-6**: Update parser and core compiler
- **Week 7-8**: Update function modules one by one
- **Week 9-10**: Update tests and remove adapters
- **Week 11-12**: Documentation and final cleanup

## Risk Mitigation

1. **Incremental migration** - Never break everything at once
2. **Adapter pattern** - Maintain compatibility during transition
3. **Comprehensive testing** - Run full test suite at each step
4. **Feature flags** - Allow rollback if issues found
5. **Staged rollout** - Internal testing before external release

## Success Metrics

- ✅ All 336+ tests continue passing
- ✅ No performance regression
- ✅ Improved developer experience (measured by survey)
- ✅ Easier to add new types (demonstrated by adding one)
- ✅ No increase in bugs (measured over 3 months post-release)