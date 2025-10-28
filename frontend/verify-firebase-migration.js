// Verify Firebase UID migration
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  try {
    console.log('🔍 Verifying Firebase UID migration...');

    // Check if firebase_uid column exists
    const { data: testData, error: testError } = await supabase
      .from('user_clients')
      .select('firebase_uid')
      .limit(1);

    if (testError) {
      console.log('❌ firebase_uid column does not exist');
      console.log('💡 Please run the migration SQL in Supabase dashboard first');
      return;
    }

    console.log('✅ firebase_uid column exists!');

    // Check current records
    const { data: records, error: recordsError } = await supabase
      .from('user_clients')
      .select('*');

    if (recordsError) {
      console.error('❌ Error fetching records:', recordsError.message);
      return;
    }

    console.log(`📊 Found ${records.length} user-client associations:`);
    records.forEach((record, index) => {
      console.log(`  ${index + 1}. User: ${record.user_id}, Client: ${record.client_id}, Firebase UID: ${record.firebase_uid || 'null'}`);
    });

    // Test inserting a Firebase UID for the demo user
    const demoFirebaseUid = '4LtwhspICcdgb18CO3c6Ns7RpM13';
    const demoClientId = '550e8400-e29b-41d4-a716-446655440000';

    console.log(`\n🔧 Testing Firebase UID association for demo user...`);

    // Check if association already exists
    const { data: existing, error: checkError } = await supabase
      .from('user_clients')
      .select('*')
      .eq('firebase_uid', demoFirebaseUid)
      .eq('client_id', demoClientId);

    if (checkError) {
      console.error('❌ Error checking existing association:', checkError.message);
      return;
    }

    if (existing && existing.length > 0) {
      console.log('✅ Demo user Firebase association already exists');
    } else {
      // Try to insert the association
      const { error: insertError } = await supabase
        .from('user_clients')
        .insert({
          firebase_uid: demoFirebaseUid,
          client_id: demoClientId,
          role: 'admin'
        });

      if (insertError) {
        console.error('❌ Error creating demo user association:', insertError.message);
      } else {
        console.log('✅ Demo user Firebase association created successfully');
      }
    }

    console.log('\n🎉 Migration verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyMigration();