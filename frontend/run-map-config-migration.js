const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk3ODE4MiwiZXhwIjoyMDc2NTU0MTgyfQ.WItOFfQ_E97EpfBeYl99GNS0ZOkDpkUWijuSitdl6UE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMapConfigMigration() {
  try {
    console.log('🔄 Running map_config column migration for clients table...');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), '..', 'add-map-config-column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded');

    // Since Supabase JS client doesn't support DDL directly, we'll provide instructions
    console.log('\n⚠️  Note: Supabase JS client cannot execute DDL statements directly.');
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/fvrueabzpinhlzyrnhne/sql');

    console.log('\n--- SQL to execute ---');
    console.log(migrationSQL);
    console.log('--- End SQL ---');

    // Check if clients table exists and has map_config column
    console.log('\n🔍 Checking current clients table structure...');

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('map_config')
        .limit(1);

      if (error) {
        console.log('❌ map_config column does not exist yet');
        console.log('🔧 Please run the migration SQL in Supabase dashboard');
      } else {
        console.log('✅ map_config column exists!');

        // Show current map_config for first client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('name, map_config')
          .limit(1)
          .single();

        if (clientError) {
          console.log('❌ Error fetching client data:', clientError.message);
        } else {
          console.log('✅ Sample client map_config:', JSON.stringify(clientData.map_config, null, 2));
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

runMapConfigMigration();