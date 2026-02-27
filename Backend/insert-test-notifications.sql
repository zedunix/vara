-- INSERT TEST DATA FOR NOTIFICATIONS
-- Run this in Supabase SQL Editor to see events and jobs in notifications

-- Insert test EVENTS (must have future dates and status='published')
INSERT INTO events (title, description, event_date, time, location, status, max_participants, category) 
VALUES 
  ('Networking Breakfast', 'Join us for networking and breakfast', '2026-02-20', '08:00 AM', 'Dubai Marriott', 'published', 50, 'Networking'),
  ('Tech Workshop: React Hooks', 'Learn advanced React patterns', '2026-02-25', '06:00 PM', 'Tech Hub Dubai', 'published', 30, 'Workshop'),
  ('Annual Awards Ceremony', 'Celebrate member achievements', '2026-03-15', '07:00 PM', 'Atlantis The Palm', 'published', 200, 'Celebration'),
  ('Career Development Panel', 'Industry leaders discuss career growth', '2026-02-28', '05:30 PM', 'Emirates NBD Tower', 'published', 75, 'Professional'),
  ('Coffee & Connect Meetup', 'Casual networking over coffee', '2026-03-05', '04:00 PM', 'Starbucks JBR', 'published', 25, 'Social')
ON CONFLICT DO NOTHING;

-- Insert test JOBS (must have future deadline and status='published')
INSERT INTO jobs (job_title, company_name, description, location, employment_type, experience_level, apply_by_date, status)
VALUES
  ('Senior React Developer', 'Tech Startup Dubai', 'Build scalable web applications with React', 'Dubai, UAE', 'Full-time', '5+ years', '2026-03-15', 'published'),
  ('UX/UI Designer', 'Digital Agency', 'Design beautiful and user-friendly interfaces', 'Remote', 'Full-time', '3+ years', '2026-02-28', 'published'),
  ('Product Manager', 'SaaS Company', 'Lead product vision and roadmap', 'Dubai, UAE', 'Full-time', '5+ years', '2026-03-20', 'published'),
  ('Backend Engineer (Node.js)', 'E-commerce Platform', 'Build scalable backend services and APIs', 'Remote', 'Full-time', '3+ years', '2026-03-10', 'published'),
  ('Marketing Manager', 'Tech Consulting Firm', 'Lead marketing strategy and brand initiatives', 'Dubai, UAE', 'Full-time', '4+ years', '2026-03-01', 'published')
ON CONFLICT DO NOTHING;

-- Insert test ANNOUNCEMENTS (must have future expiry and status='published')
INSERT INTO announcements (title, message, expiry_date, priority, status)
VALUES
  ('System Maintenance Alert', 'Scheduled maintenance on Feb 22, 2026 from 2-4 AM', '2026-02-22', 'high', 'published'),
  ('New Members Welcome Event', 'Join us for orientation and networking', '2026-03-01', 'normal', 'published'),
  ('Membership Fee Reminder', 'Annual membership renewal is due', '2026-02-28', 'high', 'published')
ON CONFLICT DO NOTHING;

-- VERIFY: Run these SELECT statements to confirm data was inserted

-- Check Events
SELECT '=== EVENTS ===' as info;
SELECT id, title, event_date, status FROM events WHERE status = 'published' AND event_date >= CURRENT_DATE ORDER BY event_date;

-- Check Jobs
SELECT '=== JOBS ===' as info;
SELECT id, job_title, apply_by_date, status FROM jobs WHERE status = 'published' AND apply_by_date >= CURRENT_DATE ORDER BY apply_by_date;

-- Check Announcements
SELECT '=== ANNOUNCEMENTS ===' as info;
SELECT id, title, expiry_date, status FROM announcements WHERE status = 'published' AND expiry_date >= CURRENT_DATE ORDER BY expiry_date DESC;
