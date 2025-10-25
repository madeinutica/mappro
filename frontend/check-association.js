// Check user-client association
import { supabase } from './utils/supabaseClient.js';

async function checkAssociation() {
  const userId = 'e591326c-f899-421c-8138-0699c1df05f4';
  console.log('Checking association for userId:', userId);

  const { data, error } = await supabase
    .from('user_clients')
    .select(`
      role,
      clients (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .single();

  console.log('Result:', { data, error });
}

checkAssociation();