# 📊 Report Builder Guide

## Overview

The Report Builder feature allows users to create multi-formula reports that combine multiple calculations into a single optimized SQL query. This feature leverages the existing formula compiler to build complex reports with automatic join deduplication and optimization.

## Features

### ✨ Key Capabilities

- **Multi-Formula Reports**: Combine multiple formulas into a single report
- **SQL Optimization**: Automatic join deduplication across formulas
- **Named Columns**: Each formula gets a custom column name in the output
- **Example Reports**: Pre-built templates for each table type
- **Save/Load Reports**: Persistent report storage in browser localStorage
- **Real-time Validation**: Formula validation as you type
- **Rich UI**: Developer tools integration with autocomplete and syntax highlighting

### 🔧 Technical Features

- **Shared Join Optimization**: Multiple formulas that reference the same relationships will share JOINs
- **Aggregate Consolidation**: Multiple aggregates on the same relationship are combined into subqueries
- **Schema Awareness**: Full access to table schemas and relationships
- **Error Handling**: Comprehensive error reporting for invalid formulas

## How to Use

### 1. Access the Report Builder

1. Open the web interface at `http://localhost:3000`
2. Click on the **"Report Builder"** tab
3. The interface will initialize with one empty formula row

### 2. Basic Report Creation

1. **Select a Table**: Choose the base table for your report from the dropdown
2. **Name Your Report**: Enter a descriptive name for your report
3. **Add Formulas**: 
   - Each row represents one column in the final report
   - Set the column name (left field)
   - Enter the formula (right field)
4. **Generate Report**: Click "Generate Report" to execute

### 3. Adding More Formulas

- Click **"+ Add Formula"** to add additional formula rows
- Use the **"×"** button to remove unwanted formula rows
- At least one formula row must remain

### 4. Example Reports

Click **"Load Example Report"** to load pre-built templates:

#### Customer Analysis Report
```
Customer_Name: first_name & " " & last_name
Budget_Range: STRING(budget_min) & " - " & STRING(budget_max)
Budget_Flexibility: ROUND((budget_max - budget_min) / budget_min * 100, 1) & "%"
```

#### Listing Analysis Report
```
Property_Address: address
Price_Per_SqFt: ROUND(listing_price / square_feet, 2)
Market_Status: IF(days_on_market < 30, "HOT", IF(days_on_market < 60, "NORMAL", "SLOW"))
Days_Listed: days_on_market & " days"
```

#### Opportunity Analysis Report
```
Deal_Value: STRING(estimated_value)
Commission_Est: ROUND(estimated_value * 0.03, 0)
Stage_Status: stage
```

### 5. Saving and Loading Reports

- **Save Report**: Click "Save Report" to store your report configuration
- **Load Report**: Click on any saved report in the "Saved Reports" section
- **Delete Report**: Use the "🗑️ Delete" button to remove saved reports

## Formula Examples

### Basic Column References
```
Customer_Name: first_name & " " & last_name
Email: email
Phone: phone
```

### Calculations with Functions
```
Price_Per_SqFt: ROUND(listing_price / square_feet, 2)
Budget_Midpoint: (budget_min + budget_max) / 2
Days_On_Market: days_on_market
```

### Conditional Logic
```
Market_Status: IF(days_on_market < 30, "🔥 HOT", IF(days_on_market < 60, "📈 NORMAL", "📊 SLOW"))
Budget_Category: IF(budget_max > 500000, "Premium", IF(budget_max > 200000, "Standard", "Budget"))
```

### Relationship Access
```
Merchant_Name: merchant_rel.business_name
Rep_Name: rep_rel.first_name & " " & rep_rel.last_name
Category: merchant_rel.category
```

### String Aggregations
```
All_Rep_Names: STRING_AGG(rep_links, rep_rel.first_name & " " & rep_rel.last_name, ", ")
Categories: STRING_AGG(category_links, category_rel.name, " | ")
```

### Numeric Aggregations
```
Total_Opportunities: COUNT_AGG(opportunity_links, opportunity_rel.id)
Average_Deal_Size: AVG_AGG(opportunity_links, opportunity_rel.estimated_value)
Max_Commission: MAX_AGG(commission_links, commission_rel.amount)
```

## SQL Optimization Examples

### Without Optimization (Multiple Queries)
```sql
-- Query 1
SELECT merchant_rel.business_name AS merchant_name 
FROM submission s 
LEFT JOIN merchant merchant_rel ON s.merchant_id = merchant_rel.id;

-- Query 2  
SELECT merchant_rel.category AS merchant_category
FROM submission s 
LEFT JOIN merchant merchant_rel ON s.merchant_id = merchant_rel.id;
```

