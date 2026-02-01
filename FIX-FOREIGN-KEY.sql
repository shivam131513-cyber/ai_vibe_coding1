-- ============================================
-- FIX: Add Foreign Key Relationship Between Reports and Users
-- This fixes the "Could not find a relationship" error
-- ============================================

-- First, check if the foreign key already exists
DO $$
BEGIN
    -- Drop the constraint if it exists (to recreate it properly)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reports_user_id_fkey' 
        AND table_name = 'reports'
    ) THEN
        ALTER TABLE reports DROP CONSTRAINT reports_user_id_fkey;
        RAISE NOTICE 'Dropped existing foreign key constraint';
    END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE reports 
ADD CONSTRAINT reports_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Verify the foreign key was created
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'reports'
    AND kcu.column_name = 'user_id';

-- Success message
SELECT '✅ Foreign key relationship created! Report details should load now.' as status;
