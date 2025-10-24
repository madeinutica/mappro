// Utility to initialize Supabase client
import { createClient } from '@supabase/supabase-js';

// For webpack/browser, use environment variables injected at build time

const supabaseUrl = 'https://fvrueabzpinhlzyrnhne.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
