// Script to help migrate firebase_uid from user_clients to clients table
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateFirebaseUidToClients() {
  try {
    console.log('🔄 Migrating firebase_uid from user_clients to clients table...');

    // Get all user_clients records with firebase_uid
    const { data: userClients, error: fetchError } = await supabase
      .from('user_clients')
      .select('client_id, firebase_uid')
      .not('firebase_uid', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching user_clients:', fetchError.message);
      return;
    }

    console.log(`📊 Found ${userClients.length} records with firebase_uid`);

    // Update clients table with firebase_uid
    for (const record of userClients) {
      console.log(`🔧 Migrating client ${record.client_id} with firebase_uid ${record.firebase_uid}`);

      const { error: updateError } = await supabase
        .from('clients')
        .update({ firebase_uid: record.firebase_uid })
        .eq('id', record.client_id);

      if (updateError) {
        console.error(`❌ Error updating client ${record.client_id}:`, updateError.message);
      } else {
        console.log(`✅ Updated client ${record.client_id}`);
      }
    }

    console.log('🎉 Migration complete! You can now:');
    console.log('1. Remove firebase_uid column from user_clients table');
    console.log('2. Update auth.js to query clients table instead');
    console.log('3. Update RLS policies accordingly');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

migrateFirebaseUidToClients();