# Assigned Rep Relationship Debug Test

## Purpose
This test specifically debugs the `assigned_rep_rel.name` formula issue by:
- Testing the formula execution in the browser environment
- Capturing detailed console output about relationship loading
- Analyzing the schema and relationship data
- Providing clear error reporting

## How to Run

### Option 1: Using npm script (recommended)
```bash
npm run test:assigned-rep
```

### Option 2: Direct execution
```bash
cd tests/playwright
node assigned-rep-debug.js
```

## What It Tests

1. **Application Loading**: Verifies the web app loads correctly
2. **Browser API Initialization**: Ensures the database and API are working
3. **Table Schema Analysis**: Examines the opportunity table structure
4. **Relationship Discovery**: Lists all direct and reverse relationships
5. **Formula Execution**: Attempts to run `assigned_rep_rel.name`
6. **Error Analysis**: Provides detailed error information if it fails

## Console Output

The test provides detailed console output including:
- 🔍 Relationship loading information
- ✅ Success indicators for each step
- ❌ Clear error messages with context
- 📋 Schema analysis results
- 🧪 Formula execution results

## Expected Output

If the `assigned_rep` relationship exists and is properly configured, you should see:
```
✅ assigned_rep relationship found: true
assigned_rep details: { relationship_name: 'assigned_rep', target_table_name: 'rep', ... }
✅ Formula compilation successful
```

If there's an issue, you'll see specific error messages indicating what's wrong.

## Troubleshooting

### Common Issues:

1. **Relationship not found**:
   - Check if the `assigned_rep` relationship exists in your database
   - Verify the foreign key constraint is properly set up

2. **Table not found**:
   - Ensure the `rep` table exists
   - Check that all required tables are in the database

3. **Column missing**:
   - Verify the `rep` table has a `name` column
   - Check the data types are correct

## Files Involved

- `assigned-rep-debug.js` - The main test file
- `../../../web/public/modules/shared/browser-api.js` - Browser API with debugging
- Frontend application at `http://localhost:3000`

## Prerequisites

1. The web server must be running on port 3000
2. Playwright must be installed (`npm install`)
3. The database must be seeded with proper data