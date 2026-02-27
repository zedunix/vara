-- ============================================
-- VARA UAE - Row Level Security (RLS) Policies Fix
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- EVENTS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for published events" ON public.events;
DROP POLICY IF EXISTS "Enable authenticated read for published events" ON public.events;
DROP POLICY IF EXISTS "Enable admin full access" ON public.events;
DROP POLICY IF EXISTS "Service role full access" ON public.events;

-- Allow service role full access (for backend API)
CREATE POLICY "Service role full access on events"
  ON public.events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anonymous and authenticated users to read published events
CREATE POLICY "Public read published events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Allow authenticated users (admins) to manage all events
CREATE POLICY "Authenticated users manage events"
  ON public.events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- ANNOUNCEMENTS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for published announcements" ON public.announcements;
DROP POLICY IF EXISTS "Enable authenticated read for published announcements" ON public.announcements;
DROP POLICY IF EXISTS "Service role full access" ON public.announcements;

-- Allow service role full access (for backend API)
CREATE POLICY "Service role full access on announcements"
  ON public.announcements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anonymous and authenticated users to read published announcements
CREATE POLICY "Public read published announcements"
  ON public.announcements
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Allow authenticated users (admins) to manage all announcements
CREATE POLICY "Authenticated users manage announcements"
  ON public.announcements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations" ON public.notifications;

-- Allow service role full access (for backend API)
CREATE POLICY "Service role full access on notifications"
  ON public.notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to read their own notifications
CREATE POLICY "Users read own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- JOBS TABLE POLICIES
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for backend API)
CREATE POLICY "Service role full access on jobs"
  ON public.jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anonymous and authenticated users to read published jobs
CREATE POLICY "Public read published jobs"
  ON public.jobs
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- ============================================
-- ACTIVITY LOGS TABLE POLICIES
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on activity_logs"
  ON public.activity_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow admins to view logs
CREATE POLICY "Admins view activity logs"
  ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- GRANT PERMISSIONS TO ROLES
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Events
GRANT ALL ON public.events TO service_role;
GRANT SELECT ON public.events TO anon, authenticated;

-- Announcements
GRANT ALL ON public.announcements TO service_role;
GRANT SELECT ON public.announcements TO anon, authenticated;

-- Notifications
GRANT ALL ON public.notifications TO service_role;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;

-- Jobs
GRANT ALL ON public.jobs TO service_role;
GRANT SELECT ON public.jobs TO anon, authenticated;

-- Activity Logs
GRANT ALL ON public.activity_logs TO service_role;
GRANT SELECT ON public.activity_logs TO authenticated;

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check events policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename IN ('events', 'announcements', 'notifications', 'jobs')
ORDER BY tablename, policyname;

-- ============================================
-- TEST QUERIES (Run these to verify)
-- ============================================

-- These should work now:
-- SELECT * FROM events WHERE status = 'published';
-- SELECT * FROM announcements WHERE status = 'published';
-- SELECT * FROM notifications LIMIT 5;
