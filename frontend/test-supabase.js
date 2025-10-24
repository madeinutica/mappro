// Test Supabase connectivity
import { supabase } from './utils/supabaseClient.js';

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...');

    // Test getSession
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
      console.log('Session data:', sessionData);
    }

    // Test a simple query
    const { data, error } = await supabase.from('clients').select('id, name').limit(1);
    if (error) {
      console.error('Query error:', error);
    } else {
      console.log('Query result:', data);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testSupabase();