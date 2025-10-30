-- Development policy updates to allow access to demo client projects
-- Run this in Supabase SQL Editor for development purposes

-- Temporarily allow access to demo client projects without authentication
-- This is for development only - remove in production

-- New York Sash
DROP POLICY IF EXISTS "Allow New York Sash access in development" ON projects;
CREATE POLICY "Allow New York Sash access in development" ON projects FOR ALL USING (
  client_id = '550e8400-e29b-41d4-a716-446655440000'
);

DROP POLICY IF EXISTS "Allow New York Sash reviews access in development" ON reviews;
CREATE POLICY "Allow New York Sash reviews access in development" ON reviews FOR ALL USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id = '550e8400-e29b-41d4-a716-446655440000'
  )
);

DROP POLICY IF EXISTS "Allow New York Sash photos access in development" ON photos;
CREATE POLICY "Allow New York Sash photos access in development" ON photos FOR ALL USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id = '550e8400-e29b-41d4-a716-446655440000'
  )
);

-- Erick's Lawn Care
DROP POLICY IF EXISTS "Allow Erick's Lawn Care access in development" ON projects;
CREATE POLICY "Allow Erick's Lawn Care access in development" ON projects FOR ALL USING (
  client_id = 'f2bbc15b-3ded-41bd-b636-84f3ac688a93'
);

DROP POLICY IF EXISTS "Allow Erick's Lawn Care reviews access in development" ON reviews;
CREATE POLICY "Allow Erick's Lawn Care reviews access in development" ON reviews FOR ALL USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id = 'f2bbc15b-3ded-41bd-b636-84f3ac688a93'
  )
);

DROP POLICY IF EXISTS "Allow Erick's Lawn Care photos access in development" ON photos;
CREATE POLICY "Allow Erick's Lawn Care photos access in development" ON photos FOR ALL USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id = 'f2bbc15b-3ded-41bd-b636-84f3ac688a93'
  )
);