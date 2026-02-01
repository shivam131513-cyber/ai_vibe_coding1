# 🔧 Manual Fix for Policy Conflicts

## The Problem
SQL scripts can't drop policies because of dependency issues. We need to manually delete them through Supabase UI.

---

## Solution: Manual Deletion via Supabase UI

### Step 1: Delete Existing Policies Manually

1. **Go to Supabase Dashboard**
2. **Click "Database"** in left sidebar
3. **Click "Policies"** tab
4. **You'll see a list of all policies**

5. **Delete these policies if they exist:**
   - Find any policy on the `reports` table
   - Click the **trash icon** or **delete button** next to each policy
   - Delete ALL policies on these tables:
     - `users`
     - `reports`
     - `badges`
     - `user_badges`

6. **Confirm deletion** for each one

---

### Step 2: Run This Simple SQL

After deleting all policies manually, run this SQL:

```sql
-- Create tables
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

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create policies for reports
CREATE POLICY "Reports are viewable by everyone"
  ON public.reports FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reports"
  ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.reports FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for badges
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT USING (true);

-- Create policies for user_badges
CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT USING (true);

CREATE POLICY "Users can earn badges"
  ON public.user_badges FOR INSERT WITH CHECK (true);

-- Create functions
CREATE OR REPLACE FUNCTION increment_reputation(user_id_param UUID, points INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users
  SET reputation_points = COALESCE(reputation_points, 0) + points
  WHERE id = user_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_stats(user_id_param UUID)
RETURNS TABLE (
  total_reports BIGINT,
  resolved_reports BIGINT,
  pending_reports BIGINT,
  reputation_points INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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

-- Insert badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value)
VALUES
  ('First Report', 'Submitted your first hazard report', '🎯', 'reports', 1),
  ('Problem Solver', 'Had 5 reports resolved', '✅', 'resolved', 5),
  ('Civic Hero', 'Earned 100 reputation points', '🦸', 'reputation', 100),
  ('Community Leader', 'Earned 500 reputation points', '👑', 'reputation', 500)
ON CONFLICT (name) DO NOTHING;

SELECT 'Database setup complete! ✅' as status;
```

---

## Alternative: Faster UI Method

If you can't find the Policies tab, try this:

1. **Go to Table Editor**
2. **Click on `reports` table**
3. **Look for "RLS" or "Policies" button** at the top
4. **Disable RLS temporarily:**
   - Toggle RLS off
   - This will remove all policies
5. **Then run the SQL above**
6. **RLS will be re-enabled by the SQL**

---

## After Setup Complete

Test avatar upload:
1. Go to Profile
2. Upload avatar
3. Should work! ✅

---

## Still Having Issues?

If you still get errors, **take a screenshot** of:
1. The Supabase Policies page
2. The error message
3. Browser console (F12)

And I'll help you fix it!
