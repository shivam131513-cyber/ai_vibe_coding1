# 🗺️ Heatmap Database Setup Required

## The Issue

The Heatmap page shows: **"column reports.location_lat does not exist"**

This means the database tables haven't been created yet.

---

## Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run the Setup SQL
1. Click **"New Query"**
2. Open the file: `FINAL-FIX.sql` (in your project root)
3. **Copy ALL the SQL** from that file
4. **Paste** into the Supabase SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify Success
You should see:
- ✅ "Database setup complete!"
- ✅ List of 4 tables (users, reports, badges, user_badges)

### Step 4: Refresh Heatmap
1. Go back to your app
2. Navigate to the Heatmap page
3. Click **"Try Again"**
4. Map should load! 🎉

---

## What the SQL Does

Creates these tables:
- `users` - User profiles
- `reports` - Hazard reports with **location_lat** and **location_lon**
- `badges` - Achievement badges
- `user_badges` - User achievements

Plus:
- Row Level Security (RLS) policies
- Helper functions
- Initial badge data

---

## Still Having Issues?

### If you see "policy already exists":
The SQL file handles this automatically by disabling/re-enabling RLS.

### If you see "permission denied":
Make sure you're logged into Supabase with the correct account.

### If the map is empty:
That's normal! You need to:
1. Submit a report from the "Report Hazard" page
2. Make sure to enable location when submitting
3. The report will appear on the map

---

## Alternative: Manual Table Creation

If the SQL doesn't work, you can create tables manually:

1. **Supabase Dashboard** → **Table Editor**
2. Click **"New Table"**
3. Create `reports` table with these columns:
   - `id` (uuid, primary key)
   - `ticket_id` (text, unique)
   - `user_id` (uuid, foreign key to auth.users)
   - `hazard_type` (text)
   - `category` (text)
   - `severity` (text)
   - `location_lat` (float8) ← **Important!**
   - `location_lon` (float8) ← **Important!**
   - `location_address` (text)
   - `photo_url` (text)
   - `status` (text)
   - `urgency_score` (int4)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

But using the SQL file is much easier! 😊
