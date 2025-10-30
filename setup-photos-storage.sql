-- Complete Storage Setup for Photos Bucket
-- Run this in Supabase SQL Editor

-- First, create the photos bucket if it doesn't exist
-- Note: Bucket creation is typically done via dashboard, but we can set policies

-- Insert bucket record (this might not work, but let's try)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the photos bucket
-- Allow authenticated users to upload to their client's folder
CREATE POLICY "Users can upload photos to their client's folder" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT 'projects/' || client_id::text || '/'
    FROM user_clients
    WHERE user_id = auth.uid()
  )
);

-- Allow users to view photos from their client's projects
CREATE POLICY "Users can view photos from their client's projects" ON storage.objects FOR SELECT USING (
  bucket_id = 'photos'
  AND (
    auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT 'projects/' || client_id::text || '/'
      FROM user_clients
      WHERE user_id = auth.uid()
    )
  ) OR bucket_id = 'photos' -- Allow public access for now
);

-- Allow users to update/delete their own uploaded photos
CREATE POLICY "Users can update their client's photos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT 'projects/' || client_id::text || '/'
    FROM user_clients
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their client's photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT 'projects/' || client_id::text || '/'
    FROM user_clients
    WHERE user_id = auth.uid()
  )
);

-- Alternative simpler approach: Allow all authenticated users to manage photos
-- Uncomment these if the above policies are too complex

-- CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id = 'photos' AND auth.role() = 'authenticated'
-- );

-- CREATE POLICY "Authenticated users can view photos" ON storage.objects FOR SELECT USING (
--   bucket_id = 'photos' AND auth.role() = 'authenticated'
-- );

-- CREATE POLICY "Authenticated users can update photos" ON storage.objects FOR UPDATE USING (
--   bucket_id = 'photos' AND auth.role() = 'authenticated'
-- );

-- CREATE POLICY "Authenticated users can delete photos" ON storage.objects FOR DELETE USING (
--   bucket_id = 'photos' AND auth.role() = 'authenticated'
-- );

-- Public read access for photos (for published projects)
CREATE POLICY "Public can view photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'photos'
);