// Create a user and associate them with a client
//
// SETUP INSTRUCTIONS:
// 1. Get your service role key from Supabase Dashboard > Settings > API
// 2. Set it as an environment variable: SUPABASE_SERVICE_ROLE_KEY=your-key-here
//    Or replace 'your-service-role-key-here' below with your actual service role key
// 3. Update the EMAIL, PASSWORD, CLIENT_ID, and ROLE variables below
// 4. Run: node create-user-for-client.js
//
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations (get this from Supabase Dashboard > Settings > API)
const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserForClient(email, password, clientId, role = 'admin') {
  try {
    console.log(`Creating user ${email} and associating with client ${clientId}...`);

    // Create the user account
    let { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // If user already exists, try to sign in instead
      if (authError.message.includes('already registered')) {
        console.log('User already exists, signing in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        authData = signInData;
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error('Failed to create or authenticate user');
    }

    const userId = authData.user.id;
    console.log(`User created/authenticated with ID: ${userId}`);

    // Associate the user with the client
    const { error: associationError } = await supabase
      .from('user_clients')
      .upsert([{
        user_id: userId,
        client_id: clientId,
        role: role
      }]);

    if (associationError) throw associationError;

    console.log('User successfully associated with client');
    return { userId, clientId };

  } catch (error) {
    console.error('Error creating user and associating with client:', error);
  }
}

// Usage - replace with actual values
const EMAIL = 'eflorez@newyorksash.com'; // Replace with your desired email
const PASSWORD = 'Password123'; // Replace with your desired password
const CLIENT_ID = '550e8400-e29b-41d4-a716-446655440000'; // New York Sash client ID
const ROLE = 'admin'; // 'admin' or 'user'

createUserForClient(EMAIL, PASSWORD, CLIENT_ID, ROLE);
