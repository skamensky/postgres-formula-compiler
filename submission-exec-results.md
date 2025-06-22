# 🚀 Formula Execution Results

## 📋 Metadata
- **Table:** submission
- **Formulas Processed:** 23
- **Execution Time:** 2025-06-22T17:16:21.064Z

## 📄 Formulas

### 1. advanced_math
```
ROUND(CEILING(amount / 1000) * FLOOR(AVG_AGG(rep_links_submission, commission_percentage)) + ABS(DATEDIF(created_at, updated_at, "days")) * 0.5, 2)
```
**Source:** examples/table/submission/advanced_math.formula

### 2. approval_status
```
IF(status = "approved", "✅ APPROVED on " & STRING(MONTH(updated_at)) & "/" & STRING(DAY(updated_at)), IF(status = "rejected", "❌ REJECTED", IF(DATEDIF(created_at, TODAY(), "days") > 30, "⚠️ OVERDUE", "📋 IN PROGRESS")))
```
**Source:** examples/table/submission/approval_status.formula

### 3. business_summary
```
merchant_rel.business_name & " - $" & STRING(ROUND(amount, 2)) & " - Commission: " & STRING_AGG(rep_links_submission, STRING(commission_percentage) & "%", ", ")
```
**Source:** examples/table/submission/business_summary.formula

### 4. commission_breakdown
```
STRING_AGG_DISTINCT(rep_links_submission, STRING(commission_percentage) & "%", " | ")
```
**Source:** examples/table/submission/commission_breakdown.formula

### 5. compliance_check
```
IF(AND(amount <= 250000, DATEDIF(created_at, TODAY(), "days") <= 60), "✅ COMPLIANT", "⚠️ REVIEW NEEDED") & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"
```
**Source:** examples/table/submission/compliance_check.formula

### 6. comprehensive_dashboard
```
merchant_rel.business_name & " | $" & STRING(ROUND(amount, 0)) & " | " & STRING(COUNT_AGG(rep_links_submission, rep)) & " reps | " & STRING(DATEDIF(created_at, TODAY(), "days")) & "d old | " & UPPER(status) & " | Q" & STRING(CEILING(MONTH(created_at) / 3)) & "/" & STRING(YEAR(created_at))
```
**Source:** examples/table/submission/comprehensive_dashboard.formula

### 7. contact_info
```
merchant_rel.first_name & " " & merchant_rel.last_name & " (" & merchant_rel.email & ") | " & SUBSTITUTE(merchant_rel.phone, "-", ".") & " | Business: " & merchant_rel.business_name
```
**Source:** examples/table/submission/contact_info.formula

### 8. deep_relationship
```
merchant_rel.main_rep_rel.app_user_rel.name
```
**Source:** examples/table/submission/deep_relationship.formula

### 9. document_summary
```
"Status: " & UPPER(status) & " | Amount: $" & STRING(ROUND(amount, 0)) & " | Merchant: " & merchant_rel.business_name
```
**Source:** examples/table/submission/document_summary.formula

### 10. financial_metrics
```
ROUND(amount * SUM_AGG(rep_links_submission, commission_percentage) / 100, 2)
```
**Source:** examples/table/submission/financial_metrics.formula

### 11. funding_analysis
```
IF(amount > 500000, "JUMBO: $" & STRING(ROUND(amount/1000, 0)) & "K", IF(amount > 100000, "LARGE: $" & STRING(ROUND(amount/1000, 0)) & "K", "STANDARD: $" & STRING(amount))) & " - " & merchant_rel.industry
```
**Source:** examples/table/submission/funding_analysis.formula

### 12. merchant_profile
```
UPPER(LEFT(merchant_rel.business_name, 3)) & "-" & STRING(merchant_rel.id) & " | " & SUBSTITUTE(merchant_rel.city, " ", "_") & " | Industry: " & merchant_rel.industry
```
**Source:** examples/table/submission/merchant_profile.formula

### 13. multi_level_demo
```
"Submission " & STRING(amount) & " with " & STRING(COUNT_AGG(rep_links_submission, commission_percentage)) & " rep commissions"
```
**Source:** examples/table/submission/multi_level_demo.formula

### 14. null_safety_check
```
IF(ISNULL(merchant_rel.business_name), "NO MERCHANT", merchant_rel.business_name) & " | Amount: " & IF(ISNULL(amount), "N/A", STRING(amount)) & " | Reps: " & STRING(IF(ISNULL(COUNT_AGG(rep_links_submission, id)), 0, COUNT_AGG(rep_links_submission, id)))
```
**Source:** examples/table/submission/null_safety_check.formula

