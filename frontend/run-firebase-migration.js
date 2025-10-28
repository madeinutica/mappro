// Run Firebase UID migration on Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Running Firebase UID migration...');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), '..', 'firebase-user-clients-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded');
    console.log('--- Migration Content ---');
    console.log(migrationSQL);
    console.log('--- End Migration ---');

    // Since Supabase JS client doesn't support DDL directly, we'll provide instructions
    console.log('\n⚠️  Note: Supabase JS client cannot execute DDL statements directly.');
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/fvrueabzpinhlzyrnhne/sql');

    console.log('\n--- SQL to execute ---');
    console.log(migrationSQL);
    console.log('--- End SQL ---');

    // Check current state
    console.log('\n🔍 Checking current user_clients table structure...');

    try {
      const { data, error } = await supabase
        .from('user_clients')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Error accessing user_clients table:', error.message);
        console.log('💡 You may need to run the schema setup first');
      } else {
        console.log('✅ user_clients table exists');

        // Check if firebase_uid column exists
        try {
          const { data: testData, error: testError } = await supabase
            .from('user_clients')
            .select('firebase_uid')
            .limit(1);

          if (testError) {
            console.log('❌ firebase_uid column does not exist yet');
            console.log('🔧 Please run the migration SQL in Supabase dashboard');
          } else {
            console.log('✅ firebase_uid column already exists!');
          }
        } catch (err) {
          console.log('❌ Error checking firebase_uid column:', err.message);
        }
      }
    } catch (err) {
      console.error('❌ Error checking table:', err.message);
    }

  } catch (error) {
    console.error('❌ Migration script failed:', error.message);
    process.exit(1);
  }
}

runMigration();