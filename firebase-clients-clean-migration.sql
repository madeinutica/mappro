-- Clean Migration: Add firebase_uid to clients table
-- Run this in Supabase SQL Editor

-- Add firebase_uid column to clients table
ALTER TABLE clients ADD COLUMN firebase_uid TEXT UNIQUE;

-- Update RLS policies to work with Firebase UIDs in clients table
DROP POLICY IF EXISTS "Users can view their own client" ON clients;
CREATE POLICY "Users can view their own client" ON clients FOR SELECT USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can update their own client" ON clients;
CREATE POLICY "Users can update their own client" ON clients FOR UPDATE USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

-- Note: This assumes a 1:1 relationship between Firebase users and clients