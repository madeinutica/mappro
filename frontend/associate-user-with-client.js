// Associate a user with a client in the user_clients table
import { supabase } from './utils/supabaseClient.js';

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
const USER_ID = '2de170ad-56f6-4325-9e5e-d35748fff1af';
const CLIENT_ID = '550e8400-e29b-41d4-a716-446655440000';
const ROLE = 'admin'; // Can be 'admin', 'editor', or 'viewer'

associateUserWithClient(USER_ID, CLIENT_ID, ROLE);