-- ============================================
-- COMPLETE FIX FOR REPORT SUBMISSION
-- Run ALL of this to fix submission issues
-- ============================================

-- 1. Ensure hazard-photos bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('hazard-photos', 'hazard-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop and recreate storage policies for hazard-photos
DELETE FROM storage.policies WHERE bucket_id = 'hazard-photos';

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload hazard photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hazard-photos');

-- Allow public read access
CREATE POLICY "Public can view hazard photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hazard-photos');

-- Allow users to update their own photos
CREATE POLICY "Users can update own hazard photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hazard-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own hazard photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hazard-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Ensure reports table RLS policies allow insert
DO $$
BEGIN
  -- Drop existing insert policy if it exists
  DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
  
  -- Create new insert policy
  CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- 4. Verify all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'reports'
ORDER BY policyname;

-- 5. Check storage policies
SELECT 
  name,
  bucket_id,
  definition
FROM storage.policies
WHERE bucket_id = 'hazard-photos'
ORDER BY name;

-- Success message
SELECT '✅ All report submission fixes applied!' as status;
