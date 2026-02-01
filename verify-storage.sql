-- ============================================
-- VERIFY STORAGE POLICIES
-- Run this to check if storage policies are working
-- ============================================

-- 1. Check if buckets exist
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE name IN ('hazard-photos', 'avatars')
ORDER BY name;

-- Expected: 2 rows (hazard-photos and avatars), both should have public = true

-- 2. Check storage policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

-- Expected: 8 policies total
-- - Public can view avatars (SELECT)
-- - Public can view hazard photos (SELECT)
-- - Users can delete hazard photos (DELETE)
-- - Users can delete own avatar (DELETE)
-- - Users can update hazard photos (UPDATE)
-- - Users can update own avatar (UPDATE)
-- - Users can upload hazard photos (INSERT)
-- - Users can upload their avatar (INSERT)

-- 3. Check if policies are working (test query)
-- This should return true if you're authenticated
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'You are authenticated ✅'
    ELSE 'You are NOT authenticated ❌'
  END as auth_status;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If buckets don't exist, create them:
/*
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('hazard-photos', 'hazard-photos', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;
*/

-- If policies don't exist, run fix-storage-policies.sql again

-- ============================================
-- EXPECTED RESULTS
-- ============================================

/*
✅ GOOD:
- 2 buckets found (hazard-photos, avatars)
- Both buckets have public = true
- 8 storage policies found
- You see "You are authenticated ✅"

❌ BAD:
- Less than 2 buckets → Create buckets manually
- public = false → Run: UPDATE storage.buckets SET public = true WHERE name IN ('hazard-photos', 'avatars');
- Less than 8 policies → Run fix-storage-policies.sql
- "You are NOT authenticated" → Sign in to the app first
*/
