# Date Functions


## NOW

**Signature:** `NOW()`  
**Returns:** [date](../types.md#date)  
**Description:** Returns the current date and time

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

## TODAY

**Signature:** `TODAY()`  
**Returns:** [date](../types.md#date)  
**Description:** Returns the current date (without time)

**Arguments:** None


<details>
<summary><strong>Test References</strong> (15 found)</summary>

- **core-functions.test.js** (4 references)
  - [Line 12](/tests/core-functions.test.js#L12): `const result = evaluateFormula('TODAY()', testContext);`
  - [Line 30](/tests/core-functions.test.js#L30): `const result = evaluateFormula('today()', testContext);`
  - [Line 41](/tests/core-functions.test.js#L41): `const result = evaluateFormula('STRING(revenue) & " on " & STRING(TODAY())', testContext);`
  - [Line 48](/tests/core-functions.test.js#L48): `() => evaluateFormula('TODAY(5)', testContext),`

- **date-functions.test.js** (7 references)
  - [Line 18](/tests/date-functions.test.js#L18): `const result = evaluateFormula('YEAR(TODAY())', testContext);`
  - [Line 36](/tests/date-functions.test.js#L36): `const result = evaluateFormula('MONTH(TODAY())', testContext);`
  - [Line 60](/tests/date-functions.test.js#L60): `const result = evaluateFormula('WEEKDAY(TODAY())', testContext);`
  - [Line 72](/tests/date-functions.test.js#L72): `const result = evaluateFormula('ADDMONTHS(TODAY(), -3)', testContext);`
  - [Line 84](/tests/date-functions.test.js#L84): `const result = evaluateFormula('ADDDAYS(TODAY(), -7)', testContext);`
  - [Line 96](/tests/date-functions.test.js#L96): `const result = evaluateFormula('DATEDIF(created_date, TODAY(), "months")', testContext);`
  - [Line 102](/tests/date-functions.test.js#L102): `const result = evaluateFormula('DATEDIF(DATE("2020-01-01"), TODAY(), "years")', testContext);`

- **math-functions.test.js** (2 references)
  - [Line 124](/tests/math-functions.test.js#L124): `() => evaluateFormula('MAX(10, TODAY())', testContext),`
  - [Line 234](/tests/math-functions.test.js#L234): `() => evaluateFormula('CEILING(TODAY())', testContext),`

- **text-functions.test.js** (2 references)
  - [Line 209](/tests/text-functions.test.js#L209): `() => evaluateFormula('LEN(TODAY())', testContext),`
  - [Line 281](/tests/text-functions.test.js#L281): `() => evaluateFormula('SUBSTITUTE(revenue, "hello", TODAY())', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (6 found)</summary>

- **examples/table/submission/approval_status.formula** (1 reference)
  - [Line 1](/examples/table/submission/approval_status.formula#L1): `IF(status = "approved", "✅ APPROVED on " & STRING(MONTH(updated_at)) & "/" & STRING(DAY(updated_at)), IF(status = "rejected", "❌ REJECTED", IF(DATEDIF(created_at, TODAY(), "days") > 30, "⚠️ OVERDUE", "📋 IN PROGRESS")))`

- **examples/table/submission/compliance_check.formula** (1 reference)
  - [Line 1](/examples/table/submission/compliance_check.formula#L1): `IF(AND(amount <= 250000, DATEDIF(created_at, TODAY(), "days") <= 60), "✅ COMPLIANT", "⚠️ REVIEW NEEDED") & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`

- **examples/table/submission/comprehensive_dashboard.formula** (1 reference)
  - [Line 1](/examples/table/submission/comprehensive_dashboard.formula#L1): `merchant_rel.business_name & " | $" & STRING(ROUND(amount, 0)) & " | " & STRING(COUNT_AGG(rep_links_submission, rep)) & " reps | " & STRING(DATEDIF(created_at, TODAY(), "days")) & "d old | " & UPPER(status) & " | Q" & STRING(CEILING(MONTH(created_at) / 3)) & "/" & STRING(YEAR(created_at))`

- **examples/table/submission/performance_score.formula** (1 reference)
  - [Line 1](/examples/table/submission/performance_score.formula#L1): `ROUND(MIN(100, MAX(0, (amount / 1000) * 10 + AVG_AGG(rep_links_submission, commission_percentage) - DATEDIF(created_at, TODAY(), "days") * 0.1)), 1)`

- **examples/table/submission/status_report.formula** (1 reference)
  - [Line 1](/examples/table/submission/status_report.formula#L1): `IF(status = "approved", "✅ APPROVED", IF(status = "pending", "⏳ PENDING", "❌ " & UPPER(status))) & " | Days since creation: " & STRING(ROUND(DATEDIF(created_at, TODAY(), "days"),0))`

- **examples/table/submission/timeline_tracker.formula** (1 reference)
  - [Line 1](/examples/table/submission/timeline_tracker.formula#L1): `"Created: " & STRING(MONTH(created_at)) & "/" & STRING(DAY(created_at)) & "/" & STRING(YEAR(created_at)) & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`
</details>

---

## YEAR

**Signature:** `YEAR(date)`  
**Returns:** [number](../types.md#number)  
**Description:** Extracts the year from a date

**Arguments:**
- `date` ([date](../types.md#date)): Date to extract year from


<details>
<summary><strong>Test References</strong> (9 found)</summary>

- **date-functions.test.js** (8 references)
  - [Line 12](/tests/date-functions.test.js#L12): `const result = evaluateFormula('YEAR(created_date)', testContext);`
  - [Line 18](/tests/date-functions.test.js#L18): `const result = evaluateFormula('YEAR(TODAY())', testContext);`
  - [Line 24](/tests/date-functions.test.js#L24): `const result = evaluateFormula('YEAR(DATE("2023-12-25"))', testContext);`
  - [Line 108](/tests/date-functions.test.js#L108): `const result = evaluateFormula('YEAR(created_date) + MONTH(created_date)', testContext);`
  - [Line 114](/tests/date-functions.test.js#L114): `const result = evaluateFormula('STRING(YEAR(created_date)) & "-" & STRING(MONTH(created_date))', testContext);`
  - [Line 129](/tests/date-functions.test.js#L129): `() => evaluateFormula('YEAR()', testContext),`
  - [Line 138](/tests/date-functions.test.js#L138): `() => evaluateFormula('YEAR(revenue)', testContext),`
  - [Line 264](/tests/date-functions.test.js#L264): `() => evaluateFormula('YEAR(MONTH(created_date))', testContext),`

- **if-function.test.js** (1 reference)
  - [Line 84](/tests/if-function.test.js#L84): `const result = evaluateFormula('IF(YEAR(created_date) = 2023, "This year", "Other year")', testContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (4 found)</summary>

- **examples/table/submission/comprehensive_dashboard.formula** (1 reference)
  - [Line 1](/examples/table/submission/comprehensive_dashboard.formula#L1): `merchant_rel.business_name & " | $" & STRING(ROUND(amount, 0)) & " | " & STRING(COUNT_AGG(rep_links_submission, rep)) & " reps | " & STRING(DATEDIF(created_at, TODAY(), "days")) & "d old | " & UPPER(status) & " | Q" & STRING(CEILING(MONTH(created_at) / 3)) & "/" & STRING(YEAR(created_at))`

- **examples/table/submission/quarterly_report.formula** (1 reference)
  - [Line 1](/examples/table/submission/quarterly_report.formula#L1): `"Q" & STRING(CEILING(MONTH(created_at) / 3)) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name & " | $" & STRING(amount)`

- **examples/table/submission/seasonal_analysis.formula** (1 reference)
  - [Line 1](/examples/table/submission/seasonal_analysis.formula#L1): `IF(AND(MONTH(created_at) >= 3, MONTH(created_at) <= 5), "🌸 SPRING", IF(AND(MONTH(created_at) >= 6, MONTH(created_at) <= 8), "☀️ SUMMER", IF(AND(MONTH(created_at) >= 9, MONTH(created_at) <= 11), "🍂 FALL", "❄️ WINTER"))) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name`

- **examples/table/submission/timeline_tracker.formula** (1 reference)
  - [Line 1](/examples/table/submission/timeline_tracker.formula#L1): `"Created: " & STRING(MONTH(created_at)) & "/" & STRING(DAY(created_at)) & "/" & STRING(YEAR(created_at)) & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`
</details>

---

## MONTH

**Signature:** `MONTH(date)`  
**Returns:** [number](../types.md#number)  
**Description:** Extracts the month from a date (1-12)

**Arguments:**
- `date` ([date](../types.md#date)): Date to extract month from


<details>
<summary><strong>Test References</strong> (6 found)</summary>

- **date-functions.test.js** (6 references)
  - [Line 30](/tests/date-functions.test.js#L30): `const result = evaluateFormula('MONTH(updated_date)', testContext);`
  - [Line 36](/tests/date-functions.test.js#L36): `const result = evaluateFormula('MONTH(TODAY())', testContext);`
  - [Line 108](/tests/date-functions.test.js#L108): `const result = evaluateFormula('YEAR(created_date) + MONTH(created_date)', testContext);`
  - [Line 114](/tests/date-functions.test.js#L114): `const result = evaluateFormula('STRING(YEAR(created_date)) & "-" & STRING(MONTH(created_date))', testContext);`
  - [Line 192](/tests/date-functions.test.js#L192): `() => evaluateFormula('MONTH("hello")', testContext),`
  - [Line 264](/tests/date-functions.test.js#L264): `() => evaluateFormula('YEAR(MONTH(created_date))', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (5 found)</summary>

- **examples/table/submission/approval_status.formula** (1 reference)
  - [Line 1](/examples/table/submission/approval_status.formula#L1): `IF(status = "approved", "✅ APPROVED on " & STRING(MONTH(updated_at)) & "/" & STRING(DAY(updated_at)), IF(status = "rejected", "❌ REJECTED", IF(DATEDIF(created_at, TODAY(), "days") > 30, "⚠️ OVERDUE", "📋 IN PROGRESS")))`

- **examples/table/submission/comprehensive_dashboard.formula** (1 reference)
  - [Line 1](/examples/table/submission/comprehensive_dashboard.formula#L1): `merchant_rel.business_name & " | $" & STRING(ROUND(amount, 0)) & " | " & STRING(COUNT_AGG(rep_links_submission, rep)) & " reps | " & STRING(DATEDIF(created_at, TODAY(), "days")) & "d old | " & UPPER(status) & " | Q" & STRING(CEILING(MONTH(created_at) / 3)) & "/" & STRING(YEAR(created_at))`

- **examples/table/submission/quarterly_report.formula** (1 reference)
  - [Line 1](/examples/table/submission/quarterly_report.formula#L1): `"Q" & STRING(CEILING(MONTH(created_at) / 3)) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name & " | $" & STRING(amount)`

- **examples/table/submission/seasonal_analysis.formula** (1 reference)
  - [Line 1](/examples/table/submission/seasonal_analysis.formula#L1): `IF(AND(MONTH(created_at) >= 3, MONTH(created_at) <= 5), "🌸 SPRING", IF(AND(MONTH(created_at) >= 6, MONTH(created_at) <= 8), "☀️ SUMMER", IF(AND(MONTH(created_at) >= 9, MONTH(created_at) <= 11), "🍂 FALL", "❄️ WINTER"))) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name`

- **examples/table/submission/timeline_tracker.formula** (1 reference)
  - [Line 1](/examples/table/submission/timeline_tracker.formula#L1): `"Created: " & STRING(MONTH(created_at)) & "/" & STRING(DAY(created_at)) & "/" & STRING(YEAR(created_at)) & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`
</details>

---

## DAY

**Signature:** `DAY(date)`  
**Returns:** [number](../types.md#number)  
**Description:** Extracts the day from a date (1-31)

**Arguments:**
- `date` ([date](../types.md#date)): Date to extract day from


<details>
<summary><strong>Test References</strong> (3 found)</summary>

- **date-functions.test.js** (3 references)
  - [Line 42](/tests/date-functions.test.js#L42): `const result = evaluateFormula('DAY(created_date)', testContext);`
  - [Line 48](/tests/date-functions.test.js#L48): `const result = evaluateFormula('DAY(DATE("2023-12-25"))', testContext);`
  - [Line 201](/tests/date-functions.test.js#L201): `() => evaluateFormula('DAY(created_date, updated_date)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (2 found)</summary>

- **examples/table/submission/approval_status.formula** (1 reference)
  - [Line 1](/examples/table/submission/approval_status.formula#L1): `IF(status = "approved", "✅ APPROVED on " & STRING(MONTH(updated_at)) & "/" & STRING(DAY(updated_at)), IF(status = "rejected", "❌ REJECTED", IF(DATEDIF(created_at, TODAY(), "days") > 30, "⚠️ OVERDUE", "📋 IN PROGRESS")))`

- **examples/table/submission/timeline_tracker.formula** (1 reference)
  - [Line 1](/examples/table/submission/timeline_tracker.formula#L1): `"Created: " & STRING(MONTH(created_at)) & "/" & STRING(DAY(created_at)) & "/" & STRING(YEAR(created_at)) & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`
</details>

---

## HOUR

**Signature:** `HOUR(date)`  
**Returns:** [number](../types.md#number)  
**Description:** Extracts the hour from a date (0-23)

**Arguments:**
- `date` ([date](../types.md#date)): Date to extract hour from


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## MINUTE

**Signature:** `MINUTE(date)`  
**Returns:** [number](../types.md#number)  
**Description:** Extracts the minute from a date (0-59)

**Arguments:**
- `date` ([date](../types.md#date)): Date to extract minute from


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## SECOND

**Signature:** `SECOND(date)`  
**Returns:** [number](../types.md#number)  
**Description:** Extracts the second from a date (0-59)

**Arguments:**
- `date` ([date](../types.md#date)): Date to extract second from


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## DATE_ADD

**Signature:** `DATE_ADD(date, amount, unit)`  
**Returns:** [date](../types.md#date)  
**Description:** Adds a specified amount of time to a date

**Arguments:**
- `date` ([date](../types.md#date)): Base date
- `amount` ([number](../types.md#number)): Amount to add
- `unit` ([string literal](../types.md#string-literal)): Time unit (day, month, year, hour, minute, second)


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## DATE_DIFF

**Signature:** `DATE_DIFF(date1, date2, unit)`  
**Returns:** [number](../types.md#number)  
**Description:** Calculates the difference between two dates

**Arguments:**
- `date1` ([date](../types.md#date)): First date
- `date2` ([date](../types.md#date)): Second date
- `unit` ([string literal](../types.md#string-literal)): Time unit (day, month, year, hour, minute, second)


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## FORMAT_DATE

**Signature:** `FORMAT_DATE(date, format)`  
**Returns:** [string](../types.md#string)  
**Description:** Formats a date as a string

**Arguments:**
- `date` ([date](../types.md#date)): Date to format
- `format` ([string literal](../types.md#string-literal)): Format string


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## WEEKDAY

**Signature:** `WEEKDAY(date)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the day of the week as a number (1=Sunday)

**Arguments:**
- `date` ([date](../types.md#date)): Date to get weekday from


<details>
<summary><strong>Test References</strong> (3 found)</summary>

- **date-functions.test.js** (3 references)
  - [Line 54](/tests/date-functions.test.js#L54): `const result = evaluateFormula('WEEKDAY(created_date)', testContext);`
  - [Line 60](/tests/date-functions.test.js#L60): `const result = evaluateFormula('WEEKDAY(TODAY())', testContext);`
  - [Line 210](/tests/date-functions.test.js#L210): `() => evaluateFormula('WEEKDAY(cost)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (1 found)</summary>

- **examples/table/submission/weekend_detector.formula** (1 reference)
  - [Line 1](/examples/table/submission/weekend_detector.formula#L1): `IF(OR(WEEKDAY(created_at) = 1, WEEKDAY(created_at) = 7), "📅 WEEKEND SUBMISSION", "🏢 WEEKDAY SUBMISSION") & " | " & STRING(WEEKDAY(created_at)) & "/7"`
</details>

---

## ADDMONTHS

**Signature:** `ADDMONTHS(date, months)`  
**Returns:** [date](../types.md#date)  
**Description:** Adds months to a date

**Arguments:**
- `date` ([date](../types.md#date)): Starting date
- `months` ([number](../types.md#number)): Number of months to add


<details>
<summary><strong>Test References</strong> (6 found)</summary>

- **date-functions.test.js** (6 references)
  - [Line 66](/tests/date-functions.test.js#L66): `const result = evaluateFormula('ADDMONTHS(created_date, 6)', testContext);`
  - [Line 72](/tests/date-functions.test.js#L72): `const result = evaluateFormula('ADDMONTHS(TODAY(), -3)', testContext);`
  - [Line 120](/tests/date-functions.test.js#L120): `const result = evaluateFormula('ADDDAYS(ADDMONTHS(created_date, 6), DATEDIF(created_date, updated_date, "days"))', testContext);`
  - [Line 147](/tests/date-functions.test.js#L147): `() => evaluateFormula('ADDMONTHS(created_date)', testContext),`
  - [Line 156](/tests/date-functions.test.js#L156): `() => evaluateFormula('ADDMONTHS(revenue, 6)', testContext),`
  - [Line 219](/tests/date-functions.test.js#L219): `() => evaluateFormula('ADDMONTHS(created_date, "six")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## ADDDAYS

**Signature:** `ADDDAYS(date, days)`  
**Returns:** [date](../types.md#date)  
**Description:** Adds days to a date

**Arguments:**
- `date` ([date](../types.md#date)): Starting date
- `days` ([number](../types.md#number)): Number of days to add


<details>
<summary><strong>Test References</strong> (5 found)</summary>

- **date-functions.test.js** (5 references)
  - [Line 78](/tests/date-functions.test.js#L78): `const result = evaluateFormula('ADDDAYS(updated_date, 30)', testContext);`
  - [Line 84](/tests/date-functions.test.js#L84): `const result = evaluateFormula('ADDDAYS(TODAY(), -7)', testContext);`
  - [Line 120](/tests/date-functions.test.js#L120): `const result = evaluateFormula('ADDDAYS(ADDMONTHS(created_date, 6), DATEDIF(created_date, updated_date, "days"))', testContext);`
  - [Line 228](/tests/date-functions.test.js#L228): `() => evaluateFormula('ADDDAYS(created_date, 30, 15)', testContext),`
  - [Line 237](/tests/date-functions.test.js#L237): `() => evaluateFormula('ADDDAYS("hello", created_date)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## DATEDIF

**Signature:** `DATEDIF(date1, date2, unit)`  
**Returns:** [number](../types.md#number)  
**Description:** Returns the difference between two dates in specified units

**Arguments:**
- `date1` ([date](../types.md#date)): First date
- `date2` ([date](../types.md#date)): Second date
- `unit` ([string literal](../types.md#string-literal)): Time unit ("days", "months", or "years")


<details>
<summary><strong>Test References</strong> (9 found)</summary>

- **date-functions.test.js** (9 references)
  - [Line 90](/tests/date-functions.test.js#L90): `const result = evaluateFormula('DATEDIF(created_date, updated_date, "days")', testContext);`
  - [Line 96](/tests/date-functions.test.js#L96): `const result = evaluateFormula('DATEDIF(created_date, TODAY(), "months")', testContext);`
  - [Line 102](/tests/date-functions.test.js#L102): `const result = evaluateFormula('DATEDIF(DATE("2020-01-01"), TODAY(), "years")', testContext);`
  - [Line 120](/tests/date-functions.test.js#L120): `const result = evaluateFormula('ADDDAYS(ADDMONTHS(created_date, 6), DATEDIF(created_date, updated_date, "days"))', testContext);`
  - [Line 165](/tests/date-functions.test.js#L165): `() => evaluateFormula('DATEDIF(created_date, updated_date)', testContext),`
  - [Line 174](/tests/date-functions.test.js#L174): `() => evaluateFormula('DATEDIF(created_date, updated_date, revenue)', testContext),`
  - [Line 183](/tests/date-functions.test.js#L183): `() => evaluateFormula('DATEDIF(created_date, updated_date, "hours")', testContext),`
  - [Line 246](/tests/date-functions.test.js#L246): `() => evaluateFormula('DATEDIF(revenue, updated_date, "days")', testContext),`
  - [Line 255](/tests/date-functions.test.js#L255): `() => evaluateFormula('DATEDIF(created_date, cost, "days")', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (7 found)</summary>

- **examples/table/submission/advanced_math.formula** (1 reference)
  - [Line 1](/examples/table/submission/advanced_math.formula#L1): `ROUND(CEILING(amount / 1000) * FLOOR(AVG_AGG(rep_links_submission, commission_percentage)) + ABS(DATEDIF(created_at, updated_at, "days")) * 0.5, 2)`

- **examples/table/submission/approval_status.formula** (1 reference)
  - [Line 1](/examples/table/submission/approval_status.formula#L1): `IF(status = "approved", "✅ APPROVED on " & STRING(MONTH(updated_at)) & "/" & STRING(DAY(updated_at)), IF(status = "rejected", "❌ REJECTED", IF(DATEDIF(created_at, TODAY(), "days") > 30, "⚠️ OVERDUE", "📋 IN PROGRESS")))`

- **examples/table/submission/compliance_check.formula** (1 reference)
  - [Line 1](/examples/table/submission/compliance_check.formula#L1): `IF(AND(amount <= 250000, DATEDIF(created_at, TODAY(), "days") <= 60), "✅ COMPLIANT", "⚠️ REVIEW NEEDED") & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`

- **examples/table/submission/comprehensive_dashboard.formula** (1 reference)
  - [Line 1](/examples/table/submission/comprehensive_dashboard.formula#L1): `merchant_rel.business_name & " | $" & STRING(ROUND(amount, 0)) & " | " & STRING(COUNT_AGG(rep_links_submission, rep)) & " reps | " & STRING(DATEDIF(created_at, TODAY(), "days")) & "d old | " & UPPER(status) & " | Q" & STRING(CEILING(MONTH(created_at) / 3)) & "/" & STRING(YEAR(created_at))`

- **examples/table/submission/performance_score.formula** (1 reference)
  - [Line 1](/examples/table/submission/performance_score.formula#L1): `ROUND(MIN(100, MAX(0, (amount / 1000) * 10 + AVG_AGG(rep_links_submission, commission_percentage) - DATEDIF(created_at, TODAY(), "days") * 0.1)), 1)`

- **examples/table/submission/status_report.formula** (1 reference)
  - [Line 1](/examples/table/submission/status_report.formula#L1): `IF(status = "approved", "✅ APPROVED", IF(status = "pending", "⏳ PENDING", "❌ " & UPPER(status))) & " | Days since creation: " & STRING(ROUND(DATEDIF(created_at, TODAY(), "days"),0))`

- **examples/table/submission/timeline_tracker.formula** (1 reference)
  - [Line 1](/examples/table/submission/timeline_tracker.formula#L1): `"Created: " & STRING(MONTH(created_at)) & "/" & STRING(DAY(created_at)) & "/" & STRING(YEAR(created_at)) & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`
</details>


*Documentation generated on 2025-06-22T21:53:46.259Z*
