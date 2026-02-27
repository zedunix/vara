-- DIAGNOSTIC QUERY - Run this in Supabase SQL Editor to check data

-- Check Events table
SELECT 
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE status = 'published') as published_events,
  COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE) as upcoming_events,
  MIN(event_date) as earliest_date,
  MAX(event_date) as latest_date
FROM events;

-- Check Jobs table  
SELECT 
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE status = 'published') as published_jobs,
  COUNT(*) FILTER (WHERE apply_by_date >= CURRENT_DATE) as active_jobs,
  MIN(apply_by_date) as earliest_deadline,
  MAX(apply_by_date) as latest_deadline
FROM jobs;

-- Check Announcements table
SELECT 
  COUNT(*) as total_announcements,
  COUNT(*) FILTER (WHERE status = 'published') as published_announcements,
  COUNT(*) FILTER (WHERE expiry_date >= CURRENT_DATE) as active_announcements,
  MIN(expiry_date) as earliest_expiry,
  MAX(expiry_date) as latest_expiry
FROM announcements;

-- Show actual events (debugging)
SELECT id, title, event_date, status FROM events WHERE status = 'published' AND event_date >= CURRENT_DATE ORDER BY event_date LIMIT 10;

-- Show actual jobs (debugging)
SELECT id, job_title, apply_by_date, status FROM jobs WHERE status = 'published' AND apply_by_date >= CURRENT_DATE ORDER BY apply_by_date LIMIT 10;

-- Show actual announcements (debugging)
SELECT id, title, expiry_date, status FROM announcements WHERE status = 'published' AND expiry_date >= CURRENT_DATE ORDER BY expiry_date DESC LIMIT 10;
