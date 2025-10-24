-- Create waitlist table for storing signup emails
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    source TEXT DEFAULT 'marketing_page',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add source column if it doesn't exist (for existing tables)
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'marketing_page';

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON waitlist;
DROP POLICY IF EXISTS "Allow authenticated reads" ON waitlist;

-- Allow anonymous inserts (for signup form)
CREATE POLICY "Allow anonymous inserts" ON waitlist
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated users to read (for admin dashboard)
CREATE POLICY "Allow authenticated reads" ON waitlist
    FOR SELECT
    TO authenticated
    USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_waitlist_updated_at ON waitlist;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();