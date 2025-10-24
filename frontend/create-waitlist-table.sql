-- Create waitlist table for storing email signups
CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) DEFAULT 'website',
    notified BOOLEAN DEFAULT FALSE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index on created_at for analytics
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for signup forms)
CREATE POLICY "Allow anonymous inserts to waitlist" ON waitlist
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policy to allow authenticated users to view waitlist (for admin)
CREATE POLICY "Allow authenticated users to view waitlist" ON waitlist
    FOR SELECT
    TO authenticated
    USING (true);