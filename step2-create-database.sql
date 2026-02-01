-- ============================================
-- STEP 2: CREATE FRESH DATABASE (Run after Step 1)
-- ============================================

-- 1. CREATE USERS TABLE
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
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES FOR USERS TABLE
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 7. CREATE RLS POLICIES FOR REPORTS TABLE
CREATE POLICY "Reports are viewable by everyone"
  ON public.reports FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

-- 8. CREATE RLS POLICIES FOR BADGES TABLE
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

-- 9. CREATE RLS POLICIES FOR USER_BADGES TABLE
CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can earn badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (true);

-- 10. CREATE HELPER FUNCTIONS
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
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value)
VALUES
  ('First Report', 'Submitted your first hazard report', '🎯', 'reports', 1),
  ('Problem Solver', 'Had 5 reports resolved', '✅', 'resolved', 5),
  ('Civic Hero', 'Earned 100 reputation points', '🦸', 'reputation', 100),
  ('Community Leader', 'Earned 500 reputation points', '👑', 'reputation', 500)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Step 2 complete - Database setup successful! ✅' as status;

-- Show created tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'reports', 'badges', 'user_badges')
ORDER BY table_name;
