-- ============================================
-- SIMPLE FIX FOR REPORT SUBMISSION
-- This only fixes the reports table RLS policy
-- ============================================

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON reports;

-- Create new insert policy that allows authenticated users to insert reports
CREATE POLICY "Users can insert own reports"
ON reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'reports'
  AND cmd = 'INSERT'
ORDER BY policyname;

-- Success message
SELECT '✅ Reports table insert policy fixed!' as status;
