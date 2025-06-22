#!/usr/bin/env node

/**
 * PGlite Database Setup Script
 * Initializes the PGlite database with seed data for formula testing
 */

import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

async function setupDatabase() {
  console.log('🚀 Setting up PGlite database...');
  
  try {
    // Create PGlite instance
    const db = new PGlite();
    
    // Read and execute seed.sql
    console.log('📝 Reading seed.sql...');
    const seedSql = readFileSync(join(projectRoot, 'seed.sql'), 'utf8');
    
    console.log('🌱 Executing seed script...');
    await db.exec(seedSql);
    
    // Verify setup by running a simple query
    console.log('✅ Verifying setup...');
    const result = await db.query('SELECT COUNT(*) as count FROM submission');
    console.log(`📊 Found ${result.rows[0].count} submissions in database`);
    
    // Test metadata tables
    const tableCount = await db.query('SELECT COUNT(*) as count FROM table_info');
    console.log(`🏗️  Found ${tableCount.rows[0].count} tables in metadata system`);
    
    const relationshipCount = await db.query('SELECT COUNT(*) as count FROM relationship_lookups');
    console.log(`🔗 Found ${relationshipCount.rows[0].count} relationships in lookup system`);
    
    await db.close();
    console.log('🎉 PGlite database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };