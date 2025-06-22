# Aggregate Functions


## COUNT

**Signature:** `COUNT(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Counts the number of non-null values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([expression](../types.md#expression)): Expression to count


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (4 found)</summary>

- **src/functions/aggregate-functions.js** (1 reference)
  - [Line 307](../../src/functions/aggregate-functions.js#L307): `// For COUNT_AGG, use the same semantic ID regardless of column since SQL is always COUNT(*)`

- **src/sql-generator.js** (3 references)
  - [Line 296](../../src/sql-generator.js#L296): `aggSQL = `COUNT(*)`;`
  - [Line 403](../../src/sql-generator.js#L403): `aggSQL = `COUNT(*)`;`
  - [Line 480](../../src/sql-generator.js#L480): `aggSQL = `COUNT(${exprSQL})`;`
</details>

---

## SUM

**Signature:** `SUM(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Sums numeric values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([number](../types.md#number)): Numeric expression to sum


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (3 found)</summary>

- **src/sql-generator.js** (3 references)
  - [Line 299](../../src/sql-generator.js#L299): `aggSQL = `SUM(${exprSQL})`;`
  - [Line 406](../../src/sql-generator.js#L406): `aggSQL = `SUM(${exprSQL})`;`
  - [Line 477](../../src/sql-generator.js#L477): `aggSQL = `SUM(${exprSQL})`;`
</details>

---

## AVG

**Signature:** `AVG(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Calculates the average of numeric values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([number](../types.md#number)): Numeric expression to average


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (3 found)</summary>

- **src/sql-generator.js** (3 references)
  - [Line 302](../../src/sql-generator.js#L302): `aggSQL = `AVG(${exprSQL})`;`
  - [Line 409](../../src/sql-generator.js#L409): `aggSQL = `AVG(${exprSQL})`;`
  - [Line 483](../../src/sql-generator.js#L483): `aggSQL = `AVG(${exprSQL})`;`
</details>

---

## MIN_AGG

**Signature:** `MIN_AGG(relationship, value)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Finds the minimum value

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([expression](../types.md#expression)): Expression to find minimum of


<details>
<summary><strong>Test References</strong> (1 found)</summary>

- **aggregate-functions.test.js** (1 reference)
  - [Line 58](../../tests/aggregate-functions.test.js#L58): `const result = evaluateFormula('MIN_AGG(rep_links_submission, commission_percentage)', relationshipContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## MAX_AGG

**Signature:** `MAX_AGG(relationship, value)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Finds the maximum value

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([expression](../types.md#expression)): Expression to find maximum of


<details>
<summary><strong>Test References</strong> (1 found)</summary>

- **aggregate-functions.test.js** (1 reference)
  - [Line 65](../../tests/aggregate-functions.test.js#L65): `const result = evaluateFormula('MAX_AGG(rep_links_submission, commission_percentage)', relationshipContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## STRING_AGG

**Signature:** `STRING_AGG(relationship, value, separator)`  
**Returns:** [string](../types.md#string)  
**Description:** Concatenates string values with a separator

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([string](../types.md#string)): String expression to concatenate
- `separator` ([string](../types.md#string)): Separator between values


<details>
<summary><strong>Test References</strong> (18 found)</summary>

- **aggregate-functions.test.js** (10 references)
  - [Line 14](../../tests/aggregate-functions.test.js#L14): `const result = evaluateFormula('STRING_AGG(rep_links_submission, commission_percentage, ",")', relationshipContext);`
  - [Line 22](../../tests/aggregate-functions.test.js#L22): `const result = evaluateFormula('STRING_AGG(rep_links_submission, rep_rel.name, ",")', relationshipContext);`
  - [Line 111](../../tests/aggregate-functions.test.js#L111): `const result = evaluateFormula('STRING_AGG(rep_links_submission, rep_rel.name, ",")', relationshipContext);`
  - [Line 126](../../tests/aggregate-functions.test.js#L126): `const result = evaluateFormula('STRING_AGG(submissions_merchant.rep_links_submission, rep_rel.name, ",")', relationshipContext);`
  - [Line 177](../../tests/aggregate-functions.test.js#L177): `evaluateFormula('STRING_AGG(rela.relb.relc.reld.rele.relf.relg.relh, value, ",")', relationshipContext);`
  - [Line 208](../../tests/aggregate-functions.test.js#L208): `const result = evaluateFormula('STRING_AGG(submissions_merchant.locations_merchant.staff_location, name, ",")', relationshipContext);`
  - [Line 225](../../tests/aggregate-functions.test.js#L225): `() => evaluateFormula('STRING_AGG(rep_links_submission)', relationshipContext),`
  - [Line 249](../../tests/aggregate-functions.test.js#L249): `() => evaluateFormula('STRING_AGG(rep_links_submission, commission_percentage, 123)', relationshipContext),`
  - [Line 269](../../tests/aggregate-functions.test.js#L269): `() => evaluateFormula('STRING_AGG(unknown_table.unknown_field, value, ",")', relationshipContext),`
  - [Line 279](../../tests/aggregate-functions.test.js#L279): `evaluateFormula('STRING_AGG(rep_links_submission.invalid_relationship, value, ",")', relationshipContext);`

- **compiler-modularization.test.js** (8 references)
  - [Line 156](../../tests/compiler-modularization.test.js#L156): `const result = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext);`
  - [Line 182](../../tests/compiler-modularization.test.js#L182): `const result1 = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext);`
  - [Line 183](../../tests/compiler-modularization.test.js#L183): `const result2 = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext);`
  - [Line 190](../../tests/compiler-modularization.test.js#L190): `const result1 = evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext);`
  - [Line 191](../../tests/compiler-modularization.test.js#L191): `const result2 = evaluateFormula('STRING_AGG(rep_links, rep_rel.rate, ", ")', baseContext);`
  - [Line 221](../../tests/compiler-modularization.test.js#L221): `rep_names: evaluateFormula('STRING_AGG(rep_links, rep_rel.name, ", ")', baseContext),`
  - [Line 239](../../tests/compiler-modularization.test.js#L239): `complex_calc: evaluateFormula('IF(amount > 100, merchant_rel.name & " - " & STRING_AGG(rep_links, rep_rel.name, ", "), "simple")', baseContext)`
  - [Line 266](../../tests/compiler-modularization.test.js#L266): `evaluateFormula('STRING_AGG(unknown_rel, name, ", ")', baseContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (6 found)</summary>

- **src/sql-generator.js** (6 references)
  - [Line 289](../../src/sql-generator.js#L289): `aggSQL = `STRING_AGG(${exprSQL}, ${delimiterSQL})`;`
  - [Line 293](../../src/sql-generator.js#L293): `aggSQL = `STRING_AGG(DISTINCT ${exprSQL}, ${delimiterSQL2})`;`
  - [Line 396](../../src/sql-generator.js#L396): `aggSQL = `STRING_AGG(${exprSQL}, ${delimiterSQL})`;`
  - [Line 400](../../src/sql-generator.js#L400): `aggSQL = `STRING_AGG(DISTINCT ${exprSQL}, ${delimiterSQL2})`;`
  - [Line 470](../../src/sql-generator.js#L470): `aggSQL = `STRING_AGG(${exprSQL}, ${delimiterSQL})`;`
  - [Line 474](../../src/sql-generator.js#L474): `aggSQL = `STRING_AGG(DISTINCT ${exprSQL}, ${delimiterSQL2})`;`
</details>

---

## STRING_AGG_DISTINCT

**Signature:** `STRING_AGG_DISTINCT(relationship, value, separator)`  
**Returns:** [string](../types.md#string)  
**Description:** Concatenates unique string values with a separator

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([string](../types.md#string)): String expression to concatenate
- `separator` ([string](../types.md#string)): Separator between values


<details>
<summary><strong>Test References</strong> (1 found)</summary>

- **aggregate-functions.test.js** (1 reference)
  - [Line 29](../../tests/aggregate-functions.test.js#L29): `const result = evaluateFormula('STRING_AGG_DISTINCT(rep_links_submission, commission_percentage, "|")', relationshipContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## SUM_AGG

**Signature:** `SUM_AGG(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Sums numeric values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([number](../types.md#number)): Numeric expression to sum


<details>
<summary><strong>Test References</strong> (13 found)</summary>

- **aggregate-functions.test.js** (13 references)
  - [Line 37](../../tests/aggregate-functions.test.js#L37): `const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage)', relationshipContext);`
  - [Line 88](../../tests/aggregate-functions.test.js#L88): `const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage) + COUNT_AGG(rep_links_submission, commission_percentage)', relationshipContext);`
  - [Line 96](../../tests/aggregate-functions.test.js#L96): `const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage) + COUNT_AGG(documents_submission, size)', relationshipContext);`
  - [Line 104](../../tests/aggregate-functions.test.js#L104): `const result = evaluateFormula('IF(SUM_AGG(rep_links_submission, commission_percentage) > 100, "High Commission", "Low Commission")', relationshipContext);`
  - [Line 160](../../tests/aggregate-functions.test.js#L160): `const result = evaluateFormula('SUM_AGG(submissions_merchant.rep_links_submission, commission_percentage)', relationshipContext);`
  - [Line 193](../../tests/aggregate-functions.test.js#L193): `const result = evaluateFormula('IF(SUM_AGG(submissions_merchant.rep_links_submission, commission_percentage) > 100, "High", "Low")', relationshipContext);`
  - [Line 233](../../tests/aggregate-functions.test.js#L233): `() => evaluateFormula('SUM_AGG(rep_links_submission)', relationshipContext),`
  - [Line 241](../../tests/aggregate-functions.test.js#L241): `() => evaluateFormula('SUM_AGG(unknown_relationship, amount)', relationshipContext),`
  - [Line 257](../../tests/aggregate-functions.test.js#L257): `() => evaluateFormula('SUM_AGG("not_a_relationship", commission_percentage)', relationshipContext),`
  - [Line 294](../../tests/aggregate-functions.test.js#L294): `const result = evaluateFormula('"Total: " & STRING(SUM_AGG(rep_links_submission, commission_percentage))', relationshipContext);`
  - [Line 300](../../tests/aggregate-functions.test.js#L300): `const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage) > 50', relationshipContext);`
  - [Line 325](../../tests/aggregate-functions.test.js#L325): `const result = evaluateFormula('SUM_AGG(submissions_merchant.rep_links_submission, commission_percentage) > 100', relationshipContext);`
  - [Line 339](../../tests/aggregate-functions.test.js#L339): `const result = evaluateFormula('SUM_AGG(submissions_merchant.rep_links_submission, commission_percentage) + COUNT_AGG(submissions_merchant.documents_submission, size)', relationshipContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## COUNT_AGG

**Signature:** `COUNT_AGG(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Counts the number of non-null values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([expression](../types.md#expression)): Expression to count


<details>
<summary><strong>Test References</strong> (7 found)</summary>

- **aggregate-functions.test.js** (6 references)
  - [Line 44](../../tests/aggregate-functions.test.js#L44): `const result = evaluateFormula('COUNT_AGG(rep_links_submission, commission_percentage)', relationshipContext);`
  - [Line 88](../../tests/aggregate-functions.test.js#L88): `const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage) + COUNT_AGG(rep_links_submission, commission_percentage)', relationshipContext);`
  - [Line 96](../../tests/aggregate-functions.test.js#L96): `const result = evaluateFormula('SUM_AGG(rep_links_submission, commission_percentage) + COUNT_AGG(documents_submission, size)', relationshipContext);`
  - [Line 146](../../tests/aggregate-functions.test.js#L146): `const result = evaluateFormula('COUNT_AGG(submissions_merchant.rep_links_submission, rep_rel.id)', relationshipContext);`
  - [Line 311](../../tests/aggregate-functions.test.js#L311): `const result = evaluateFormula('"Total reps: " & STRING(COUNT_AGG(submissions_merchant.rep_links_submission, rep_rel.id))', relationshipContext);`
  - [Line 339](../../tests/aggregate-functions.test.js#L339): `const result = evaluateFormula('SUM_AGG(submissions_merchant.rep_links_submission, commission_percentage) + COUNT_AGG(submissions_merchant.documents_submission, size)', relationshipContext);`

- **compiler-modularization.test.js** (1 reference)
  - [Line 222](../../tests/compiler-modularization.test.js#L222): `rep_count: evaluateFormula('COUNT_AGG(rep_links, rep_rel.id)', baseContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## AVG_AGG

**Signature:** `AVG_AGG(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Calculates the average of numeric values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([number](../types.md#number)): Numeric expression to average


<details>
<summary><strong>Test References</strong> (1 found)</summary>

- **aggregate-functions.test.js** (1 reference)
  - [Line 51](../../tests/aggregate-functions.test.js#L51): `const result = evaluateFormula('AVG_AGG(rep_links_submission, commission_percentage)', relationshipContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## AND_AGG

**Signature:** `AND_AGG(relationship, value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if all boolean values are true

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([boolean](../types.md#boolean)): Boolean expression to check


<details>
<summary><strong>Test References</strong> (1 found)</summary>

- **aggregate-functions.test.js** (1 reference)
  - [Line 73](../../tests/aggregate-functions.test.js#L73): `const result = evaluateFormula('AND_AGG(rep_links_submission, commission_percentage > 0)', relationshipContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## OR_AGG

**Signature:** `OR_AGG(relationship, value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if any boolean value is true

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([boolean](../types.md#boolean)): Boolean expression to check


<details>
<summary><strong>Test References</strong> (1 found)</summary>

- **aggregate-functions.test.js** (1 reference)
  - [Line 80](../../tests/aggregate-functions.test.js#L80): `const result = evaluateFormula('OR_AGG(rep_links_submission, commission_percentage > 10)', relationshipContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>


*Documentation generated on 2025-06-22T21:40:57.303Z*
