-- ============================================
-- VARA UAE Database - Membership Module
-- Currency: AED (United Arab Emirates Dirham)
-- ============================================

-- Member profiles (detailed user information)
CREATE TABLE IF NOT EXISTS member_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    member_id VARCHAR(20) UNIQUE NOT NULL, -- e.g., VARA-2024-001
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    age_category VARCHAR(20) NOT NULL, -- e.g., '25-31', '32-38', etc.
    blood_group VARCHAR(5), -- e.g., 'O+', 'A-', etc.
    profile_photo_url TEXT,
    
    -- Contact Information
    country VARCHAR(100) DEFAULT 'UAE',
    emirate VARCHAR(50),
    area_name VARCHAR(100),
    country_code VARCHAR(10) DEFAULT '+971',
    contact_number VARCHAR(20),
    whatsapp_country_code VARCHAR(10) DEFAULT '+971',
    whatsapp_number VARCHAR(20),
    kerala_district VARCHAR(100),
    
    -- Professional Information
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    visa_status VARCHAR(50),
    years_in_uae INT DEFAULT 0,
    months_in_uae INT DEFAULT 0,
    total_industry_experience VARCHAR(50),
    primary_area_of_work VARCHAR(255),
    skillsets JSONB DEFAULT '[]', -- Array of skills
    other_skill VARCHAR(255),
    portfolio_link TEXT,
    
    -- VARA Specific
    vara_whatsapp_group BOOLEAN DEFAULT false,
    interested_in_volunteering BOOLEAN DEFAULT false,
    volunteering_areas JSONB DEFAULT '[]', -- Array of areas
    proceed_with_membership_fee BOOLEAN DEFAULT false,
    message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membership types
CREATE TABLE IF NOT EXISTS membership_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- 'Standard', 'Premium'
    category VARCHAR(100) NOT NULL, -- 'Individual Member', 'Corporate Member'
    price_aed DECIMAL(10, 2) NOT NULL, -- Price in AED (Dirhams)
    duration_months INT DEFAULT 12,
    benefits JSONB DEFAULT '[]', -- Array of benefits
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member memberships
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
    membership_type_id UUID NOT NULL REFERENCES membership_types(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'pending', 'cancelled')),
    joined_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membership applications (pending approvals)
CREATE TABLE IF NOT EXISTS membership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    application_id VARCHAR(20) UNIQUE, -- e.g., APP-2026-001
    
    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    age_category VARCHAR(20),
    blood_group VARCHAR(5),
    profile_photo_url TEXT,
    
    -- Contact Information
    country VARCHAR(100) DEFAULT 'UAE',
    emirate VARCHAR(50),
    area_name VARCHAR(100),
    country_code VARCHAR(10) DEFAULT '+971',
    contact_number VARCHAR(20),
    whatsapp_country_code VARCHAR(10) DEFAULT '+971',
    whatsapp_number VARCHAR(20),
    kerala_district VARCHAR(100),
    
    -- Professional Information
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    visa_status VARCHAR(50),
    years_in_uae INT DEFAULT 0,
    months_in_uae INT DEFAULT 0,
    total_industry_experience VARCHAR(50),
    primary_area_of_work VARCHAR(255),
    skillsets JSONB DEFAULT '[]',
    other_skill VARCHAR(255),
    portfolio_link TEXT,
    
    -- VARA Specific
    vara_whatsapp_group VARCHAR(10),
    interested_in_volunteering BOOLEAN DEFAULT false,
    volunteering_areas JSONB DEFAULT '[]',
    proceed_with_membership_fee BOOLEAN DEFAULT false,
    message TEXT,
    
    -- Application Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Timestamps
    application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations" ON member_profiles;
DROP POLICY IF EXISTS "Allow all operations" ON membership_types;
DROP POLICY IF EXISTS "Allow all operations" ON memberships;
DROP POLICY IF EXISTS "Allow all operations" ON membership_applications;

-- Policies
CREATE POLICY "Allow all operations" ON member_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON membership_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON memberships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON membership_applications FOR ALL USING (true) WITH CHECK (true);

-- Additional policies for admin access
CREATE POLICY "Allow authenticated users to view all applications" ON membership_applications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to view all applications" ON membership_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'superadmin')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON member_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_member_id ON member_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_member_id ON memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_membership_applications_email ON membership_applications(email);

-- Auto-generate application_id
CREATE OR REPLACE FUNCTION generate_application_id()
RETURNS TRIGGER AS $$
DECLARE
    year_str VARCHAR(4);
    seq_num INT;
    new_id VARCHAR(20);
BEGIN
    year_str := EXTRACT(YEAR FROM NOW())::VARCHAR;
    SELECT COALESCE(MAX(CAST(SUBSTRING(application_id FROM 10) AS INT)), 0) + 1
    INTO seq_num
    FROM membership_applications
    WHERE application_id LIKE 'APP-' || year_str || '-%';
    
    new_id := 'APP-' || year_str || '-' || LPAD(seq_num::VARCHAR, 3, '0');
    NEW.application_id := new_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_application_id ON membership_applications;
CREATE TRIGGER set_application_id
    BEFORE INSERT ON membership_applications
    FOR EACH ROW
    WHEN (NEW.application_id IS NULL)
    EXECUTE FUNCTION generate_application_id();

-- Seed Data: Membership Types
INSERT INTO membership_types (name, category, price_aed, duration_months, benefits) VALUES
('Standard', 'Individual Member', 500.00, 12, '["Access to events", "Newsletter subscription", "Member directory access"]'),
('Premium', 'Individual Member', 1000.00, 12, '["Access to all events", "Priority registration", "Exclusive member discounts", "Newsletter subscription", "Voting rights", "Member directory access"]'),
('Corporate', 'Corporate Member', 5000.00, 12, '["Up to 5 employee memberships", "Corporate branding at events", "Priority sponsorship opportunities", "All Premium benefits"]')
ON CONFLICT DO NOTHING;

-- ============================================
-- Grant Permissions to Supabase Roles
-- ============================================

-- Service role (backend API) - full access
GRANT ALL ON member_profiles TO service_role;
GRANT ALL ON membership_types TO service_role;
GRANT ALL ON memberships TO service_role;
GRANT ALL ON membership_applications TO service_role;

-- Authenticated users
GRANT SELECT ON member_profiles TO authenticated;
GRANT SELECT ON membership_types TO authenticated;
GRANT SELECT ON memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE ON membership_applications TO authenticated;

-- Anon (public) - for public membership info
GRANT SELECT ON membership_types TO anon;
GRANT INSERT ON membership_applications TO anon;
