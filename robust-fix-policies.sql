-- Robust fix for RLS policies - handle existing policies properly
-- Run this in Supabase SQL Editor

-- First, let's see what policies exist and drop them all
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on clients table
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename = 'clients'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on %.%', policy_record.policyname, policy_record.schemaname, policy_record.tablename;
    END LOOP;

    -- Drop all policies on projects table
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename = 'projects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on %.%', policy_record.policyname, policy_record.schemaname, policy_record.tablename;
    END LOOP;

    -- Drop all policies on reviews table
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename = 'reviews'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on %.%', policy_record.policyname, policy_record.schemaname, policy_record.tablename;
    END LOOP;

    -- Drop all policies on photos table
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename = 'photos'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on %.%', policy_record.policyname, policy_record.schemaname, policy_record.tablename;
    END LOOP;

    RAISE NOTICE 'All existing policies have been dropped';
END $$;

-- Now create new policies for Supabase auth

-- Clients policies
CREATE POLICY "Users can view clients they belong to" ON clients FOR SELECT USING (
  id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update clients they belong to" ON clients FOR UPDATE USING (
  id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
);

-- Projects policies
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

-- Reviews policies
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

-- Photos policies
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