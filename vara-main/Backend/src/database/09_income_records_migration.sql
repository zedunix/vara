-- ============================================
-- VARA UAE Database - Income Records Migration
-- Fix schema to align with frontend requirements
-- ============================================

-- Step 1: Modify income_id column length
ALTER TABLE income_records
ALTER COLUMN income_id TYPE VARCHAR(50);

-- Step 2: Drop existing payment_mode constraint if it exists
ALTER TABLE income_records
DROP CONSTRAINT IF EXISTS income_records_payment_mode_check;

-- Step 3: Add payment mode constraint matching database requirements
ALTER TABLE income_records
ADD CONSTRAINT income_records_payment_mode_check CHECK (
    payment_mode IN ('Cash', 'Bank Transfer', 'UPI', 'NEFT', 'Credit Card', 'Cheque')
);

-- Step 4: Ensure status constraint is correct
ALTER TABLE income_records
DROP CONSTRAINT IF EXISTS income_records_status_check;

ALTER TABLE income_records
ADD CONSTRAINT income_records_status_check CHECK (
    status IN ('received', 'pending')
);

-- Step 5: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_income_records_source ON income_records(source);
CREATE INDEX IF NOT EXISTS idx_income_records_created_by ON income_records(created_by);
CREATE INDEX IF NOT EXISTS idx_income_records_date_status ON income_records(date, status);

-- Comments for clarity
COMMENT ON TABLE income_records IS 'Tracks all income records with source, amount, and payment details';
COMMENT ON COLUMN income_records.income_id IS 'Unique income identifier - format: INC-{base36_timestamp}-{random}';
COMMENT ON COLUMN income_records.source IS 'Income source (e.g., Membership Fees, Event Revenue, Donations)';
COMMENT ON COLUMN income_records.amount_aed IS 'Amount in AED with 2 decimal places';
COMMENT ON COLUMN income_records.payment_mode IS 'Payment method: Cash, Bank Transfer, UPI, NEFT, Credit Card, Cheque';
COMMENT ON COLUMN income_records.status IS 'Payment status: received or pending';
COMMENT ON COLUMN income_records.created_by IS 'Admin user who created this record';


