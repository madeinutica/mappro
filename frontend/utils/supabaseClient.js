// Utility to initialize Supabase client
import { createClient } from '@supabase/supabase-js';

// For webpack/browser, use environment variables injected at build time
const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.REACT_APP_SUPABASE_URL
	? import.meta.env.REACT_APP_SUPABASE_URL
	: (window?.env?.REACT_APP_SUPABASE_URL || 'https://fvrueabzpinhlzyrnhne.supabase.co');
const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.REACT_APP_SUPABASE_ANON_KEY
	? import.meta.env.REACT_APP_SUPABASE_ANON_KEY
	: (window?.env?.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzgxODIsImV4cCI6MjA3NjU1NDE4Mn0.kg6y-vsG7MZAnCk-15LkIK8HUcnQD5rACzDT2x05Y1w');

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
