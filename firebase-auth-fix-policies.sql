-- Fix RLS policies for Firebase + Supabase hybrid auth
-- Run this in Supabase SQL Editor

-- Drop all existing policies first
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

-- Create new policies for Firebase authentication (using JWT token)
-- Clients policies
CREATE POLICY "Firebase users can view their client" ON clients FOR SELECT USING (
  firebase_uid = auth.jwt() ->> 'sub'
);

CREATE POLICY "Firebase users can update their client" ON clients FOR UPDATE USING (
  firebase_uid = auth.jwt() ->> 'sub'
);

-- Projects policies
CREATE POLICY "Firebase users can view projects from their client" ON projects FOR SELECT USING (
  client_id IN (
    SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Firebase users can insert projects for their client" ON projects FOR INSERT WITH CHECK (
  client_id IN (
    SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Firebase users can update projects from their client" ON projects FOR UPDATE USING (
  client_id IN (
    SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Firebase users can delete projects from their client" ON projects FOR DELETE USING (
  client_id IN (
    SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Allow public read access on published projects" ON projects FOR SELECT USING (is_published = true);

-- Reviews policies
CREATE POLICY "Firebase users can view reviews for their client's projects" ON reviews FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  )
);

CREATE POLICY "Firebase users can insert reviews for their client's projects" ON reviews FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  )
);

CREATE POLICY "Firebase users can update reviews for their client's projects" ON reviews FOR UPDATE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  )
);

CREATE POLICY "Firebase users can delete reviews for their client's projects" ON reviews FOR DELETE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  )
);

CREATE POLICY "Allow public read access on reviews for published projects" ON reviews FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE is_published = true)
);

-- Photos policies (this was missing!)
CREATE POLICY "Firebase users can view photos for their client's projects" ON photos FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  )
);

CREATE POLICY "Firebase users can insert photos for their client's projects" ON photos FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  )
);

CREATE POLICY "Firebase users can update photos for their client's projects" ON photos FOR UPDATE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  )
);

CREATE POLICY "Firebase users can delete photos for their client's projects" ON photos FOR DELETE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id IN (
      SELECT id FROM clients WHERE firebase_uid = auth.jwt() ->> 'sub'
    )
  )
);

CREATE POLICY "Allow public read access on photos for published projects" ON photos FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE is_published = true)
);