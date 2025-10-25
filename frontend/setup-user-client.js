// Create user_clients table and associate user
import { supabase } from './utils/supabaseClient.js';

async function setupUserClient() {
  try {
    console.log('Creating user_clients table...');

    // Try to create the table (this might fail if it already exists)
    const { error: createError } = await supabase.rpc('create_user_clients_table_if_not_exists');

    if (createError) {
      console.log('RPC function not available, trying direct insert...');
    }

    // Try direct insert - if table doesn't exist, this will fail
    const { error: insertError } = await supabase
      .from('user_clients')
      .insert({
        user_id: 'e591326c-f899-421c-8138-0699c1df05f4',
        client_id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'admin'
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      // If table doesn't exist, let's create it manually
      console.log('Table might not exist. Please run the migration SQL manually.');
    } else {
      console.log('✅ Successfully associated user with client');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

setupUserClient();