### 15. performance_score
```
ROUND(MIN(100, MAX(0, (amount / 1000) * 10 + AVG_AGG(rep_links_submission, commission_percentage) - DATEDIF(created_at, TODAY(), "days") * 0.1)), 1)
```
**Source:** examples/table/submission/performance_score.formula

### 16. quarterly_report
```
"Q" & STRING(CEILING(MONTH(created_at) / 3)) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name & " | $" & STRING(amount)
```
**Source:** examples/table/submission/quarterly_report.formula

### 17. rep_analysis
```
IF(AND_AGG(rep_links_submission, commission_percentage > 0), "All reps have commission", "Some reps without commission") & " | High performers: " & STRING_AGG(rep_links_submission, IF(commission_percentage > 5, rep_rel.name, ""), ", ")
```
**Source:** examples/table/submission/rep_analysis.formula

### 18. risk_assessment
```
IF(amount > 100000, "HIGH RISK", IF(amount > 50000, "MEDIUM RISK", "LOW RISK")) & " | " & merchant_rel.business_name & " | Reps: " & STRING(COUNT_AGG(rep_links_submission, rep))
```
**Source:** examples/table/submission/risk_assessment.formula

### 19. seasonal_analysis
```
IF(AND(MONTH(created_at) >= 3, MONTH(created_at) <= 5), "🌸 SPRING", IF(AND(MONTH(created_at) >= 6, MONTH(created_at) <= 8), "☀️ SUMMER", IF(AND(MONTH(created_at) >= 9, MONTH(created_at) <= 11), "🍂 FALL", "❄️ WINTER"))) & " " & STRING(YEAR(created_at)) & " | " & merchant_rel.business_name
```
**Source:** examples/table/submission/seasonal_analysis.formula

### 20. status_report
```
IF(status = "approved", "✅ APPROVED", IF(status = "pending", "⏳ PENDING", "❌ " & UPPER(status))) & " | Days since creation: " & STRING(ROUND(DATEDIF(created_at, TODAY(), "days"),0))
```
**Source:** examples/table/submission/status_report.formula

### 21. text_processing
```
UPPER(LEFT(TRIM(merchant_rel.business_name), 10)) & "..." & " (" & STRING(LEN(merchant_rel.business_name)) & " chars) | " & IF(CONTAINS(merchant_rel.business_name, "LLC"), "CORPORATION", "OTHER")
```
**Source:** examples/table/submission/text_processing.formula

### 22. timeline_tracker
```
"Created: " & STRING(MONTH(created_at)) & "/" & STRING(DAY(created_at)) & "/" & STRING(YEAR(created_at)) & " | Age: " & STRING(DATEDIF(created_at, TODAY(), "days")) & " days"
```
**Source:** examples/table/submission/timeline_tracker.formula

### 23. weekend_detector
```
IF(OR(WEEKDAY(created_at) = 1, WEEKDAY(created_at) = 7), "📅 WEEKEND SUBMISSION", "🏢 WEEKDAY SUBMISSION") & " | " & STRING(WEEKDAY(created_at)) & "/7"
```
**Source:** examples/table/submission/weekend_detector.formula


## 📈 Analysis

| Metric | Value |
|--------|-------|
| Join Intents | 4 |
| Aggregate Intents | 7 |
| Actual JOINs | 4 |
| Subqueries | 0 |
| SELECT Expressions | 23 |

## 📝 Generated SQL

