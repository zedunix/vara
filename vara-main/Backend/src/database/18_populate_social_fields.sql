-- ============================================
-- Populate Social Media & Software Fields for Existing Members
-- ============================================
-- This script updates existing member_profiles with social media and software
-- fields from their corresponding membership_applications if not already set

-- Step 1: Check how many members need updates
SELECT 
  COUNT(DISTINCT mp.id) as members_needing_updates,
  COUNT(CASE WHEN mp.linkedin_link IS NULL THEN 1 END) as missing_linkedin,
  COUNT(CASE WHEN mp.behance_link IS NULL THEN 1 END) as missing_behance,
  COUNT(CASE WHEN mp.instagram_link IS NULL THEN 1 END) as missing_instagram,
  COUNT(CASE WHEN mp.software_and_tools IS NULL THEN 1 END) as missing_software
FROM member_profiles mp;

-- Step 2: Update existing member profiles with missing social media fields from applications
UPDATE member_profiles mp
SET 
  linkedin_link = COALESCE(mp.linkedin_link, ma.linkedin_link),
  behance_link = COALESCE(mp.behance_link, ma.behance_link),
  instagram_link = COALESCE(mp.instagram_link, ma.instagram_link),
  software_and_tools = COALESCE(mp.software_and_tools, ma.software_and_tools),
  updated_at = NOW()
FROM membership_applications ma
WHERE mp.user_id = ma.user_id
  AND ma.status = 'approved'
  AND (mp.linkedin_link IS NULL 
    OR mp.behance_link IS NULL 
    OR mp.instagram_link IS NULL 
    OR mp.software_and_tools IS NULL);

-- Step 3: Verify the updates
SELECT 
  COUNT(*) as total_members,
  COUNT(CASE WHEN linkedin_link IS NOT NULL THEN 1 END) as with_linkedin,
  COUNT(CASE WHEN behance_link IS NOT NULL THEN 1 END) as with_behance,
  COUNT(CASE WHEN instagram_link IS NOT NULL THEN 1 END) as with_instagram,
  COUNT(CASE WHEN software_and_tools IS NOT NULL THEN 1 END) as with_software
FROM member_profiles
WHERE linkedin_link IS NOT NULL 
  OR behance_link IS NOT NULL 
  OR instagram_link IS NOT NULL 
  OR software_and_tools IS NOT NULL;

-- Step 4: Show sample of updated members
SELECT 
  member_id,
  full_name,
  email,
  linkedin_link,
  behance_link,
  instagram_link,
  software_and_tools
FROM member_profiles
WHERE linkedin_link IS NOT NULL 
  OR behance_link IS NOT NULL 
  OR instagram_link IS NOT NULL 
  OR software_and_tools IS NOT NULL
LIMIT 10;
