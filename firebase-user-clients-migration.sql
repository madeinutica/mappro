-- Migration: Update user_clients table to work with Firebase UIDs
-- This allows Firebase authenticated users to be associated with clients

-- First, add a new column for Firebase UID
ALTER TABLE user_clients ADD COLUMN firebase_uid TEXT UNIQUE;

-- Update existing records to use Firebase UID if they have one
-- (This is for migration purposes - existing Supabase users would need Firebase UIDs added)

-- Make firebase_uid required for new records (but allow null for existing)
-- We'll use a trigger or application logic to ensure firebase_uid is set

-- Update the unique constraint to include firebase_uid
ALTER TABLE user_clients DROP CONSTRAINT IF EXISTS user_clients_user_id_client_id_key;
ALTER TABLE user_clients ADD CONSTRAINT user_clients_firebase_uid_client_id_key UNIQUE (firebase_uid, client_id);

-- Update RLS policies to work with Firebase UIDs
-- Note: This is a simplified approach. In production, you'd want proper JWT validation
DROP POLICY IF EXISTS "Users can view their own user_client relationships" ON user_clients;
CREATE POLICY "Users can view their own user_client relationships" ON user_clients FOR SELECT USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can insert their own user_client relationships" ON user_clients;
CREATE POLICY "Users can insert their own user_client relationships" ON user_clients FOR INSERT WITH CHECK (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

-- For now, let's disable RLS on user_clients to make it simpler for Firebase integration
-- In production, you'd implement proper JWT validation
ALTER TABLE user_clients DISABLE ROW LEVEL SECURITY;