# PGlite Migration & Interactive Web UI

This document explains the new PGlite setup and interactive web interface for formula testing.

## 🆕 What's New

1. **PGlite Integration**: Replaced PostgreSQL with PGlite for automated testing without needing a full database instance
2. **Interactive Web UI**: Beautiful web interface for testing formulas with live SQL generation and execution
3. **Shared Infrastructure**: Common seed.sql and database abstraction for both testing and web UI

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database (Optional - auto-initializes)
```bash
npm run setup-db
```

### 3. Run Tests (now uses PGlite automatically)
```bash
npm run test
```

### 4. Execute Formulas (now uses PGlite automatically)
```bash
npm run exec-all
```

### 5. Start Interactive Web UI
```bash
npm run serve
```

Then open http://localhost:3000 in your browser for the interactive formula tester!

## 🔧 How It Works

### Database Abstraction Layer

The new `src/db-client.js` module provides automatic switching between PostgreSQL and PGlite:

- **No DATABASE_URL**: Uses PGlite with auto-initialization from `seed.sql`
- **With DATABASE_URL**: Uses PostgreSQL (backward compatible)

### Seed Data

The `seed.sql` file contains:
- **Real estate schema**: app_user, rep, customer, listing, opportunity, rep_link
- **Formula system tables**: merchant, submission (for existing formula compatibility)  
- **Metadata tables**: table_info, table_field, relationship_lookups
- **Sample data**: Ready-to-use test data for all tables

### Interactive Web UI Features

1. **Formula Compiler Tab**: 
   - Live formula execution with table selection
   - Real-time SQL generation
   - Results display with metadata

2. **Examples Tab**:
   - Browse existing formula examples
   - Click to load into compiler
   - Organized by table

3. **Database Schema Tab**:
   - View table columns and data types
   - See relationships between tables
   - Sample data preview

## 📊 Example Usage

### Command Line (same as before, now with PGlite)
```bash
# Test a single formula
./exec-formula examples/table/submission/business_summary.formula

# Test all formulas for a table
./exec-formula examples/table/submission/*.formula

# Generate markdown output
./exec-formula --output markdown examples/table/submission/*.formula > results.md
```

### Interactive Web UI
1. Visit http://localhost:3000
2. Select a table (e.g., "submission")
3. Enter a formula: `amount + lender_fee` 
4. Click "Execute Formula"
5. View SQL generation and results

### Advanced Examples
- **Simple calculation**: `amount + lender_fee`
- **Conditional logic**: `IF(amount > 1000, "High", "Low")`
- **Relationships**: `merchant_rel.business_name`
- **Aggregations**: `STRING_AGG(rep_links_submission, rep_rel.name, ",")`
- **Complex expressions**: `IF(status = "approved", amount * 0.1, 0)`

## 🔄 Migration Details

### Backward Compatibility
- **All existing tests work unchanged**
- **All existing formulas work unchanged**
- **PostgreSQL still supported** (set DATABASE_URL)
- **Command-line tools work as before**

### New Capabilities
- **No database setup required** for testing
- **Automatic schema initialization**
- **Interactive web-based testing**
- **Rich visual feedback**
- **Example browsing and loading**

### Performance Benefits
- **Faster test execution** (no network calls)
- **No external dependencies** for testing
- **Consistent test environment**
- **Easier CI/CD integration**

## 🎯 Use Cases

### Development & Testing
```bash
# Quick test cycle
npm run test && npm run exec-all
```

### Demos & Training
```bash
# Start interactive server
npm run serve

# Share: http://localhost:3000
```

### Production Deployment
```bash
# Use PostgreSQL in production
export DATABASE_URL="postgresql://..."
npm run serve
```

## 📁 File Structure

```
js-to-sql/
├── seed.sql                 # 🆕 Database schema & sample data
├── src/db-client.js         # 🆕 Database abstraction layer
├── web/                     # 🆕 Interactive web UI
│   ├── server.js           #     Express server
│   └── public/index.html   #     Frontend interface
├── scripts/
│   └── setup-pglite.js     # 🆕 Manual database setup
└── package.json            # 🆕 Updated with new dependencies
```

## 🐛 Troubleshooting

### "Cannot find module @electric-sql/pglite"
```bash
npm install
```

### Web UI not loading tables
- Check if seed.sql loaded correctly: `npm run setup-db`
- Verify server logs for database connection issues

### Formula execution errors
- Test the same formula via command line: `./exec-formula`
- Check browser developer console for network errors

### Port 3000 already in use
```bash
PORT=3001 npm run serve
```

## 🎉 Benefits Summary

- ✅ **Zero database setup** for testing and development
- ✅ **Beautiful interactive interface** for demos and training  
- ✅ **Backward compatible** with existing PostgreSQL workflows
- ✅ **Shared infrastructure** reduces duplication
- ✅ **Real-time feedback** with SQL generation visualization
- ✅ **Example browsing** makes learning easier
- ✅ **Production ready** with automatic environment detection