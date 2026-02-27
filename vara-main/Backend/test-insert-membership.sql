-- Insert test membership data
-- Use this if memberships don't exist for your user

-- First, ensure membership_types exist
INSERT INTO membership_types (name, category, price_aed, duration_months, benefits, is_active)
VALUES 
  ('Standard', 'Individual Member', 500.00, 12, '["Community Access", "Event Invitations", "Monthly Newsletter", "Networking Opportunities"]'::jsonb, true),
  ('Premium', 'Corporate Member', 2500.00, 12, '["Community Access", "Event Invitations", "Monthly Newsletter", "Networking Opportunities", "Priority Support", "Featured Listing"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Then add membership for users (replace with actual member_id and membership_type_id from your database)
-- You need to get the correct IDs first by running the test query

-- Example (MODIFY THE IDs BASED ON YOUR DATA):
-- INSERT INTO memberships (member_id, membership_type_id, status, joined_date, expiry_date)
-- VALUES 
--   ('YOUR_MEMBER_PROFILES_ID', 'YOUR_MEMBERSHIP_TYPE_ID', 'active', '2024-01-15'::date, '2025-12-31'::date);
