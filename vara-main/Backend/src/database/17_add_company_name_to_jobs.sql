-- Add company_name column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Update existing jobs to use a placeholder if needed
-- You can manually set company_name values later via the admin dashboard
