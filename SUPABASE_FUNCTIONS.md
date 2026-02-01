# Supabase Database Functions

This document contains SQL functions that need to be created in Supabase for the CivicGuard application.

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each function below
4. Click **Run** to create the function

---

## 1. Increment Reputation Function

This function safely increments a user's reputation points.

```sql
-- Function to increment user reputation
CREATE OR REPLACE FUNCTION increment_reputation(
  user_id UUID,
  points INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET reputation_points = COALESCE(reputation_points, 0) + points
  WHERE id = user_id;
END;
$$;
```

---

## 2. Get User Stats Function

This function returns aggregated stats for a user.

```sql
-- Function to get user statistics
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
    COALESCE((SELECT u.reputation_points FROM users u WHERE u.id = user_id_param), 0) as reputation_points
  FROM reports
  WHERE user_id = user_id_param;
END;
$$;
```

---

## 3. Update Report Status Function

This function updates a report's status and adds a status history entry.

```sql
-- Function to update report status with history
CREATE OR REPLACE FUNCTION update_report_status(
  report_id_param UUID,
  new_status TEXT,
  updated_by_param UUID,
  notes_param TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the report status
  UPDATE reports
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = report_id_param;
  
  -- Add to status history (if you have a status_history table)
  -- INSERT INTO status_history (report_id, status, updated_by, notes, created_at)
  -- VALUES (report_id_param, new_status, updated_by_param, notes_param, NOW());
END;
$$;
```

---

## 4. Award Badge Function

This function awards a badge to a user if they don't already have it.

```sql
-- Function to award a badge to a user
CREATE OR REPLACE FUNCTION award_badge(
  user_id_param UUID,
  badge_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  already_has_badge BOOLEAN;
BEGIN
  -- Check if user already has this badge
  SELECT EXISTS(
    SELECT 1 FROM user_badges 
    WHERE user_id = user_id_param AND badge_id = badge_id_param
  ) INTO already_has_badge;
  
  -- If they don't have it, award it
  IF NOT already_has_badge THEN
    INSERT INTO user_badges (user_id, badge_id, earned_at)
    VALUES (user_id_param, badge_id_param, NOW());
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;
```

---

## 5. Get Leaderboard Function

This function returns the top users by reputation.

```sql
-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
  limit_param INTEGER DEFAULT 50,
  city_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  reputation_points INTEGER,
  total_reports BIGINT,
  resolved_reports BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.avatar_url,
    u.reputation_points,
    COUNT(r.id)::BIGINT as total_reports,
    COUNT(r.id) FILTER (WHERE r.status IN ('resolved', 'verified'))::BIGINT as resolved_reports
  FROM users u
  LEFT JOIN reports r ON u.id = r.user_id
  WHERE (city_param IS NULL OR u.city = city_param)
  GROUP BY u.id, u.name, u.email, u.avatar_url, u.reputation_points
  ORDER BY u.reputation_points DESC
  LIMIT limit_param;
END;
$$;
```

---

## Usage Examples

### Increment Reputation
```sql
SELECT increment_reputation('user-uuid-here', 10);
```

### Get User Stats
```sql
SELECT * FROM get_user_stats('user-uuid-here');
```

### Update Report Status
```sql
SELECT update_report_status(
  'report-uuid-here',
  'in_progress',
  'admin-uuid-here',
  'Started working on this issue'
);
```

### Award Badge
```sql
SELECT award_badge('user-uuid-here', 'badge-uuid-here');
```

### Get Leaderboard
```sql
-- All cities
SELECT * FROM get_leaderboard(50);

-- Specific city
SELECT * FROM get_leaderboard(50, 'Mumbai');
```

---

## Notes

- All functions use `SECURITY DEFINER` to run with the privileges of the function creator
- Make sure to set up proper Row Level Security (RLS) policies on your tables
- These functions assume the database schema from `database.ts`
- Test each function after creation to ensure it works correctly

---

## Storage Buckets

Make sure to create the following storage buckets in Supabase:

1. **hazard-photos** - For report photos
   - Public bucket
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/heic

2. **avatars** - For user profile pictures
   - Public bucket
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png

### Storage Policies

For `hazard-photos` bucket:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload hazard photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hazard-photos');

-- Allow public read access
CREATE POLICY "Public can view hazard photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hazard-photos');
```

For `avatars` bucket:
```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```
