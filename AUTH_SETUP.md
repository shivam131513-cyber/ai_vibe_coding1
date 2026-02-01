# Authentication Setup Guide

## Overview
CivicGuard uses **email/password authentication** with Supabase Auth. Users can sign up with their email and password, and sign in multiple times with the same credentials.

---

## Authentication Flow

### 1. Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
});
```

**What happens:**
1. User enters email and password
2. Supabase creates auth user
3. Verification email sent (if enabled)
4. User record created in `users` table
5. Success toast shown

### 2. Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
});
```

**What happens:**
1. User enters credentials
2. Supabase validates credentials
3. Session created
4. User redirected to dashboard
5. Success toast shown

### 3. Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

**What happens:**
1. User clicks sign out
2. Session cleared
3. User redirected to home
4. Success toast shown

---

## Supabase Configuration

### Email Settings

Go to **Authentication > Email Templates** in Supabase Dashboard:

#### Option 1: Disable Email Confirmation (Development)
1. Go to **Authentication > Providers > Email**
2. Uncheck **"Confirm email"**
3. Save changes

**Pros:** Instant signup, no email verification needed
**Cons:** Less secure, not recommended for production

#### Option 2: Enable Email Confirmation (Production)
1. Configure SMTP settings in **Project Settings > Auth**
2. Customize email templates
3. Users must verify email before signing in

---

## Demo Credentials

For testing purposes, create a demo account:

```sql
-- Run this in Supabase SQL Editor
-- First, sign up through the UI with these credentials:
-- Email: demo@civicguard.ai
-- Password: demo123
```

Or use the sign-up form in the app to create the demo account.

---

## User Table Integration

When a user signs up or signs in, their record is automatically created/updated in the `users` table:

```typescript
// After successful auth
const { data: existingUser } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();

if (!existingUser) {
  await supabase.from('users').insert({
    id: user.id,
    email: user.email,
    name: user.email?.split('@')[0] || 'User',
  });
}
```

---

## Security Features

### Password Requirements
- Minimum 6 characters
- Validated on both client and server
- Hashed and stored securely by Supabase

### Session Management
- Sessions stored in localStorage
- Auto-refresh on page load
- Expires after inactivity (configurable)

### Protected Routes
```typescript
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

---

## Troubleshooting

### "Email not confirmed"
- Check Supabase email confirmation settings
- Verify SMTP configuration
- Check spam folder for verification email

### "Invalid login credentials"
- Verify email and password are correct
- Check if user exists in auth.users table
- Ensure password meets requirements

### "User already registered"
- User already exists with that email
- Use "Sign In" instead of "Sign Up"
- Or use password reset flow

---

## Testing Checklist

- [ ] Sign up with new email
- [ ] Verify email (if enabled)
- [ ] Sign in with credentials
- [ ] Sign out
- [ ] Sign in again (multiple times)
- [ ] Try wrong password
- [ ] Try non-existent email
- [ ] Check user created in database
- [ ] Check protected routes work
- [ ] Check avatar upload works
- [ ] Check profile update works

---

## Production Checklist

- [ ] Enable email confirmation
- [ ] Configure custom SMTP
- [ ] Set up password reset flow
- [ ] Add rate limiting
- [ ] Enable RLS policies
- [ ] Set up monitoring
- [ ] Configure session timeout
- [ ] Add 2FA (optional)
- [ ] Set up backup codes (optional)

---

## API Reference

### AuthContext Methods

```typescript
const { 
  user,              // Current user object
  session,           // Current session
  loading,           // Loading state
  signInWithPassword, // Sign in function
  signUp,            // Sign up function
  signOut            // Sign out function
} = useAuth();
```

### Usage Example

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signInWithPassword } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithPassword('user@example.com', 'password123');
      // Success!
    } catch (error) {
      // Handle error
    }
  };

  return <div>{user?.email}</div>;
}
```

---

## Migration from Google OAuth

If you previously used Google OAuth, users will need to:
1. Sign up with email/password
2. Use the same email as their Google account (optional)
3. Set a new password

**Note:** Previous Google OAuth sessions will be invalidated.
