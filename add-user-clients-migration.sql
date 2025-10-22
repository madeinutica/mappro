-- Migration: Add user_clients table for admin-client relationships
-- Run this in Supabase SQL Editor after the initial schema setup

-- Create user_clients table to link authenticated users to clients
CREATE TABLE IF NOT EXISTS user_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, client_id)
);

-- Enable RLS on user_clients
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;

-- Create policies for user_clients
DROP POLICY IF EXISTS "Users can view their own user_client relationships" ON user_clients;
CREATE POLICY "Users can view their own user_client relationships" ON user_clients FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own user_client relationships" ON user_clients;
CREATE POLICY "Users can insert their own user_client relationships" ON user_clients FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update client policies to use user_clients relationship
DROP POLICY IF EXISTS "Users can view clients they belong to" ON clients;
CREATE POLICY "Users can view clients they belong to" ON clients FOR SELECT USING (
  id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update clients they belong to" ON clients;
CREATE POLICY "Users can update clients they belong to" ON clients FOR UPDATE USING (
  id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

-- Update project policies
DROP POLICY IF EXISTS "Users can view projects from their clients" ON projects;
CREATE POLICY "Users can view projects from their clients" ON projects FOR SELECT USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert projects for their clients" ON projects;
CREATE POLICY "Users can insert projects for their clients" ON projects FOR INSERT WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update projects from their clients" ON projects;
CREATE POLICY "Users can update projects from their clients" ON projects FOR UPDATE USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete projects from their clients" ON projects;
CREATE POLICY "Users can delete projects from their clients" ON projects FOR DELETE USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

-- Update review policies
DROP POLICY IF EXISTS "Users can view reviews for their client's projects" ON reviews;
CREATE POLICY "Users can view reviews for their client's projects" ON reviews FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can insert reviews for their client's projects" ON reviews;
CREATE POLICY "Users can insert reviews for their client's projects" ON reviews FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can update reviews for their client's projects" ON reviews;
CREATE POLICY "Users can update reviews for their client's projects" ON reviews FOR UPDATE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can delete reviews for their client's projects" ON reviews;
CREATE POLICY "Users can delete reviews for their client's projects" ON reviews FOR DELETE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  )
);

-- Update photo policies
DROP POLICY IF EXISTS "Users can view photos for their client's projects" ON photos;
CREATE POLICY "Users can view photos for their client's projects" ON photos FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can insert photos for their client's projects" ON photos;
CREATE POLICY "Users can insert photos for their client's projects" ON photos FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can update photos for their client's projects" ON photos;
CREATE POLICY "Users can update photos for their client's projects" ON photos FOR UPDATE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can delete photos for their client's projects" ON photos;
CREATE POLICY "Users can delete photos for their client's projects" ON photos FOR DELETE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  )
);