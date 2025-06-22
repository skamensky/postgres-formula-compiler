# Logical Functions


## AND

**Signature:** `AND(argument...)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if all arguments are true

**Arguments:**
- `argument` ([boolean](../types.md#boolean)): Boolean conditions to check *(variadic)*


<details>
<summary><strong>Test References</strong> (23 found)</summary>

- **boolean-literals.test.js** (1 reference)
  - [Line 30](../../tests/boolean-literals.test.js#L30): `const result = evaluateFormula('AND(TRUE, FALSE)', testContext);`

- **if-function.test.js** (2 references)
  - [Line 42](../../tests/if-function.test.js#L42): `const result = evaluateFormula('IF(AND(revenue > 1000, cost < 500), "Good Deal", "Check Again")', testContext);`
  - [Line 43](../../tests/if-function.test.js#L43): `assertEqual(result, 'CASE WHEN (("s"."revenue" > 1000) AND ("s"."cost" < 500)) THEN \'Good Deal\' ELSE \'Check Again\' END');`

- **logical-operators-functions.test.js** (20 references)
  - [Line 3](../../tests/logical-operators-functions.test.js#L3): `* Tests for AND(), OR(), NOT() functions (not infix operators)`
  - [Line 12](../../tests/logical-operators-functions.test.js#L12): `const result = evaluateFormula('AND(revenue > 1000, cost < 500)', testContext);`
  - [Line 13](../../tests/logical-operators-functions.test.js#L13): `assertEqual(result, '(("s"."revenue" > 1000) AND ("s"."cost" < 500))');`
  - [Line 17](../../tests/logical-operators-functions.test.js#L17): `const result = evaluateFormula('AND(revenue > 1000, cost < 500, amount > 0)', testContext);`
  - [Line 18](../../tests/logical-operators-functions.test.js#L18): `assertEqual(result, '(("s"."revenue" > 1000) AND ("s"."cost" < 500) AND ("s"."amount" > 0))');`
  - [Line 22](../../tests/logical-operators-functions.test.js#L22): `const result = evaluateFormula('AND(closed, syndication)', testContext);`
  - [Line 27](../../tests/logical-operators-functions.test.js#L27): `const result = evaluateFormula('AND(TRUE, FALSE)', testContext);`
  - [Line 70](../../tests/logical-operators-functions.test.js#L70): `const result = evaluateFormula('AND(OR(revenue > 1000, cost < 100), revenue < 10000)', testContext);`
  - [Line 71](../../tests/logical-operators-functions.test.js#L71): `assertEqual(result, '((("s"."revenue" > 1000) OR ("s"."cost" < 100)) AND ("s"."revenue" < 10000))');`
  - [Line 75](../../tests/logical-operators-functions.test.js#L75): `const result = evaluateFormula('NOT(AND(revenue > 1000, cost < 100))', testContext);`
  - [Line 76](../../tests/logical-operators-functions.test.js#L76): `assertEqual(result, 'NOT ((("s"."revenue" > 1000) AND ("s"."cost" < 100)))');`
  - [Line 80](../../tests/logical-operators-functions.test.js#L80): `const result = evaluateFormula('OR(AND(revenue > 1000, NOT(closed)), amount = 0)', testContext);`
  - [Line 86](../../tests/logical-operators-functions.test.js#L86): `const result = evaluateFormula('AND(revenue > 0, cost > 0, amount > 0, closed)', testContext);`
  - [Line 87](../../tests/logical-operators-functions.test.js#L87): `assertEqual(result, '(("s"."revenue" > 0) AND ("s"."cost" > 0) AND ("s"."amount" > 0) AND "s"."closed")');`
  - [Line 97](../../tests/logical-operators-functions.test.js#L97): `const result = evaluateFormula('AND(ISNULL(revenue), ISBLANK(note))', testContext);`
  - [Line 98](../../tests/logical-operators-functions.test.js#L98): `assertEqual(result, '(("s"."revenue" IS NULL) AND ("s"."note" IS NULL OR "s"."note" = \'\'))');`
  - [Line 109](../../tests/logical-operators-functions.test.js#L109): `() => evaluateFormula('AND()', testContext),`
  - [Line 117](../../tests/logical-operators-functions.test.js#L117): `() => evaluateFormula('AND(TRUE)', testContext),`
  - [Line 157](../../tests/logical-operators-functions.test.js#L157): `() => evaluateFormula('AND(revenue, cost)', testContext),`
  - [Line 181](../../tests/logical-operators-functions.test.js#L181): `() => evaluateFormula('AND(revenue > 1000, cost, closed)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **src/types-unified.js** (1 reference)
  - [Line 212](../../src/types-unified.js#L212): `'Logical functions: `AND()`, `OR()`, `NOT()`',`
</details>

---

## OR

**Signature:** `OR(argument...)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if any argument is true

**Arguments:**
- `argument` ([boolean](../types.md#boolean)): Boolean conditions to check *(variadic)*


<details>
<summary><strong>Test References</strong> (19 found)</summary>

- **boolean-literals.test.js** (1 reference)
  - [Line 36](../../tests/boolean-literals.test.js#L36): `const result = evaluateFormula('OR(TRUE, FALSE)', testContext);`

- **logical-operators-functions.test.js** (18 references)
  - [Line 3](../../tests/logical-operators-functions.test.js#L3): `* Tests for AND(), OR(), NOT() functions (not infix operators)`
  - [Line 33](../../tests/logical-operators-functions.test.js#L33): `const result = evaluateFormula('OR(revenue > 5000, cost < 100)', testContext);`
  - [Line 34](../../tests/logical-operators-functions.test.js#L34): `assertEqual(result, '(("s"."revenue" > 5000) OR ("s"."cost" < 100))');`
  - [Line 38](../../tests/logical-operators-functions.test.js#L38): `const result = evaluateFormula('OR(revenue > 5000, cost < 100, amount = 0)', testContext);`
  - [Line 39](../../tests/logical-operators-functions.test.js#L39): `assertEqual(result, '(("s"."revenue" > 5000) OR ("s"."cost" < 100) OR ("s"."amount" = 0))');`
  - [Line 43](../../tests/logical-operators-functions.test.js#L43): `const result = evaluateFormula('OR(closed, open_approval)', testContext);`
  - [Line 48](../../tests/logical-operators-functions.test.js#L48): `const result = evaluateFormula('OR(TRUE, FALSE)', testContext);`
  - [Line 70](../../tests/logical-operators-functions.test.js#L70): `const result = evaluateFormula('AND(OR(revenue > 1000, cost < 100), revenue < 10000)', testContext);`
  - [Line 71](../../tests/logical-operators-functions.test.js#L71): `assertEqual(result, '((("s"."revenue" > 1000) OR ("s"."cost" < 100)) AND ("s"."revenue" < 10000))');`
  - [Line 80](../../tests/logical-operators-functions.test.js#L80): `const result = evaluateFormula('OR(AND(revenue > 1000, NOT(closed)), amount = 0)', testContext);`
  - [Line 81](../../tests/logical-operators-functions.test.js#L81): `assertEqual(result, '((("s"."revenue" > 1000) AND NOT ("s"."closed")) OR ("s"."amount" = 0))');`
  - [Line 91](../../tests/logical-operators-functions.test.js#L91): `const result = evaluateFormula('OR(revenue > 5000, cost < 100, amount = 0, closed, syndication)', testContext);`
  - [Line 92](../../tests/logical-operators-functions.test.js#L92): `assertEqual(result, '(("s"."revenue" > 5000) OR ("s"."cost" < 100) OR ("s"."amount" = 0) OR "s"."closed" OR "s"."syndication")');`
  - [Line 102](../../tests/logical-operators-functions.test.js#L102): `const result = evaluateFormula('OR(ISNULL(revenue), revenue > 1000)', testContext);`
  - [Line 103](../../tests/logical-operators-functions.test.js#L103): `assertEqual(result, '(("s"."revenue" IS NULL) OR ("s"."revenue" > 1000))');`
  - [Line 125](../../tests/logical-operators-functions.test.js#L125): `() => evaluateFormula('OR()', testContext),`
  - [Line 133](../../tests/logical-operators-functions.test.js#L133): `() => evaluateFormula('OR(FALSE)', testContext),`
  - [Line 165](../../tests/logical-operators-functions.test.js#L165): `() => evaluateFormula('OR(revenue > 1000, "text")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **src/types-unified.js** (1 reference)
  - [Line 212](../../src/types-unified.js#L212): `'Logical functions: `AND()`, `OR()`, `NOT()`',`
</details>

---

## NOT

**Signature:** `NOT(requires boolean argument)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns the opposite of a boolean value

**Arguments:**
- `requires boolean argument` ([boolean](../types.md#boolean)): Boolean condition to negate


<details>
<summary><strong>Test References</strong> (16 found)</summary>

- **boolean-literals.test.js** (2 references)
  - [Line 24](../../tests/boolean-literals.test.js#L24): `const result = evaluateFormula('NOT(FALSE)', testContext);`
  - [Line 25](../../tests/boolean-literals.test.js#L25): `assertEqual(result, 'NOT (FALSE)');`

- **logical-operators-functions.test.js** (14 references)
  - [Line 3](../../tests/logical-operators-functions.test.js#L3): `* Tests for AND(), OR(), NOT() functions (not infix operators)`
  - [Line 54](../../tests/logical-operators-functions.test.js#L54): `const result = evaluateFormula('NOT(revenue > 1000)', testContext);`
  - [Line 55](../../tests/logical-operators-functions.test.js#L55): `assertEqual(result, 'NOT (("s"."revenue" > 1000))');`
  - [Line 59](../../tests/logical-operators-functions.test.js#L59): `const result = evaluateFormula('NOT(closed)', testContext);`
  - [Line 60](../../tests/logical-operators-functions.test.js#L60): `assertEqual(result, 'NOT ("s"."closed")');`
  - [Line 64](../../tests/logical-operators-functions.test.js#L64): `const result = evaluateFormula('NOT(TRUE)', testContext);`
  - [Line 65](../../tests/logical-operators-functions.test.js#L65): `assertEqual(result, 'NOT (TRUE)');`
  - [Line 75](../../tests/logical-operators-functions.test.js#L75): `const result = evaluateFormula('NOT(AND(revenue > 1000, cost < 100))', testContext);`
  - [Line 76](../../tests/logical-operators-functions.test.js#L76): `assertEqual(result, 'NOT ((("s"."revenue" > 1000) AND ("s"."cost" < 100)))');`
  - [Line 80](../../tests/logical-operators-functions.test.js#L80): `const result = evaluateFormula('OR(AND(revenue > 1000, NOT(closed)), amount = 0)', testContext);`
  - [Line 81](../../tests/logical-operators-functions.test.js#L81): `assertEqual(result, '((("s"."revenue" > 1000) AND NOT ("s"."closed")) OR ("s"."amount" = 0))');`
  - [Line 141](../../tests/logical-operators-functions.test.js#L141): `() => evaluateFormula('NOT()', testContext),`
  - [Line 149](../../tests/logical-operators-functions.test.js#L149): `() => evaluateFormula('NOT(TRUE, FALSE)', testContext),`
  - [Line 173](../../tests/logical-operators-functions.test.js#L173): `() => evaluateFormula('NOT(revenue)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 720](../../src/sql-generator.js#L720): `return `NOT (${notArgSQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 212](../../src/types-unified.js#L212): `'Logical functions: `AND()`, `OR()`, `NOT()`',`
</details>


*Documentation generated on 2025-06-22T21:40:57.180Z*
