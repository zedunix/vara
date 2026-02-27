-- ============================================
-- VARA UAE Database - Accounts Module
-- Income & Expense Records Management
-- Currency: AED (United Arab Emirates Dirham)
-- Note: This module is now managed through the Admin API
-- ============================================

-- Income categories
CREATE TABLE income_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense categories
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors list
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income records (matches adminService.IncomeRecord interface)
CREATE TABLE income_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    income_id VARCHAR(50) UNIQUE NOT NULL,
    source VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES income_categories(id) ON DELETE SET NULL,
    description TEXT,
    amount_aed DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('received', 'pending')),
    payment_mode VARCHAR(50) NOT NULL CHECK (
        payment_mode IN ('Cash', 'Bank Transfer', 'UPI', 'NEFT', 'Credit Card', 'Cheque')
    ),
    receipt_number VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense records (matches adminService.ExpenseRecord interface)
CREATE TABLE expense_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id VARCHAR(50) UNIQUE NOT NULL,
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    description TEXT,
    amount_aed DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
    payment_mode VARCHAR(50) NOT NULL CHECK (
        payment_mode IN ('Cash', 'Bank Transfer', 'UPI', 'NEFT', 'Credit Card', 'Cheque')
    ),
    invoice_number VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ Indexes for Performance ============

CREATE INDEX idx_income_records_source ON income_records(source);
CREATE INDEX idx_income_records_created_by ON income_records(created_by);
CREATE INDEX idx_income_records_date_status ON income_records(date, status);
CREATE INDEX idx_income_records_category_id ON income_records(category_id);

CREATE INDEX idx_expense_records_category_id ON expense_records(category_id);
CREATE INDEX idx_expense_records_vendor_id ON expense_records(vendor_id);
CREATE INDEX idx_expense_records_date_status ON expense_records(date, status);
CREATE INDEX idx_expense_records_created_by ON expense_records(created_by);

CREATE INDEX idx_income_categories_active ON income_categories(is_active);
CREATE INDEX idx_expense_categories_active ON expense_categories(is_active);
CREATE INDEX idx_vendors_active ON vendors(is_active);

-- ============ Updated Timestamp Trigger ============

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_income_records_updated_at
BEFORE UPDATE ON income_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_records_updated_at
BEFORE UPDATE ON expense_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============ Seed Data ============

-- Income Categories
INSERT INTO income_categories (name, description) VALUES
('Membership Fees', 'Income from membership subscriptions and renewals'),
('Event Revenue', 'Income from event ticket sales and registrations'),
('Donations', 'Charitable donations and corporate sponsorships'),
('Workshop Fees', 'Income from paid workshops and training sessions'),
('Merchandise', 'Income from VARA merchandise sales'),
('Other Income', 'Miscellaneous income sources')
ON CONFLICT DO NOTHING;

-- Expense Categories
INSERT INTO expense_categories (name, description) VALUES
('Operations', 'Office rent, utilities, and general operations'),
('Marketing', 'Advertising, promotions, and marketing materials'),
('Events', 'Event venue, catering, and event-related expenses'),
('Technology', 'IT infrastructure, hosting, and software subscriptions'),
('Salaries', 'Staff salaries and contractor payments'),
('Travel', 'Travel and transportation expenses'),
('Office Supplies', 'Stationery and office equipment'),
('Miscellaneous', 'Other miscellaneous expenses')
ON CONFLICT DO NOTHING;

-- Default Vendors
INSERT INTO vendors (name, category) VALUES
('Landlord Properties LLC', 'Real Estate'),
('DEWA', 'Utilities'),
('ADDC', 'Utilities'),
('Etisalat', 'Telecommunications'),
('Du Telecom', 'Telecommunications'),
('Grand Catering Services', 'Catering'),
('Print Pro UAE', 'Printing'),
('Social Media Solutions', 'Marketing'),
('HostGator', 'Technology'),
('GoDaddy', 'Technology'),
('Amazon Web Services', 'Technology'),
('Microsoft Azure', 'Technology'),
('Google Workspace', 'Technology'),
('Zoom Communications', 'Technology'),
('Office Supplies Co.', 'Office Supplies'),
('Transportation Services LLC', 'Transportation'),
('Security Services UAE', 'Security')
ON CONFLICT DO NOTHING;

-- ============ RLS (Row-Level Security) ============

ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Permissive policies for admin operations
CREATE POLICY "Allow all operations" ON income_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON expense_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON income_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON expense_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON vendors FOR ALL USING (true) WITH CHECK (true);

-- ============ Permissions ============

GRANT ALL ON income_categories TO service_role;
GRANT ALL ON expense_categories TO service_role;
GRANT ALL ON income_records TO service_role;
GRANT ALL ON expense_records TO service_role;
GRANT ALL ON vendors TO service_role;

GRANT SELECT ON income_categories TO authenticated;
GRANT SELECT ON expense_categories TO authenticated;
GRANT SELECT ON vendors TO authenticated;

-- ============ Table Comments ============

COMMENT ON TABLE income_records IS 'Tracks all income records managed through admin API. Uses base36-encoded unique IDs.';
COMMENT ON TABLE expense_records IS 'Tracks all expense records managed through admin API. Uses base36-encoded unique IDs.';
COMMENT ON COLUMN income_records.income_id IS 'Unique income identifier - format: INC-{base36_timestamp}-{random8}';
COMMENT ON COLUMN expense_records.expense_id IS 'Unique expense identifier - format: EXP-{base36_timestamp}-{random8}';
COMMENT ON COLUMN income_records.payment_mode IS 'Payment method: Cash, Bank Transfer, UPI, NEFT, Credit Card, Cheque';
COMMENT ON COLUMN expense_records.payment_mode IS 'Payment method: Cash, Bank Transfer, UPI, NEFT, Credit Card, Cheque';
