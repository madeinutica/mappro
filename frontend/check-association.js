// Check user-client association
import { config } from 'dotenv';
config({ path: './.env' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkAssociation() {
  const userIds = [
    'e591326c-f899-421c-8138-0699c1df05f4', // admin@newyorksash.com
    '1f662711-58df-4280-9dda-d99666941424'  // eflorez@newyorksash.com
  ];

  for (const userId of userIds) {
    console.log(`\nChecking association for userId: ${userId}`);

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
}

checkAssociation();