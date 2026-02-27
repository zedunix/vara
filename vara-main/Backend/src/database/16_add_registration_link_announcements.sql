-- Add registration_link field to announcements table
ALTER TABLE IF EXISTS announcements 
ADD COLUMN IF NOT EXISTS registration_link TEXT;

-- Add comment to the new column
COMMENT ON COLUMN announcements.registration_link IS 'Link provided by admin for announcements that require registration or further action';