```sql
SELECT
  ROUND(((CEILING(("s"."amount" / 1000)) * FLOOR(COALESCE(sr1.avg_value, 0))) + (ABS(EXTRACT(EPOCH FROM ("s"."updated_at" - "s"."created_at")) / 86400) * 0.5)), 2) AS advanced_math,
  CASE WHEN ("s"."status" = 'approved') THEN ((('✅ APPROVED on ' || CAST(EXTRACT(MONTH FROM "s"."updated_at") AS TEXT)) || '/') || CAST(EXTRACT(DAY FROM "s"."updated_at") AS TEXT)) ELSE CASE WHEN ("s"."status" = 'rejected') THEN '❌ REJECTED' ELSE CASE WHEN (EXTRACT(EPOCH FROM (current_date - "s"."created_at")) / 86400 > 30) THEN '⚠️ OVERDUE' ELSE '📋 IN PROGRESS' END END END AS approval_status,
  (((("rel_merchant"."business_name" || ' - $') || CAST(ROUND("s"."amount", 2) AS TEXT)) || ' - Commission: ') || COALESCE(sr1.rep_names, '')) AS business_summary,
  COALESCE(sr1.rep_names_1, '') AS commission_breakdown,
  (((CASE WHEN (("s"."amount" <= 250000) AND (EXTRACT(EPOCH FROM (current_date - "s"."created_at")) / 86400 <= 60)) THEN '✅ COMPLIANT' ELSE '⚠️ REVIEW NEEDED' END || ' | Age: ') || CAST(EXTRACT(EPOCH FROM (current_date - "s"."created_at")) / 86400 AS TEXT)) || ' days') AS compliance_check,
  (((((((((((("rel_merchant"."business_name" || ' | $') || CAST(ROUND("s"."amount", 0) AS TEXT)) || ' | ') || CAST(COALESCE(sr1.rep_count, 0) AS TEXT)) || ' reps | ') || CAST(EXTRACT(EPOCH FROM (current_date - "s"."created_at")) / 86400 AS TEXT)) || 'd old | ') || UPPER("s"."status")) || ' | Q') || CAST(CEILING((EXTRACT(MONTH FROM "s"."created_at") / 3)) AS TEXT)) || '/') || CAST(EXTRACT(YEAR FROM "s"."created_at") AS TEXT)) AS comprehensive_dashboard,
  (((((((("rel_merchant"."first_name" || ' ') || "rel_merchant"."last_name") || ' (') || "rel_merchant"."email") || ') | ') || REPLACE("rel_merchant"."phone", '-', '.')) || ' | Business: ') || "rel_merchant"."business_name") AS contact_info,
  "rel_merchant_main_rep_app_user"."name" AS deep_relationship,
  ((((('Status: ' || UPPER("s"."status")) || ' | Amount: $') || CAST(ROUND("s"."amount", 0) AS TEXT)) || ' | Merchant: ') || "rel_merchant"."business_name") AS document_summary,
  ROUND((("s"."amount" * COALESCE(sr1.sum_value, 0)) / 100), 2) AS financial_metrics,
  ((CASE WHEN ("s"."amount" > 500000) THEN (('JUMBO: $' || CAST(ROUND(("s"."amount" / 1000), 0) AS TEXT)) || 'K') ELSE CASE WHEN ("s"."amount" > 100000) THEN (('LARGE: $' || CAST(ROUND(("s"."amount" / 1000), 0) AS TEXT)) || 'K') ELSE ('STANDARD: $' || CAST("s"."amount" AS TEXT)) END END || ' - ') || "rel_merchant"."industry") AS funding_analysis,
  ((((((UPPER(LEFT("rel_merchant"."business_name", 3)) || '-') || CAST("rel_merchant"."id" AS TEXT)) || ' | ') || REPLACE("rel_merchant"."city", ' ', '_')) || ' | Industry: ') || "rel_merchant"."industry") AS merchant_profile,
  (((('Submission ' || CAST("s"."amount" AS TEXT)) || ' with ') || CAST(COALESCE(sr1.rep_count, 0) AS TEXT)) || ' rep commissions') AS multi_level_demo,
  ((((CASE WHEN ("rel_merchant"."business_name" IS NULL) THEN 'NO MERCHANT' ELSE "rel_merchant"."business_name" END || ' | Amount: ') || CASE WHEN ("s"."amount" IS NULL) THEN 'N/A' ELSE CAST("s"."amount" AS TEXT) END) || ' | Reps: ') || CAST(CASE WHEN (COALESCE(sr1.rep_count, 0) IS NULL) THEN 0 ELSE COALESCE(sr1.rep_count, 0) END AS TEXT)) AS null_safety_check,
  ROUND(LEAST(100, GREATEST(0, (((("s"."amount" / 1000) * 10) + COALESCE(sr1.avg_value, 0)) - (EXTRACT(EPOCH FROM (current_date - "s"."created_at")) / 86400 * 0.1)))), 1) AS performance_score,
  ((((((('Q' || CAST(CEILING((EXTRACT(MONTH FROM "s"."created_at") / 3)) AS TEXT)) || ' ') || CAST(EXTRACT(YEAR FROM "s"."created_at") AS TEXT)) || ' | ') || "rel_merchant"."business_name") || ' | $') || CAST("s"."amount" AS TEXT)) AS quarterly_report,
  ((CASE WHEN COALESCE(sr1.and_value, FALSE) THEN 'All reps have commission' ELSE 'Some reps without commission' END || ' | High performers: ') || COALESCE(sr1.rep_names_2, '')) AS rep_analysis,
  ((((CASE WHEN ("s"."amount" > 100000) THEN 'HIGH RISK' ELSE CASE WHEN ("s"."amount" > 50000) THEN 'MEDIUM RISK' ELSE 'LOW RISK' END END || ' | ') || "rel_merchant"."business_name") || ' | Reps: ') || CAST(COALESCE(sr1.rep_count, 0) AS TEXT)) AS risk_assessment,
  ((((CASE WHEN ((EXTRACT(MONTH FROM "s"."created_at") >= 3) AND (EXTRACT(MONTH FROM "s"."created_at") <= 5)) THEN '🌸 SPRING' ELSE CASE WHEN ((EXTRACT(MONTH FROM "s"."created_at") >= 6) AND (EXTRACT(MONTH FROM "s"."created_at") <= 8)) THEN '☀️ SUMMER' ELSE CASE WHEN ((EXTRACT(MONTH FROM "s"."created_at") >= 9) AND (EXTRACT(MONTH FROM "s"."created_at") <= 11)) THEN '🍂 FALL' ELSE '❄️ WINTER' END END END || ' ') || CAST(EXTRACT(YEAR FROM "s"."created_at") AS TEXT)) || ' | ') || "rel_merchant"."business_name") AS seasonal_analysis,
  ((CASE WHEN ("s"."status" = 'approved') THEN '✅ APPROVED' ELSE CASE WHEN ("s"."status" = 'pending') THEN '⏳ PENDING' ELSE ('❌ ' || UPPER("s"."status")) END END || ' | Days since creation: ') || CAST(ROUND(EXTRACT(EPOCH FROM (current_date - "s"."created_at")) / 86400, 0) AS TEXT)) AS status_report,
  (((((UPPER(LEFT(TRIM("rel_merchant"."business_name"), 10)) || '...') || ' (') || CAST(LENGTH("rel_merchant"."business_name") AS TEXT)) || ' chars) | ') || CASE WHEN (POSITION('LLC' IN "rel_merchant"."business_name") > 0) THEN 'CORPORATION' ELSE 'OTHER' END) AS text_processing,
  (((((((('Created: ' || CAST(EXTRACT(MONTH FROM "s"."created_at") AS TEXT)) || '/') || CAST(EXTRACT(DAY FROM "s"."created_at") AS TEXT)) || '/') || CAST(EXTRACT(YEAR FROM "s"."created_at") AS TEXT)) || ' | Age: ') || CAST(EXTRACT(EPOCH FROM (current_date - "s"."created_at")) / 86400 AS TEXT)) || ' days') AS timeline_tracker,
  (((CASE WHEN ((EXTRACT(DOW FROM "s"."created_at") + 1 = 1) OR (EXTRACT(DOW FROM "s"."created_at") + 1 = 7)) THEN '📅 WEEKEND SUBMISSION' ELSE '🏢 WEEKDAY SUBMISSION' END || ' | ') || CAST(EXTRACT(DOW FROM "s"."created_at") + 1 AS TEXT)) || '/7') AS weekend_detector
FROM submission s
  LEFT JOIN merchant rel_merchant ON s.merchant = rel_merchant.id
  LEFT JOIN rep rel_merchant_main_rep ON rel_merchant.main_rep = rel_merchant_main_rep.id
  LEFT JOIN app_user rel_merchant_main_rep_app_user ON rel_merchant_main_rep.app_user = rel_merchant_main_rep_app_user.id
  LEFT JOIN (
    SELECT
      rep_link.submission AS submission,
      AVG("rep_link"."commission_percentage") AS avg_value,
      STRING_AGG((CAST("rep_link"."commission_percentage" AS TEXT) || '%'), ', ') AS rep_names,
      STRING_AGG(DISTINCT (CAST("rep_link"."commission_percentage" AS TEXT) || '%'), ' | ') AS rep_names_1,
      COUNT(*) AS rep_count,
      SUM("rep_link"."commission_percentage") AS sum_value,
      BOOL_AND(("rep_link"."commission_percentage" > 0)) AS and_value,
      STRING_AGG(CASE WHEN ("rep_link"."commission_percentage" > 5) THEN "agg_t1"."name" ELSE '' END, ', ') AS rep_names_2
    FROM rep_link
    JOIN rep agg_t1 ON rep_link.rep = agg_t1.id
    GROUP BY rep_link.submission
  ) sr1 ON sr1.submission = s.id
```

