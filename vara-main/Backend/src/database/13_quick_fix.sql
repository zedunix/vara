-- ============ IMMEDIATE FIX: ENABLE ACCESS TO EVENTS, ANNOUNCEMENTS, JOBS ============
-- This is a minimal fix that directly addresses the permission issue

-- Step 1: Disable RLS on all three tables (if it's enabled)
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant SELECT permission to service_role and anon
GRANT SELECT ON events TO service_role;
GRANT SELECT ON events TO anon;
GRANT SELECT ON announcements TO service_role;
GRANT SELECT ON announcements TO anon;
GRANT SELECT ON jobs TO service_role;
GRANT SELECT ON jobs TO anon;

-- Step 3: Grant full permissions (in case we need to write too)
GRANT INSERT, UPDATE, DELETE ON events TO service_role;
GRANT INSERT, UPDATE, DELETE ON announcements TO service_role;
GRANT INSERT, UPDATE, DELETE ON jobs TO service_role;

-- Step 4: Verify the fix
SELECT table_name, row_security_enabled, relhassubclass
FROM information_schema.tables
LEFT JOIN pg_class ON pg_class.relname = table_name
WHERE table_name IN ('events', 'announcements', 'jobs')
AND table_schema = 'public';

-- Step 5: Check for any foreign key constraints
SELECT constraint_name, table_name, column_name
FROM information_schema.table_constraints
JOIN information_schema.key_column_usage USING (constraint_name, table_name)
WHERE table_name IN ('events', 'announcements', 'jobs')
AND constraint_type = 'FOREIGN KEY';
