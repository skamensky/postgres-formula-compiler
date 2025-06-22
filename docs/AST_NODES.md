# AST Nodes Reference

This document describes the Abstract Syntax Tree (AST) node types used internally by the Formula Language compiler.

> **Note:** This is technical documentation for developers working on the compiler itself.

## Node Types

### BINARY_OP

**Description:** Binary operation between two expressions

**Properties:**
- `left`
- `op`
- `right`
- `position`

**Examples:** [tests/basic-arithmetic-literals.test.js:12](../tests/basic-arithmetic-literals.test.js:12)

---

### UNARY_OP

**Description:** Unary operation on a single expression (like negation)

**Properties:**
- `op`
- `operand`
- `position`

**Examples:** [tests/basic-arithmetic-literals.test.js:36](../tests/basic-arithmetic-literals.test.js:36)

---

### NUMBER

**Description:** Numeric literal value

**Properties:**
- `value`
- `position`

**Examples:** [tests/basic-arithmetic-literals.test.js:6](../tests/basic-arithmetic-literals.test.js:6)

---

### IDENTIFIER

**Description:** Column reference or function name

**Properties:**
- `value`
- `position`

**Examples:** [tests/basic-arithmetic-literals.test.js:42](../tests/basic-arithmetic-literals.test.js:42)

---

### FUNCTION_CALL

**Description:** Function call with arguments

**Properties:**
- `name`
- `args`
- `position`

**Examples:** [tests/core-functions.test.js:12](../tests/core-functions.test.js:12)

---

### DATE_LITERAL

**Description:** Date literal value

**Properties:**
- `value`
- `position`

**Examples:** [tests/core-functions.test.js:36](../tests/core-functions.test.js:36)

---

### STRING_LITERAL

**Description:** String literal value in double quotes

**Properties:**
- `value`
- `position`

**Examples:** [tests/basic-arithmetic-literals.test.js:48](../tests/basic-arithmetic-literals.test.js:48)

---

### BOOLEAN_LITERAL

**Description:** Boolean literal (TRUE or FALSE)

**Properties:**
- `value`
- `position`

**Examples:** [tests/boolean-literals.test.js:12](../tests/boolean-literals.test.js:12)

---

### NULL_LITERAL

**Description:** NULL literal value

**Properties:**
- `value`
- `position`

**Examples:** [tests/null-handling.test.js:6](../tests/null-handling.test.js:6)

---

### RELATIONSHIP_REF

**Description:** Reference to a field in a related table

**Properties:**
- `relationName`
- `fieldName`
- `position`

**Examples:** [tests/relationships.test.js:12](../tests/relationships.test.js:12)

---

