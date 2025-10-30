-- Quick migration to associate Firebase UID with New York Sash client
-- Run this in Supabase SQL Editor

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

-- Verify the association
SELECT id, name, firebase_uid FROM clients WHERE name = 'New York Sash';