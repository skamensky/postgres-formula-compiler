# Relationships Reference

This document explains how to work with relationships between tables in the Formula Language.

## Direct Relationships

Direct relationships allow you to access fields from related tables using the `_rel` suffix.

### Syntax
```
related_table_rel.field_name
```

### Examples
```
customer_rel.business_name      // Access customer's business name
merchant_rel.status            // Access merchant's status  
rep_rel.name                   // Access rep's name
```

### How It Works
1. **Relationship Detection:** The compiler identifies `_rel` suffix
2. **Foreign Key Lookup:** Finds the foreign key column (removes `_rel`)
3. **JOIN Generation:** Creates appropriate LEFT JOIN in SQL
4. **Field Access:** References the field in the joined table

### Generated SQL
```
-- Formula: customer_rel.business_name
SELECT rel_customer.business_name
FROM submission s
LEFT JOIN customer rel_customer ON s.customer = rel_customer.id
```

## Inverse Relationships (Aggregates)

Inverse relationships work in the opposite direction, allowing you to aggregate data from tables that reference your current table.

### Naming Convention
Format: `{table_name}s_{field_name}`

Examples:
- `orders_customer` - Order records that reference this customer
- `payments_invoice` - Payment records that reference this invoice
- `rep_links_submission` - Rep link records that reference this submission

### Aggregate Functions

#### STRING_AGG
Concatenate values from related records:
```
STRING_AGG(orders_customer, product_name, ", ")
STRING_AGG_DISTINCT(payments_invoice, payment_method, " | ")
```

#### Numeric Aggregates
```
SUM_AGG(line_items_order, amount)        // Sum amounts
COUNT_AGG(orders_customer, id)           // Count records
AVG_AGG(reviews_product, rating)         // Average rating
MIN_AGG(payments_invoice, amount)        // Minimum payment
MAX_AGG(orders_customer, total)          // Maximum order total
```

#### Boolean Aggregates
```
AND_AGG(line_items_order, is_taxable)    // All items taxable?
OR_AGG(orders_customer, is_priority)     // Any priority orders?
```

### Generated SQL
```
-- Formula: STRING_AGG(orders_customer, product_name, ", ")
SELECT agg1.string_agg_result
FROM customer c
LEFT JOIN (
  SELECT 
    o.customer,
    STRING_AGG(o.product_name, ', ') as string_agg_result
  FROM order o 
  GROUP BY o.customer
) agg1 ON c.id = agg1.customer
```

## Nested Relationships

### Current Support
Nested relationships work within aggregate expressions:
```
STRING_AGG(rep_links_submission, rep_rel.name, ", ")
```

This accesses the `name` field from the `rep` table through the `rep_link` relationship.

### Future Enhancement
Multi-level relationships in main expressions (planned):
```
customer_rel.main_rep_rel.user_rel.email
```

## Relationship Metadata

The Formula Language loads relationship information from your database schema:

### Direct Relationships
- **Source:** Foreign key constraints in database
- **Loading:** Automatic discovery from `information_schema`
- **Caching:** Relationship info cached per compilation context

### Inverse Relationships  
- **Source:** `relationship_lookups` table or computed from schema
- **Format:** Maps relationship names to table and join column info
- **Validation:** Compiler validates relationship existence

## Error Handling

### Common Errors
```
"Unknown relationship: customer_rel"
"Unknown inverse relationship: invalid_orders_customer"
"Field 'invalid_field' not found in related table"
```

### Troubleshooting
1. **Check relationship name:** Ensure `_rel` suffix for direct relationships
2. **Verify foreign keys:** Database must have proper foreign key constraints
3. **Validate field names:** Referenced fields must exist in target table
4. **Case sensitivity:** Relationship names are case-insensitive

## Performance Considerations

### JOIN Optimization
- **Automatic deduplication:** Same relationships share JOINs across formulas
- **LEFT JOINs:** Used to handle missing relationships gracefully
- **Alias management:** Unique aliases prevent conflicts

### Aggregate Optimization
- **Consolidated subqueries:** Multiple aggregates on same relationship share subqueries
- **Efficient grouping:** Proper GROUP BY clauses for aggregation
- **NULL handling:** Appropriate default values when no related records

## Best Practices

### Direct Relationships
1. **Validate existence:** Ensure relationships exist in your schema
2. **Handle NULLs:** Use `ISNULL()` to check for missing relationships
3. **Performance:** Consider index on foreign key columns

### Inverse Relationships
1. **Meaningful names:** Use descriptive relationship names
2. **Aggregate appropriately:** Choose right aggregate function for data
3. **Handle empty results:** Aggregates return appropriate defaults for no matches
4. **Complex expressions:** Use sub-expressions within aggregates for flexibility

### General
1. **Document relationships:** Comment complex relationship chains
2. **Test with real data:** Verify relationships work with actual database
3. **Monitor performance:** Watch for slow queries with many JOINs
