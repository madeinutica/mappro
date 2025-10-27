// Associate a user with a client in the user_clients table
import { config } from 'dotenv';
config({ path: './.env' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function associateUserWithClient(userId, clientId, role = 'admin') {
  try {
    console.log(`Associating user ${userId} with client ${clientId}...`);

    // Check if the association already exists
    const { data: existingAssociation, error: checkError } = await supabase
      .from('user_clients')
      .select('*')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingAssociation) {
      console.log('User is already associated with this client');
      return;
    }

    // Insert the association
    const { error: insertError } = await supabase
      .from('user_clients')
      .insert([{
        user_id: userId,
        client_id: clientId,
        role: role
      }]);

    if (insertError) throw insertError;

    console.log('User successfully associated with client');

  } catch (error) {
    console.error('Error associating user with client:', error);
  }
}

// Usage
const USER_ID = '1f662711-58df-4280-9dda-d99666941424';
const CLIENT_ID = '550e8400-e29b-41d4-a716-446655440000';
const ROLE = 'admin'; // Can be 'admin', 'editor', or 'viewer'

associateUserWithClient(USER_ID, CLIENT_ID, ROLE);