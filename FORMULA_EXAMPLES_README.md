# Formula Examples Library

A comprehensive collection of real-world formula examples for the JavaScript-to-SQL formula compiler, organized by database table and featuring advanced deduplication and optimization capabilities.

## 🎯 Overview

This library demonstrates the full capabilities of the formula compiler through realistic business scenarios. The system supports:

- **Multi-table support** with automatic relationship detection
- **Variadic formula execution** with intelligent deduplication
- **Advanced SQL optimization** across multiple formulas
- **Type-safe compilation** with comprehensive validation
- **Hierarchical semantic IDs** for precise optimization

## 📁 Directory Structure

```
examples/
└── table/
    └── {table_name}/
        ├── README.md              # Table-specific documentation
        ├── formula1.formula       # Individual formula files
        ├── formula2.formula
        └── ...
```

## 🚀 Usage

### Single Formula Execution
```bash
./exec-formula examples/table/submission/business_summary.formula
```

### Multiple Formula Execution (Same Table)
```bash
./exec-formula examples/table/submission/business_summary.formula \
               examples/table/submission/risk_assessment.formula \
               examples/table/submission/financial_metrics.formula
```

### Validation
- All formulas in a single execution must be from the same table
- Table name is automatically extracted from directory structure
- Field names are generated from filename (e.g., `business_summary.formula` → `business_summary`)

## 📊 Submission Table Examples

The `examples/table/submission/` directory contains **21 comprehensive examples** covering:

### Business Logic & Status Management
- **business_summary** - Merchant info + amount + commission aggregation
- **risk_assessment** - Conditional risk categorization with rep counting
- **status_report** - Status display with creation date calculations
- **approval_status** - Multi-level approval workflow with date handling
- **compliance_check** - Multi-condition compliance verification

### Financial Analysis & Calculations
- **financial_metrics** - Commission amount calculations
- **funding_analysis** - Funding categorization by size and industry
- **performance_score** - Complex performance scoring algorithm
- **commission_breakdown** - Detailed per-rep commission analysis

### Date & Time Intelligence
- **timeline_tracker** - Creation date formatting and age calculation
- **quarterly_report** - Quarter-based business reporting
- **seasonal_analysis** - Season detection and categorization
- **weekend_detector** - Business day vs weekend analysis

### Text Processing & Formatting
- **merchant_profile** - Advanced text manipulation and formatting
- **text_processing** - Text function demonstration with business logic
- **contact_info** - Contact information compilation and formatting

### Relationship & Aggregation Mastery
- **rep_analysis** - Representative performance with boolean aggregates
- **document_summary** - Document metrics with size calculations
- **null_safety_check** - Comprehensive null handling patterns

### Advanced Features
- **advanced_math** - Complex mathematical operations
- **comprehensive_dashboard** - Complete business dashboard summary

## 🔧 Formula Features Demonstrated

### Core Functions
- **Text**: `UPPER`, `LOWER`, `TRIM`, `LEN`, `LEFT`, `RIGHT`, `MID`, `CONTAINS`, `SUBSTITUTE`
- **Math**: `ROUND`, `ABS`, `MIN`, `MAX`, `MOD`, `CEILING`, `FLOOR`
- **Date**: `YEAR`, `MONTH`, `DAY`, `WEEKDAY`, `ADDDAYS`, `ADDMONTHS`, `DATEDIF`, `TODAY`
- **Logic**: `IF`, `AND`, `OR`, `ISNULL`
- **Conversion**: `STRING` (type casting)

### Aggregate Functions
- **String Aggregation**: `STRING_AGG`, `STRING_AGG_DISTINCT`
- **Numeric Aggregation**: `SUM_AGG`, `COUNT_AGG`, `AVG_AGG`, `MIN_AGG`, `MAX_AGG`
- **Boolean Aggregation**: `AND_AGG`, `OR_AGG`

### Relationship Types
- **Direct Relationships**: Access related table data directly
  - `merchant_rel.business_name` (submission → merchant)
  - `created_by_rel.full_name` (submission → user)
  
- **Inverse Relationships**: Aggregate from child tables
  - `rep_links_submission` (rep_link → submission)
  - `documents_submission` (document → submission)

### Advanced Patterns
- **Nested Relationships**: `rep_links_submission, rep_rel.name`
- **Complex Conditions**: Multi-level IF statements with business logic
- **Mathematical Expressions**: Proper operator precedence and calculations
- **String Concatenation**: Business-friendly output formatting
- **Null Safety**: Defensive programming patterns
- **Date Arithmetic**: Business calendar calculations

## ⚡ Optimization Features

### Automatic Deduplication
- **Join Deduplication**: Shared joins across formulas are executed once
- **Expression Reuse**: Common expressions within joins are optimized
- **Aggregate Optimization**: Subqueries are consolidated and shared
- **Semantic ID System**: Hierarchical identification enables precise optimization

### Performance Benefits
- **Single Query Execution**: Multiple formulas execute in one database round-trip
- **Minimal JOIN Operations**: Only necessary joins are included
- **Optimized Subqueries**: Aggregate operations are consolidated
- **Expression Caching**: Repeated calculations are eliminated

## 🗄️ Database Schema Integration

### Metadata-Driven Design
The system automatically discovers:
- **Table Structure**: Column names and types from `table_info`/`table_field`
- **Relationships**: Foreign key mappings from `relationship_lookups`
- **Inverse Relationships**: Child table relationships for aggregation

### Supported Data Types
- **String**: Text manipulation and formatting
- **Number**: Mathematical calculations and aggregation
- **Date**: Date arithmetic and formatting
- **Boolean**: Logical operations and conditions

## 🧪 Testing & Validation

The system includes comprehensive test coverage:
- **400+ Unit Tests** covering all function types
- **Error Handling Tests** for validation and edge cases
- **Integration Tests** for complex scenarios
- **Relationship Tests** for join operations
- **Aggregate Tests** for advanced aggregation

## 💡 Real-World Applications

These examples demonstrate patterns suitable for:
- **Financial Services**: Risk assessment, commission calculations
- **Business Intelligence**: Performance metrics, trend analysis  
- **Workflow Management**: Status tracking, approval processes
- **Compliance Reporting**: Audit trails, regulatory requirements
- **Customer Relationship Management**: Contact management, interaction tracking

## 🔮 Future Extensibility

The architecture supports easy extension to:
- **Additional Tables**: Following the same directory structure
- **New Functions**: Adding to the compiler's function library
- **Custom Relationships**: Extending the metadata system
- **Advanced Aggregations**: Complex business logic patterns

---

**Created**: Comprehensive formula library with 21+ real-world examples  
**Features**: Multi-formula execution, automatic optimization, type safety  
**Performance**: Intelligent deduplication and single-query execution  
**Scalability**: Metadata-driven design for easy extension