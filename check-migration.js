const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk3ODE4MiwiZXhwIjoyMDc2NTU0MTgyfQ.WItOFfQ_E97EpfBeYl99GNS0ZOkDpkUWijuSitdl6UE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Running Firebase UID migration for clients table...');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'firebase-clients-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded');

    // Since Supabase JS client doesn't support DDL directly, we'll provide instructions
    console.log('\n⚠️  Note: Supabase JS client cannot execute DDL statements directly.');
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/fvrueabzpinhlzyrnhne/sql');

    console.log('\n--- SQL to execute ---');
    console.log(migrationSQL);
    console.log('--- End SQL ---');

    // Check if clients table exists and has firebase_uid column
    console.log('\n🔍 Checking current clients table structure...');

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Error accessing clients table:', error.message);
        console.log('💡 You may need to run the schema setup first');
      } else {
        console.log('✅ clients table exists');

        // Check if firebase_uid column exists
        try {
          const { data: testData, error: testError } = await supabase
            .from('clients')
            .select('firebase_uid')
            .limit(1);

          if (testError) {
            console.log('❌ firebase_uid column does not exist yet');
            console.log('🔧 Please run the migration SQL in Supabase dashboard');
          } else {
            console.log('✅ firebase_uid column exists!');

            // Check if New York Sash client exists
            const { data: clientData, error: clientError } = await supabase
              .from('clients')
              .select('*')
              .eq('name', 'New York Sash')
              .single();

            if (clientError) {
              console.log('❌ New York Sash client not found');
            } else {
              console.log('✅ New York Sash client found:', clientData);
              if (clientData.firebase_uid === 'ibEEqGoyOOXeAbBg7QIREWmWa523') {
                console.log('✅ Firebase UID association is correct!');
              } else {
                console.log('❌ Firebase UID not set correctly. Expected: ibEEqGoyOOXeAbBg7QIREWmWa523, Got:', clientData.firebase_uid);
              }
            }
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