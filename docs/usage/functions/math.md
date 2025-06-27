# Math Functions


## ROUND

**Signature:** `ROUND(number, decimals)`  
**Returns:** [number](../types.md#number)  
**Description:** Rounds a number to specified decimal places

**Arguments:**
- `number` ([number](../types.md#number)): Number to round
- `decimals` ([number](../types.md#number)): Number of decimal places


<details>
<summary><strong>Test References</strong> (9 found)</summary>

- **math-functions.test.js** (9 references)
  - [Line 12](/tests/math-functions.test.js#L12): `const result = evaluateFormula('ROUND(3.14159, 2)', testContext);`
  - [Line 18](/tests/math-functions.test.js#L18): `const result = evaluateFormula('ROUND(revenue, 0)', testContext);`
  - [Line 96](/tests/math-functions.test.js#L96): `const result = evaluateFormula('ROUND(ABS(revenue - cost) / MAX(revenue, cost) * 100, 2)', testContext);`
  - [Line 102](/tests/math-functions.test.js#L102): `const result = evaluateFormula('ROUND(revenue * 0.1, 2) + MIN(cost, 100)', testContext);`
  - [Line 108](/tests/math-functions.test.js#L108): `const result = evaluateFormula('STRING(ROUND(revenue, 2)) & " (max with cost: " & STRING(MAX(revenue, cost)) & ")"', testContext);`
  - [Line 115](/tests/math-functions.test.js#L115): `() => evaluateFormula('ROUND(3.14, "world")', testContext),`
  - [Line 160](/tests/math-functions.test.js#L160): `() => evaluateFormula('ROUND(MIN("a", "b"), ABS("c"))', testContext),`
  - [Line 171](/tests/math-functions.test.js#L171): `() => evaluateFormula('ROUND(3.14)', testContext),`
  - [Line 180](/tests/math-functions.test.js#L180): `() => evaluateFormula('ROUND("hello", 2)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (13 found)</summary>

- **examples/table/customer/budget_analysis.formula** (1 reference)
  - [Line 1](/examples/table/customer/budget_analysis.formula#L1): `first_name & " " & last_name & " | Budget Range: $" & STRING(ROUND(budget_max - budget_min, 0)) & " | Flexibility: " & STRING(ROUND((budget_max - budget_min) / budget_min * 100, 0)) & "% | Avg Target: $" & STRING(ROUND((budget_min + budget_max) / 2, 0))`

- **examples/table/customer/contact_card.formula** (1 reference)
  - [Line 1](/examples/table/customer/contact_card.formula#L1): `first_name & " " & last_name & " | " & email & " | " & phone & " | Budget: $" & STRING(ROUND(budget_min/1000, 0)) & "K-$" & STRING(ROUND(budget_max/1000, 0)) & "K | " & STRING(preferred_bedrooms) & "BR | " & UPPER(status) & " | " & assigned_rep_id_rel.name`

- **examples/table/customer/lead_score.formula** (3 references)
  - [Line 1](/examples/table/customer/lead_score.formula#L1): `STRING(ROUND(`
  - [Line 7](/examples/table/customer/lead_score.formula#L7): `, 0)) & "/100 | " & IF(ROUND(`
  - [Line 13](/examples/table/customer/lead_score.formula#L13): `, 0) > 70, "🔥 HOT", IF(ROUND(`

- **examples/table/listing/luxury_indicator.formula** (1 reference)
  - [Line 1](/examples/table/listing/luxury_indicator.formula#L1): `IF(listing_price > 800000, "💎 LUXURY", IF(listing_price > 500000, "⭐ PREMIUM", IF(listing_price > 300000, "🏠 STANDARD", "💰 AFFORDABLE"))) & " | " & STRING(bedrooms) & "BR " & STRING(bathrooms) & "BA | " & STRING(ROUND(square_feet/1000, 1)) & "K sqft"`

- **examples/table/listing/market_analysis.formula** (1 reference)
  - [Line 1](/examples/table/listing/market_analysis.formula#L1): `address & " | Market Position: " & IF(days_on_market < 30, "🔥 HOT", IF(days_on_market < 60, "📈 NORMAL", IF(days_on_market < 90, "📊 SLOW", "❄️ STALE"))) & " | " & STRING(days_on_market) & " days | Price/sqft: $" & STRING(ROUND(listing_price/square_feet, 0)) & " | " & IF(ROUND(listing_price/square_feet, 0) > 200, "💰 PREMIUM", IF(ROUND(listing_price/square_feet, 0) > 150, "📊 MARKET", "💵 VALUE"))`

- **examples/table/listing/market_summary.formula** (1 reference)
  - [Line 1](/examples/table/listing/market_summary.formula#L1): `address & " | $" & STRING(ROUND(listing_price/1000, 0)) & "K | " & STRING(bedrooms) & "bed/" & STRING(bathrooms) & "bath | " & STRING(ROUND(listing_price/square_feet, 0)) & "/sqft | " & STRING(days_on_market) & " days | " & UPPER(status)`

- **examples/table/listing/price_per_sqft.formula** (1 reference)
  - [Line 1](/examples/table/listing/price_per_sqft.formula#L1): `ROUND(listing_price / square_feet, 2)`

- **examples/table/opportunity/commission_projection.formula** (1 reference)
  - [Line 1](/examples/table/opportunity/commission_projection.formula#L1): `IF(stage = "closed", "✅ PAID: $" & STRING(ROUND(commission_total, 0)), "📊 PROJECTED: $" & STRING(ROUND(NULLVALUE(offer_amount, listing_id_rel.listing_price) * 0.06 * (probability / 100), 0))) & " | Reps: " & STRING(COUNT_AGG(rep_links_opportunity_id, rep_id))`

- **examples/table/opportunity/deal_summary.formula** (1 reference)
  - [Line 1](/examples/table/opportunity/deal_summary.formula#L1): `customer_id_rel.first_name & " " & customer_id_rel.last_name & " → " & listing_id_rel.address & " | " & UPPER(stage) & " | $" & STRING(ROUND(NULLVALUE(offer_amount, listing_id_rel.listing_price)/1000, 0)) & "K | " & STRING(probability) & "% | " & NULLVALUE(financing_type, "TBD")`

- **examples/table/rep/commission_summary.formula** (1 reference)
  - [Line 1](/examples/table/rep/commission_summary.formula#L1): `name & " | Earned: $" & STRING(ROUND(SUM_AGG(rep_links_rep_id, NULLVALUE(commission_amount, 0)), 0)) & " | Pending: $" & STRING(ROUND(SUM_AGG(rep_links_rep_id, IF(ISNULL(commission_amount), 50000 * commission_percentage / 100, 0)), 0)) & " | Deals: " & STRING(COUNT_AGG(rep_links_rep_id, id))`

- **examples/table/rep/performance_dashboard.formula** (1 reference)
  - [Line 1](/examples/table/rep/performance_dashboard.formula#L1): `name & " (" & region & ") | Goal: $" & STRING(ROUND(sales_goal/1000, 0)) & "K | Active Listings: " & STRING(COUNT_AGG(listings_listing_agent_id, id)) & " | Opportunities: " & STRING(COUNT_AGG(rep_links_rep_id, id)) & " | Rate: " & STRING(commission_rate * 100) & "%"`
</details>

---

## ABS

**Signature:** `ABS(number)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the absolute value of a number

**Arguments:**
- `number` ([number](../types.md#number)): Number to get absolute value of


<details>
<summary><strong>Test References</strong> (7 found)</summary>

- **if-function.test.js** (1 reference)
  - [Line 66](/tests/if-function.test.js#L66): `const result = evaluateFormula('IF(ABS(revenue - cost) > 1000, "Large difference", "Small difference")', testContext);`

- **math-functions.test.js** (6 references)
  - [Line 24](/tests/math-functions.test.js#L24): `const result = evaluateFormula('ABS(-25.5)', testContext);`
  - [Line 30](/tests/math-functions.test.js#L30): `const result = evaluateFormula('ABS(cost)', testContext);`
  - [Line 96](/tests/math-functions.test.js#L96): `const result = evaluateFormula('ROUND(ABS(revenue - cost) / MAX(revenue, cost) * 100, 2)', testContext);`
  - [Line 160](/tests/math-functions.test.js#L160): `() => evaluateFormula('ROUND(MIN("a", "b"), ABS("c"))', testContext),`
  - [Line 189](/tests/math-functions.test.js#L189): `() => evaluateFormula('ABS()', testContext),`
  - [Line 198](/tests/math-functions.test.js#L198): `() => evaluateFormula('ABS("hello")', testContext),`
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
<summary><strong>Test References</strong> (4 found)</summary>

- **math-functions.test.js** (4 references)
  - [Line 72](/tests/math-functions.test.js#L72): `const result = evaluateFormula('CEILING(3.2)', testContext);`
  - [Line 78](/tests/math-functions.test.js#L78): `const result = evaluateFormula('CEILING(revenue)', testContext);`
  - [Line 142](/tests/math-functions.test.js#L142): `() => evaluateFormula('CEILING(3.2, 5)', testContext),`
  - [Line 234](/tests/math-functions.test.js#L234): `() => evaluateFormula('CEILING(TODAY())', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## FLOOR

**Signature:** `FLOOR(number)`  
**Returns:** [number](../types.md#number)  
**Description:** Rounds a number down to the nearest integer

**Arguments:**
- `number` ([number](../types.md#number)): Number to round down


<details>
<summary><strong>Test References</strong> (3 found)</summary>

- **math-functions.test.js** (3 references)
  - [Line 84](/tests/math-functions.test.js#L84): `const result = evaluateFormula('FLOOR(8.9)', testContext);`
  - [Line 90](/tests/math-functions.test.js#L90): `const result = evaluateFormula('FLOOR(cost)', testContext);`
  - [Line 151](/tests/math-functions.test.js#L151): `() => evaluateFormula('FLOOR("text")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
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
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
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
  - [Line 36](/tests/math-functions.test.js#L36): `const result = evaluateFormula('MIN(10, 20)', testContext);`
  - [Line 42](/tests/math-functions.test.js#L42): `const result = evaluateFormula('MIN(revenue, cost)', testContext);`
  - [Line 102](/tests/math-functions.test.js#L102): `const result = evaluateFormula('ROUND(revenue * 0.1, 2) + MIN(cost, 100)', testContext);`
  - [Line 160](/tests/math-functions.test.js#L160): `() => evaluateFormula('ROUND(MIN("a", "b"), ABS("c"))', testContext),`
  - [Line 207](/tests/math-functions.test.js#L207): `() => evaluateFormula('MIN(5)', testContext),`
  - [Line 216](/tests/math-functions.test.js#L216): `() => evaluateFormula('MIN("hello", "world")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
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
  - [Line 48](/tests/math-functions.test.js#L48): `const result = evaluateFormula('MAX(15, 8)', testContext);`
  - [Line 54](/tests/math-functions.test.js#L54): `const result = evaluateFormula('MAX(revenue, cost)', testContext);`
  - [Line 96](/tests/math-functions.test.js#L96): `const result = evaluateFormula('ROUND(ABS(revenue - cost) / MAX(revenue, cost) * 100, 2)', testContext);`
  - [Line 108](/tests/math-functions.test.js#L108): `const result = evaluateFormula('STRING(ROUND(revenue, 2)) & " (max with cost: " & STRING(MAX(revenue, cost)) & ")"', testContext);`
  - [Line 124](/tests/math-functions.test.js#L124): `() => evaluateFormula('MAX(10, TODAY())', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
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
<summary><strong>Test References</strong> (4 found)</summary>

- **math-functions.test.js** (4 references)
  - [Line 60](/tests/math-functions.test.js#L60): `const result = evaluateFormula('MOD(17, 5)', testContext);`
  - [Line 66](/tests/math-functions.test.js#L66): `const result = evaluateFormula('MOD(revenue, 10)', testContext);`
  - [Line 133](/tests/math-functions.test.js#L133): `() => evaluateFormula('MOD(revenue, "divisor")', testContext),`
  - [Line 225](/tests/math-functions.test.js#L225): `() => evaluateFormula('MOD(17, 5, 3)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
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


*Documentation generated on 2025-06-27T07:39:53.106Z*
