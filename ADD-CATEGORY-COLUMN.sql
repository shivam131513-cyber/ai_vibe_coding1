-- ============================================
-- FIX: Add Missing Category Column to Reports
-- Run this to fix "category column not found" error
-- ============================================

-- Add category column if it doesn't exist
DO $$
BEGIN
    -- Check if category column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'category'
    ) THEN
        -- Add category column
        ALTER TABLE reports ADD COLUMN category TEXT NOT NULL DEFAULT 'Roads';
        RAISE NOTICE '✅ Added category column';
    ELSE
        RAISE NOTICE 'ℹ️  category column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reports'
  AND column_name = 'category';

-- Success message
SELECT '✅ Category column is ready!' as status;
