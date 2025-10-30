-- Migration to add Firebase UID support to clients table
-- Run this in Supabase SQL Editor

-- Add firebase_uid column to clients table (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'firebase_uid'
    ) THEN
        ALTER TABLE clients ADD COLUMN firebase_uid TEXT UNIQUE;
        RAISE NOTICE 'Added firebase_uid column to clients table';
    ELSE
        RAISE NOTICE 'firebase_uid column already exists in clients table';
    END IF;
END $$;

-- Ensure name column has unique constraint for ON CONFLICT to work
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'clients' AND constraint_name = 'clients_name_key'
    ) THEN
        ALTER TABLE clients ADD CONSTRAINT clients_name_key UNIQUE (name);
        RAISE NOTICE 'Added unique constraint on clients.name';
    ELSE
        RAISE NOTICE 'Unique constraint on clients.name already exists';
    END IF;
END $$;

-- Create or update the New York Sash client with Firebase UID
INSERT INTO clients (name, domain, firebase_uid)
VALUES ('New York Sash', 'newyorksash.com', 'ibEEqGoyOOXeAbBg7QIREWmWa523')
ON CONFLICT (name) DO UPDATE SET
  firebase_uid = EXCLUDED.firebase_uid;

-- Update RLS policies to work with Firebase UIDs
DROP POLICY IF EXISTS "Users can view their own client" ON clients;
DROP POLICY IF EXISTS "Users can update their own client" ON clients;

-- Create new policies that work with Firebase UID
CREATE POLICY "Firebase users can view their client" ON clients FOR SELECT
USING (firebase_uid = auth.jwt() ->> 'sub');

CREATE POLICY "Firebase users can insert their client" ON clients FOR INSERT
WITH CHECK (firebase_uid = auth.jwt() ->> 'sub');

CREATE POLICY "Firebase users can update their client" ON clients FOR UPDATE
USING (firebase_uid = auth.jwt() ->> 'sub');

-- Create a function to get client_id from firebase_uid for use in other policies
CREATE OR REPLACE FUNCTION get_client_id_from_firebase_uid(firebase_uid_param TEXT)
RETURNS UUID AS $$
DECLARE
    client_id UUID;
BEGIN
    SELECT id INTO client_id FROM clients WHERE firebase_uid = firebase_uid_param;
    RETURN client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update project policies to work with Firebase
DROP POLICY IF EXISTS "Users can view projects from their client" ON projects;
DROP POLICY IF EXISTS "Users can insert projects for their client" ON projects;
DROP POLICY IF EXISTS "Users can update projects from their client" ON projects;
DROP POLICY IF EXISTS "Users can delete projects from their client" ON projects;

CREATE POLICY "Firebase users can view projects from their client" ON projects FOR SELECT
USING (client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub'));

CREATE POLICY "Anonymous users can view published projects" ON projects FOR SELECT
USING (is_published = true);

CREATE POLICY "Firebase users can insert projects for their client" ON projects FOR INSERT
WITH CHECK (client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub'));

CREATE POLICY "Firebase users can update projects from their client" ON projects FOR UPDATE
USING (client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub'));

CREATE POLICY "Firebase users can delete projects from their client" ON projects FOR DELETE
USING (client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub'));

-- Update review policies
DROP POLICY IF EXISTS "Users can view reviews for their client's projects" ON reviews;
DROP POLICY IF EXISTS "Users can insert reviews for their client's projects" ON reviews;
DROP POLICY IF EXISTS "Users can update reviews for their client's projects" ON reviews;
DROP POLICY IF EXISTS "Users can delete reviews for their client's projects" ON reviews;

CREATE POLICY "Firebase users can view reviews for their client's projects" ON reviews FOR SELECT
USING (project_id IN (
  SELECT id FROM projects WHERE client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub')
));

CREATE POLICY "Firebase users can insert reviews for their client's projects" ON reviews FOR INSERT
WITH CHECK (project_id IN (
  SELECT id FROM projects WHERE client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub')
));

CREATE POLICY "Firebase users can update reviews for their client's projects" ON reviews FOR UPDATE
USING (project_id IN (
  SELECT id FROM projects WHERE client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub')
));

CREATE POLICY "Firebase users can delete reviews for their client's projects" ON reviews FOR DELETE
USING (project_id IN (
  SELECT id FROM projects WHERE client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub')
));

-- Update photo policies (only if photos table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'photos'
    ) THEN
        -- Drop existing photo policies
        DROP POLICY IF EXISTS "Users can view photos for their client's projects" ON photos;
        DROP POLICY IF EXISTS "Users can insert photos for their client's projects" ON photos;
        DROP POLICY IF EXISTS "Users can update photos for their client's projects" ON photos;
        DROP POLICY IF EXISTS "Users can delete photos for their client's projects" ON photos;

        -- Create new photo policies
        CREATE POLICY "Firebase users can view photos for their client's projects" ON photos FOR SELECT
        USING (project_id IN (
          SELECT id FROM projects WHERE client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub')
        ));

        CREATE POLICY "Firebase users can insert photos for their client's projects" ON photos FOR INSERT
        WITH CHECK (project_id IN (
          SELECT id FROM projects WHERE client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub')
        ));

        CREATE POLICY "Firebase users can update photos for their client's projects" ON photos FOR UPDATE
        USING (project_id IN (
          SELECT id FROM projects WHERE client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub')
        ));

        CREATE POLICY "Firebase users can delete photos for their client's projects" ON photos FOR DELETE
        USING (project_id IN (
          SELECT id FROM projects WHERE client_id = get_client_id_from_firebase_uid(auth.jwt() ->> 'sub')
        ));

        RAISE NOTICE 'Updated photos table policies for Firebase authentication';
    ELSE
        RAISE NOTICE 'Photos table does not exist, skipping photo policy updates';
    END IF;
END $$;