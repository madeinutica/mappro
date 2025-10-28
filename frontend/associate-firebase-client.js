// Associate Firebase user with client in clients table
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function associateFirebaseUserWithClient() {
  try {
    console.log('🔗 Associating Firebase user with New York Sash client...');

    const demoFirebaseUid = '4LtwhspICcdgb18CO3c6Ns7RpM13'; // demo@mappro.com
    const newYorkSashClientId = '550e8400-e29b-41d4-a716-446655440000';

    // Update the clients table with the Firebase UID
    const { error } = await supabase
      .from('clients')
      .update({ firebase_uid: demoFirebaseUid })
      .eq('id', newYorkSashClientId);

    if (error) {
      console.error('❌ Error associating Firebase user with client:', error.message);
      return;
    }

    console.log('✅ Successfully associated demo Firebase user with New York Sash client');

    // Verify the association
    const { data: client, error: verifyError } = await supabase
      .from('clients')
      .select('id, name, firebase_uid')
      .eq('id', newYorkSashClientId)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying association:', verifyError.message);
    } else {
      console.log('🔍 Verification:', client);
    }

  } catch (error) {
    console.error('❌ Association failed:', error.message);
  }
}

associateFirebaseUserWithClient();