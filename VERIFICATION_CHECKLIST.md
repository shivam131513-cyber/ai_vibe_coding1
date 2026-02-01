# ✅ Supabase Setup Verification Checklist

## Quick Verification Steps

Follow these steps to verify your setup is complete:

---

## 1️⃣ Verify Database Tables

**Go to:** Supabase Dashboard → Table Editor

You should see these 4 tables:
- ✅ `users`
- ✅ `reports`
- ✅ `badges`
- ✅ `user_badges`

**Test Query:**
Go to SQL Editor and run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Result:** Should show all 4 tables

---

## 2️⃣ Verify Storage Buckets

**Go to:** Supabase Dashboard → Storage

You should see these 2 buckets:
- ✅ `hazard-photos` (Public)
- ✅ `avatars` (Public)

**Check if Public:**
- Click on each bucket
- Look for "Public" badge next to bucket name
- If not public, click bucket settings → Make public

---

## 3️⃣ Verify Storage Policies

**Go to:** Storage → Click on `hazard-photos` → Policies tab

You should see at least 2 policies:
- ✅ Policy for INSERT (authenticated users can upload)
- ✅ Policy for SELECT (public can view)

**If missing, add them:**

```sql
-- For hazard-photos bucket
CREATE POLICY "Users can upload hazard photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hazard-photos');

CREATE POLICY "Public can view hazard photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hazard-photos');

-- For avatars bucket
CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## 4️⃣ Verify Authentication Settings

**Go to:** Authentication → Providers → Email

Check these settings:
- ✅ Email provider is **Enabled**
- ✅ "Confirm email" is **UNCHECKED** (for development)
- ✅ "Secure email change" can be checked or unchecked

**If "Confirm email" is checked:**
- Uncheck it
- Click Save
- This allows instant signup without email verification

---

## 5️⃣ Verify Helper Functions

**Go to:** SQL Editor

Run this to check if functions exist:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
```

**Expected Result:** Should show:
- `increment_reputation`
- `get_user_stats`

**If missing, run the database-setup.sql script again**

---

## 6️⃣ Test the Application

### A. Test Login/Signup

1. **Restart your dev server** (important!)
   ```bash
   # In terminal, press Ctrl+C
   npm run dev
   ```

2. **Open browser:** http://localhost:8080/login

3. **Try Sign Up:**
   - Email: `test@example.com`
   - Password: `test123`
   - Click "Sign Up"
   - Should succeed immediately (no email verification)

4. **Check Supabase:**
   - Go to Authentication → Users
   - Should see your new user
   - Go to Table Editor → users
   - Should see user record created

### B. Test Report Submission

1. **Sign in** with your test account

2. **Go to:** Report Hazard page

3. **Upload a photo:**
   - Click upload area
   - Select any image
   - Should show preview

4. **Fill form:**
   - Location: "Test Location"
   - Hazard Type: Select any
   - Category: Select any
   - Severity: Select any
   - Description: "Test report"

5. **Submit:**
   - Click "Submit Report"
   - Should see success screen with Ticket ID (e.g., CG-XXXXX-XXXX)

6. **Verify in Supabase:**
   - Table Editor → reports
   - Should see your report
   - Storage → hazard-photos
   - Should see uploaded photo

### C. Test Avatar Upload

1. **Go to:** Profile page

2. **Click:** "Change Avatar"

3. **Upload:** Any image (max 5MB)

4. **Verify:**
   - Avatar should update immediately
   - Check Navbar - should show new avatar
   - Check Supabase Storage → avatars
   - Should see uploaded avatar

### D. Test Dashboard

1. **Go to:** Dashboard page

2. **Check Stats Cards:**
   - Total Reports: Should show 1 (from your test report)
   - Reputation Points: Should show 10 (from submitting report)

3. **Check My Reports Tab:**
   - Should see your test report listed
   - Should show ticket ID, status, severity

---

## 7️⃣ Common Issues & Fixes

### ❌ "relation 'public.users' does not exist"
**Fix:** Run the database-setup.sql script in SQL Editor

### ❌ "bucket 'hazard-photos' does not exist"
**Fix:** Create the storage buckets manually (Step 2)

### ❌ "new row violates row-level security policy"
**Fix:** The RLS policies weren't created. Run database-setup.sql again

### ❌ "permission denied for storage object"
**Fix:** Add storage policies (Step 3)

### ❌ Images upload but show broken image icon
**Fix:** Make buckets public (Storage → bucket → Settings → Public)

### ❌ "Email not confirmed"
**Fix:** Disable email confirmation (Step 4)

### ❌ User created in auth.users but not in public.users
**Fix:** The AuthContext should auto-create user record. Check browser console for errors.

---

## 8️⃣ Browser Console Check

**Open browser console** (F12) and check for errors:

### Good Signs ✅
```
✓ No red errors
✓ Supabase client initialized
✓ Auth state changed
✓ User session loaded
```

### Bad Signs ❌
```
✗ "Invalid API key" → Check .env file
✗ "relation does not exist" → Run SQL script
✗ "bucket does not exist" → Create buckets
✗ "permission denied" → Add RLS policies
```

---

## 9️⃣ Final Verification Query

Run this in SQL Editor to see all your data:

```sql
-- Check users
SELECT id, email, name, reputation_points FROM public.users;

-- Check reports
SELECT ticket_id, hazard_type, status, created_at FROM public.reports;

-- Check badges
SELECT name, description FROM public.badges;

-- Check storage objects
SELECT name, bucket_id, created_at FROM storage.objects;
```

---

## ✅ Setup Complete Checklist

Mark each item as you verify:

**Database:**
- [ ] 4 tables created (users, reports, badges, user_badges)
- [ ] RLS policies enabled on all tables
- [ ] Helper functions created (increment_reputation, get_user_stats)
- [ ] Initial badges inserted

**Storage:**
- [ ] hazard-photos bucket created (Public)
- [ ] avatars bucket created (Public)
- [ ] Storage policies added for both buckets

**Authentication:**
- [ ] Email provider enabled
- [ ] Email confirmation disabled (for dev)

**Testing:**
- [ ] Can sign up new user
- [ ] User appears in auth.users
- [ ] User appears in public.users
- [ ] Can submit report
- [ ] Report appears in public.reports
- [ ] Photo appears in hazard-photos bucket
- [ ] Can upload avatar
- [ ] Avatar appears in avatars bucket
- [ ] Dashboard shows correct stats
- [ ] No errors in browser console

---

## 🎉 If All Checks Pass

Your CivicGuard app is fully functional! You can now:
- ✅ Sign up and sign in users
- ✅ Submit hazard reports with photos
- ✅ Upload and update avatars
- ✅ Track reputation points
- ✅ View leaderboards
- ✅ See dashboard statistics

---

## 📞 Need Help?

If something isn't working:
1. Check browser console (F12) for errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify .env file has correct credentials
4. Make sure dev server was restarted
5. Clear browser cache and try again

**Share the error message and I'll help you fix it!**
