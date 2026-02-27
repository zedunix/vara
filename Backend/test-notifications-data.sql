-- Test data for notifications - Insert sample events, jobs, and announcements
-- These will be used to test the notification system

-- Insert test events (with today's date and future dates)
INSERT INTO events (title, description, event_date, time, location, status, max_participants, category)
VALUES 
  ('Networking Breakfast - February 2026', 'Join us for our monthly networking breakfast with VARA members', '2026-02-20', '08:00 AM', 'Golf Hotel Dubai', 'published', 50, 'Networking'),
  ('Tech Workshop - React Best Practices', 'Learn advanced React patterns and best practices from industry experts', '2026-03-05', '06:00 PM', 'Dubai Tech Hub', 'published', 30, 'Workshop'),
  ('Annual Awards Ceremony', 'Celebrate the achievements of our community members', '2026-03-15', '07:00 PM', 'Atlantis The Palm', 'published', 200, 'Awards'),
  ('Career Development Panel Discussion', 'Industry leaders discuss career growth opportunities in tech', '2026-02-28', '05:30 PM', 'Emirates NBD Tower', 'published', 75, 'Professional Development'),
  ('Coffee & Connect - Casual Meetup', 'An informal gathering for members to network and connect', '2026-03-01', '04:00 PM', 'Starbucks JBR', 'published', 25, 'Casual')
ON CONFLICT DO NOTHING;

-- Insert test announcements (with future expiry dates)
INSERT INTO announcements (title, message, priority, status, expiry_date, type, created_by)
VALUES 
  ('New Member Benefits', 'We are excited to announce enhanced benefits for all members including exclusive access to member-only events and resources.', 'high', 'published', '2026-03-31', 'update', NULL),
  ('Membership Renewal Reminder', 'Your membership expires soon! Visit our website to renew your membership and enjoy continuous benefits.', 'medium', 'published', '2026-02-28', 'alert', NULL),
  ('Community Partnership Announcement', 'VARA has partnered with leading tech companies to bring exclusive opportunities to our members.', 'high', 'published', '2026-04-15', 'news', NULL),
  ('Volunteer Opportunities Available', 'Help us grow the community! We are looking for volunteers for various roles and responsibilities.', 'medium', 'published', '2026-03-20', 'update', NULL),
  ('Monthly Newsletter Released', 'Our February 2026 newsletter is now available with latest updates, member stories, and upcoming events.', 'low', 'published', '2026-02-25', 'news', NULL)
ON CONFLICT DO NOTHING;

-- Insert test jobs (with future apply_by_date)
INSERT INTO jobs (job_title, company_name, description, location, employment_type, experience_level, apply_by_date, status, created_by)
VALUES 
  ('Senior React Developer', 'Tech Startup Dubai', 'Looking for an experienced React developer with 5+ years of experience. Work on cutting-edge projects.', 'Dubai, UAE', 'Full-time', '5+ years', '2026-03-15', 'published', NULL),
  ('UX/UI Designer', 'Digital Agency', 'Creative designer needed for designing beautiful user interfaces and experiences for web and mobile applications.', 'Remote', 'Full-time', '3+ years', '2026-02-28', 'published', NULL),
  ('Product Manager', 'SaaS Company', 'Seeking a strategic Product Manager to lead product vision and roadmap for our growing platform.', 'Dubai, UAE', 'Full-time', '5+ years', '2026-03-20', 'published', NULL),
  ('Backend Engineer (Node.js)', 'E-commerce Platform', 'Build scalable backend services using Node.js and modern cloud technologies. Join our growing engineering team.', 'Remote', 'Full-time', '3+ years', '2026-03-10', 'published', NULL),
  ('Marketing Manager', 'Tech Consulting Firm', 'Lead marketing initiatives and strategy for B2B tech company. Great opportunity for growth.', 'Dubai, UAE', 'Full-time', '4+ years', '2026-02-28', 'published', NULL)
ON CONFLICT DO NOTHING;

-- Insert some draft items for superadmin to see pending approvals
INSERT INTO events (title, description, event_date, time, location, status, max_participants, category)
VALUES 
  ('Draft Event - Under Review', 'This event is pending approval by superadmin', '2026-03-25', '10:00 AM', 'TBD', 'draft', 50, 'Workshop')
ON CONFLICT DO NOTHING;

INSERT INTO jobs (job_title, company_name, description, location, employment_type, experience_level, apply_by_date, status, created_by)
VALUES 
  ('Draft Job Position - Pending Approval', 'Company Name TBD', 'This job posting is under review', 'Location TBD', 'Full-time', 'TBD', '2026-03-30', 'draft', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO announcements (title, message, priority, status, expiry_date, type, created_by)
VALUES 
  ('Draft Announcement - Under Review', 'This announcement is pending superadmin approval.', 'medium', 'draft', '2026-03-25', 'update', NULL)
ON CONFLICT DO NOTHING;

-- For testing pending membership applications, insert test data
INSERT INTO membership_applications (user_id, email, full_name, job_title, company_name, status, visa_status)
VALUES 
  ('test-pending-1', 'newmember1@example.com', 'John Doe', 'Software Engineer', 'Tech Corp', 'pending', 'Employment Visa'),
  ('test-pending-2', 'newmember2@example.com', 'Jane Smith', 'Product Manager', 'Digital Agency', 'pending', 'Investor Visa'),
  ('test-pending-3', 'newmember3@example.com', 'Ahmed Al-Mansouri', 'Designer', 'Creative Studio', 'pending', 'Employment Visa')
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 'Events' as Type, COUNT(*) as Count FROM events WHERE status = 'published' AND event_date >= CAST(NOW() AS DATE)
UNION ALL
SELECT 'Announcements', COUNT(*) FROM announcements WHERE status = 'published' AND expiry_date >= CAST(NOW() AS DATE)
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs WHERE status = 'published' AND apply_by_date >= CAST(NOW() AS DATE)
UNION ALL
SELECT 'Pending Applications', COUNT(*) FROM membership_applications WHERE status = 'pending'
UNION ALL
SELECT 'Draft Events', COUNT(*) FROM events WHERE status = 'draft'
UNION ALL
SELECT 'Draft Jobs', COUNT(*) FROM jobs WHERE status = 'draft'
UNION ALL
SELECT 'Draft Announcements', COUNT(*) FROM announcements WHERE status = 'draft';
