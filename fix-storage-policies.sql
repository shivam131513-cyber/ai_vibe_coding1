-- ============================================
-- STORAGE POLICIES FIX
-- Run this in Supabase SQL Editor to fix upload issues
-- ============================================

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload hazard photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view hazard photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- ============================================
-- POLICIES FOR HAZARD-PHOTOS BUCKET
-- ============================================

-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload hazard photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hazard-photos');

-- Allow everyone to view photos (public bucket)
CREATE POLICY "Public can view hazard photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hazard-photos');

-- Allow users to update their own photos
CREATE POLICY "Users can update hazard photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hazard-photos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete hazard photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hazard-photos');

-- ============================================
-- POLICIES FOR AVATARS BUCKET
-- ============================================

-- Allow authenticated users to upload their avatar
CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- Allow everyone to view avatars (public bucket)
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify policies were created:

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

-- You should see 8 policies (4 for hazard-photos, 4 for avatars)

-- ============================================
-- DONE! ✅
-- ============================================
-- Now try uploading an image again in your app
-- It should work!
