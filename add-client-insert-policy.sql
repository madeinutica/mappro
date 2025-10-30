-- Add INSERT policy for clients to allow new user registration
-- Run this in Supabase SQL Editor

-- Add INSERT policy for clients
CREATE POLICY "Firebase users can insert their client" ON clients FOR INSERT
WITH CHECK (firebase_uid = auth.jwt() ->> 'sub');