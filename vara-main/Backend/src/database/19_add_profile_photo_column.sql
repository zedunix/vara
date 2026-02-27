-- ============================================
-- Add profile_photo column for ID card photos
-- ============================================

-- Check if profile_photo column exists, if not add it
DO $$ 
BEGIN
    -- Add profile_photo column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'member_profiles' 
        AND column_name = 'profile_photo'
    ) THEN
        ALTER TABLE member_profiles 
        ADD COLUMN profile_photo TEXT;
        
        -- Copy data from profile_photo_url to profile_photo if profile_photo_url has data
        UPDATE member_profiles 
        SET profile_photo = profile_photo_url 
        WHERE profile_photo_url IS NOT NULL;
        
        RAISE NOTICE 'Added profile_photo column to member_profiles table';
    ELSE
        RAISE NOTICE 'profile_photo column already exists';
    END IF;
END $$;

-- Add index for faster photo lookups
CREATE INDEX IF NOT EXISTS idx_member_profiles_profile_photo 
ON member_profiles(profile_photo) 
WHERE profile_photo IS NOT NULL;

-- Update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_member_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists for updated_at
DROP TRIGGER IF EXISTS update_member_profiles_timestamp ON member_profiles;
CREATE TRIGGER update_member_profiles_timestamp
    BEFORE UPDATE ON member_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_member_profile_timestamp();
