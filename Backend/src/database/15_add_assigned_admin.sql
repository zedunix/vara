-- ============================================
-- VARA UAE Database - Add Assigned Admin Field
-- ============================================

-- Add assigned_admin_id field to membership_applications table
ALTER TABLE membership_applications 
ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES users(id);

-- Add assigned_admin_id field to member_profiles table
ALTER TABLE member_profiles 
ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES users(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_membership_applications_assigned_admin 
ON membership_applications(assigned_admin_id);

CREATE INDEX IF NOT EXISTS idx_member_profiles_assigned_admin 
ON member_profiles(assigned_admin_id);

-- Add comments for documentation
COMMENT ON COLUMN membership_applications.assigned_admin_id IS 'ID of the admin assigned to review this application';
COMMENT ON COLUMN member_profiles.assigned_admin_id IS 'ID of the admin who approved this member';

-- Grant permissions
GRANT SELECT, UPDATE ON membership_applications TO service_role;
GRANT SELECT ON membership_applications TO authenticated;
GRANT SELECT, UPDATE ON member_profiles TO service_role;
GRANT SELECT ON member_profiles TO authenticated;
