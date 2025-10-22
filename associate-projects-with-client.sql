-- Associate existing projects with New York Sash client
-- Run this in Supabase SQL Editor

-- Insert New York Sash client
INSERT INTO clients (id, name, domain, primary_color) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'New York Sash', 'nysash.com', '#3B82F6')
ON CONFLICT (id) DO NOTHING;

-- Update existing projects to belong to New York Sash client
UPDATE projects SET client_id = '550e8400-e29b-41d4-a716-446655440000' WHERE client_id IS NULL;

-- Mark some projects as published for public viewing
UPDATE projects SET is_published = true WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440005'
);