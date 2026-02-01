-- ============================================
-- STEP 1: DROP EVERYTHING (Run this first)
-- ============================================

-- Drop all existing policies
DO $$ 
BEGIN
    -- Drop policies on users table
    DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
    
    -- Drop policies on reports table
    DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.reports;
    DROP POLICY IF EXISTS "Users can insert their own reports" ON public.reports;
    DROP POLICY IF EXISTS "Users can update their own reports" ON public.reports;
    
    -- Drop policies on badges table
    DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
    
    -- Drop policies on user_badges table
    DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
    DROP POLICY IF EXISTS "Users can earn badges" ON public.user_badges;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Ignore if tables don't exist
    WHEN undefined_object THEN
        NULL; -- Ignore if policies don't exist
END $$;

-- Drop functions
DROP FUNCTION IF EXISTS increment_reputation(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_user_stats(UUID);

-- Success message
SELECT 'Step 1 complete - All existing policies and functions dropped ✅' as status;
