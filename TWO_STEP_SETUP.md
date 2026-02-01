# 🔧 Two-Step Database Setup

## Problem
Getting "policy already exists" error because some database items were partially created.

## Solution
Run these two SQL files **in order**:

---

## Step 1: Drop Everything

**File:** `step1-drop-policies.sql`

1. Open Supabase Dashboard → SQL Editor
2. Open `step1-drop-policies.sql`
3. Copy all SQL
4. Paste in SQL Editor
5. Click **Run**
6. Should see: "Step 1 complete - All existing policies and functions dropped ✅"

---

## Step 2: Create Fresh Database

**File:** `step2-create-database.sql`

1. In SQL Editor, click **New Query**
2. Open `step2-create-database.sql`
3. Copy all SQL
4. Paste in SQL Editor
5. Click **Run**
6. Should see: "Step 2 complete - Database setup successful! ✅"
7. Should also see list of 4 tables: badges, reports, user_badges, users

---

## After Both Steps Complete

✅ **You should have:**
- 4 tables created
- All RLS policies set up
- Helper functions created
- Initial badges inserted

✅ **Now test:**
1. Go to your app (http://localhost:8080)
2. Sign in
3. Go to Profile
4. Upload avatar
5. **Should work!** ✅

---

## If Still Getting Errors

**Check browser console (F12)** and share the error message.

Common issues:
- Not signed in → Sign out and sign in again
- Storage policies missing → Run `fix-storage-policies.sql`
- Buckets not created → Create `avatars` and `hazard-photos` buckets manually
