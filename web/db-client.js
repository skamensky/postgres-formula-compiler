/**
 * Database Client Module
 * Provides abstraction layer for both PGlite and PostgreSQL connections
 */

import { PGlite } from '@electric-sql/pglite';
import pkg from 'pg';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

class DatabaseClient {
  constructor(options = {}) {
    this.usePGlite = options.usePGlite !== undefined ? options.usePGlite : !process.env.DATABASE_URL;
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      return this.client;
    }

    if (this.usePGlite) {
      console.log('🔌 Connecting to PGlite database...');
      this.client = new PGlite();
      
      // Check if database is initialized, if not, initialize it
      try {
        const result = await this.client.query('SELECT 1 FROM information_schema.tables WHERE table_name = $1 LIMIT 1', ['listing']);
        if (result.rows.length === 0) {
          console.log('📦 Initializing PGlite database with seed data...');
          await this.initializePGlite();
        }
      } catch (error) {
        console.log('📦 Initializing PGlite database with seed data (fallback)...');
        await this.initializePGlite();
      }
    } else {
      console.log('🔌 Connecting to PostgreSQL database...');
      this.client = new Client({ connectionString: process.env.DATABASE_URL });
      await this.client.connect();
    }

    this.isConnected = true;
    return this.client;
  }

  async initializePGlite() {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const projectRoot = join(__dirname, '..');
    const seedSql = readFileSync(join(projectRoot, 'seed.sql'), 'utf8');
    await this.client.exec(seedSql);
  }

  async query(text, params) {
    if (!this.isConnected) {
      await this.connect();
    }
    return await this.client.query(text, params);
  }

  async close() {
    if (this.isConnected && this.client) {
      if (this.usePGlite) {
        await this.client.close();
      } else {
        await this.client.end();
      }
      this.isConnected = false;
    }
  }

  // Compatibility methods
  async exec(sql) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    if (this.usePGlite) {
      return await this.client.exec(sql);
    } else {
      return await this.client.query(sql);
    }
  }
}

// Export factory function for easy use
export function createDatabaseClient(options = {}) {
  return new DatabaseClient(options);
}

export { DatabaseClient };