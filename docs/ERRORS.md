# Error Reference

This document describes error handling and common error messages in the Formula Language.

## Error Types

### Lexer Errors
Errors that occur during tokenization:

- **Invalid character:** Unrecognized character in input
- **Unterminated string:** String literal missing closing quote
- **Unterminated comment:** Block comment missing closing `*/`

### Parser Errors  
Errors that occur during parsing:

- **Unexpected token:** Token doesn't match expected syntax
- **Unexpected EOF:** Input ends unexpectedly
- **Consecutive operators:** Two operators without operand between them

### Compiler Errors
Errors that occur during compilation:

- **Unknown function:** Function name not recognized
- **Unknown relationship:** Relationship reference not found
- **Type mismatch:** Argument type doesn't match function requirement
- **Wrong argument count:** Function called with wrong number of arguments

## Error Format

All errors include:
- **Message:** Human-readable description
- **Position:** Character position in formula where error occurred

```json
{
  "message": "Unknown function: INVALID",
  "position": 15
}
```

## Common Error Messages

### Function Errors
```
"Unknown function: INVALID"
"TODAY() takes no arguments"
"STRING() takes exactly one argument"
"IF() takes 2 or 3 arguments"
```

### Type Errors
```
"LEFT() first argument must be string, got number"
"ROUND() requires number argument, got string"
"IF() condition must be boolean, got string"
"AND() argument 1 must be boolean, got number"
```

### Relationship Errors
```
"Unknown relationship: invalid_rel"
"Unknown inverse relationship: invalid_orders_customer"
"Field 'invalid_field' not found in related table 'customer'"
```

### Syntax Errors
```
"Expected RPAREN, got EOF"
"Unexpected token: COMMA"
"Consecutive operators are not allowed"
"Unary plus operator is not supported"
```

## Error Recovery

The Formula Language compiler stops at the first error encountered and does not attempt error recovery. This ensures:

- **Clear error reporting:** Single, specific error message
- **Fast compilation:** No time spent on recovery attempts
- **Predictable behavior:** Consistent error handling

## Debugging Tips

### Position Information
Use the position information to locate errors:
1. Count characters from start of formula
2. Position is 0-based
3. Whitespace and comments count toward position

### Common Mistakes
1. **Missing quotes:** `hello` should be `"hello"`
2. **Wrong function name:** `LENGTH()` should be `LEN()`
3. **Missing relationship suffix:** `customer.name` should be `customer_rel.name`
4. **Type mismatches:** `"5" + 5` should be `5 + 5` or `"5" & STRING(5)`

### Validation Strategy
1. **Start simple:** Build formula incrementally
2. **Test components:** Validate individual parts first
3. **Check references:** Ensure all columns and relationships exist
4. **Verify types:** Check argument types match function requirements
