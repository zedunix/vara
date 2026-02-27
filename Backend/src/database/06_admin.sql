-- ============================================
-- VARA UAE Database - Admin & Board Members Module
-- Currency: AED (United Arab Emirates Dirham)
-- ============================================

-- Admin profiles
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    admin_since DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Board members
CREATE TABLE board_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('superadmin', 'admin') NOT NULL,
    assigned_date DATE NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all operations" ON admin_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON board_members FOR ALL USING (true) WITH CHECK (true);

-- Grant Permissions
GRANT ALL ON admin_profiles TO service_role;
GRANT ALL ON board_members TO service_role;

GRANT SELECT ON board_members TO authenticated;
