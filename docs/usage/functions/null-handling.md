# Null handling Functions


## ISNULL

**Signature:** `ISNULL(value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if the value is null

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to check for null


<details>
<summary><strong>Test References</strong> (11 found)</summary>

- **if-function.test.js** (1 reference)
  - [Line 72](../../tests/if-function.test.js#L72): `const result = evaluateFormula('IF(ISNULL(revenue), "No revenue", "Has revenue")', testContext);`

- **logical-operators-functions.test.js** (2 references)
  - [Line 97](../../tests/logical-operators-functions.test.js#L97): `const result = evaluateFormula('AND(ISNULL(revenue), ISBLANK(note))', testContext);`
  - [Line 102](../../tests/logical-operators-functions.test.js#L102): `const result = evaluateFormula('OR(ISNULL(revenue), revenue > 1000)', testContext);`

- **multi-level-relationships.test.js** (1 reference)
  - [Line 129](../../tests/multi-level-relationships.test.js#L129): `const result = evaluateFormula('IF(ISNULL(merchant_rel.main_rep_rel.user_rel.status), "No Status", merchant_rel.main_rep_rel.user_rel.status)', multiLevelContext);`

- **null-handling.test.js** (7 references)
  - [Line 3](../../tests/null-handling.test.js#L3): `* Tests for ISNULL(), NULLVALUE(), ISBLANK() functions and NULL literal`
  - [Line 12](../../tests/null-handling.test.js#L12): `const result = evaluateFormula('ISNULL(note)', testContext);`
  - [Line 17](../../tests/null-handling.test.js#L17): `const result = evaluateFormula('ISNULL(NULL)', testContext);`
  - [Line 53](../../tests/null-handling.test.js#L53): `const result = evaluateFormula('IF(ISNULL(note), "No note", note)', testContext);`
  - [Line 71](../../tests/null-handling.test.js#L71): `() => evaluateFormula('ISNULL()', testContext),`
  - [Line 79](../../tests/null-handling.test.js#L79): `() => evaluateFormula('ISNULL(note, amount)', testContext),`
  - [Line 119](../../tests/null-handling.test.js#L119): `const result = evaluateFormula('ISNULL("hello")', testContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **src/types-unified.js** (1 reference)
  - [Line 237](../../src/types-unified.js#L237): `'Null checking: `ISNULL()`, `ISBLANK()`',`
</details>

---

## ISBLANK

**Signature:** `ISBLANK(value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if the value is null or empty string

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to check for blank


<details>
<summary><strong>Test References</strong> (9 found)</summary>

- **logical-operators-functions.test.js** (1 reference)
  - [Line 97](../../tests/logical-operators-functions.test.js#L97): `const result = evaluateFormula('AND(ISNULL(revenue), ISBLANK(note))', testContext);`

- **null-handling.test.js** (8 references)
  - [Line 3](../../tests/null-handling.test.js#L3): `* Tests for ISNULL(), NULLVALUE(), ISBLANK() functions and NULL literal`
  - [Line 32](../../tests/null-handling.test.js#L32): `const result = evaluateFormula('ISBLANK(note)', testContext);`
  - [Line 37](../../tests/null-handling.test.js#L37): `const result = evaluateFormula('ISBLANK(NULL)', testContext);`
  - [Line 103](../../tests/null-handling.test.js#L103): `() => evaluateFormula('ISBLANK()', testContext),`
  - [Line 111](../../tests/null-handling.test.js#L111): `() => evaluateFormula('ISBLANK(note, amount)', testContext),`
  - [Line 137](../../tests/null-handling.test.js#L137): `const result = evaluateFormula('ISBLANK("test")', testContext);`
  - [Line 149](../../tests/null-handling.test.js#L149): `const result = evaluateFormula('IF(ISBLANK(revenue), NULLVALUE(cost, 0), revenue)', testContext);`
  - [Line 164](../../tests/null-handling.test.js#L164): `const result = evaluateFormula('STRING(NULLVALUE(revenue, 0)) & " (empty: " & STRING(ISBLANK(revenue)) & ")"', testContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **src/types-unified.js** (1 reference)
  - [Line 237](../../src/types-unified.js#L237): `'Null checking: `ISNULL()`, `ISBLANK()`',`
</details>

---

## NULLVALUE

**Signature:** `NULLVALUE(value, defaultValue)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Returns the first value if not null, otherwise returns the second value

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to check for null
- `defaultValue` ([expression](../types.md#expression)): Value to return if first is null


<details>
<summary><strong>Test References</strong> (14 found)</summary>

- **null-handling.test.js** (14 references)
  - [Line 3](../../tests/null-handling.test.js#L3): `* Tests for ISNULL(), NULLVALUE(), ISBLANK() functions and NULL literal`
  - [Line 22](../../tests/null-handling.test.js#L22): `const result = evaluateFormula('NULLVALUE(note, "No note")', testContext);`
  - [Line 27](../../tests/null-handling.test.js#L27): `const result = evaluateFormula('NULLVALUE(NULL, "Default")', testContext);`
  - [Line 48](../../tests/null-handling.test.js#L48): `const result = evaluateFormula('NULLVALUE(note, "Empty") & " - " & STRING(amount)', testContext);`
  - [Line 58](../../tests/null-handling.test.js#L58): `const result = evaluateFormula('NULLVALUE(amount, 0) + 100', testContext);`
  - [Line 64](../../tests/null-handling.test.js#L64): `const result = evaluateFormula('NULLVALUE(merchant_rel.business_name, "Unknown Business")', relationshipContext);`
  - [Line 87](../../tests/null-handling.test.js#L87): `() => evaluateFormula('NULLVALUE(note)', testContext),`
  - [Line 95](../../tests/null-handling.test.js#L95): `() => evaluateFormula('NULLVALUE(note, "default", "extra")', testContext),`
  - [Line 125](../../tests/null-handling.test.js#L125): `const result = evaluateFormula('NULLVALUE(NULL, "default")', testContext);`
  - [Line 131](../../tests/null-handling.test.js#L131): `const result = evaluateFormula('NULLVALUE("maybe null", "definitely not null")', testContext);`
  - [Line 143](../../tests/null-handling.test.js#L143): `const result = evaluateFormula('NULLVALUE("maybe null", "default") & " value"', testContext);`
  - [Line 149](../../tests/null-handling.test.js#L149): `const result = evaluateFormula('IF(ISBLANK(revenue), NULLVALUE(cost, 0), revenue)', testContext);`
  - [Line 156](../../tests/null-handling.test.js#L156): `() => evaluateFormula('NULLVALUE(revenue, "string default")', testContext),`
  - [Line 164](../../tests/null-handling.test.js#L164): `const result = evaluateFormula('STRING(NULLVALUE(revenue, 0)) & " (empty: " & STRING(ISBLANK(revenue)) & ")"', testContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (3 found)</summary>

- **src/functions/null-functions.js** (2 references)
  - [Line 63](../../src/functions/null-functions.js#L63): `compiler.error('NULLVALUE() takes exactly two arguments', node.position);`
  - [Line 72](../../src/functions/null-functions.js#L72): `compiler.error(`NULLVALUE() value and default must be the same type, got ${typeToString(nullvalueArg1.returnType)} and ${typeToString(nullvalueArg2.returnType)}`, node.position);`

- **src/types-unified.js** (1 reference)
  - [Line 238](../../src/types-unified.js#L238): `'Null handling: `NULLVALUE()`, `COALESCE()`',`
</details>

---

## COALESCE

**Signature:** `COALESCE(values...)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Returns the first non-null value from a list of expressions

**Arguments:**
- `values` ([expression](../types.md#expression)): Values to check (returns first non-null) *(variadic)*


<details>
<summary><strong>Test References</strong> (10 found)</summary>

- **null-handling.test.js** (10 references)
  - [Line 23](../../tests/null-handling.test.js#L23): `assertEqual(result, 'COALESCE("s"."note", \'No note\')');`
  - [Line 28](../../tests/null-handling.test.js#L28): `assertEqual(result, 'COALESCE(NULL, \'Default\')');`
  - [Line 49](../../tests/null-handling.test.js#L49): `assertEqual(result, '((COALESCE("s"."note", \'Empty\') || \' - \') || CAST("s"."amount" AS TEXT))');`
  - [Line 59](../../tests/null-handling.test.js#L59): `assertEqual(result, '(COALESCE("s"."amount", 0) + 100)');`
  - [Line 65](../../tests/null-handling.test.js#L65): `assertEqual(result, 'COALESCE("rel_merchant"."business_name", \'Unknown Business\')');`
  - [Line 126](../../tests/null-handling.test.js#L126): `assertEqual(result, 'COALESCE(NULL, \'default\')');`
  - [Line 132](../../tests/null-handling.test.js#L132): `assertEqual(result, 'COALESCE(\'maybe null\', \'definitely not null\')');`
  - [Line 144](../../tests/null-handling.test.js#L144): `assertEqual(result, '(COALESCE(\'maybe null\', \'default\') || \' value\')');`
  - [Line 150](../../tests/null-handling.test.js#L150): `assertEqual(result, 'CASE WHEN ("s"."revenue" IS NULL OR "s"."revenue" = \'\') THEN COALESCE("s"."cost", 0) ELSE "s"."revenue" END');`
  - [Line 165](../../tests/null-handling.test.js#L165): `assertEqual(result, '(((CAST(COALESCE("s"."revenue", 0) AS TEXT) || \' (empty: \') || CAST(("s"."revenue" IS NULL OR "s"."revenue" = \'\') AS TEXT)) || \')\')');`
</details>

<details>
<summary><strong>Usage Examples</strong> (3 found)</summary>

- **src/sql-generator.js** (2 references)
  - [Line 598](../../src/sql-generator.js#L598): `return `COALESCE(${aggMapping.alias}.${aggMapping.column}, ${getDefaultValueForAggregateType(expr.returnType)})`;`
  - [Line 700](../../src/sql-generator.js#L700): `return `COALESCE(${nullvalue1SQL}, ${nullvalue2SQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 238](../../src/types-unified.js#L238): `'Null handling: `NULLVALUE()`, `COALESCE()`',`
</details>


*Documentation generated on 2025-06-22T21:40:57.210Z*
