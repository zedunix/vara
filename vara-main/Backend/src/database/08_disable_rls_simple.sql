-- ============ ALTERNATIVE: DISABLE RLS (SIMPLER) ============
-- Use this if the policies approach doesn't work

-- Disable RLS on all three tables
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('events', 'announcements', 'jobs');
