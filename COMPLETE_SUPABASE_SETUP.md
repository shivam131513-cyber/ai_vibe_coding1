# 🚀 Complete Supabase Setup Guide

## ⚠️ IMPORTANT: Follow These Steps in Order!

Your Supabase credentials are already configured in `.env`. Now you need to set up the database tables and storage buckets.

---

## Step 1: Create Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **sygejbuydejmgdhmxaar**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL below
6. Click **Run** (or press Ctrl+Enter)

```sql
-- ============================================
-- CIVICGUARD DATABASE SETUP
-- ============================================

-- 1. CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  city TEXT,
  ward TEXT,
  preferred_language TEXT DEFAULT 'en',
  reputation_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CREATE REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  hazard_type TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  urgency_score INTEGER DEFAULT 5,
  description TEXT,
  location_lat DOUBLE PRECISION,
  location_lon DOUBLE PRECISION,
  location_address TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE USER_BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES FOR USERS TABLE
-- ============================================
-- Users can view all profiles
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 7. CREATE RLS POLICIES FOR REPORTS TABLE
-- ============================================
-- Everyone can view all reports
CREATE POLICY "Reports are viewable by everyone"
  ON public.reports FOR SELECT
  USING (true);

-- Users can insert their own reports
CREATE POLICY "Users can insert their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update their own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

-- 8. CREATE RLS POLICIES FOR BADGES TABLE
-- ============================================
-- Everyone can view badges
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

-- 9. CREATE RLS POLICIES FOR USER_BADGES TABLE
-- ============================================
-- Everyone can view user badges
CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

-- Users can insert their own badges (via functions)
CREATE POLICY "Users can earn badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (true);

-- 10. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to increment user reputation
CREATE OR REPLACE FUNCTION increment_reputation(
  user_id_param UUID,
  points INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET reputation_points = COALESCE(reputation_points, 0) + points
  WHERE id = user_id_param;
END;
$$;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param UUID)
RETURNS TABLE (
  total_reports BIGINT,
  resolved_reports BIGINT,
  pending_reports BIGINT,
  reputation_points INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_reports,
    COUNT(*) FILTER (WHERE status IN ('resolved', 'verified'))::BIGINT as resolved_reports,
    COUNT(*) FILTER (WHERE status IN ('sent', 'acknowledged', 'in_progress'))::BIGINT as pending_reports,
    COALESCE((SELECT u.reputation_points FROM public.users u WHERE u.id = user_id_param), 0) as reputation_points
  FROM public.reports
  WHERE user_id = user_id_param;
END;
$$;

-- 11. INSERT INITIAL BADGES
-- ============================================
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value)
VALUES
  ('First Report', 'Submitted your first hazard report', '🎯', 'reports', 1),
  ('Problem Solver', 'Had 5 reports resolved', '✅', 'resolved', 5),
  ('Civic Hero', 'Earned 100 reputation points', '🦸', 'reputation', 100),
  ('Community Leader', 'Earned 500 reputation points', '👑', 'reputation', 500)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
```

---

## Step 2: Create Storage Buckets

### A. Create `hazard-photos` Bucket

1. In Supabase Dashboard, click **Storage** in the left sidebar
2. Click **New bucket**
3. Fill in:
   - **Name**: `hazard-photos`
   - **Public bucket**: ✅ **Check this box**
   - **File size limit**: 10 MB
   - **Allowed MIME types**: Leave empty (allows all images)
4. Click **Create bucket**

### B. Create `avatars` Bucket

1. Click **New bucket** again
2. Fill in:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Check this box**
   - **File size limit**: 5 MB
   - **Allowed MIME types**: Leave empty
3. Click **Create bucket**

---

## Step 3: Configure Storage Policies

### For `hazard-photos` bucket:

1. Click on **hazard-photos** bucket
2. Click **Policies** tab
3. Click **New policy**
4. Select **Custom policy**
5. Add these policies:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Users can upload hazard photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hazard-photos');
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Public can view hazard photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hazard-photos');
```

### For `avatars` bucket:

**Policy 1: Allow users to upload their avatar**
```sql
CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## Step 4: Configure Email Authentication

1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Find **Email** provider
3. **IMPORTANT:** Uncheck **"Confirm email"** (for development)
   - This allows instant signup without email verification
   - For production, configure SMTP and enable this
4. Click **Save**

---

## Step 5: Create Demo User (Optional)

You can create a demo user in two ways:

### Option A: Through the App
1. Go to http://localhost:8080/login
2. Click "Sign Up"
3. Enter:
   - Email: `demo@civicguard.ai`
   - Password: `demo123`
4. Click "Sign Up"

### Option B: Through Supabase Dashboard
1. Go to **Authentication** > **Users**
2. Click **Add user**
3. Select **Create new user**
4. Enter:
   - Email: `demo@civicguard.ai`
   - Password: `demo123`
   - Auto Confirm User: ✅ **Check this**
5. Click **Create user**

---

## Step 6: Verify Setup

### Test Database Connection

Run this in the SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show: badges, reports, user_badges, users
```

### Test Storage Buckets

```sql
-- Check if buckets exist
SELECT * FROM storage.buckets;

-- Should show: avatars, hazard-photos
```

---

## Step 7: Test the App

1. **Restart your dev server** (important!)
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

2. **Test Login:**
   - Go to http://localhost:8080/login
   - Sign up with a new email
   - Or sign in with demo credentials

3. **Test Report Submission:**
   - Go to "Report Hazard"
   - Upload a photo
   - Fill in details
   - Submit
   - Check if ticket ID appears

4. **Test Avatar Upload:**
   - Go to Profile
   - Click "Change Avatar"
   - Upload an image
   - Check if it updates

5. **Verify in Supabase:**
   - Go to **Table Editor** > **users** - should see your user
   - Go to **Table Editor** > **reports** - should see your report
   - Go to **Storage** > **hazard-photos** - should see uploaded photo
   - Go to **Storage** > **avatars** - should see uploaded avatar

---

## 🐛 Troubleshooting

### "relation does not exist"
- ❌ Tables not created
- ✅ Run the SQL script in Step 1

### "bucket does not exist"
- ❌ Storage buckets not created
- ✅ Create buckets in Step 2

### "new row violates row-level security policy"
- ❌ RLS policies not set up
- ✅ Check Step 1 (policies are in the SQL script)

### "permission denied for storage object"
- ❌ Storage policies not configured
- ✅ Add storage policies in Step 3

### Images upload but don't display
- ❌ Buckets not set to public
- ✅ Make sure "Public bucket" is checked

### "Email not confirmed"
- ❌ Email confirmation is enabled
- ✅ Disable it in Step 4

---

## ✅ Checklist

- [ ] Run SQL script (Step 1)
- [ ] Create `hazard-photos` bucket (Step 2A)
- [ ] Create `avatars` bucket (Step 2B)
- [ ] Add storage policies (Step 3)
- [ ] Disable email confirmation (Step 4)
- [ ] Create demo user (Step 5)
- [ ] Restart dev server
- [ ] Test login
- [ ] Test report submission
- [ ] Test avatar upload
- [ ] Verify data in Supabase

---

## 🎉 You're All Set!

Once you complete these steps, your app will:
- ✅ Save users to database
- ✅ Upload photos to storage
- ✅ Save reports with ticket IDs
- ✅ Update user avatars
- ✅ Track reputation points
- ✅ Display leaderboards

**Need help?** Check the browser console (F12) for error messages!
