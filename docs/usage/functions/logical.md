# Logical Functions


## AND

**Signature:** `AND(argument...)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if all arguments are true

**Arguments:**
- `argument` ([boolean](../types.md#boolean)): Boolean conditions to check *(variadic)*


<details>
<summary><strong>Test References</strong> (15 found)</summary>

- **boolean-literals.test.js** (1 reference)
  - [Line 30](/tests/boolean-literals.test.js#L30): `const result = evaluateFormula('AND(TRUE, FALSE)', testContext);`

- **if-function.test.js** (1 reference)
  - [Line 42](/tests/if-function.test.js#L42): `const result = evaluateFormula('IF(AND(revenue > 1000, cost < 500), "Good Deal", "Check Again")', testContext);`

- **logical-operators-functions.test.js** (13 references)
  - [Line 12](/tests/logical-operators-functions.test.js#L12): `const result = evaluateFormula('AND(revenue > 1000, cost < 500)', testContext);`
  - [Line 17](/tests/logical-operators-functions.test.js#L17): `const result = evaluateFormula('AND(revenue > 1000, cost < 500, amount > 0)', testContext);`
  - [Line 22](/tests/logical-operators-functions.test.js#L22): `const result = evaluateFormula('AND(closed, syndication)', testContext);`
  - [Line 27](/tests/logical-operators-functions.test.js#L27): `const result = evaluateFormula('AND(TRUE, FALSE)', testContext);`
  - [Line 70](/tests/logical-operators-functions.test.js#L70): `const result = evaluateFormula('AND(OR(revenue > 1000, cost < 100), revenue < 10000)', testContext);`
  - [Line 75](/tests/logical-operators-functions.test.js#L75): `const result = evaluateFormula('NOT(AND(revenue > 1000, cost < 100))', testContext);`
  - [Line 80](/tests/logical-operators-functions.test.js#L80): `const result = evaluateFormula('OR(AND(revenue > 1000, NOT(closed)), amount = 0)', testContext);`
  - [Line 86](/tests/logical-operators-functions.test.js#L86): `const result = evaluateFormula('AND(revenue > 0, cost > 0, amount > 0, closed)', testContext);`
  - [Line 97](/tests/logical-operators-functions.test.js#L97): `const result = evaluateFormula('AND(ISNULL(revenue), ISBLANK(note))', testContext);`
  - [Line 109](/tests/logical-operators-functions.test.js#L109): `() => evaluateFormula('AND()', testContext),`
  - [Line 117](/tests/logical-operators-functions.test.js#L117): `() => evaluateFormula('AND(TRUE)', testContext),`
  - [Line 157](/tests/logical-operators-functions.test.js#L157): `() => evaluateFormula('AND(revenue, cost)', testContext),`
  - [Line 181](/tests/logical-operators-functions.test.js#L181): `() => evaluateFormula('AND(revenue > 1000, cost, closed)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **examples/table/submission/compliance_check.formula** (1 reference)
  - [Line 1](/examples/table/submission/compliance_check.formula#L1): `IF(AND(amount <= 250000, DATEDIF(created_at, TODAY(), "days") <= 60), "✅ COMPLIANT", "⚠️ REVIEW NEEDED") & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`

- **examples/table/submission/seasonal_analysis.formula** (1 reference)
  - [Line 1](/examples/table/submission/seasonal_analysis.formula#L1): `IF(AND(MONTH(created_at) >= 3, MONTH(created_at) <= 5), "🌸 SPRING", IF(AND(MONTH(created_at) >= 6, MONTH(created_at) <= 8), "☀️ SUMMER", IF(AND(MONTH(created_at) >= 9, MONTH(created_at) <= 11), "🍂 FALL", "❄️ WINTER"))) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name`
</details>

---

## OR

**Signature:** `OR(argument...)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if any argument is true

**Arguments:**
- `argument` ([boolean](../types.md#boolean)): Boolean conditions to check *(variadic)*


<details>
<summary><strong>Test References</strong> (12 found)</summary>

- **boolean-literals.test.js** (1 reference)
  - [Line 36](/tests/boolean-literals.test.js#L36): `const result = evaluateFormula('OR(TRUE, FALSE)', testContext);`

- **logical-operators-functions.test.js** (11 references)
  - [Line 33](/tests/logical-operators-functions.test.js#L33): `const result = evaluateFormula('OR(revenue > 5000, cost < 100)', testContext);`
  - [Line 38](/tests/logical-operators-functions.test.js#L38): `const result = evaluateFormula('OR(revenue > 5000, cost < 100, amount = 0)', testContext);`
  - [Line 43](/tests/logical-operators-functions.test.js#L43): `const result = evaluateFormula('OR(closed, open_approval)', testContext);`
  - [Line 48](/tests/logical-operators-functions.test.js#L48): `const result = evaluateFormula('OR(TRUE, FALSE)', testContext);`
  - [Line 70](/tests/logical-operators-functions.test.js#L70): `const result = evaluateFormula('AND(OR(revenue > 1000, cost < 100), revenue < 10000)', testContext);`
  - [Line 80](/tests/logical-operators-functions.test.js#L80): `const result = evaluateFormula('OR(AND(revenue > 1000, NOT(closed)), amount = 0)', testContext);`
  - [Line 91](/tests/logical-operators-functions.test.js#L91): `const result = evaluateFormula('OR(revenue > 5000, cost < 100, amount = 0, closed, syndication)', testContext);`
  - [Line 102](/tests/logical-operators-functions.test.js#L102): `const result = evaluateFormula('OR(ISNULL(revenue), revenue > 1000)', testContext);`
  - [Line 125](/tests/logical-operators-functions.test.js#L125): `() => evaluateFormula('OR()', testContext),`
  - [Line 133](/tests/logical-operators-functions.test.js#L133): `() => evaluateFormula('OR(FALSE)', testContext),`
  - [Line 165](/tests/logical-operators-functions.test.js#L165): `() => evaluateFormula('OR(revenue > 1000, "text")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **examples/table/submission/weekend_detector.formula** (1 reference)
  - [Line 1](/examples/table/submission/weekend_detector.formula#L1): `IF(OR(WEEKDAY(created_at) = 1, WEEKDAY(created_at) = 7), "📅 WEEKEND SUBMISSION", "🏢 WEEKDAY SUBMISSION") & " | " & STRING(WEEKDAY(created_at)) & "/7"`
</details>

---

## NOT

**Signature:** `NOT(requires boolean argument)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns the opposite of a boolean value

**Arguments:**
- `requires boolean argument` ([boolean](../types.md#boolean)): Boolean condition to negate


<details>
<summary><strong>Test References</strong> (9 found)</summary>

- **boolean-literals.test.js** (1 reference)
  - [Line 24](/tests/boolean-literals.test.js#L24): `const result = evaluateFormula('NOT(FALSE)', testContext);`

- **logical-operators-functions.test.js** (8 references)
  - [Line 54](/tests/logical-operators-functions.test.js#L54): `const result = evaluateFormula('NOT(revenue > 1000)', testContext);`
  - [Line 59](/tests/logical-operators-functions.test.js#L59): `const result = evaluateFormula('NOT(closed)', testContext);`
  - [Line 64](/tests/logical-operators-functions.test.js#L64): `const result = evaluateFormula('NOT(TRUE)', testContext);`
  - [Line 75](/tests/logical-operators-functions.test.js#L75): `const result = evaluateFormula('NOT(AND(revenue > 1000, cost < 100))', testContext);`
  - [Line 80](/tests/logical-operators-functions.test.js#L80): `const result = evaluateFormula('OR(AND(revenue > 1000, NOT(closed)), amount = 0)', testContext);`
  - [Line 141](/tests/logical-operators-functions.test.js#L141): `() => evaluateFormula('NOT()', testContext),`
  - [Line 149](/tests/logical-operators-functions.test.js#L149): `() => evaluateFormula('NOT(TRUE, FALSE)', testContext),`
  - [Line 173](/tests/logical-operators-functions.test.js#L173): `() => evaluateFormula('NOT(revenue)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>


*Documentation generated on 2025-06-22T21:51:19.656Z*