## 📊 Results


| advanced_math | approval_status | business_summary | commission_breakdown | compliance_check | comprehensive_dashboard | contact_info | deep_relationship | document_summary | financial_metrics | funding_analysis | merchant_profile | multi_level_demo | null_safety_check | performance_score | quarterly_report | rep_analysis | risk_assessment | seasonal_analysis | status_report | text_processing | timeline_tracker | weekend_detector |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| *NULL* | ⚠️ OVERDUE | *NULL* |  | ⚠️ REVIEW NEEDED | Age: 829.3952662037037037 days | *NULL* | Chris Zowarka (phoenixpoolsinc@yahoo.com) | 18137742304 | Business: Phoenix Pools, Inc. | *NULL* | *NULL* | *NULL* | *NULL* | *NULL* | *NULL* | Phoenix Pools, Inc. | Amount: N/A | Reps: 0 | 0.0 | *NULL* | Some reps without commission | High performers:  | LOW RISK | Phoenix Pools, Inc. | Reps: 0 | 🌸 SPRING 2023 | Phoenix Pools, Inc. | ❌ SUBMITTED | Days since creation: 829 | PHOENIX PO... (19 chars) | OTHER | Created: 3/15/2023 | Age: 829.3952662037037037 days | 🏢 WEEKDAY SUBMISSION | 4/7 |
| *NULL* | ⚠️ OVERDUE | *NULL* |  | ⚠️ REVIEW NEEDED | Age: 829.3951388888888889 days | *NULL* | DANIEL BORGES (inportrade@inportrade.com) | 13476981768 | Business: INPORTRADE LLC | Zeek Kamensky | *NULL* | *NULL* | *NULL* | INP-106 | HOLLYWOOD | Industry: ELECTRONICS | *NULL* | INPORTRADE LLC | Amount: N/A | Reps: 0 | 0.0 | *NULL* | Some reps without commission | High performers:  | LOW RISK | INPORTRADE LLC | Reps: 0 | 🌸 SPRING 2023 | INPORTRADE LLC | ❌ NO RESPONSE | Days since creation: 829 | INPORTRADE... (14 chars) | CORPORATION | Created: 3/15/2023 | Age: 829.3951388888888889 days | 🏢 WEEKDAY SUBMISSION | 4/7 |
| *NULL* | ⚠️ OVERDUE | *NULL* |  | ⚠️ REVIEW NEEDED | Age: 276.4252430555555556 days | *NULL* | JOHN MIYARES (jmiyares@hotmail.com) | 17739310662 | Business: TUSCANY BUILDERS CHICAGO INC | Mike Kaplin | *NULL* | *NULL* | *NULL* | *NULL* | *NULL* | TUSCANY BUILDERS CHICAGO INC | Amount: N/A | Reps: 0 | 0.0 | *NULL* | Some reps without commission | High performers:  | LOW RISK | TUSCANY BUILDERS CHICAGO INC | Reps: 0 | 🍂 FALL 2024 | TUSCANY BUILDERS CHICAGO INC | ❌ SUBMITTED | Days since creation: 276 | TUSCANY BU... (28 chars) | OTHER | Created: 9/18/2024 | Age: 276.4252430555555556 days | 🏢 WEEKDAY SUBMISSION | 4/7 |
| *NULL* | ⚠️ OVERDUE | *NULL* |  | ⚠️ REVIEW NEEDED | Age: 276.3818402777777778 days | *NULL* | MEHDI SAFFARI (sisinsurance77@yahoo.com) | 15123692548 | Business: SIS FINANCIAL LLC | Isaac Gold | *NULL* | *NULL* | *NULL* | *NULL* | *NULL* | SIS FINANCIAL LLC | Amount: N/A | Reps: 0 | 0.0 | *NULL* | Some reps without commission | High performers:  | LOW RISK | SIS FINANCIAL LLC | Reps: 0 | 🍂 FALL 2024 | SIS FINANCIAL LLC | ❌ SUBMITTED | Days since creation: 276 | SIS FINANC... (17 chars) | CORPORATION | Created: 9/18/2024 | Age: 276.3818402777777778 days | 🏢 WEEKDAY SUBMISSION | 4/7 |
| *NULL* | ⚠️ OVERDUE | *NULL* |  | ⚠️ REVIEW NEEDED | Age: 829.3952777777777778 days | *NULL* | Judith Colon (judithcolon@npointsconsulting.com) | 18136382648 | Business: N POINTS CONSULTING LLC  | Sara Adler | *NULL* | *NULL* | *NULL* | *NULL* | *NULL* | N POINTS CONSULTING LLC  | Amount: N/A | Reps: 0 | 0.0 | *NULL* | Some reps without commission | High performers:  | LOW RISK | N POINTS CONSULTING LLC  | Reps: 0 | 🌸 SPRING 2023 | N POINTS CONSULTING LLC  | ❌ SUBMITTED | Days since creation: 829 | N POINTS C... (24 chars) | CORPORATION | Created: 3/15/2023 | Age: 829.3952777777777778 days | 🏢 WEEKDAY SUBMISSION | 4/7 |


---
*Generated by Formula Executor*

