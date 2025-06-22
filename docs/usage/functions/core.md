# Core Functions


## ME

**Signature:** `ME()`  
**Returns:** [string](../types.md#string)  
**Description:** Returns the current user identifier

**Arguments:** None


<details>
<summary><strong>Test References</strong> (2 found)</summary>

- **core-functions.test.js** (2 references)
  - [Line 18](/tests/core-functions.test.js#L18): `const result = evaluateFormula('ME()', testContext);`
  - [Line 56](/tests/core-functions.test.js#L56): `() => evaluateFormula('ME(42)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## STRING

**Signature:** `STRING(value)`  
**Returns:** [string](../types.md#string)  
**Description:** Converts a value to a string

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to convert to string


<details>
<summary><strong>Test References</strong> (14 found)</summary>

- **aggregate-functions.test.js** (2 references)
  - [Line 294](/tests/aggregate-functions.test.js#L294): `const result = evaluateFormula('"Total: " & STRING(SUM_AGG(rep_links_submission, commission_percentage))', relationshipContext);`
  - [Line 311](/tests/aggregate-functions.test.js#L311): `const result = evaluateFormula('"Total reps: " & STRING(COUNT_AGG(submissions_merchant.rep_links_submission, rep_rel.id))', relationshipContext);`

- **core-functions.test.js** (1 reference)
  - [Line 41](/tests/core-functions.test.js#L41): `const result = evaluateFormula('STRING(revenue) & " on " & STRING(TODAY())', testContext);`

- **date-functions.test.js** (1 reference)
  - [Line 114](/tests/date-functions.test.js#L114): `const result = evaluateFormula('STRING(YEAR(created_date)) & "-" & STRING(MONTH(created_date))', testContext);`

- **math-functions.test.js** (1 reference)
  - [Line 108](/tests/math-functions.test.js#L108): `const result = evaluateFormula('STRING(ROUND(revenue, 2)) & " (max with cost: " & STRING(MAX(revenue, cost)) & ")"', testContext);`

- **null-handling.test.js** (2 references)
  - [Line 48](/tests/null-handling.test.js#L48): `const result = evaluateFormula('NULLVALUE(note, "Empty") & " - " & STRING(amount)', testContext);`
  - [Line 164](/tests/null-handling.test.js#L164): `const result = evaluateFormula('STRING(NULLVALUE(revenue, 0)) & " (empty: " & STRING(ISBLANK(revenue)) & ")"', testContext);`

- **parentheses-precedence.test.js** (1 reference)
  - [Line 48](/tests/parentheses-precedence.test.js#L48): `const result = evaluateFormula('STRING((revenue + cost))', testContext);`

- **string-functions-concatenation.test.js** (6 references)
  - [Line 12](/tests/string-functions-concatenation.test.js#L12): `const result = evaluateFormula('STRING(42)', testContext);`
  - [Line 18](/tests/string-functions-concatenation.test.js#L18): `const result = evaluateFormula('STRING(revenue)', testContext);`
  - [Line 30](/tests/string-functions-concatenation.test.js#L30): `const result = evaluateFormula('"Revenue: " & STRING(revenue)', testContext);`
  - [Line 36](/tests/string-functions-concatenation.test.js#L36): `const result = evaluateFormula('STRING(revenue) & " dollars"', testContext);`
  - [Line 59](/tests/string-functions-concatenation.test.js#L59): `() => evaluateFormula('STRING()', testContext),`
  - [Line 67](/tests/string-functions-concatenation.test.js#L67): `() => evaluateFormula('STRING(revenue, cost)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (18 found)</summary>

- **examples/table/submission/approval_status.formula** (1 reference)
  - [Line 1](/examples/table/submission/approval_status.formula#L1): `IF(status = "approved", "✅ APPROVED on " & STRING(MONTH(updated_at)) & "/" & STRING(DAY(updated_at)), IF(status = "rejected", "❌ REJECTED", IF(DATEDIF(created_at, TODAY(), "days") > 30, "⚠️ OVERDUE", "📋 IN PROGRESS")))`

- **examples/table/submission/business_summary.formula** (1 reference)
  - [Line 1](/examples/table/submission/business_summary.formula#L1): `merchant_rel.business_name & " - $" & STRING(ROUND(amount, 2)) & " - Commission: " & STRING_AGG(rep_links_submission, STRING(commission_percentage) & "%", ", ")`

- **examples/table/submission/commission_breakdown.formula** (1 reference)
  - [Line 1](/examples/table/submission/commission_breakdown.formula#L1): `STRING_AGG_DISTINCT(rep_links_submission, STRING(commission_percentage) & "%", " | ")`

- **examples/table/submission/compliance_check.formula** (1 reference)
  - [Line 1](/examples/table/submission/compliance_check.formula#L1): `IF(AND(amount <= 250000, DATEDIF(created_at, TODAY(), "days") <= 60), "✅ COMPLIANT", "⚠️ REVIEW NEEDED") & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`

- **examples/table/submission/comprehensive_dashboard.formula** (1 reference)
  - [Line 1](/examples/table/submission/comprehensive_dashboard.formula#L1): `merchant_rel.business_name & " | $" & STRING(ROUND(amount, 0)) & " | " & STRING(COUNT_AGG(rep_links_submission, rep)) & " reps | " & STRING(DATEDIF(created_at, TODAY(), "days")) & "d old | " & UPPER(status) & " | Q" & STRING(CEILING(MONTH(created_at) / 3)) & "/" & STRING(YEAR(created_at))`

- **examples/table/submission/document_summary.formula** (1 reference)
  - [Line 1](/examples/table/submission/document_summary.formula#L1): `"Status: " & UPPER(status) & " | Amount: $" & STRING(ROUND(amount, 0)) & " | Merchant: " & merchant_rel.business_name`

- **examples/table/submission/funding_analysis.formula** (1 reference)
  - [Line 1](/examples/table/submission/funding_analysis.formula#L1): `IF(amount > 500000, "JUMBO: $" & STRING(ROUND(amount/1000, 0)) & "K", IF(amount > 100000, "LARGE: $" & STRING(ROUND(amount/1000, 0)) & "K", "STANDARD: $" & STRING(amount))) & " - " & merchant_rel.industry`

- **examples/table/submission/merchant_profile.formula** (1 reference)
  - [Line 1](/examples/table/submission/merchant_profile.formula#L1): `UPPER(LEFT(merchant_rel.business_name, 3)) & "-" & STRING(merchant_rel.id) & " | " & SUBSTITUTE(merchant_rel.city, " ", "_") & " | Industry: " & merchant_rel.industry`

- **examples/table/submission/multi_level_demo.formula** (1 reference)
  - [Line 1](/examples/table/submission/multi_level_demo.formula#L1): `"Submission " & STRING(amount) & " with " & STRING(COUNT_AGG(rep_links_submission, commission_percentage)) & " rep commissions"`

- **examples/table/submission/null_safety_check.formula** (1 reference)
  - [Line 1](/examples/table/submission/null_safety_check.formula#L1): `IF(ISNULL(merchant_rel.business_name), "NO MERCHANT", merchant_rel.business_name) & " | Amount: " & IF(ISNULL(amount), "N/A", STRING(amount)) & " | Reps: " & STRING(IF(ISNULL(COUNT_AGG(rep_links_submission, id)), 0, COUNT_AGG(rep_links_submission, id)))`

- **examples/table/submission/quarterly_report.formula** (1 reference)
  - [Line 1](/examples/table/submission/quarterly_report.formula#L1): `"Q" & STRING(CEILING(MONTH(created_at) / 3)) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name & " | $" & STRING(amount)`

- **examples/table/submission/README.md** (1 reference)
  - [Line 60](/examples/table/submission/README.md#L60): `- **Conversion**: STRING (for type casting)`

- **examples/table/submission/risk_assessment.formula** (1 reference)
  - [Line 1](/examples/table/submission/risk_assessment.formula#L1): `IF(amount > 100000, "HIGH RISK", IF(amount > 50000, "MEDIUM RISK", "LOW RISK")) & " | " & merchant_rel.business_name & " | Reps: " & STRING(COUNT_AGG(rep_links_submission, rep))`

- **examples/table/submission/seasonal_analysis.formula** (1 reference)
  - [Line 1](/examples/table/submission/seasonal_analysis.formula#L1): `IF(AND(MONTH(created_at) >= 3, MONTH(created_at) <= 5), "🌸 SPRING", IF(AND(MONTH(created_at) >= 6, MONTH(created_at) <= 8), "☀️ SUMMER", IF(AND(MONTH(created_at) >= 9, MONTH(created_at) <= 11), "🍂 FALL", "❄️ WINTER"))) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name`

- **examples/table/submission/status_report.formula** (1 reference)
  - [Line 1](/examples/table/submission/status_report.formula#L1): `IF(status = "approved", "✅ APPROVED", IF(status = "pending", "⏳ PENDING", "❌ " & UPPER(status))) & " | Days since creation: " & STRING(ROUND(DATEDIF(created_at, TODAY(), "days"),0))`

- **examples/table/submission/text_processing.formula** (1 reference)
  - [Line 1](/examples/table/submission/text_processing.formula#L1): `UPPER(LEFT(TRIM(merchant_rel.business_name), 10)) & "..." & " (" & STRING(LEN(merchant_rel.business_name)) & " chars) | " & IF(CONTAINS(merchant_rel.business_name, "LLC"), "CORPORATION", "OTHER")`

- **examples/table/submission/timeline_tracker.formula** (1 reference)
  - [Line 1](/examples/table/submission/timeline_tracker.formula#L1): `"Created: " & STRING(MONTH(created_at)) & "/" & STRING(DAY(created_at)) & "/" & STRING(YEAR(created_at)) & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`

- **examples/table/submission/weekend_detector.formula** (1 reference)
  - [Line 1](/examples/table/submission/weekend_detector.formula#L1): `IF(OR(WEEKDAY(created_at) = 1, WEEKDAY(created_at) = 7), "📅 WEEKEND SUBMISSION", "🏢 WEEKDAY SUBMISSION") & " | " & STRING(WEEKDAY(created_at)) & "/7"`
</details>

---

## DATE

**Signature:** `DATE(dateString)`  
**Returns:** [date](../types.md#date)  
**Description:** Creates a date from a string literal

**Arguments:**
- `dateString` ([string literal](../types.md#string-literal)): Date string in ISO format


<details>
<summary><strong>Test References</strong> (8 found)</summary>

- **comparison-operators.test.js** (1 reference)
  - [Line 66](/tests/comparison-operators.test.js#L66): `const result = evaluateFormula('created_date > DATE("2023-01-01")', testContext);`

- **core-functions.test.js** (3 references)
  - [Line 24](/tests/core-functions.test.js#L24): `const result = evaluateFormula('DATE("2023-01-01")', testContext);`
  - [Line 64](/tests/core-functions.test.js#L64): `() => evaluateFormula('DATE()', testContext),`
  - [Line 72](/tests/core-functions.test.js#L72): `() => evaluateFormula('DATE(42)', testContext),`

- **date-functions.test.js** (3 references)
  - [Line 24](/tests/date-functions.test.js#L24): `const result = evaluateFormula('YEAR(DATE("2023-12-25"))', testContext);`
  - [Line 48](/tests/date-functions.test.js#L48): `const result = evaluateFormula('DAY(DATE("2023-12-25"))', testContext);`
  - [Line 102](/tests/date-functions.test.js#L102): `const result = evaluateFormula('DATEDIF(DATE("2020-01-01"), TODAY(), "years")', testContext);`

- **error-handling-basic.test.js** (1 reference)
  - [Line 58](/tests/error-handling-basic.test.js#L58): `() => evaluateFormula('DATE("2023-01-01)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## IF

**Signature:** `IF(condition, trueValue, falseValue)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Returns one value if condition is true, another if false

**Arguments:**
- `condition` ([boolean](../types.md#boolean)): Condition to evaluate
- `trueValue` ([expression](../types.md#expression)): Value to return if condition is true
- `falseValue` ([expression](../types.md#expression)): Value to return if condition is false


<details>
<summary><strong>Test References</strong> (24 found)</summary>

- **aggregate-functions.test.js** (2 references)
  - [Line 104](/tests/aggregate-functions.test.js#L104): `const result = evaluateFormula('IF(SUM_AGG(rep_links_submission, commission_percentage) > 100, "High Commission", "Low Commission")', relationshipContext);`
  - [Line 193](/tests/aggregate-functions.test.js#L193): `const result = evaluateFormula('IF(SUM_AGG(submissions_merchant.rep_links_submission, commission_percentage) > 100, "High", "Low")', relationshipContext);`

- **compiler-modularization.test.js** (2 references)
  - [Line 140](/tests/compiler-modularization.test.js#L140): `const result = evaluateFormula('IF(amount > 100, merchant_rel.name & " (high)", "low")', baseContext);`
  - [Line 239](/tests/compiler-modularization.test.js#L239): `complex_calc: evaluateFormula('IF(amount > 100, merchant_rel.name & " - " & STRING_AGG(rep_links, rep_rel.name, ", "), "simple")', baseContext)`

- **if-function.test.js** (17 references)
  - [Line 12](/tests/if-function.test.js#L12): `const result = evaluateFormula('IF(closed, "Yes", "No")', testContext);`
  - [Line 18](/tests/if-function.test.js#L18): `const result = evaluateFormula('IF(syndication, amount)', testContext);`
  - [Line 24](/tests/if-function.test.js#L24): `const result = evaluateFormula('IF(open_approval, amount, 0)', testContext);`
  - [Line 30](/tests/if-function.test.js#L30): `const result = evaluateFormula('IF(closed, merchant_rel.business_name, "Pending")', relationshipContext);`
  - [Line 36](/tests/if-function.test.js#L36): `const result = evaluateFormula('IF(revenue > 1000, "High", "Low")', testContext);`
  - [Line 42](/tests/if-function.test.js#L42): `const result = evaluateFormula('IF(AND(revenue > 1000, cost < 500), "Good Deal", "Check Again")', testContext);`
  - [Line 48](/tests/if-function.test.js#L48): `const result = evaluateFormula('IF(TRUE, "yes", "no")', testContext);`
  - [Line 54](/tests/if-function.test.js#L54): `const result = evaluateFormula('IF(CONTAINS("hello world", "world"), "Found", "Not found")', testContext);`
  - [Line 60](/tests/if-function.test.js#L60): `const result = evaluateFormula('IF(CONTAINS("Company LLC", "LLC"), SUBSTITUTE("Company LLC", "LLC", "Limited"), "No change")', testContext);`
  - [Line 66](/tests/if-function.test.js#L66): `const result = evaluateFormula('IF(ABS(revenue - cost) > 1000, "Large difference", "Small difference")', testContext);`
  - [Line 72](/tests/if-function.test.js#L72): `const result = evaluateFormula('IF(ISNULL(revenue), "No revenue", "Has revenue")', testContext);`
  - [Line 78](/tests/if-function.test.js#L78): `const result = evaluateFormula('IF(TRUE, "always true", "never false")', testContext);`
  - [Line 84](/tests/if-function.test.js#L84): `const result = evaluateFormula('IF(YEAR(created_date) = 2023, "This year", "Other year")', testContext);`
  - [Line 91](/tests/if-function.test.js#L91): `() => evaluateFormula('IF()', testContext),`
  - [Line 99](/tests/if-function.test.js#L99): `() => evaluateFormula('IF(closed, "A", "B", "C")', testContext),`
  - [Line 107](/tests/if-function.test.js#L107): `() => evaluateFormula('IF(revenue, "Yes", "No")', testContext),`
  - [Line 115](/tests/if-function.test.js#L115): `() => evaluateFormula('IF(closed, amount, "text")', testContext),`

- **multi-level-relationships.test.js** (1 reference)
  - [Line 129](/tests/multi-level-relationships.test.js#L129): `const result = evaluateFormula('IF(ISNULL(merchant_rel.main_rep_rel.user_rel.status), "No Status", merchant_rel.main_rep_rel.user_rel.status)', multiLevelContext);`

- **null-handling.test.js** (2 references)
  - [Line 53](/tests/null-handling.test.js#L53): `const result = evaluateFormula('IF(ISNULL(note), "No note", note)', testContext);`
  - [Line 149](/tests/null-handling.test.js#L149): `const result = evaluateFormula('IF(ISBLANK(revenue), NULLVALUE(cost, 0), revenue)', testContext);`
</details>

<details>
<summary><strong>Usage Examples</strong> (10 found)</summary>

- **examples/table/submission/approval_status.formula** (1 reference)
  - [Line 1](/examples/table/submission/approval_status.formula#L1): `IF(status = "approved", "✅ APPROVED on " & STRING(MONTH(updated_at)) & "/" & STRING(DAY(updated_at)), IF(status = "rejected", "❌ REJECTED", IF(DATEDIF(created_at, TODAY(), "days") > 30, "⚠️ OVERDUE", "📋 IN PROGRESS")))`

- **examples/table/submission/compliance_check.formula** (1 reference)
  - [Line 1](/examples/table/submission/compliance_check.formula#L1): `IF(AND(amount <= 250000, DATEDIF(created_at, TODAY(), "days") <= 60), "✅ COMPLIANT", "⚠️ REVIEW NEEDED") & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"`

- **examples/table/submission/funding_analysis.formula** (1 reference)
  - [Line 1](/examples/table/submission/funding_analysis.formula#L1): `IF(amount > 500000, "JUMBO: $" & STRING(ROUND(amount/1000, 0)) & "K", IF(amount > 100000, "LARGE: $" & STRING(ROUND(amount/1000, 0)) & "K", "STANDARD: $" & STRING(amount))) & " - " & merchant_rel.industry`

- **examples/table/submission/null_safety_check.formula** (1 reference)
  - [Line 1](/examples/table/submission/null_safety_check.formula#L1): `IF(ISNULL(merchant_rel.business_name), "NO MERCHANT", merchant_rel.business_name) & " | Amount: " & IF(ISNULL(amount), "N/A", STRING(amount)) & " | Reps: " & STRING(IF(ISNULL(COUNT_AGG(rep_links_submission, id)), 0, COUNT_AGG(rep_links_submission, id)))`

- **examples/table/submission/rep_analysis.formula** (1 reference)
  - [Line 1](/examples/table/submission/rep_analysis.formula#L1): `IF(AND_AGG(rep_links_submission, commission_percentage > 0), "All reps have commission", "Some reps without commission") & " | High performers: " & STRING_AGG(rep_links_submission, IF(commission_percentage > 5, rep_rel.name, ""), ", ")`

- **examples/table/submission/risk_assessment.formula** (1 reference)
  - [Line 1](/examples/table/submission/risk_assessment.formula#L1): `IF(amount > 100000, "HIGH RISK", IF(amount > 50000, "MEDIUM RISK", "LOW RISK")) & " | " & merchant_rel.business_name & " | Reps: " & STRING(COUNT_AGG(rep_links_submission, rep))`

- **examples/table/submission/seasonal_analysis.formula** (1 reference)
  - [Line 1](/examples/table/submission/seasonal_analysis.formula#L1): `IF(AND(MONTH(created_at) >= 3, MONTH(created_at) <= 5), "🌸 SPRING", IF(AND(MONTH(created_at) >= 6, MONTH(created_at) <= 8), "☀️ SUMMER", IF(AND(MONTH(created_at) >= 9, MONTH(created_at) <= 11), "🍂 FALL", "❄️ WINTER"))) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name`

- **examples/table/submission/status_report.formula** (1 reference)
  - [Line 1](/examples/table/submission/status_report.formula#L1): `IF(status = "approved", "✅ APPROVED", IF(status = "pending", "⏳ PENDING", "❌ " & UPPER(status))) & " | Days since creation: " & STRING(ROUND(DATEDIF(created_at, TODAY(), "days"),0))`

- **examples/table/submission/text_processing.formula** (1 reference)
  - [Line 1](/examples/table/submission/text_processing.formula#L1): `UPPER(LEFT(TRIM(merchant_rel.business_name), 10)) & "..." & " (" & STRING(LEN(merchant_rel.business_name)) & " chars) | " & IF(CONTAINS(merchant_rel.business_name, "LLC"), "CORPORATION", "OTHER")`

- **examples/table/submission/weekend_detector.formula** (1 reference)
  - [Line 1](/examples/table/submission/weekend_detector.formula#L1): `IF(OR(WEEKDAY(created_at) = 1, WEEKDAY(created_at) = 7), "📅 WEEKEND SUBMISSION", "🏢 WEEKDAY SUBMISSION") & " | " & STRING(WEEKDAY(created_at)) & "/7"`
</details>

---

## EVAL

**Signature:** `EVAL(relationshipRef)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Evaluates an expression from another table

**Arguments:**
- `relationshipRef` ([inverse relationship](../types.md#inverse-relationship)): Reference to relationship and expression


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>


*Documentation generated on 2025-06-22T21:53:46.266Z*
