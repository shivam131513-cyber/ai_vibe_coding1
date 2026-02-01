# 🔧 Quick Fix for "Failed to Upload Image"

## Problem
You're getting "Failed to upload image" because the **storage policies** are missing.

The buckets exist, but Supabase needs policies to allow uploads.

---

## ✅ Solution (2 minutes)

### Step 1: Run SQL Script

1. **Open Supabase Dashboard** → SQL Editor
2. **Open file:** `fix-storage-policies.sql`
3. **Copy ALL the SQL code**
4. **Paste into SQL Editor**
5. **Click RUN** (or Ctrl+Enter)

### Step 2: Verify Policies Created

After running the script, you should see:
```
✓ 8 policies created
✓ 4 for hazard-photos bucket
✓ 4 for avatars bucket
```

### Step 3: Test Upload

1. **Go to your app:** http://localhost:8080
2. **Try uploading an image** (Report Hazard or Profile Avatar)
3. **Should work now!** ✅

---

## Alternative: Manual Setup (if SQL doesn't work)

### For `hazard-photos` bucket:

1. Go to **Storage** → Click `hazard-photos`
2. Click **Policies** tab
3. Click **New Policy**
4. Click **For full customization**
5. Add these 4 policies:

**Policy 1: INSERT**
```sql
CREATE POLICY "Users can upload hazard photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hazard-photos');
```

**Policy 2: SELECT**
```sql
CREATE POLICY "Public can view hazard photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hazard-photos');
```

**Policy 3: UPDATE**
```sql
CREATE POLICY "Users can update hazard photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hazard-photos');
```

**Policy 4: DELETE**
```sql
CREATE POLICY "Users can delete hazard photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hazard-photos');
```

### For `avatars` bucket:

Repeat the same process with these policies:

**Policy 1: INSERT**
```sql
CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

**Policy 2: SELECT**
```sql
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**Policy 3: UPDATE**
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');
```

**Policy 4: DELETE**
```sql
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

---

## Verify It Works

### Test 1: Report Hazard Photo Upload
1. Go to Report Hazard
2. Upload any image
3. Should show preview ✅
4. Submit report
5. Check Supabase Storage → hazard-photos
6. Should see uploaded file ✅

### Test 2: Avatar Upload
1. Go to Profile
2. Click "Change Avatar"
3. Upload any image
4. Should update immediately ✅
5. Check Supabase Storage → avatars
6. Should see uploaded file ✅

---

## Still Not Working?

### Check Browser Console (F12)

Look for specific error messages:

**Error: "new row violates row-level security policy"**
- The policies weren't created correctly
- Run the SQL script again

**Error: "permission denied for bucket"**
- Bucket might not be public
- Go to Storage → bucket → Settings → Make public

**Error: "bucket does not exist"**
- Bucket name is wrong
- Make sure buckets are named exactly: `hazard-photos` and `avatars`

**Error: "Invalid API key"**
- Check your .env file
- Restart dev server

---

## Quick Verification

Run this in SQL Editor:
```sql
-- Check if policies exist
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects'
ORDER BY policyname;
```

Should show 8 policies total.

---

## ✅ After Fix

Your uploads will work for:
- ✅ Hazard report photos
- ✅ User avatars
- ✅ Any future file uploads

**The fix is permanent** - you only need to do this once!
