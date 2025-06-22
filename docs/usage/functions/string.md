# String Functions


## LENGTH

**Signature:** `LENGTH(text)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the length of a string

**Arguments:**
- `text` ([string](../types.md#string)): String to get length of


<details>
<summary><strong>Test References</strong> (2 found)</summary>

- **text-functions.test.js** (2 references)
  - [Line 31](../../tests/text-functions.test.js#L31): `assertEqual(result, 'LENGTH(\'hello\')');`
  - [Line 73](../../tests/text-functions.test.js#L73): `assertEqual(result, '(LENGTH(\'hello\') + 5)');`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 664](../../src/sql-generator.js#L664): `return `LENGTH(${lenArgSQL})`;`
</details>

---

## UPPER

**Signature:** `UPPER(requires string argument)`  
**Returns:** [string](../types.md#string)  
**Description:** Converts a string to uppercase

**Arguments:**
- `requires string argument` ([string](../types.md#string)): String to convert to uppercase


<details>
<summary><strong>Test References</strong> (10 found)</summary>

- **text-functions.test.js** (10 references)
  - [Line 12](../../tests/text-functions.test.js#L12): `const result = evaluateFormula('UPPER("hello world")', testContext);`
  - [Line 13](../../tests/text-functions.test.js#L13): `assertEqual(result, 'UPPER(\'hello world\')');`
  - [Line 60](../../tests/text-functions.test.js#L60): `const result = evaluateFormula('UPPER(name)', testContext);`
  - [Line 61](../../tests/text-functions.test.js#L61): `assertEqual(result, 'UPPER("s"."name")');`
  - [Line 66](../../tests/text-functions.test.js#L66): `const result = evaluateFormula('UPPER(LEFT(TRIM(name), 3)) & "..."', testContext);`
  - [Line 67](../../tests/text-functions.test.js#L67): `assertEqual(result, '(UPPER(LEFT(TRIM("s"."name"), 3)) || \'...\')');`
  - [Line 98](../../tests/text-functions.test.js#L98): `const result = evaluateFormula('UPPER(SUBSTITUTE(company_name, "LLC", "Limited Liability Company"))', testContext);`
  - [Line 99](../../tests/text-functions.test.js#L99): `assertEqual(result, 'UPPER(REPLACE("s"."company_name", \'LLC\', \'Limited Liability Company\'))');`
  - [Line 119](../../tests/text-functions.test.js#L119): `() => evaluateFormula('UPPER("hello", "world")', testContext),`
  - [Line 128](../../tests/text-functions.test.js#L128): `() => evaluateFormula('UPPER(42)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 652](../../src/sql-generator.js#L652): `return `UPPER(${upperArgSQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 187](../../src/types-unified.js#L187): `'String functions: `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, etc.',`
</details>

---

## LOWER

**Signature:** `LOWER(requires string argument)`  
**Returns:** [string](../types.md#string)  
**Description:** Converts a string to lowercase

**Arguments:**
- `requires string argument` ([string](../types.md#string)): String to convert to lowercase


<details>
<summary><strong>Test References</strong> (3 found)</summary>

- **text-functions.test.js** (3 references)
  - [Line 18](../../tests/text-functions.test.js#L18): `const result = evaluateFormula('LOWER("HELLO WORLD")', testContext);`
  - [Line 19](../../tests/text-functions.test.js#L19): `assertEqual(result, 'LOWER(\'HELLO WORLD\')');`
  - [Line 191](../../tests/text-functions.test.js#L191): `() => evaluateFormula('LOWER(revenue)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 656](../../src/sql-generator.js#L656): `return `LOWER(${lowerArgSQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 187](../../src/types-unified.js#L187): `'String functions: `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, etc.',`
</details>

---

## TRIM

**Signature:** `TRIM(requires string argument)`  
**Returns:** [string](../types.md#string)  
**Description:** Removes whitespace from both ends of a string

**Arguments:**
- `requires string argument` ([string](../types.md#string)): String to trim


<details>
<summary><strong>Test References</strong> (5 found)</summary>

- **text-functions.test.js** (5 references)
  - [Line 24](../../tests/text-functions.test.js#L24): `const result = evaluateFormula('TRIM("  hello  ")', testContext);`
  - [Line 25](../../tests/text-functions.test.js#L25): `assertEqual(result, 'TRIM(\'  hello  \')');`
  - [Line 66](../../tests/text-functions.test.js#L66): `const result = evaluateFormula('UPPER(LEFT(TRIM(name), 3)) & "..."', testContext);`
  - [Line 67](../../tests/text-functions.test.js#L67): `assertEqual(result, '(UPPER(LEFT(TRIM("s"."name"), 3)) || \'...\')');`
  - [Line 200](../../tests/text-functions.test.js#L200): `() => evaluateFormula('TRIM(123)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 660](../../src/sql-generator.js#L660): `return `TRIM(${trimArgSQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 187](../../src/types-unified.js#L187): `'String functions: `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, etc.',`
</details>

---

## SUBSTR

**Signature:** `SUBSTR(text, start, [length])`  
**Returns:** [string](../types.md#string)  
**Description:** Extracts a substring from a string

**Arguments:**
- `text` ([string](../types.md#string)): Source string
- `start` ([number](../types.md#number)): Starting position (1-based)
- `length` ([number](../types.md#number)): Length of substring (optional) *(optional)*


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## CONCAT

**Signature:** `CONCAT(strings...)`  
**Returns:** [string](../types.md#string)  
**Description:** Concatenates two or more strings

**Arguments:**
- `strings` ([string](../types.md#string)): Strings to concatenate *(variadic)*


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## REPLACE

**Signature:** `REPLACE(text, search, replacement)`  
**Returns:** [string](../types.md#string)  
**Description:** Replaces occurrences of a substring with another string

**Arguments:**
- `text` ([string](../types.md#string)): Source string
- `search` ([string](../types.md#string)): String to search for
- `replacement` ([string](../types.md#string)): Replacement string


<details>
<summary><strong>Test References</strong> (7 found)</summary>

- **if-function.test.js** (1 reference)
  - [Line 61](../../tests/if-function.test.js#L61): `assertEqual(result, 'CASE WHEN (POSITION(\'LLC\' IN \'Company LLC\') > 0) THEN REPLACE(\'Company LLC\', \'LLC\', \'Limited\') ELSE \'No change\' END');`

- **text-functions.test.js** (6 references)
  - [Line 81](../../tests/text-functions.test.js#L81): `assertEqual(result, 'REPLACE(\'hello world\', \'world\', \'universe\')');`
  - [Line 87](../../tests/text-functions.test.js#L87): `assertEqual(result, 'REPLACE("s"."name", \'Inc\', \'LLC\')');`
  - [Line 93](../../tests/text-functions.test.js#L93): `assertEqual(result, 'REPLACE(\'hello hello world\', \'hello\', \'hi\')');`
  - [Line 99](../../tests/text-functions.test.js#L99): `assertEqual(result, 'UPPER(REPLACE("s"."company_name", \'LLC\', \'Limited Liability Company\'))');`
  - [Line 105](../../tests/text-functions.test.js#L105): `assertEqual(result, 'REPLACE(\'hello world\', \'hello \', \'\')');`
  - [Line 111](../../tests/text-functions.test.js#L111): `assertEqual(result, '(REPLACE(\'hello world\', \'world\', \'universe\') || \'!\')');`
</details>

<details>
<summary><strong>Usage Examples</strong> (3 found)</summary>

- **src/sql-generator.js** (2 references)
  - [Line 529](../../src/sql-generator.js#L529): `return `'${expr.value.replace(/'/g, "''")}'`; // Escape single quotes`
  - [Line 731](../../src/sql-generator.js#L731): `return `REPLACE(${subTextSQL}, ${subOldSQL}, ${subNewSQL})`;`

- **src/types-unified.js** (1 reference)
  - [Line 365](../../src/types-unified.js#L365): `return description.toLowerCase().replace(/_/g, ' ');`
</details>

---

## CONTAINS

**Signature:** `CONTAINS(text, second argument)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Checks if a string contains a substring

**Arguments:**
- `text` ([string](../types.md#string)): String to search in
- `second argument` ([string](../types.md#string)): Substring to search for


<details>
<summary><strong>Test References</strong> (5 found)</summary>

- **if-function.test.js** (2 references)
  - [Line 54](../../tests/if-function.test.js#L54): `const result = evaluateFormula('IF(CONTAINS("hello world", "world"), "Found", "Not found")', testContext);`
  - [Line 60](../../tests/if-function.test.js#L60): `const result = evaluateFormula('IF(CONTAINS("Company LLC", "LLC"), SUBSTITUTE("Company LLC", "LLC", "Limited"), "No change")', testContext);`

- **text-functions.test.js** (3 references)
  - [Line 54](../../tests/text-functions.test.js#L54): `const result = evaluateFormula('CONTAINS("hello world", "world")', testContext);`
  - [Line 164](../../tests/text-functions.test.js#L164): `() => evaluateFormula('CONTAINS("hello", 123)', testContext),`
  - [Line 245](../../tests/text-functions.test.js#L245): `() => evaluateFormula('CONTAINS("hello")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## STARTS_WITH

**Signature:** `STARTS_WITH(text, prefix)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Checks if a string starts with a substring

**Arguments:**
- `text` ([string](../types.md#string)): String to check
- `prefix` ([string](../types.md#string)): Prefix to check for


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## LEN

**Signature:** `LEN(requires string argument)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the length of a string

**Arguments:**
- `requires string argument` ([string](../types.md#string)): String to get length of


<details>
<summary><strong>Test References</strong> (3 found)</summary>

- **text-functions.test.js** (3 references)
  - [Line 30](../../tests/text-functions.test.js#L30): `const result = evaluateFormula('LEN("hello")', testContext);`
  - [Line 72](../../tests/text-functions.test.js#L72): `const result = evaluateFormula('LEN("hello") + 5', testContext);`
  - [Line 209](../../tests/text-functions.test.js#L209): `() => evaluateFormula('LEN(TODAY())', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **src/types-unified.js** (1 reference)
  - [Line 187](../../src/types-unified.js#L187): `'String functions: `UPPER()`, `LOWER()`, `TRIM()`, `LEN()`, etc.',`
</details>

---

## LEFT

**Signature:** `LEFT(first argument, second argument)`  
**Returns:** [string](../types.md#string)  
**Description:** Returns the leftmost characters from a string

**Arguments:**
- `first argument` ([string](../types.md#string)): Source string
- `second argument` ([number](../types.md#number)): Number of characters to extract


<details>
<summary><strong>Test References</strong> (7 found)</summary>

- **text-functions.test.js** (7 references)
  - [Line 36](../../tests/text-functions.test.js#L36): `const result = evaluateFormula('LEFT("hello world", 5)', testContext);`
  - [Line 37](../../tests/text-functions.test.js#L37): `assertEqual(result, 'LEFT(\'hello world\', 5)');`
  - [Line 66](../../tests/text-functions.test.js#L66): `const result = evaluateFormula('UPPER(LEFT(TRIM(name), 3)) & "..."', testContext);`
  - [Line 67](../../tests/text-functions.test.js#L67): `assertEqual(result, '(UPPER(LEFT(TRIM("s"."name"), 3)) || \'...\')');`
  - [Line 137](../../tests/text-functions.test.js#L137): `() => evaluateFormula('LEFT("hello")', testContext),`
  - [Line 146](../../tests/text-functions.test.js#L146): `() => evaluateFormula('LEFT(123, 5)', testContext),`
  - [Line 218](../../tests/text-functions.test.js#L218): `() => evaluateFormula('LEFT("hello", "world")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 669](../../src/sql-generator.js#L669): `return `LEFT(${leftTextSQL}, ${leftNumSQL})`;`
</details>

---

## RIGHT

**Signature:** `RIGHT(first argument, numChars)`  
**Returns:** [string](../types.md#string)  
**Description:** Returns the rightmost characters from a string

**Arguments:**
- `first argument` ([string](../types.md#string)): Source string
- `numChars` ([number](../types.md#number)): Number of characters to extract


<details>
<summary><strong>Test References</strong> (3 found)</summary>

- **text-functions.test.js** (3 references)
  - [Line 42](../../tests/text-functions.test.js#L42): `const result = evaluateFormula('RIGHT("hello world", 5)', testContext);`
  - [Line 43](../../tests/text-functions.test.js#L43): `assertEqual(result, 'RIGHT(\'hello world\', 5)');`
  - [Line 227](../../tests/text-functions.test.js#L227): `() => evaluateFormula('RIGHT(123, "abc")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **src/sql-generator.js** (1 reference)
  - [Line 674](../../src/sql-generator.js#L674): `return `RIGHT(${rightTextSQL}, ${rightNumSQL})`;`
</details>

---

## MID

**Signature:** `MID(first argument, start, length)`  
**Returns:** [string](../types.md#string)  
**Description:** Returns characters from the middle of a string

**Arguments:**
- `first argument` ([string](../types.md#string)): Source string
- `start` ([number](../types.md#number)): Starting position (1-based)
- `length` ([number](../types.md#number)): Number of characters to extract


<details>
<summary><strong>Test References</strong> (3 found)</summary>

- **text-functions.test.js** (3 references)
  - [Line 48](../../tests/text-functions.test.js#L48): `const result = evaluateFormula('MID("hello world", 2, 5)', testContext);`
  - [Line 155](../../tests/text-functions.test.js#L155): `() => evaluateFormula('MID("hello", 2)', testContext),`
  - [Line 236](../../tests/text-functions.test.js#L236): `() => evaluateFormula('MID(123, "start", "length")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## SUBSTITUTE

**Signature:** `SUBSTITUTE(first argument, second argument, third argument)`  
**Returns:** [string](../types.md#string)  
**Description:** Replaces occurrences of a substring with another string

**Arguments:**
- `first argument` ([string](../types.md#string)): Source string
- `second argument` ([string](../types.md#string)): Text to replace
- `third argument` ([string](../types.md#string)): Replacement text


<details>
<summary><strong>Test References</strong> (13 found)</summary>

- **if-function.test.js** (1 reference)
  - [Line 60](../../tests/if-function.test.js#L60): `const result = evaluateFormula('IF(CONTAINS("Company LLC", "LLC"), SUBSTITUTE("Company LLC", "LLC", "Limited"), "No change")', testContext);`

- **text-functions.test.js** (12 references)
  - [Line 80](../../tests/text-functions.test.js#L80): `const result = evaluateFormula('SUBSTITUTE("hello world", "world", "universe")', testContext);`
  - [Line 86](../../tests/text-functions.test.js#L86): `const result = evaluateFormula('SUBSTITUTE(name, "Inc", "LLC")', testContext);`
  - [Line 92](../../tests/text-functions.test.js#L92): `const result = evaluateFormula('SUBSTITUTE("hello hello world", "hello", "hi")', testContext);`
  - [Line 98](../../tests/text-functions.test.js#L98): `const result = evaluateFormula('UPPER(SUBSTITUTE(company_name, "LLC", "Limited Liability Company"))', testContext);`
  - [Line 104](../../tests/text-functions.test.js#L104): `const result = evaluateFormula('SUBSTITUTE("hello world", "hello ", "")', testContext);`
  - [Line 110](../../tests/text-functions.test.js#L110): `const result = evaluateFormula('SUBSTITUTE("hello world", "world", "universe") & "!"', testContext);`
  - [Line 173](../../tests/text-functions.test.js#L173): `() => evaluateFormula('SUBSTITUTE("hello", "world")', testContext),`
  - [Line 182](../../tests/text-functions.test.js#L182): `() => evaluateFormula('SUBSTITUTE(123, "1", "2")', testContext),`
  - [Line 254](../../tests/text-functions.test.js#L254): `() => evaluateFormula('SUBSTITUTE("hello", "world", "universe", "extra")', testContext),`
  - [Line 263](../../tests/text-functions.test.js#L263): `() => evaluateFormula('SUBSTITUTE("hello", 123, "world")', testContext),`
  - [Line 272](../../tests/text-functions.test.js#L272): `() => evaluateFormula('SUBSTITUTE("hello", "world", 123)', testContext),`
  - [Line 281](../../tests/text-functions.test.js#L281): `() => evaluateFormula('SUBSTITUTE(revenue, "hello", TODAY())', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## ENDS_WITH

**Signature:** `ENDS_WITH(text, suffix)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Checks if a string ends with a substring

**Arguments:**
- `text` ([string](../types.md#string)): String to check
- `suffix` ([string](../types.md#string)): Suffix to check for


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>


*Documentation generated on 2025-06-22T21:40:57.007Z*
