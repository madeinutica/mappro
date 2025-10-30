-- Simple fix for RLS policies - drop and recreate
-- Run this in Supabase SQL Editor

-- Drop all existing policies that might conflict
DROP POLICY IF EXISTS "Users can view clients they belong to" ON clients;
DROP POLICY IF EXISTS "Users can update clients they belong to" ON clients;

DROP POLICY IF EXISTS "Users can view projects from their clients" ON projects;
DROP POLICY IF EXISTS "Users can insert projects for their clients" ON projects;
DROP POLICY IF EXISTS "Users can update projects from their clients" ON projects;
DROP POLICY IF EXISTS "Users can delete projects from their clients" ON projects;

DROP POLICY IF EXISTS "Users can view reviews for their client's projects" ON reviews;
DROP POLICY IF EXISTS "Users can insert reviews for their client's projects" ON reviews;
DROP POLICY IF EXISTS "Users can update reviews for their client's projects" ON reviews;
DROP POLICY IF EXISTS "Users can delete reviews for their client's projects" ON reviews;

-- Drop photos policies if they exist
DROP POLICY IF EXISTS "Users can view photos for their client's projects" ON photos;
DROP POLICY IF EXISTS "Users can insert photos for their client's projects" ON photos;
DROP POLICY IF EXISTS "Users can update photos for their client's projects" ON photos;
DROP POLICY IF EXISTS "Users can delete photos for their client's projects" ON photos;

-- Create new policies for Supabase auth
CREATE POLICY "Users can view clients they belong to" ON clients FOR SELECT USING (
  id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update clients they belong to" ON clients FOR UPDATE USING (
  id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view projects from their clients" ON projects FOR SELECT USING (
  client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert projects for their clients" ON projects FOR INSERT WITH CHECK (
  client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update projects from their clients" ON projects FOR UPDATE USING (
  client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete projects from their clients" ON projects FOR DELETE USING (
  client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

CREATE POLICY "Allow public read access on published projects" ON projects FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view reviews for their client's projects" ON reviews FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can insert reviews for their client's projects" ON reviews FOR INSERT WITH CHECK (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can update reviews for their client's projects" ON reviews FOR UPDATE USING (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can delete reviews for their client's projects" ON reviews FOR DELETE USING (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid()))
);

CREATE POLICY "Allow public read access on reviews for published projects" ON reviews FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE is_published = true)
);

-- Create photos policies for Supabase auth
CREATE POLICY "Users can view photos for their client's projects" ON photos FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can insert photos for their client's projects" ON photos FOR INSERT WITH CHECK (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can update photos for their client's projects" ON photos FOR UPDATE USING (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can delete photos for their client's projects" ON photos FOR DELETE USING (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid()))
);

CREATE POLICY "Allow public read access on photos for published projects" ON photos FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE is_published = true)
);