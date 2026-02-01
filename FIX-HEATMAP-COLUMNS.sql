-- ============================================
-- FIX HEATMAP: Add Missing Location Columns
-- Run this if you get "column location_lat does not exist"
-- ============================================

-- Check if columns exist, if not add them
DO $$ 
BEGIN
    -- Add location_lat if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'location_lat'
    ) THEN
        ALTER TABLE reports ADD COLUMN location_lat DOUBLE PRECISION;
        RAISE NOTICE '✅ Added location_lat column';
    ELSE
        RAISE NOTICE 'ℹ️  location_lat column already exists';
    END IF;

    -- Add location_lon if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'location_lon'
    ) THEN
        ALTER TABLE reports ADD COLUMN location_lon DOUBLE PRECISION;
        RAISE NOTICE '✅ Added location_lon column';
    ELSE
        RAISE NOTICE 'ℹ️  location_lon column already exists';
    END IF;

    -- Add location_address if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'location_address'
    ) THEN
        ALTER TABLE reports ADD COLUMN location_address TEXT;
        RAISE NOTICE '✅ Added location_address column';
    ELSE
        RAISE NOTICE 'ℹ️  location_address column already exists';
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'reports' 
    AND column_name IN ('location_lat', 'location_lon', 'location_address')
ORDER BY column_name;

-- Success message
SELECT '✅ Heatmap location columns are ready!' as status;
