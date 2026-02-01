-- ============================================
-- COMPLETE FIX: Add ALL Missing Columns to Reports Table
-- This adds every column that might be missing
-- ============================================

DO $$
BEGIN
    -- Add ticket_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'ticket_id'
    ) THEN
        ALTER TABLE reports ADD COLUMN ticket_id TEXT UNIQUE NOT NULL DEFAULT 'TEMP-' || gen_random_uuid()::text;
        RAISE NOTICE '✅ Added ticket_id column';
    ELSE
        RAISE NOTICE 'ℹ️  ticket_id column already exists';
    END IF;

    -- Add user_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE reports ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column';
    ELSE
        RAISE NOTICE 'ℹ️  user_id column already exists';
    END IF;

    -- Add hazard_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'hazard_type'
    ) THEN
        ALTER TABLE reports ADD COLUMN hazard_type TEXT NOT NULL DEFAULT 'Unknown';
        RAISE NOTICE '✅ Added hazard_type column';
    ELSE
        RAISE NOTICE 'ℹ️  hazard_type column already exists';
    END IF;

    -- Add category column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'category'
    ) THEN
        ALTER TABLE reports ADD COLUMN category TEXT NOT NULL DEFAULT 'Roads';
        RAISE NOTICE '✅ Added category column';
    ELSE
        RAISE NOTICE 'ℹ️  category column already exists';
    END IF;

    -- Add severity column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'severity'
    ) THEN
        ALTER TABLE reports ADD COLUMN severity TEXT NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Low', 'Moderate', 'High', 'Critical', 'Medium'));
        RAISE NOTICE '✅ Added severity column';
    ELSE
        RAISE NOTICE 'ℹ️  severity column already exists';
    END IF;

    -- Add description column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'description'
    ) THEN
        ALTER TABLE reports ADD COLUMN description TEXT NOT NULL DEFAULT '';
        RAISE NOTICE '✅ Added description column';
    ELSE
        RAISE NOTICE 'ℹ️  description column already exists';
    END IF;

    -- Add location_lat column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'location_lat'
    ) THEN
        ALTER TABLE reports ADD COLUMN location_lat DOUBLE PRECISION;
        RAISE NOTICE '✅ Added location_lat column';
    ELSE
        RAISE NOTICE 'ℹ️  location_lat column already exists';
    END IF;

    -- Add location_lon column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'location_lon'
    ) THEN
        ALTER TABLE reports ADD COLUMN location_lon DOUBLE PRECISION;
        RAISE NOTICE '✅ Added location_lon column';
    ELSE
        RAISE NOTICE 'ℹ️  location_lon column already exists';
    END IF;

    -- Add location_address column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'location_address'
    ) THEN
        ALTER TABLE reports ADD COLUMN location_address TEXT;
        RAISE NOTICE '✅ Added location_address column';
    ELSE
        RAISE NOTICE 'ℹ️  location_address column already exists';
    END IF;

    -- Add photo_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE reports ADD COLUMN photo_url TEXT;
        RAISE NOTICE '✅ Added photo_url column';
    ELSE
        RAISE NOTICE 'ℹ️  photo_url column already exists';
    END IF;

    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'status'
    ) THEN
        ALTER TABLE reports ADD COLUMN status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'acknowledged', 'in_progress', 'resolved', 'verified'));
        RAISE NOTICE '✅ Added status column';
    ELSE
        RAISE NOTICE 'ℹ️  status column already exists';
    END IF;

    -- Add urgency_score column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'urgency_score'
    ) THEN
        ALTER TABLE reports ADD COLUMN urgency_score INTEGER DEFAULT 5 CHECK (urgency_score >= 1 AND urgency_score <= 10);
        RAISE NOTICE '✅ Added urgency_score column';
    ELSE
        RAISE NOTICE 'ℹ️  urgency_score column already exists';
    END IF;

    -- Add created_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE reports ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '✅ Added created_at column';
    ELSE
        RAISE NOTICE 'ℹ️  created_at column already exists';
    END IF;

    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reports' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE reports ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at column';
    ELSE
        RAISE NOTICE 'ℹ️  updated_at column already exists';
    END IF;
END $$;

-- Show all columns in reports table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ All required columns are now present in reports table!' as status;
