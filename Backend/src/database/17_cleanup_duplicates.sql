-- ============================================
-- Direct Merge: Keep Only Latest Application Per Email
-- ============================================
-- This script removes all but the most recent application for each email

-- First, check how many duplicates exist
SELECT 
  email, 
  COUNT(*) as duplicate_count
FROM membership_applications
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Delete duplicates: Keep only the most recent application per email
DELETE FROM membership_applications
WHERE id NOT IN (
  -- Select the most recent application for each email
  SELECT id FROM (
    SELECT DISTINCT ON (email) id
    FROM membership_applications
    ORDER BY email, application_date DESC, created_at DESC
  ) latest_apps
);

-- Verify the cleanup
SELECT 
  COUNT(*) as total_applications,
  COUNT(DISTINCT email) as unique_emails,
  CASE 
    WHEN COUNT(*) = COUNT(DISTINCT email) THEN '✅ SUCCESS - All duplicates removed!'
    ELSE '⚠️  Warning - Some duplicates may remain'
  END as status
FROM membership_applications;

-- Show any remaining duplicates (should be none)
SELECT email, COUNT(*) as count
FROM membership_applications
GROUP BY email
HAVING COUNT(*) > 1;
