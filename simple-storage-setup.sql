-- Simple Storage Setup - Disable RLS for Photos
-- Run this in Supabase SQL Editor

-- Disable Row Level Security on storage objects to allow photo uploads
-- This is the simplest approach for photo storage
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Alternative: Create a simple policy that allows authenticated users to manage photos
-- Uncomment the lines below if you prefer more restrictive policies

-- CREATE POLICY "Allow authenticated users to manage photos" ON storage.objects
-- FOR ALL USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- CREATE POLICY "Allow public to view photos" ON storage.objects
-- FOR SELECT USING (bucket_id = 'photos');