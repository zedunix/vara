-- Create Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title TEXT NOT NULL,
  description TEXT NOT NULL,
  role TEXT NOT NULL,
  application_link TEXT NOT NULL,
  apply_by_date DATE NOT NULL,
  location TEXT NOT NULL,
  employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
  experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('Entry Level', 'Mid Level', 'Senior Level', 'Expert Level')),
  salary TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_apply_by_date ON jobs(apply_by_date);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to manage all jobs" ON jobs;
DROP POLICY IF EXISTS "Allow public read access to all jobs" ON jobs;
DROP POLICY IF EXISTS "Allow authenticated users to view published jobs" ON jobs;

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including service role) to read published jobs
CREATE POLICY "Enable read access for published jobs" ON jobs
  FOR SELECT USING (status = 'published');

-- Allow authenticated users to read published jobs
CREATE POLICY "Enable authenticated read for published jobs" ON jobs
  FOR SELECT TO authenticated USING (status = 'published');
