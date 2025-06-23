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
    const result = await db.query('SELECT COUNT(*) as count FROM listing');
    console.log(`📊 Found ${result.rows[0].count} listings in database`);
    
    // Test schema using standard introspection
    const tableCount = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    console.log(`🏗️  Found ${tableCount.rows[0].count} tables in database`);
    
    const relationshipCount = await db.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
    `);
    console.log(`🔗 Found ${relationshipCount.rows[0].count} foreign key relationships`);
    
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