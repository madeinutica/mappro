// Waitlist API using Supabase
import { supabase } from './supabaseClient';

export async function addToWaitlist(email, name = '') {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([{
      email: email.trim().toLowerCase(),
      name: name.trim(),
      created_at: new Date().toISOString(),
      source: 'marketing_page'
    }]);

  if (error) {
    // Handle duplicate email error gracefully
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      throw new Error('This email is already on the waitlist!');
    }
    throw error;
  }

  return data;
}

export async function getWaitlistCount() {
  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count;
}