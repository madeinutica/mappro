// Utility to initialize Supabase client
import { createClient } from '@supabase/supabase-js';

// For webpack/browser, use environment variables injected at build time

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
