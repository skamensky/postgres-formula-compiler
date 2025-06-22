# Operators Reference

This document provides a comprehensive reference for all available operators in the Formula Language.

## Operator Precedence

Operators are evaluated in the following order (highest to lowest precedence):

| Precedence | Operators | Associativity | Description |
|------------|-----------|---------------|-------------|
| 3 | `=`, `!=`, `<>`, `<`, `<=`, `>`, `>=` | left | Equality comparison operator, Inequality comparison operator, Inequality comparison operator (alternative syntax), Less than comparison operator, Less than or equal comparison operator, Greater than comparison operator, Greater than or equal comparison operator |
| 2 | `*`, `/` | left | Multiplication operator for numeric values, Division operator for numeric values |
| 1 | `+`, `-` | left | Addition operator for numeric values, Subtraction operator for numeric values or unary negation |
| 0 | `&` | left | String concatenation operator |

## Operator Details

### Arithmetic Operators

#### `+`

**Description:** Addition operator for numeric values  
**Precedence:** 1  
**Associativity:** left

**Examples:** [tests/basic-arithmetic-literals.test.js:12](../tests/basic-arithmetic-literals.test.js:12)

---

#### `-`

**Description:** Subtraction operator for numeric values or unary negation  
**Precedence:** 1  
**Associativity:** left

**Examples:** [tests/basic-arithmetic-literals.test.js:18](../tests/basic-arithmetic-literals.test.js:18)

---

#### `*`

**Description:** Multiplication operator for numeric values  
**Precedence:** 2  
**Associativity:** left

**Examples:** [tests/multiplication-division.test.js:12](../tests/multiplication-division.test.js:12)

---

#### `/`

**Description:** Division operator for numeric values  
**Precedence:** 2  
**Associativity:** left

**Examples:** [tests/multiplication-division.test.js:18](../tests/multiplication-division.test.js:18)

---

### String Operators

#### `&`

**Description:** String concatenation operator  
**Precedence:** 0  
**Associativity:** left

**Examples:** [tests/string-functions-concatenation.test.js:12](../tests/string-functions-concatenation.test.js:12)

---

### Comparison Operators

#### `=`

**Description:** Equality comparison operator  
**Precedence:** 3  
**Associativity:** left

**Examples:** [tests/comparison-operators.test.js:12](../tests/comparison-operators.test.js:12)

---

#### `!=`

**Description:** Inequality comparison operator  
**Precedence:** 3  
**Associativity:** left

**Examples:** [tests/comparison-operators.test.js:18](../tests/comparison-operators.test.js:18)

---

#### `<>`

**Description:** Inequality comparison operator (alternative syntax)  
**Precedence:** 3  
**Associativity:** left

**Examples:** [tests/comparison-operators.test.js:24](../tests/comparison-operators.test.js:24)

---

#### `<`

**Description:** Less than comparison operator  
**Precedence:** 3  
**Associativity:** left

**Examples:** [tests/comparison-operators.test.js:30](../tests/comparison-operators.test.js:30)

---

#### `<=`

**Description:** Less than or equal comparison operator  
**Precedence:** 3  
**Associativity:** left

**Examples:** [tests/comparison-operators.test.js:36](../tests/comparison-operators.test.js:36)

---

#### `>`

**Description:** Greater than comparison operator  
**Precedence:** 3  
**Associativity:** left

**Examples:** [tests/comparison-operators.test.js:42](../tests/comparison-operators.test.js:42)

---

#### `>=`

**Description:** Greater than or equal comparison operator  
**Precedence:** 3  
**Associativity:** left

**Examples:** [tests/comparison-operators.test.js:48](../tests/comparison-operators.test.js:48)

---

