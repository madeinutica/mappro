// Create user-client association for eflorez@newyorksash.com
import { supabase } from './utils/supabaseClient.js';

async function createUserClientAssociation() {
  try {
    console.log('Creating user-client association...');

    // First, sign in to get the user ID
    console.log('Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'eflorez@newyorksash.com',
      password: 'your_password_here' // Replace with actual password
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }

    console.log('Signed in successfully. User ID:', signInData.user.id);

    // Get the New York Sash client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('name', 'New York Sash')
      .single();

    if (clientError) {
      console.error('Client query error:', clientError);
      return;
    }

    console.log('Found client:', client);

    // Create the association
    const { data: newAssoc, error: createError } = await supabase
      .from('user_clients')
      .insert({
        user_id: signInData.user.id,
        client_id: client.id,
        role: 'admin'
      })
      .select();

    if (createError) {
      console.error('Create association error:', createError);
    } else {
      console.log('✅ Successfully created user-client association:', newAssoc);
    }

    // Sign out
    await supabase.auth.signOut();

  } catch (error) {
    console.error('Error:', error);
  }
}

createUserClientAssociation();