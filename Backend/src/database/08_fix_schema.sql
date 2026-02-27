-- ============================================
-- VARA UAE Database - Schema Fixes
-- Fix missing columns and relationships
-- ============================================

-- Step 1: Fix membership_applications table - ensure user_id column exists
-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'membership_applications' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE membership_applications 
        ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added user_id column to membership_applications';
    ELSE
        RAISE NOTICE 'user_id column already exists in membership_applications';
    END IF;
END $$;

-- Step 2: Ensure member_profiles doesn't have email column (it shouldn't be there)
-- This is for documentation - email is in membership_applications, not in member_profiles
-- member_profiles has contact_number for contact info

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_membership_applications_user_id 
  ON membership_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_membership_applications_status 
  ON membership_applications(status);

CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id 
  ON member_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_member_profiles_member_id 
  ON member_profiles(member_id);

-- Step 4: Enable RLS on tables (already done but ensuring it's set)
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Ensure RLS policies allow operations
DROP POLICY IF EXISTS "Allow all operations" ON membership_applications;
DROP POLICY IF EXISTS "Allow all operations" ON member_profiles;

CREATE POLICY "Allow all operations" ON membership_applications 
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations" ON member_profiles 
  FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Verify column existence with output
DO $$ 
DECLARE
    v_membership_user_id_exists BOOLEAN;
    v_member_profiles_count INT;
    v_membership_applications_count INT;
BEGIN
    -- Check if user_id exists in membership_applications
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'membership_applications' 
        AND column_name = 'user_id'
    ) INTO v_membership_user_id_exists;
    
    SELECT COUNT(*) INTO v_membership_applications_count 
    FROM membership_applications;
    
    SELECT COUNT(*) INTO v_member_profiles_count 
    FROM member_profiles;
    
    RAISE NOTICE '✅ Schema Fix Summary:';
    RAISE NOTICE '  membership_applications.user_id exists: %', v_membership_user_id_exists;
    RAISE NOTICE '  membership_applications records: %', v_membership_applications_count;
    RAISE NOTICE '  member_profiles records: %', v_member_profiles_count;
END $$;
