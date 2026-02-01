-- ============================================
-- FIX: Add SELECT Policy for Reports
-- Allows users to view report details
-- ============================================

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can select own reports" ON reports;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON reports;

-- Create new SELECT policy that allows users to view their own reports
CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Also allow public to view reports (for sharing links)
-- Comment this out if you want reports to be private
CREATE POLICY "Public can view reports"
ON reports FOR SELECT
TO public
USING (true);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'reports'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Success message
SELECT '✅ Report SELECT policies created! View Details should work now.' as status;
