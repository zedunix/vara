-- Create Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  registration_link TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  max_participants INTEGER,
  category TEXT,
  banner_image TEXT,
  type VARCHAR(20) DEFAULT 'upcoming' CHECK (type IN ('upcoming', 'past')),
  created_by UUID
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to manage all events" ON events;
DROP POLICY IF EXISTS "Allow public read access to published events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to view published events" ON events;

-- Allow anyone (including service role) to read published events
CREATE POLICY "Enable read access for published events" ON events
  FOR SELECT USING (status = 'published');

-- Allow authenticated users to read published events
CREATE POLICY "Enable authenticated read for published events" ON events
  FOR SELECT TO authenticated USING (status = 'published');
