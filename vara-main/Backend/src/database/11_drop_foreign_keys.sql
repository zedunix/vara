-- ============ FIX: RECREATE TABLES WITHOUT FOREIGN KEY CONSTRAINTS ============
-- This fixes Supabase RLS permission issues by removing foreign keys that block service_role access

-- Drop existing tables
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Recreate Events table WITHOUT foreign key constraint
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

-- Recreate Announcements table WITHOUT foreign key constraint
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  message TEXT,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date DATE,
  created_by UUID
);

-- Recreate Jobs table WITHOUT foreign key constraint
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title TEXT NOT NULL,
  description TEXT NOT NULL,
  role TEXT NOT NULL,
  application_link TEXT NOT NULL,
  apply_by_date DATE NOT NULL,
  location TEXT NOT NULL,
  employment_type VARCHAR(50) NOT NULL,
  experience_level VARCHAR(50) NOT NULL,
  salary TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'announcements', 'jobs');
