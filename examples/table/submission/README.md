# Submission Table Formula Examples

This directory contains comprehensive real-world formula examples for the submission table. Each `.formula` file contains a single formula that demonstrates various capabilities of the formula compiler.

## Available Examples

### Basic Business Logic
- **business_summary.formula** - Combines merchant info, amount, and commission data
- **risk_assessment.formula** - Conditional risk categorization based on amount and rep count
- **status_report.formula** - Status display with days since creation
- **approval_status.formula** - Nested approval status with date handling

### Financial Analysis
- **financial_metrics.formula** - Calculates total commission amount
- **funding_analysis.formula** - Categorizes funding by size with industry info
- **performance_score.formula** - Complex performance calculation with multiple factors

### Relationship & Aggregation Examples
- **commission_breakdown.formula** - Detailed commission breakdown by rep
- **rep_analysis.formula** - Rep performance analysis with boolean aggregates
- **document_summary.formula** - Document count and size totals
- **contact_info.formula** - Contact information compilation

### Date & Time Analysis
- **timeline_tracker.formula** - Creation date formatting and age calculation
- **quarterly_report.formula** - Quarter-based reporting
- **seasonal_analysis.formula** - Season detection based on creation date
- **weekend_detector.formula** - Weekend vs weekday submission detection

### Text Processing
- **merchant_profile.formula** - Text manipulation and formatting
- **text_processing.formula** - Advanced text functions demonstration

### Advanced Features
- **null_safety_check.formula** - Null handling and safety checks
- **advanced_math.formula** - Complex mathematical operations
- **compliance_check.formula** - Multi-condition compliance verification
- **comprehensive_dashboard.formula** - Complete dashboard-style summary

## Usage with exec-formula

You can execute any combination of these formulas using the exec-formula script:

```bash
# Single formula
./exec-formula examples/table/submission/business_summary.formula

# Multiple formulas (all must be from same table)
./exec-formula examples/table/submission/business_summary.formula examples/table/submission/risk_assessment.formula examples/table/submission/financial_metrics.formula
```

## Formula Features Demonstrated

### Functions Used
- **Text Functions**: UPPER, LOWER, TRIM, LEN, LEFT, RIGHT, MID, CONTAINS, SUBSTITUTE
- **Math Functions**: ROUND, ABS, MIN, MAX, MOD, CEILING, FLOOR
- **Date Functions**: YEAR, MONTH, DAY, WEEKDAY, ADDDAYS, ADDMONTHS, DATEDIF, TODAY
- **Aggregate Functions**: STRING_AGG, STRING_AGG_DISTINCT, SUM_AGG, COUNT_AGG, AVG_AGG, MIN_AGG, MAX_AGG, AND_AGG, OR_AGG
- **Logical Functions**: IF, AND, OR, ISNULL
- **Conversion**: STRING (for type casting)

### Relationships Used
- **Direct Relationships**: merchant_rel, created_by_rel
- **Inverse Relationships**: rep_links_submission, documents_submission

### Advanced Patterns
- Nested IF statements for complex logic
- String concatenation with &
- Mathematical expressions with proper precedence
- Date arithmetic and formatting
- Null safety patterns
- Aggregate function optimization
- Multi-condition boolean logic

## Database Schema Context

These formulas assume the following relationships:
- submission -> merchant (via merchant_id)
- submission -> user (via created_by)
- rep_link -> submission (inverse relationship)
- document -> submission (inverse relationship)
- rep_link -> rep (nested relationship)

Each formula demonstrates real-world business scenarios that would be common in a financial submission system.