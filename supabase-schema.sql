-- Create clients table for multi-tenancy
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table with client relationship
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  customer TEXT NOT NULL,
  project_type TEXT,
  address TEXT,
  before_photo TEXT,
  after_photo TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table for additional project photos
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'additional', -- 'before', 'after', 'additional'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_location ON projects USING gist (point(lng, lat));
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_reviews_project_id ON reviews(project_id);
CREATE INDEX idx_photos_project_id ON photos(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies for clients (authenticated users can only see their own client)
CREATE POLICY "Users can view their own client" ON clients FOR SELECT USING (auth.jwt() ->> 'client_id' = id::text);
CREATE POLICY "Users can update their own client" ON clients FOR UPDATE USING (auth.jwt() ->> 'client_id' = id::text);

-- Create policies for projects (users can only see projects from their client)
CREATE POLICY "Users can view projects from their client" ON projects FOR SELECT USING (client_id::text = auth.jwt() ->> 'client_id');
CREATE POLICY "Users can insert projects for their client" ON projects FOR INSERT WITH CHECK (client_id::text = auth.jwt() ->> 'client_id');
CREATE POLICY "Users can update projects from their client" ON projects FOR UPDATE USING (client_id::text = auth.jwt() ->> 'client_id');
CREATE POLICY "Users can delete projects from their client" ON projects FOR DELETE USING (client_id::text = auth.jwt() ->> 'client_id');

-- Public read access for published projects (for embeddable maps)
CREATE POLICY "Allow public read access on published projects" ON projects FOR SELECT USING (is_published = true);

-- Create policies for reviews (same client restriction)
CREATE POLICY "Users can view reviews for their client's projects" ON reviews FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id::text = auth.jwt() ->> 'client_id'
  )
);
CREATE POLICY "Users can insert reviews for their client's projects" ON reviews FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE client_id::text = auth.jwt() ->> 'client_id'
  )
);
CREATE POLICY "Users can update reviews for their client's projects" ON reviews FOR UPDATE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id::text = auth.jwt() ->> 'client_id'
  )
);
CREATE POLICY "Users can delete reviews for their client's projects" ON reviews FOR DELETE USING (
  project_id IN (
    SELECT id FROM projects WHERE client_id::text = auth.jwt() ->> 'client_id'
  )
);

-- Public read access for reviews on published projects
CREATE POLICY "Allow public read access on reviews for published projects" ON reviews FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE is_published = true
  )
);

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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();