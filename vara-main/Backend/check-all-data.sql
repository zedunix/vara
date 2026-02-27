otal events in DB: 5
✅ Published upcoming events retrieved: 3
📋 Events: [...]-- DIAGNOSTIC QUERY - CHECK ALL EXISTING DATA
-- Run this in Supabase SQL Editor to see what data already exists

-- Check ALL Events (no filters)
SELECT 
  '📅 ALL EVENTS' as section,
  COUNT(*) as total_count
FROM events;

SELECT 
  id, 
  title, 
  event_date, 
  status,
  CASE 
    WHEN status = 'published' AND event_date >= CURRENT_DATE THEN '✅ WILL SHOW'
    WHEN status != 'published' THEN '❌ Not published'
    WHEN event_date < CURRENT_DATE THEN '❌ Date in past'
    ELSE '⏳ Unknown'
  END as notification_status
FROM events
ORDER BY event_date DESC
LIMIT 20;

-- Check ALL Jobs (no filters)
SELECT 
  '💼 ALL JOBS' as section,
  COUNT(*) as total_count
FROM jobs;
SELECT 
  id, 
  job_title, 
  apply_by_date, 
  status,
  CASE 
    WHEN status = 'published' AND apply_by_date >= CURRENT_DATE THEN '✅ WILL SHOW'
    WHEN status != 'published' THEN '❌ Not published'
    WHEN apply_by_date < CURRENT_DATE THEN '❌ Deadline passed'
    ELSE '⏳ Unknown'
  END as notification_status
FROM jobs
ORDER BY apply_by_date DESC
LIMIT 20;

-- Check ALL Announcements (no filters)
SELECT 
  '📢 ALL ANNOUNCEMENTS' as section,
  COUNT(*) as total_count
FROM announcements;

SELECT 
  id, 
  title, 
  expiry_date, 
  status,
  CASE 
    WHEN status = 'published' AND expiry_date >= CURRENT_DATE THEN '✅ WILL SHOW'
    WHEN status != 'published' THEN '❌ Not published'
    WHEN expiry_date < CURRENT_DATE THEN '❌ Expired'
    ELSE '⏳ Unknown'
  END as notification_status
FROM announcements
ORDER BY expiry_date DESC
LIMIT 20;
