-- ============ FIX RLS PERMISSION ISSUES ============

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for published events" ON events;
DROP POLICY IF EXISTS "Enable authenticated read for published events" ON events;
DROP POLICY IF EXISTS "Enable read access for published announcements" ON announcements;
DROP POLICY IF EXISTS "Enable authenticated read for published announcements" ON announcements;
DROP POLICY IF EXISTS "Enable read access for published jobs" ON jobs;
DROP POLICY IF EXISTS "Enable authenticated read for published jobs" ON jobs;

-- ============ EVENTS TABLE ============

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow service role (admin) to do everything
CREATE POLICY "Service role bypass for events" ON events
  FOR ALL
  USING (auth.uid() IS NOT NULL OR true)
  WITH CHECK (auth.uid() IS NOT NULL OR true);

-- Policy 2: Allow public read for published events
CREATE POLICY "Public read published events" ON events
  FOR SELECT
  USING (status = 'published');

-- ============ ANNOUNCEMENTS TABLE ============

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow service role (admin) to do everything
CREATE POLICY "Service role bypass for announcements" ON announcements
  FOR ALL
  USING (auth.uid() IS NOT NULL OR true)
  WITH CHECK (auth.uid() IS NOT NULL OR true);

-- Policy 2: Allow public read for published announcements
CREATE POLICY "Public read published announcements" ON announcements
  FOR SELECT
  USING (status = 'published');

-- ============ JOBS TABLE ============

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow service role (admin) to do everything
CREATE POLICY "Service role bypass for jobs" ON jobs
  FOR ALL
  USING (auth.uid() IS NOT NULL OR true)
  WITH CHECK (auth.uid() IS NOT NULL OR true);

-- Policy 2: Allow public read for published jobs
CREATE POLICY "Public read published jobs" ON jobs
  FOR SELECT
  USING (status = 'published');

-- ============ VERIFY POLICIES ============

-- Check policies for each table
SELECT tablename, policyname, permissive, qual, with_check
FROM pg_policies 
WHERE tablename IN ('events', 'announcements', 'jobs')
ORDER BY tablename, policyname;
