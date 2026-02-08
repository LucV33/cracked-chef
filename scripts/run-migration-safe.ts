/**
 * Safe Migration Runner
 * Uses existing credentials from .env.local to run the migration
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import pg from 'pg';

const { Client } = pg;

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const dbPassword = process.env.SUPABASE_DB_PASSWORD!;

if (!supabaseUrl || !dbPassword) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('❌ Invalid Supabase URL format');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Running database migration...\n');

  // Read the migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '005_canonical_items.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  // Connect directly to Postgres
  const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📄 Executing migration SQL...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!\n');

    console.log('🎉 All done! Now run: npm run populate-db');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nIf the tables already exist, this is fine - skip to:');
    console.error('  npm run populate-db\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
