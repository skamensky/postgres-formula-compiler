# Null handling Functions


## ISNULL

**Signature:** `ISNULL(value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if the value is null

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to check for null


<details>
<summary><strong>Test References</strong> (10 found)</summary>

- **if-function.test.js** (1 reference)
  - [Line 72](/tests/if-function.test.js#L72): `const result = evaluateFormula('IF(ISNULL(revenue), "No revenue", "Has revenue")', testContext);`

- **logical-operators-functions.test.js** (2 references)
  - [Line 97](/tests/logical-operators-functions.test.js#L97): `const result = evaluateFormula('AND(ISNULL(revenue), ISBLANK(note))', testContext);`
  - [Line 102](/tests/logical-operators-functions.test.js#L102): `const result = evaluateFormula('OR(ISNULL(revenue), revenue > 1000)', testContext);`

- **multi-level-relationships.test.js** (1 reference)
  - [Line 129](/tests/multi-level-relationships.test.js#L129): `const result = evaluateFormula('IF(ISNULL(merchant_rel.main_rep_rel.user_rel.status), "No Status", merchant_rel.main_rep_rel.user_rel.status)', multiLevelContext);`

- **null-handling.test.js** (6 references)
  - [Line 12](/tests/null-handling.test.js#L12): `const result = evaluateFormula('ISNULL(note)', testContext);`
  - [Line 17](/tests/null-handling.test.js#L17): `const result = evaluateFormula('ISNULL(NULL)', testContext);`
  - [Line 53](/tests/null-handling.test.js#L53): `const result = evaluateFormula('IF(ISNULL(note), "No note", note)', testContext);`
  - [Line 71](/tests/null-handling.test.js#L71): `() => evaluateFormula('ISNULL()', testContext),`
  - [Line 79](/tests/null-handling.test.js#L79): `() => evaluateFormula('ISNULL(note, amount)', testContext),`
  - [Line 119](/tests/null-handling.test.js#L119): `const result = evaluateFormula('ISNULL("hello")', testContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **examples/table/submission/null_safety_check.formula** (1 reference)
  - [Line 1](/examples/table/submission/null_safety_check.formula#L1): `IF(ISNULL(merchant_rel.business_name), "NO MERCHANT", merchant_rel.business_name) & " | Amount: " & IF(ISNULL(amount), "N/A", STRING(amount)) & " | Reps: " & STRING(IF(ISNULL(COUNT_AGG(rep_links_submission, id)), 0, COUNT_AGG(rep_links_submission, id)))`
</details>

---

## ISBLANK

**Signature:** `ISBLANK(value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if the value is null or empty string

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to check for blank


<details>
<summary><strong>Test References</strong> (8 found)</summary>

- **logical-operators-functions.test.js** (1 reference)
  - [Line 97](/tests/logical-operators-functions.test.js#L97): `const result = evaluateFormula('AND(ISNULL(revenue), ISBLANK(note))', testContext);`

- **null-handling.test.js** (7 references)
  - [Line 32](/tests/null-handling.test.js#L32): `const result = evaluateFormula('ISBLANK(note)', testContext);`
  - [Line 37](/tests/null-handling.test.js#L37): `const result = evaluateFormula('ISBLANK(NULL)', testContext);`
  - [Line 103](/tests/null-handling.test.js#L103): `() => evaluateFormula('ISBLANK()', testContext),`
  - [Line 111](/tests/null-handling.test.js#L111): `() => evaluateFormula('ISBLANK(note, amount)', testContext),`
  - [Line 137](/tests/null-handling.test.js#L137): `const result = evaluateFormula('ISBLANK("test")', testContext);`
  - [Line 149](/tests/null-handling.test.js#L149): `const result = evaluateFormula('IF(ISBLANK(revenue), NULLVALUE(cost, 0), revenue)', testContext);`
  - [Line 164](/tests/null-handling.test.js#L164): `const result = evaluateFormula('STRING(NULLVALUE(revenue, 0)) & " (empty: " & STRING(ISBLANK(revenue)) & ")"', testContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
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
<summary><strong>Test References</strong> (13 found)</summary>

- **null-handling.test.js** (13 references)
  - [Line 22](/tests/null-handling.test.js#L22): `const result = evaluateFormula('NULLVALUE(note, "No note")', testContext);`
  - [Line 27](/tests/null-handling.test.js#L27): `const result = evaluateFormula('NULLVALUE(NULL, "Default")', testContext);`
  - [Line 48](/tests/null-handling.test.js#L48): `const result = evaluateFormula('NULLVALUE(note, "Empty") & " - " & STRING(amount)', testContext);`
  - [Line 58](/tests/null-handling.test.js#L58): `const result = evaluateFormula('NULLVALUE(amount, 0) + 100', testContext);`
  - [Line 64](/tests/null-handling.test.js#L64): `const result = evaluateFormula('NULLVALUE(merchant_rel.business_name, "Unknown Business")', relationshipContext);`
  - [Line 87](/tests/null-handling.test.js#L87): `() => evaluateFormula('NULLVALUE(note)', testContext),`
  - [Line 95](/tests/null-handling.test.js#L95): `() => evaluateFormula('NULLVALUE(note, "default", "extra")', testContext),`
  - [Line 125](/tests/null-handling.test.js#L125): `const result = evaluateFormula('NULLVALUE(NULL, "default")', testContext);`
  - [Line 131](/tests/null-handling.test.js#L131): `const result = evaluateFormula('NULLVALUE("maybe null", "definitely not null")', testContext);`
  - [Line 143](/tests/null-handling.test.js#L143): `const result = evaluateFormula('NULLVALUE("maybe null", "default") & " value"', testContext);`
  - [Line 149](/tests/null-handling.test.js#L149): `const result = evaluateFormula('IF(ISBLANK(revenue), NULLVALUE(cost, 0), revenue)', testContext);`
  - [Line 156](/tests/null-handling.test.js#L156): `() => evaluateFormula('NULLVALUE(revenue, "string default")', testContext),`
  - [Line 164](/tests/null-handling.test.js#L164): `const result = evaluateFormula('STRING(NULLVALUE(revenue, 0)) & " (empty: " & STRING(ISBLANK(revenue)) & ")"', testContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## COALESCE

**Signature:** `COALESCE(values...)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Returns the first non-null value from a list of expressions

**Arguments:**
- `values` ([expression](../types.md#expression)): Values to check (returns first non-null) *(variadic)*


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>


*Documentation generated on 2025-06-22T21:49:57.967Z*
