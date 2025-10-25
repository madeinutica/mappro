// Direct association script - run this after migration
import { supabase } from './utils/supabaseClient.js';

async function associateUserDirectly() {
  try {
    console.log('Associating user directly...');

    // Sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@newyorksash.com',
      password: 'password123'
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }

    console.log('Signed in, user ID:', signInData.user.id);

    // Try to insert directly (this should work after migration)
    const { data, error } = await supabase
      .from('user_clients')
      .upsert({
        user_id: signInData.user.id,
        client_id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'admin'
      });

    console.log('Upsert result:', { data, error });

    // Sign out
    await supabase.auth.signOut();
    console.log('Done');

  } catch (error) {
    console.error('Error:', error);
  }
}

associateUserDirectly();