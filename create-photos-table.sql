-- Create photos table for additional project photos
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'additional', -- 'before', 'after', 'additional'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_photos_project_id ON photos(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies for photos (same client restriction)
CREATE POLICY "Users can view photos for their client's projects" ON photos FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id::text = auth.jwt() ->> 'client_id'
  )
);
CREATE POLICY "Users can insert photos for their client's projects" ON photos FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE client_id::text = auth.jwt() ->> 'client_id'
  )
);
CREATE POLICY "Users can update photos for their client's projects" ON photos FOR UPDATE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id::text = auth.jwt() ->> 'client_id'
  )
);
CREATE POLICY "Users can delete photos for their client's projects" ON photos FOR DELETE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id::text = auth.jwt() ->> 'client_id'
  )
);

-- Public read access for photos on published projects
CREATE POLICY "Allow public read access on photos for published projects" ON photos FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE is_published = true
  )
);