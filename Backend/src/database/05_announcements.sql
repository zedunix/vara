-- Create Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  message TEXT,
  type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('news', 'alert', 'update', 'general')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date DATE,
  created_by UUID
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to manage all announcements" ON announcements;
DROP POLICY IF EXISTS "Allow public read access to published announcements" ON announcements;
DROP POLICY IF EXISTS "Allow authenticated users to view published announcements" ON announcements;

-- Allow anyone (including service role) to read published announcements
CREATE POLICY "Enable read access for published announcements" ON announcements
  FOR SELECT USING (status = 'published');

-- Allow authenticated users to read published announcements
CREATE POLICY "Enable authenticated read for published announcements" ON announcements
  FOR SELECT TO authenticated USING (status = 'published');
