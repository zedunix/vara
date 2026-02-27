-- ============================================
-- Merge Duplicate Membership Applications
-- ============================================
-- This migration identifies and merges duplicate applications
-- by the same email address, keeping only the most recent one

-- Step 1: Identify duplicates
-- SELECT email, COUNT(*) as count FROM membership_applications GROUP BY email HAVING COUNT(*) > 1;

-- Step 2: Create a temp table with the IDs to keep (most recent per email)
CREATE TEMP TABLE apps_to_keep AS
SELECT DISTINCT ON (email) id, email, application_date
FROM membership_applications
ORDER BY email, application_date DESC;

-- Step 3: Create a mapping table of old IDs to keep IDs
CREATE TEMP TABLE duplicate_mapping AS
SELECT 
  m1.id as old_id,
  (SELECT id FROM apps_to_keep WHERE email = m1.email LIMIT 1) as keep_id,
  m1.email
FROM membership_applications m1
WHERE m1.id NOT IN (SELECT id FROM apps_to_keep);

-- Step 4: Log the duplicates to be removed
DO $$
DECLARE
  dup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM duplicate_mapping;
  RAISE NOTICE '🗑️  Found % duplicate applications to merge', dup_count;
END $$;

-- Step 5: Update any foreign key references (if any) from old IDs to new IDs
-- (Adjust as needed based on your schema)

-- Step 6: Delete the duplicate applications (keep only the most recent per email)
DELETE FROM membership_applications
WHERE id NOT IN (SELECT id FROM apps_to_keep);

-- Step 7: Log completion
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count FROM membership_applications;
  RAISE NOTICE '✅ Cleanup complete! Remaining applications: %', remaining_count;
END $$;

-- Verify: Show unique emails
SELECT 'Email deduplication check:' as status;
SELECT email, COUNT(*) as count
FROM membership_applications
GROUP BY email
HAVING COUNT(*) > 1
LIMIT 5;

-- If no rows returned above, deduplication was successful
SELECT 
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(DISTINCT email) FROM membership_applications) 
    THEN '✅ SUCCESS: All applications are now unique per email!'
    ELSE '⚠️  WARNING: Some duplicates may still exist'
  END as result
FROM membership_applications;