### With Optimization (Single Query)
```sql
SELECT 
  merchant_rel.business_name AS merchant_name,
  merchant_rel.category AS merchant_category
FROM submission s
LEFT JOIN merchant merchant_rel ON s.merchant_id = merchant_rel.id;
```

## API Integration

The Report Builder uses the `executeMultipleFormulas` function:

```javascript
const result = await executeMultipleFormulas([
  { name: 'Customer_Name', formula: 'first_name & " " & last_name' },
  { name: 'Budget_Range', formula: 'STRING(budget_min) & " - " & STRING(budget_max)' }
], 'customer');
```

### Response Format
```javascript
{
  success: true,
  formulas: [
    { name: 'Customer_Name', fieldName: 'customer_name', formula: '...' },
    { name: 'Budget_Range', fieldName: 'budget_range', formula: '...' }
  ],
  sql: "SELECT ...",  // Optimized SQL
  results: [...],     // Query results
  metadata: {
    formulaCount: 2,
    totalJoinIntents: 5,
    totalAggregateIntents: 2,
    actualJoins: 3,
    subqueries: 1,
    selectExpressions: 2
  }
}
```

## Performance Benefits

### Join Deduplication
- **Before**: Multiple formulas accessing the same relationship = multiple identical JOINs
- **After**: Shared relationships use a single JOIN across all formulas

### Aggregate Consolidation
- **Before**: Multiple aggregates on same relationship = multiple subqueries
- **After**: Multiple aggregates combined into single subquery

### Example Performance Gain
For a report with 5 formulas accessing 3 shared relationships:
- **Without optimization**: 5 separate queries with 15 total JOINs
- **With optimization**: 1 query with 3 JOINs (5x reduction)

## Validation and Error Handling

### Real-time Validation
- Formulas are validated as you type
- Visual indicators show valid (green) or invalid (red) formulas
- Error tooltips provide specific error messages

### Common Error Types
- **Syntax Errors**: Invalid formula syntax
- **Column Not Found**: Referenced column doesn't exist
- **Type Mismatch**: Incompatible data types in operations
- **Relationship Errors**: Invalid relationship references

## Advanced Features

### Developer Tools Integration
- **Autocomplete**: Smart suggestions for columns and functions
- **Syntax Highlighting**: Color-coded formula syntax
- **Formatting**: Automatic formula formatting

### Schema Browsing
- Full table schema inspection
- Relationship visualization
- Sample data preview

### Export Options
The underlying `exec-formula` command supports multiple output formats:
```bash
./exec-formula --output json report_formulas/*.formula
./exec-formula --output html report_formulas/*.formula
./exec-formula --output markdown report_formulas/*.formula
```

## Troubleshooting

### Common Issues

1. **Formula Not Validating**
   - Check column names are correct
   - Verify relationship syntax
   - Ensure parentheses are balanced

2. **Empty Results**
   - Verify table has data
   - Check JOIN conditions
   - Review filtering logic

3. **Performance Issues**
   - Simplify complex aggregations
   - Consider breaking large reports into smaller ones
   - Use appropriate indices on database tables

### Error Messages

- `"Formula compilation errors"`: One or more formulas have syntax errors
- `"Please select a table"`: No base table selected
- `"Please fill in all formulas"`: Empty formula fields detected
- `"Database not initialized"`: Browser database not ready

## Technical Architecture

### Components
- **ReportBuilder**: Main UI controller
- **executeMultipleFormulas**: API function for multi-formula execution
- **generateSQL**: SQL optimization engine
- **validateFormula**: Real-time validation

### Data Flow
1. User creates formulas in UI
2. Formulas validated in real-time
3. On execution, all formulas compiled together
4. SQL generator optimizes joins and aggregates
5. Single optimized query executed
6. Results displayed in formatted table

## Future Enhancements

### Roadmap Items
- **Report Scheduling**: Automatic report generation
- **Chart Integration**: Visual charts from report data
- **Export Formats**: CSV, Excel, PDF export
- **Report Templates**: More pre-built templates
- **Collaboration**: Sharing reports between users
- **Parameterization**: Dynamic report parameters

### Contributions
The Report Builder is built on the existing formula compiler infrastructure. New features can be added by:
1. Extending the `ReportBuilder` class
2. Adding new functions to the formula language
3. Enhancing the SQL optimization engine
4. Improving the UI components

---

*This guide covers the current Report Builder functionality. For technical details about the formula language itself, see the main documentation.*