// Script to create a user account for a client
import { supabase } from './utils/supabaseClient.js';

async function createUserForClient(clientId, clientName, email, password) {
  try {
    console.log(`Creating user account for ${clientName}...`);

    // First, try to create the user_clients table if it doesn't exist
    console.log('Ensuring user_clients table exists...');
    try {
      await supabase.rpc('create_user_clients_table_if_not_exists');
    } catch (error) {
      console.log('RPC function may not exist, continuing...');
    }

    // Sign up a new user
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password, // This should be changed in production
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('User already exists. Checking if they are associated with client...');

        // Try to sign in instead
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (signInError) {
          console.error('Error signing in:', signInError);
          return;
        }

        console.log('Signed in successfully. User ID:', signInData.user.id);

        // Check if user is already associated with client
        const { data: existingAssociation, error: associationError } = await supabase
          .from('user_clients')
          .select('*')
          .eq('user_id', signInData.user.id)
          .eq('client_id', clientId);

        if (associationError) {
          console.error('Error checking association:', associationError);
          return;
        }

        if (existingAssociation && existingAssociation.length > 0) {
          console.log(`User is already associated with ${clientName} client`);
          return;
        }

        // Associate user with client
        const { error: insertError } = await supabase
          .from('user_clients')
          .insert([{
            user_id: signInData.user.id,
            client_id: clientId,
            role: 'admin'
          }]);

        if (insertError) {
          console.error('Error associating user with client:', insertError);
        } else {
          console.log(`Successfully associated user with ${clientName} client`);
        }

        return;
      }

      console.error('Error creating user:', error);
      return;
    }

    if (data.user) {
      console.log('User created successfully. User ID:', data.user.id);

      // Associate user with client
      const { error: insertError } = await supabase
        .from('user_clients')
        .insert([{
          user_id: data.user.id,
          client_id: clientId,
          role: 'admin'
        }]);

      if (insertError) {
        console.error('Error associating user with client:', insertError);
      } else {
        console.log(`Successfully associated user with ${clientName} client`);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Example usage - replace with actual values
const CLIENT_ID = '550e8400-e29b-41d4-a716-446655440000'; // Replace with actual client ID
const CLIENT_NAME = 'Example Client'; // Replace with actual client name
const EMAIL = 'admin@example.com'; // Replace with actual email
const PASSWORD = 'password123'; // Replace with actual password

createUserForClient(CLIENT_ID, CLIENT_NAME, EMAIL, PASSWORD);