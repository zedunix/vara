-- Add social media links and software/tools knowledge to member profiles and applications

-- Add columns to member_profiles table
ALTER TABLE IF EXISTS member_profiles 
ADD COLUMN IF NOT EXISTS linkedin_link TEXT,
ADD COLUMN IF NOT EXISTS behance_link TEXT,
ADD COLUMN IF NOT EXISTS instagram_link TEXT,
ADD COLUMN IF NOT EXISTS software_and_tools TEXT;

-- Add columns to membership_applications table
ALTER TABLE IF EXISTS membership_applications
ADD COLUMN IF NOT EXISTS linkedin_link TEXT,
ADD COLUMN IF NOT EXISTS behance_link TEXT,
ADD COLUMN IF NOT EXISTS instagram_link TEXT,
ADD COLUMN IF NOT EXISTS software_and_tools TEXT;

-- Add comments for documentation
COMMENT ON COLUMN member_profiles.linkedin_link IS 'LinkedIn profile URL';
COMMENT ON COLUMN member_profiles.behance_link IS 'Behance portfolio URL';
COMMENT ON COLUMN member_profiles.instagram_link IS 'Instagram profile handle or URL';
COMMENT ON COLUMN member_profiles.software_and_tools IS 'Software and tools they know, comma-separated';

COMMENT ON COLUMN membership_applications.linkedin_link IS 'LinkedIn profile URL';
COMMENT ON COLUMN membership_applications.behance_link IS 'Behance portfolio URL';
COMMENT ON COLUMN membership_applications.instagram_link IS 'Instagram profile handle or URL';
COMMENT ON COLUMN membership_applications.software_and_tools IS 'Software and tools they know, comma-separated';
