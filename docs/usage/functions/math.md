# Math Functions


## ROUND

**Signature:** `ROUND(number, decimals)`  
**Returns:** [number](../types.md#number)  
**Description:** Rounds a number to specified decimal places

**Arguments:**
- `number` ([number](../types.md#number)): Number to round
- `decimals` ([number](../types.md#number)): Number of decimal places


<details>
<summary><strong>Test References</strong> (14 found)</summary>

- **math-functions.test.js** (14 references)
  - [Line 12](../../tests/math-functions.test.js#L12): `const result = evaluateFormula('ROUND(3.14159, 2)', testContext);`
  - [Line 13](../../tests/math-functions.test.js#L13): `assertEqual(result, 'ROUND(3.14159, 2)');`
  - [Line 18](../../tests/math-functions.test.js#L18): `const result = evaluateFormula('ROUND(revenue, 0)', testContext);`
  - [Line 19](../../tests/math-functions.test.js#L19): `assertEqual(result, 'ROUND("s"."revenue", 0)');`
  - [Line 96](../../tests/math-functions.test.js#L96): `const result = evaluateFormula('ROUND(ABS(revenue - cost) / MAX(revenue, cost) * 100, 2)', testContext);`
  - [Line 97](../../tests/math-functions.test.js#L97): `assertEqual(result, 'ROUND(((ABS(("s"."revenue" - "s"."cost")) / GREATEST("s"."revenue", "s"."cost")) * 100), 2)');`
  - [Line 102](../../tests/math-functions.test.js#L102): `const result = evaluateFormula('ROUND(revenue * 0.1, 2) + MIN(cost, 100)', testContext);`
  - [Line 103](../../tests/math-functions.test.js#L103): `assertEqual(result, '(ROUND(("s"."revenue" * 0.1), 2) + LEAST("s"."cost", 100))');`
  - [Line 108](../../tests/math-functions.test.js#L108): `const result = evaluateFormula('STRING(ROUND(revenue, 2)) & " (max with cost: " & STRING(MAX(revenue, cost)) & ")"', testContext);`
  - [Line 109](../../tests/math-functions.test.js#L109): `assertEqual(result, '(((CAST(ROUND("s"."revenue", 2) AS TEXT) || \' (max with cost: \') || CAST(GREATEST("s"."revenue", "s"."cost") AS TEXT)) || \')\')');`
  - [Line 115](../../tests/math-functions.test.js#L115): `() => evaluateFormula('ROUND(3.14, "world")', testContext),`
  - [Line 160](../../tests/math-functions.test.js#L160): `() => evaluateFormula('ROUND(MIN("a", "b"), ABS("c"))', testContext),`
  - [Line 171](../../tests/math-functions.test.js#L171): `() => evaluateFormula('ROUND(3.14)', testContext),`
  - [Line 180](../../tests/math-functions.test.js#L180): `() => evaluateFormula('ROUND("hello", 2)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 740](../../src/sql-generator.js#L740): `return `ROUND(${roundNumSQL}, ${roundDecSQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 200](../../src/types-unified.js#L200): `'Math functions: `ROUND()`, `ABS()`, `CEILING()`, `FLOOR()`, etc.',`
</details>

---

## ABS

**Signature:** `ABS(number)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the absolute value of a number

**Arguments:**
- `number` ([number](../types.md#number)): Number to get absolute value of


<details>
<summary><strong>Test References</strong> (11 found)</summary>

- **if-function.test.js** (2 references)
  - [Line 66](../../tests/if-function.test.js#L66): `const result = evaluateFormula('IF(ABS(revenue - cost) > 1000, "Large difference", "Small difference")', testContext);`
  - [Line 67](../../tests/if-function.test.js#L67): `assertEqual(result, 'CASE WHEN (ABS(("s"."revenue" - "s"."cost")) > 1000) THEN \'Large difference\' ELSE \'Small difference\' END');`

- **math-functions.test.js** (9 references)
  - [Line 24](../../tests/math-functions.test.js#L24): `const result = evaluateFormula('ABS(-25.5)', testContext);`
  - [Line 25](../../tests/math-functions.test.js#L25): `assertEqual(result, 'ABS(-25.5)');`
  - [Line 30](../../tests/math-functions.test.js#L30): `const result = evaluateFormula('ABS(cost)', testContext);`
  - [Line 31](../../tests/math-functions.test.js#L31): `assertEqual(result, 'ABS("s"."cost")');`
  - [Line 96](../../tests/math-functions.test.js#L96): `const result = evaluateFormula('ROUND(ABS(revenue - cost) / MAX(revenue, cost) * 100, 2)', testContext);`
  - [Line 97](../../tests/math-functions.test.js#L97): `assertEqual(result, 'ROUND(((ABS(("s"."revenue" - "s"."cost")) / GREATEST("s"."revenue", "s"."cost")) * 100), 2)');`
  - [Line 160](../../tests/math-functions.test.js#L160): `() => evaluateFormula('ROUND(MIN("a", "b"), ABS("c"))', testContext),`
  - [Line 189](../../tests/math-functions.test.js#L189): `() => evaluateFormula('ABS()', testContext),`
  - [Line 198](../../tests/math-functions.test.js#L198): `() => evaluateFormula('ABS("hello")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 735](../../src/sql-generator.js#L735): `return `ABS(${absArgSQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 200](../../src/types-unified.js#L200): `'Math functions: `ROUND()`, `ABS()`, `CEILING()`, `FLOOR()`, etc.',`
</details>

---

## CEIL

**Signature:** `CEIL(number)`  
**Returns:** [number](../types.md#number)  
**Description:** Rounds a number up to the nearest integer

**Arguments:**
- `number` ([number](../types.md#number)): Number to round up


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## CEILING

**Signature:** `CEILING(number)`  
**Returns:** [number](../types.md#number)  
**Description:** Rounds a number up to the nearest integer

**Arguments:**
- `number` ([number](../types.md#number)): Number to round up


<details>
<summary><strong>Test References</strong> (6 found)</summary>

- **math-functions.test.js** (6 references)
  - [Line 72](../../tests/math-functions.test.js#L72): `const result = evaluateFormula('CEILING(3.2)', testContext);`
  - [Line 73](../../tests/math-functions.test.js#L73): `assertEqual(result, 'CEILING(3.2)');`
  - [Line 78](../../tests/math-functions.test.js#L78): `const result = evaluateFormula('CEILING(revenue)', testContext);`
  - [Line 79](../../tests/math-functions.test.js#L79): `assertEqual(result, 'CEILING("s"."revenue")');`
  - [Line 142](../../tests/math-functions.test.js#L142): `() => evaluateFormula('CEILING(3.2, 5)', testContext),`
  - [Line 234](../../tests/math-functions.test.js#L234): `() => evaluateFormula('CEILING(TODAY())', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 759](../../src/sql-generator.js#L759): `return `CEILING(${ceilingArgSQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 200](../../src/types-unified.js#L200): `'Math functions: `ROUND()`, `ABS()`, `CEILING()`, `FLOOR()`, etc.',`
</details>

---

## FLOOR

**Signature:** `FLOOR(number)`  
**Returns:** [number](../types.md#number)  
**Description:** Rounds a number down to the nearest integer

**Arguments:**
- `number` ([number](../types.md#number)): Number to round down


<details>
<summary><strong>Test References</strong> (5 found)</summary>

- **math-functions.test.js** (5 references)
  - [Line 84](../../tests/math-functions.test.js#L84): `const result = evaluateFormula('FLOOR(8.9)', testContext);`
  - [Line 85](../../tests/math-functions.test.js#L85): `assertEqual(result, 'FLOOR(8.9)');`
  - [Line 90](../../tests/math-functions.test.js#L90): `const result = evaluateFormula('FLOOR(cost)', testContext);`
  - [Line 91](../../tests/math-functions.test.js#L91): `assertEqual(result, 'FLOOR("s"."cost")');`
  - [Line 151](../../tests/math-functions.test.js#L151): `() => evaluateFormula('FLOOR("text")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 763](../../src/sql-generator.js#L763): `return `FLOOR(${floorArgSQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 200](../../src/types-unified.js#L200): `'Math functions: `ROUND()`, `ABS()`, `CEILING()`, `FLOOR()`, etc.',`
</details>

---

## POWER

**Signature:** `POWER(base, exponent)`  
**Returns:** [number](../types.md#number)  
**Description:** Raises a number to a power

**Arguments:**
- `base` ([number](../types.md#number)): Base number
- `exponent` ([number](../types.md#number)): Exponent


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## SQRT

**Signature:** `SQRT(value)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the square root of a number

**Arguments:**
- `value` ([number](../types.md#number)): Number to get square root of


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## LOG

**Signature:** `LOG(value)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the natural logarithm of a number

**Arguments:**
- `value` ([number](../types.md#number)): Number to get natural logarithm of


<details>
<summary><strong>Test References</strong> (39 found)</summary>

- **aggregate-functions.test.js** (12 references)
  - [Line 10](../../tests/aggregate-functions.test.js#L10): `console.log('Running Aggregate Functions Tests...\n');`
  - [Line 132](../../tests/aggregate-functions.test.js#L132): `console.log('  ✓ Multi-level aggregate parsing successful');`
  - [Line 137](../../tests/aggregate-functions.test.js#L137): `console.log('  ℹ Multi-level parsing detected but context not available (expected)');`
  - [Line 151](../../tests/aggregate-functions.test.js#L151): `console.log('  ℹ Multi-level COUNT_AGG parsing detected but context not available (expected)');`
  - [Line 165](../../tests/aggregate-functions.test.js#L165): `console.log('  ℹ Multi-level SUM_AGG parsing detected but context not available (expected)');`
  - [Line 184](../../tests/aggregate-functions.test.js#L184): `console.log('  ✓ Multi-level depth checking is working');`
  - [Line 198](../../tests/aggregate-functions.test.js#L198): `console.log('  ℹ Multi-level complex expression parsing detected but context not available (expected)');`
  - [Line 212](../../tests/aggregate-functions.test.js#L212): `console.log('  ℹ Multi-level three-level chain parsing detected but context not available (expected)');`
  - [Line 282](../../tests/aggregate-functions.test.js#L282): `console.log('  ✓ Multi-level chain validation working');`
  - [Line 316](../../tests/aggregate-functions.test.js#L316): `console.log('  ℹ Multi-level integration test detected but context not available (expected)');`
  - [Line 330](../../tests/aggregate-functions.test.js#L330): `console.log('  ℹ Multi-level comparison test detected but context not available (expected)');`
  - [Line 343](../../tests/aggregate-functions.test.js#L343): `console.log('  ℹ Multiple multi-level aggregates test detected but context not available (expected)');`

- **basic-arithmetic-literals.test.js** (1 reference)
  - [Line 8](../../tests/basic-arithmetic-literals.test.js#L8): `console.log('Running Basic Arithmetic & Literals Tests...\n');`

- **boolean-literals.test.js** (1 reference)
  - [Line 8](../../tests/boolean-literals.test.js#L8): `console.log('Running Boolean Literals Tests...\n');`

- **comments.test.js** (1 reference)
  - [Line 8](../../tests/comments.test.js#L8): `console.log('Running Comments Tests...\n');`

- **comparison-operators.test.js** (1 reference)
  - [Line 8](../../tests/comparison-operators.test.js#L8): `console.log('Running Comparison Operators Tests...\n');`

- **compiler-modularization.test.js** (9 references)
  - [Line 11](../../tests/compiler-modularization.test.js#L11): `console.log(`✓ ${description}`);`
  - [Line 14](../../tests/compiler-modularization.test.js#L14): `console.log(`✗ ${description}`);`
  - [Line 15](../../tests/compiler-modularization.test.js#L15): `console.log(`  Error: ${error.message}`);`
  - [Line 68](../../tests/compiler-modularization.test.js#L68): `console.log(`\n${name}`);`
  - [Line 73](../../tests/compiler-modularization.test.js#L73): `console.log('=== Compiler Modularization with Hierarchical Semantic IDs ===');`
  - [Line 272](../../tests/compiler-modularization.test.js#L272): `console.log(`\n=== Test Results ===`);`
  - [Line 273](../../tests/compiler-modularization.test.js#L273): `console.log(`${passedTests}/${totalTests} tests passed`);`
  - [Line 275](../../tests/compiler-modularization.test.js#L275): `console.log('🎉 All tests passed!');`
  - [Line 277](../../tests/compiler-modularization.test.js#L277): `console.log(`❌ ${totalTests - passedTests} tests failed`);`

- **core-functions.test.js** (1 reference)
  - [Line 8](../../tests/core-functions.test.js#L8): `console.log('Running Core Functions Tests...\n');`

- **date-arithmetic.test.js** (1 reference)
  - [Line 8](../../tests/date-arithmetic.test.js#L8): `console.log('Running Date Arithmetic Tests...\n');`

- **date-functions.test.js** (1 reference)
  - [Line 8](../../tests/date-functions.test.js#L8): `console.log('Running Date Functions Tests...\n');`

- **error-handling-basic.test.js** (1 reference)
  - [Line 8](../../tests/error-handling-basic.test.js#L8): `console.log('Running Basic Error Handling Tests...\n');`

- **if-function.test.js** (1 reference)
  - [Line 8](../../tests/if-function.test.js#L8): `console.log('Running IF Function Tests...\n');`

- **logical-operators-functions.test.js** (1 reference)
  - [Line 8](../../tests/logical-operators-functions.test.js#L8): `console.log('Running Logical Operator Functions Tests...\n');`

- **math-functions.test.js** (1 reference)
  - [Line 8](../../tests/math-functions.test.js#L8): `console.log('Running Math Functions Tests...\n');`

- **multi-level-relationships.test.js** (1 reference)
  - [Line 9](../../tests/multi-level-relationships.test.js#L9): `console.log('Running Multi-Level Relationships Tests...\n');`

- **multiplication-division.test.js** (1 reference)
  - [Line 8](../../tests/multiplication-division.test.js#L8): `console.log('Running Multiplication & Division Tests...\n');`

- **null-handling.test.js** (1 reference)
  - [Line 8](../../tests/null-handling.test.js#L8): `console.log('Running NULL Handling Tests...\n');`

- **parentheses-precedence.test.js** (1 reference)
  - [Line 8](../../tests/parentheses-precedence.test.js#L8): `console.log('Running Parentheses & Precedence Tests...\n');`

- **relationships.test.js** (1 reference)
  - [Line 8](../../tests/relationships.test.js#L8): `console.log('Running Relationships Tests...\n');`

- **string-functions-concatenation.test.js** (1 reference)
  - [Line 8](../../tests/string-functions-concatenation.test.js#L8): `console.log('Running String Functions & Concatenation Tests...\n');`

- **text-functions.test.js** (1 reference)
  - [Line 8](../../tests/text-functions.test.js#L8): `console.log('Running Text Functions Tests...\n');`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## LOG10

**Signature:** `LOG10(value)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the base-10 logarithm of a number

**Arguments:**
- `value` ([number](../types.md#number)): Number to get base-10 logarithm of


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## EXP

**Signature:** `EXP(value)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns e raised to the power of a number

**Arguments:**
- `value` ([number](../types.md#number)): Exponent


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## SIN

**Signature:** `SIN(angle)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the sine of an angle in radians

**Arguments:**
- `angle` ([number](../types.md#number)): Angle in radians


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## COS

**Signature:** `COS(angle)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the cosine of an angle in radians

**Arguments:**
- `angle` ([number](../types.md#number)): Angle in radians


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## TAN

**Signature:** `TAN(angle)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the tangent of an angle in radians

**Arguments:**
- `angle` ([number](../types.md#number)): Angle in radians


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## RANDOM

**Signature:** `RANDOM()`  
**Returns:** [number](../types.md#number)  
**Description:** Returns a random number between 0 and 1

**Arguments:** None


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## MIN

**Signature:** `MIN(num1, num2)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the minimum of two numbers

**Arguments:**
- `num1` ([number](../types.md#number)): First number
- `num2` ([number](../types.md#number)): Second number


<details>
<summary><strong>Test References</strong> (6 found)</summary>

- **math-functions.test.js** (6 references)
  - [Line 36](../../tests/math-functions.test.js#L36): `const result = evaluateFormula('MIN(10, 20)', testContext);`
  - [Line 42](../../tests/math-functions.test.js#L42): `const result = evaluateFormula('MIN(revenue, cost)', testContext);`
  - [Line 102](../../tests/math-functions.test.js#L102): `const result = evaluateFormula('ROUND(revenue * 0.1, 2) + MIN(cost, 100)', testContext);`
  - [Line 160](../../tests/math-functions.test.js#L160): `() => evaluateFormula('ROUND(MIN("a", "b"), ABS("c"))', testContext),`
  - [Line 207](../../tests/math-functions.test.js#L207): `() => evaluateFormula('MIN(5)', testContext),`
  - [Line 216](../../tests/math-functions.test.js#L216): `() => evaluateFormula('MIN("hello", "world")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (3 found)</summary>

- **src/sql-generator.js** (3 references)
  - [Line 305](../../src/sql-generator.js#L305): `aggSQL = `MIN(${exprSQL})`;`
  - [Line 412](../../src/sql-generator.js#L412): `aggSQL = `MIN(${exprSQL})`;`
  - [Line 486](../../src/sql-generator.js#L486): `aggSQL = `MIN(${exprSQL})`;`
</details>

---

## MAX

**Signature:** `MAX(num1, num2)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the maximum of two numbers

**Arguments:**
- `num1` ([number](../types.md#number)): First number
- `num2` ([number](../types.md#number)): Second number


<details>
<summary><strong>Test References</strong> (5 found)</summary>

- **math-functions.test.js** (5 references)
  - [Line 48](../../tests/math-functions.test.js#L48): `const result = evaluateFormula('MAX(15, 8)', testContext);`
  - [Line 54](../../tests/math-functions.test.js#L54): `const result = evaluateFormula('MAX(revenue, cost)', testContext);`
  - [Line 96](../../tests/math-functions.test.js#L96): `const result = evaluateFormula('ROUND(ABS(revenue - cost) / MAX(revenue, cost) * 100, 2)', testContext);`
  - [Line 108](../../tests/math-functions.test.js#L108): `const result = evaluateFormula('STRING(ROUND(revenue, 2)) & " (max with cost: " & STRING(MAX(revenue, cost)) & ")"', testContext);`
  - [Line 124](../../tests/math-functions.test.js#L124): `() => evaluateFormula('MAX(10, TODAY())', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (3 found)</summary>

- **src/sql-generator.js** (3 references)
  - [Line 308](../../src/sql-generator.js#L308): `aggSQL = `MAX(${exprSQL})`;`
  - [Line 415](../../src/sql-generator.js#L415): `aggSQL = `MAX(${exprSQL})`;`
  - [Line 489](../../src/sql-generator.js#L489): `aggSQL = `MAX(${exprSQL})`;`
</details>

---

## MOD

**Signature:** `MOD(dividend, divisor)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the remainder of division

**Arguments:**
- `dividend` ([number](../types.md#number)): Number to divide
- `divisor` ([number](../types.md#number)): Number to divide by


<details>
<summary><strong>Test References</strong> (6 found)</summary>

- **math-functions.test.js** (6 references)
  - [Line 60](../../tests/math-functions.test.js#L60): `const result = evaluateFormula('MOD(17, 5)', testContext);`
  - [Line 61](../../tests/math-functions.test.js#L61): `assertEqual(result, 'MOD(17, 5)');`
  - [Line 66](../../tests/math-functions.test.js#L66): `const result = evaluateFormula('MOD(revenue, 10)', testContext);`
  - [Line 67](../../tests/math-functions.test.js#L67): `assertEqual(result, 'MOD("s"."revenue", 10)');`
  - [Line 133](../../tests/math-functions.test.js#L133): `() => evaluateFormula('MOD(revenue, "divisor")', testContext),`
  - [Line 225](../../tests/math-functions.test.js#L225): `() => evaluateFormula('MOD(17, 5, 3)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 755](../../src/sql-generator.js#L755): `return `MOD(${modArg1SQL}, ${modArg2SQL})`;`
</details>

---

## SIGN

**Signature:** `SIGN(value)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the sign of a number (-1, 0, or 1)

**Arguments:**
- `value` ([number](../types.md#number)): Number to get sign of


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>


*Documentation generated on 2025-06-22T21:40:56.890Z*
