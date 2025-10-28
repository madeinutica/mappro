// Create New York Sash client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fvrueabzpinhlzyrnhne.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w'
);

async function createClientRecord() {
  console.log('Creating New York Sash client...');

  try {
    // First disable RLS
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE clients DISABLE ROW LEVEL SECURITY;'
    });

    // Then create the client
    const { data, error } = await supabase
      .from('clients')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'New York Sash',
        domain: 'nysash.com',
        primary_color: '#3B82F6'
      })
      .select();

    if (error) {
      console.error('Error creating client:', error);
    } else {
      console.log('Client created:', data);
    }
  } catch (e) {
    console.error('Exception:', e.message);
  }
}

createClientRecord();