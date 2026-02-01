# 🔧 Database Setup Error Fix

## The Problem

You're seeing this error:
```
ERROR: 42710: policy "Reports are viewable by everyone" for table "reports" already exists
```

## Why This Happens

This error occurs because:
1. You've run the database setup SQL before (partially or fully)
2. Some policies already exist in your database
3. SQL tries to create them again → conflict!

## The Solution

I've created a **clean setup script** that handles this properly.

---

## 🚀 Quick Fix (2 minutes)

### Step 1: Use the Clean Script

Instead of `FINAL-FIX.sql`, use the new file:

**File:** `DATABASE-SETUP-CLEAN.sql`

This script:
- ✅ Drops existing policies first
- ✅ Then recreates everything fresh
- ✅ No conflicts!
- ✅ Safe to run multiple times

### Step 2: Run in Supabase

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Open `DATABASE-SETUP-CLEAN.sql` from your project
4. **Copy ALL content**
5. **Paste** into SQL Editor
6. Click **"Run"** (or Ctrl+Enter)

### Step 3: Verify Success

You should see:
```
✅ Database setup complete!
✅ Tables created: users, reports, badges, user_badges
✅ RLS policies applied
✅ Storage buckets configured
✅ Default badges inserted

🎉 Your CivicGuard Hub database is ready!
```

---

## 🔍 What the Clean Script Does

### 1. Drops Existing Policies
```sql
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON reports;
-- ... and all other policies
```

### 2. Drops Existing Functions
```sql
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

### 3. Creates Tables (Safely)
```sql
CREATE TABLE IF NOT EXISTS users (...);
CREATE TABLE IF NOT EXISTS reports (...);
-- etc.
```

### 4. Recreates Everything Fresh
- Functions
- Triggers
- RLS Policies
- Storage Buckets
- Storage Policies
- Default Badges

---

## ✅ Advantages of Clean Script

| Feature | FINAL-FIX.sql | DATABASE-SETUP-CLEAN.sql |
|---------|---------------|--------------------------|
| Handles existing policies | ❌ Errors | ✅ Drops first |
| Safe to re-run | ❌ No | ✅ Yes |
| Wrapped in transaction | ❌ No | ✅ Yes (BEGIN/COMMIT) |
| Clear success message | ⚠️ Basic | ✅ Detailed |

---

## 🆘 If You Still Get Errors

### Error: "permission denied"
**Solution:** Make sure you're logged in as the project owner

### Error: "relation does not exist"
**Solution:** This is normal if tables don't exist yet. Script handles it.

### Error: "syntax error"
**Solution:** Make sure you copied the ENTIRE file, including BEGIN and COMMIT

### Error: "bucket already exists"
**Solution:** This is fine! The script uses `ON CONFLICT DO NOTHING`

---

## 📊 What Gets Created

### Tables
- ✅ `users` - User profiles and reputation
- ✅ `reports` - Hazard reports with location
- ✅ `badges` - Achievement definitions
- ✅ `user_badges` - User achievements

### Storage Buckets
- ✅ `avatars` - User profile pictures
- ✅ `hazard-photos` - Report photos

### Policies
- ✅ 12 RLS policies for data security
- ✅ 8 storage policies for file access

### Functions & Triggers
- ✅ Auto-create user profile on signup
- ✅ Auto-update timestamps

---

## 🎯 After Running the Script

### Test Everything:

1. **Test Signup**
   - Go to your app
   - Create a new account
   - Should work without errors

2. **Test Report Submission**
   - Click "Report Hazard"
   - Fill form and submit
   - Should get ticket ID

3. **Test Dashboard**
   - Go to Dashboard
   - Should see your reports
   - No errors in console

4. **Test Heatmap**
   - Go to Heatmap
   - Map should load
   - Should see markers (if you have reports with location)

5. **Test Profile**
   - Go to Profile
   - Update your info
   - Upload avatar
   - Should save successfully

---

## 🔄 Need to Reset Everything?

If you want to completely start fresh:

### Option 1: Drop All Tables
```sql
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then run `DATABASE-SETUP-CLEAN.sql`

### Option 2: Delete Storage Buckets
1. Supabase Dashboard → Storage
2. Delete `avatars` bucket
3. Delete `hazard-photos` bucket

Then run `DATABASE-SETUP-CLEAN.sql`

---

## 💡 Pro Tips

1. **Always use the CLEAN script** if you're unsure about database state
2. **The script is idempotent** - safe to run multiple times
3. **Check Supabase logs** if something fails
4. **Backup data** before major changes (if you have production data)

---

## ✨ Summary

**Problem:** "Policy already exists" error  
**Cause:** Partial database setup from before  
**Solution:** Use `DATABASE-SETUP-CLEAN.sql`  
**Time:** 2 minutes  
**Result:** Clean, working database ✅

---

**Next Step:** Run `DATABASE-SETUP-CLEAN.sql` right now! 🚀
