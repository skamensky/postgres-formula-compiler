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
<summary><strong>Usage Examples</strong> (13 found)</summary>

- **examples/table/customer/budget_analysis.formula** (1 reference)
  - [Line 1](/examples/table/customer/budget_analysis.formula#L1): `first_name & " " & last_name & " | Budget Range: $" & STRING(ROUND(budget_max - budget_min, 0)) & " | Flexibility: " & STRING(ROUND((budget_max - budget_min) / budget_min * 100, 0)) & "% | Avg Target: $" & STRING(ROUND((budget_min + budget_max) / 2, 0))`

- **examples/table/customer/contact_card.formula** (1 reference)
  - [Line 1](/examples/table/customer/contact_card.formula#L1): `first_name & " " & last_name & " | " & email & " | " & phone & " | Budget: $" & STRING(ROUND(budget_min/1000, 0)) & "K-$" & STRING(ROUND(budget_max/1000, 0)) & "K | " & STRING(preferred_bedrooms) & "BR | " & UPPER(status) & " | " & assigned_rep_id_rel.name`

- **examples/table/customer/lead_score.formula** (1 reference)
  - [Line 1](/examples/table/customer/lead_score.formula#L1): `STRING(ROUND(`

- **examples/table/customer/multi_level_reps.formula** (1 reference)
  - [Line 1](/examples/table/customer/multi_level_reps.formula#L1): `first_name & " " & last_name & " | Reps: " & STRING_AGG_DISTINCT(opportunitys_customer_id.rep_links_opportunity_id, rep_id_rel.name, ", ") & " | Opportunities: " & STRING(COUNT_AGG(opportunitys_customer_id, id))`

- **examples/table/listing/features_highlight.formula** (1 reference)
  - [Line 1](/examples/table/listing/features_highlight.formula#L1): `address & " | Built: " & STRING(year_built) & " | Lot: " & STRING(lot_size) & " acres | Features: Premium amenities available | " & IF(listing_price > 800000, "🌟 LUXURY FEATURES", IF(listing_price > 500000, "✨ NICE FEATURES", "🏠 BASIC"))`

- **examples/table/listing/luxury_indicator.formula** (1 reference)
  - [Line 1](/examples/table/listing/luxury_indicator.formula#L1): `IF(listing_price > 800000, "💎 LUXURY", IF(listing_price > 500000, "⭐ PREMIUM", IF(listing_price > 300000, "🏠 STANDARD", "💰 AFFORDABLE"))) & " | " & STRING(bedrooms) & "BR " & STRING(bathrooms) & "BA | " & STRING(ROUND(square_feet/1000, 1)) & "K sqft"`

- **examples/table/listing/market_analysis.formula** (1 reference)
  - [Line 1](/examples/table/listing/market_analysis.formula#L1): `address & " | Market Position: " & IF(days_on_market < 30, "🔥 HOT", IF(days_on_market < 60, "📈 NORMAL", IF(days_on_market < 90, "📊 SLOW", "❄️ STALE"))) & " | " & STRING(days_on_market) & " days | Price/sqft: $" & STRING(ROUND(listing_price/square_feet, 0)) & " | " & IF(ROUND(listing_price/square_feet, 0) > 200, "💰 PREMIUM", IF(ROUND(listing_price/square_feet, 0) > 150, "📊 MARKET", "💵 VALUE"))`

- **examples/table/listing/market_summary.formula** (1 reference)
  - [Line 1](/examples/table/listing/market_summary.formula#L1): `address & " | $" & STRING(ROUND(listing_price/1000, 0)) & "K | " & STRING(bedrooms) & "bed/" & STRING(bathrooms) & "bath | " & STRING(ROUND(listing_price/square_feet, 0)) & "/sqft | " & STRING(days_on_market) & " days | " & UPPER(status)`

- **examples/table/opportunity/commission_projection.formula** (1 reference)
  - [Line 1](/examples/table/opportunity/commission_projection.formula#L1): `IF(stage = "closed", "✅ PAID: $" & STRING(ROUND(commission_total, 0)), "📊 PROJECTED: $" & STRING(ROUND(NULLVALUE(offer_amount, listing_id_rel.listing_price) * 0.06 * (probability / 100), 0))) & " | Reps: " & STRING(COUNT_AGG(rep_links_opportunity_id, rep_id))`

- **examples/table/opportunity/deal_summary.formula** (1 reference)
  - [Line 1](/examples/table/opportunity/deal_summary.formula#L1): `customer_id_rel.first_name & " " & customer_id_rel.last_name & " → " & listing_id_rel.address & " | " & UPPER(stage) & " | $" & STRING(ROUND(NULLVALUE(offer_amount, listing_id_rel.listing_price)/1000, 0)) & "K | " & STRING(probability) & "% | " & NULLVALUE(financing_type, "TBD")`

- **examples/table/rep/commission_summary.formula** (1 reference)
  - [Line 1](/examples/table/rep/commission_summary.formula#L1): `name & " | Earned: $" & STRING(ROUND(SUM_AGG(rep_links_rep_id, NULLVALUE(commission_amount, 0)), 0)) & " | Pending: $" & STRING(ROUND(SUM_AGG(rep_links_rep_id, IF(ISNULL(commission_amount), 50000 * commission_percentage / 100, 0)), 0)) & " | Deals: " & STRING(COUNT_AGG(rep_links_rep_id, id))`

- **examples/table/rep/performance_dashboard.formula** (1 reference)
  - [Line 1](/examples/table/rep/performance_dashboard.formula#L1): `name & " (" & region & ") | Goal: $" & STRING(ROUND(sales_goal/1000, 0)) & "K | Active Listings: " & STRING(COUNT_AGG(listings_listing_agent_id, id)) & " | Opportunities: " & STRING(COUNT_AGG(rep_links_rep_id, id)) & " | Rate: " & STRING(commission_rate * 100) & "%"`

- **examples/table/rep/team_structure.formula** (1 reference)
  - [Line 1](/examples/table/rep/team_structure.formula#L1): `name & " | " & NULLVALUE(manager_id_rel.name, "🏆 MANAGER") & " | Team: " & region & " | Hired: " & STRING(YEAR(hire_date)) & " | " & IF(active, "✅ ACTIVE", "❌ INACTIVE")`
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
<summary><strong>Usage Examples</strong> (22 found)</summary>

- **examples/table/customer/lead_score.formula** (14 references)
  - [Line 2](/examples/table/customer/lead_score.formula#L2): `IF(status = "active", 40, IF(status = "prospect", 25, IF(status = "lead", 15, 0))) +`
  - [Line 3](/examples/table/customer/lead_score.formula#L3): `IF(lead_source = "Referral", 20, IF(lead_source = "Website", 15, IF(lead_source = "Past Client", 25, 10))) +`
  - [Line 4](/examples/table/customer/lead_score.formula#L4): `IF(budget_max > budget_min * 1.5, 15, 10) +`
  - [Line 5](/examples/table/customer/lead_score.formula#L5): `IF(ISNULL(assigned_rep_id_rel.name), 0, 10) +`
  - [Line 7](/examples/table/customer/lead_score.formula#L7): `, 0)) & "/100 | " & IF(ROUND(`
  - [Line 8](/examples/table/customer/lead_score.formula#L8): `IF(status = "active", 40, IF(status = "prospect", 25, IF(status = "lead", 15, 0))) +`
  - [Line 9](/examples/table/customer/lead_score.formula#L9): `IF(lead_source = "Referral", 20, IF(lead_source = "Website", 15, IF(lead_source = "Past Client", 25, 10))) +`
  - [Line 10](/examples/table/customer/lead_score.formula#L10): `IF(budget_max > budget_min * 1.5, 15, 10) +`
  - [Line 11](/examples/table/customer/lead_score.formula#L11): `IF(ISNULL(assigned_rep_id_rel.name), 0, 10) +`
  - [Line 13](/examples/table/customer/lead_score.formula#L13): `, 0) > 70, "🔥 HOT", IF(ROUND(`
  - [Line 14](/examples/table/customer/lead_score.formula#L14): `IF(status = "active", 40, IF(status = "prospect", 25, IF(status = "lead", 15, 0))) +`
  - [Line 15](/examples/table/customer/lead_score.formula#L15): `IF(lead_source = "Referral", 20, IF(lead_source = "Website", 15, IF(lead_source = "Past Client", 25, 10))) +`
  - [Line 16](/examples/table/customer/lead_score.formula#L16): `IF(budget_max > budget_min * 1.5, 15, 10) +`
  - [Line 17](/examples/table/customer/lead_score.formula#L17): `IF(ISNULL(assigned_rep_id_rel.name), 0, 10) +`

- **examples/table/listing/agent_listing_summary.formula** (1 reference)
  - [Line 1](/examples/table/listing/agent_listing_summary.formula#L1): `address & " - Listed by " & listing_agent_id_rel.name & " (" & listing_agent_id_rel.region & ") | " & IF(status = "active", "🟢 ACTIVE", IF(status = "pending", "🟡 PENDING", IF(status = "sold", "🔴 SOLD", "⚪ " & UPPER(status))))`

- **examples/table/listing/features_highlight.formula** (1 reference)
  - [Line 1](/examples/table/listing/features_highlight.formula#L1): `address & " | Built: " & STRING(year_built) & " | Lot: " & STRING(lot_size) & " acres | Features: Premium amenities available | " & IF(listing_price > 800000, "🌟 LUXURY FEATURES", IF(listing_price > 500000, "✨ NICE FEATURES", "🏠 BASIC"))`

- **examples/table/listing/luxury_indicator.formula** (1 reference)
  - [Line 1](/examples/table/listing/luxury_indicator.formula#L1): `IF(listing_price > 800000, "💎 LUXURY", IF(listing_price > 500000, "⭐ PREMIUM", IF(listing_price > 300000, "🏠 STANDARD", "💰 AFFORDABLE"))) & " | " & STRING(bedrooms) & "BR " & STRING(bathrooms) & "BA | " & STRING(ROUND(square_feet/1000, 1)) & "K sqft"`

- **examples/table/listing/market_analysis.formula** (1 reference)
  - [Line 1](/examples/table/listing/market_analysis.formula#L1): `address & " | Market Position: " & IF(days_on_market < 30, "🔥 HOT", IF(days_on_market < 60, "📈 NORMAL", IF(days_on_market < 90, "📊 SLOW", "❄️ STALE"))) & " | " & STRING(days_on_market) & " days | Price/sqft: $" & STRING(ROUND(listing_price/square_feet, 0)) & " | " & IF(ROUND(listing_price/square_feet, 0) > 200, "💰 PREMIUM", IF(ROUND(listing_price/square_feet, 0) > 150, "📊 MARKET", "💵 VALUE"))`

- **examples/table/opportunity/commission_projection.formula** (1 reference)
  - [Line 1](/examples/table/opportunity/commission_projection.formula#L1): `IF(stage = "closed", "✅ PAID: $" & STRING(ROUND(commission_total, 0)), "📊 PROJECTED: $" & STRING(ROUND(NULLVALUE(offer_amount, listing_id_rel.listing_price) * 0.06 * (probability / 100), 0))) & " | Reps: " & STRING(COUNT_AGG(rep_links_opportunity_id, rep_id))`

- **examples/table/opportunity/pipeline_status.formula** (1 reference)
  - [Line 1](/examples/table/opportunity/pipeline_status.formula#L1): `IF(stage = "closed", "🎉 CLOSED", IF(stage = "under_contract", "📋 CONTRACT", IF(stage = "negotiating", "💬 NEGOTIATE", IF(stage = "showing", "👁️ SHOWING", IF(stage = "contingent", "⏳ CONTINGENT", "🔍 " & UPPER(stage)))))) & " | " & customer_id_rel.first_name & " " & customer_id_rel.last_name & " | " & listing_id_rel.address`

- **examples/table/rep/commission_summary.formula** (1 reference)
  - [Line 1](/examples/table/rep/commission_summary.formula#L1): `name & " | Earned: $" & STRING(ROUND(SUM_AGG(rep_links_rep_id, NULLVALUE(commission_amount, 0)), 0)) & " | Pending: $" & STRING(ROUND(SUM_AGG(rep_links_rep_id, IF(ISNULL(commission_amount), 50000 * commission_percentage / 100, 0)), 0)) & " | Deals: " & STRING(COUNT_AGG(rep_links_rep_id, id))`

- **examples/table/rep/team_structure.formula** (1 reference)
  - [Line 1](/examples/table/rep/team_structure.formula#L1): `name & " | " & NULLVALUE(manager_id_rel.name, "🏆 MANAGER") & " | Team: " & region & " | Hired: " & STRING(YEAR(hire_date)) & " | " & IF(active, "✅ ACTIVE", "❌ INACTIVE")`
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


*Documentation generated on 2025-06-27T07:39:53.171Z*
