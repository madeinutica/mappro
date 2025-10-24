-- Supabase Storage Setup for Photos
-- Run this in your Supabase SQL Editor

-- Create the photos bucket (if it doesn't exist)
-- Note: This needs to be done through the Supabase dashboard Storage section
-- Go to: https://supabase.com/dashboard/project/fvrueabzpinhlzyrnhne/storage
-- Create a new bucket called "photos" with public access

-- SIMPLIFIED APPROACH: Disable RLS since you have application-level authentication
-- This is safer and easier than trying to manage complex RLS policies
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;