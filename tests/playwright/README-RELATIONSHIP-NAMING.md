# Relationship Naming Convention Test

## Purpose

This test ensures that the relationship naming convention follows the correct pattern and that the `assigned_rep_id_rel.name` formula works as expected.

## Naming Convention

The system uses the following convention for relationships:

```
{field_name}_rel.{foreign_field_name}
```

Where:
- `field_name` = Complete foreign key column name (including `_id` suffix)
- `foreign_field_name` = Column name in the target table

## Examples

| Foreign Key Column | Relationship Name | Formula Example |
|-------------------|-------------------|-----------------|
| `assigned_rep_id` | `assigned_rep_id` | `assigned_rep_id_rel.name` |
| `customer_id` | `customer_id` | `customer_id_rel.email` |
| `listing_id` | `listing_id` | `listing_id_rel.address` |

## How to Run

### Individual Test
```bash
# Run just the relationship naming test
npm run test:relationships
```

### As Part of Comprehensive Suite
```bash
# Run all tests including relationship naming
npm run test:comprehensive
```

### Direct Execution
```bash
# Run directly with Node
node tests/playwright/relationship-naming-test.js
```

## Test Coverage

The test verifies:

1. **Relationship Generation**: Foreign key columns generate relationships with correct names
2. **Formula Execution**: `assigned_rep_id_rel.name` executes successfully  
3. **Autocomplete Integration**: Suggestions include correct relationship names
4. **Multi-Level Relationships**: Chains like `customer_id_rel.assigned_rep_id_rel.name` work
5. **Error Handling**: Invalid relationships are properly rejected
6. **Cross-Table Consistency**: All tables follow the same naming convention

## Expected Results

When working correctly, you should see:

```
✅ assigned_rep_id column generates "assigned_rep_id" relationship
✅ All relationship names match their source column names  
✅ assigned_rep_id_rel.name formula executes successfully
✅ Formula returns result data
✅ Old naming convention (assigned_rep_rel) correctly fails
✅ Autocomplete suggests assigned_rep_id column
✅ Autocomplete suggests assigned_rep_id_rel relationship
✅ Opportunity table has customer_id relationship
✅ Multi-level formula (customer_id_rel.assigned_rep_id_rel.name) works
✅ Invalid relationship names are properly rejected
✅ All tables follow consistent naming convention

📊 Success Rate: 100.0%
```

## Troubleshooting

If tests fail:

1. **Check Server**: Ensure `npm run dev` is running on localhost:3000
2. **Check Database**: Verify tables and foreign keys exist in the schema
3. **Check Build**: Run `npm run build` to update browser modules
4. **Check Console**: Look for errors in the test output

## Integration with CI/CD

This test can be integrated into automated testing pipelines:

```bash
# Run test and exit with proper code
npm run test:relationships
echo "Exit code: $?"
```

The test returns:
- Exit code `0` if all tests pass
- Exit code `1` if any tests fail