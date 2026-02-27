-- ============ COMPREHENSIVE FIX FOR EVENTS, ANNOUNCEMENTS, JOBS TABLES ============
-- This script will:
-- 1. Drop tables completely
-- 2. Recreate them without foreign keys
-- 3. Disable RLS
-- 4. Grant all permissions
-- 5. Verify the fixes

-- Step 1: Drop all existing tables
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Step 2: Create Events table
CREATE TABLE events (
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

-- Step 3: Create Announcements table
CREATE TABLE announcements (
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

-- Step 4: Create Jobs table
CREATE TABLE jobs (
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

-- Step 5: Ensure RLS is disabled on all tables
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Step 6: Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON announcements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON jobs TO authenticated;

-- Step 7: Verify the fixes
SELECT 'Events Table' as table_name, 
  (SELECT count(*) FROM information_schema.table_constraints 
   WHERE table_name='events' AND constraint_type='FOREIGN KEY') as foreign_key_count,
  (SELECT row_security_enabled FROM information_schema.tables 
   WHERE table_name='events' AND table_schema='public') as rls_enabled;

SELECT 'Announcements Table' as table_name,
  (SELECT count(*) FROM information_schema.table_constraints 
   WHERE table_name='announcements' AND constraint_type='FOREIGN KEY') as foreign_key_count,
  (SELECT row_security_enabled FROM information_schema.tables 
   WHERE table_name='announcements' AND table_schema='public') as rls_enabled;

SELECT 'Jobs Table' as table_name,
  (SELECT count(*) FROM information_schema.table_constraints 
   WHERE table_name='jobs' AND constraint_type='FOREIGN KEY') as foreign_key_count,
  (SELECT row_security_enabled FROM information_schema.tables 
   WHERE table_name='jobs' AND table_schema='public') as rls_enabled;

-- Step 8: Verify RLS policies are empty
SELECT table_name, COUNT(*) as policy_count
FROM information_schema.role_routine_grants
WHERE table_name IN ('events', 'announcements', 'jobs')
GROUP BY table_name;
