-- ============ DIAGNOSTIC: CHECK DATABASE PERMISSIONS ============

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'announcements', 'jobs');

-- 2. Check table owner and permissions
SELECT tablename, tableowner 
FROM pg_tables 
WHERE tablename IN ('events', 'announcements', 'jobs');

-- 3. Check if RLS is enabled/disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('events', 'announcements', 'jobs');

-- 4. Check active role permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name IN ('events', 'announcements', 'jobs');

-- 5. Get current user/role
SELECT current_user, session_user;

-- 6. Check if tables have any data
SELECT 'events' as table_name, COUNT(*) as row_count FROM events
UNION ALL
SELECT 'announcements' as table_name, COUNT(*) as row_count FROM announcements
UNION ALL
SELECT 'jobs' as table_name, COUNT(*) as row_count FROM jobs;

-- 7. Check table structure for events
\d events;

-- 8. Check table structure for announcements
\d announcements;

-- 9. Check table structure for jobs
\d jobs;
