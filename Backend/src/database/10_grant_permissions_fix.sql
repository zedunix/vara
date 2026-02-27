-- ============ COMPREHENSIVE FIX FOR PERMISSION DENIED ERROR ============

-- Step 1: Grant all permissions to the public schema and tables
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Step 2: Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Step 3: If tables exist, explicitly grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON announcements TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON jobs TO anon, authenticated, service_role;

-- Step 4: Grant sequence permissions (for auto-increment IDs if using INT)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Step 5: Verify permissions were granted
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('events', 'announcements', 'jobs')
ORDER BY table_name, grantee;

-- Step 6: Check if tables exist in public schema
SELECT table_schema, table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('events', 'announcements', 'jobs')
ORDER BY table_name;

-- Step 7: Verify RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('events', 'announcements', 'jobs');
