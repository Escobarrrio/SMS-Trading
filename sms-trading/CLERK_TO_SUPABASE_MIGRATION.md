# Clerk to Supabase Auth Migration Guide

This document outlines the migration from Clerk to Supabase Auth for the SMS Trading platform.

## Overview

The application has been migrated from Clerk to Supabase Auth, which is tightly integrated with Supabase infrastructure and supports geographic distribution through Supabase's regional instances.

## Key Changes

### 1. Dependencies
- **Removed**: `@clerk/nextjs`, `@clerk/react`
- **Added**: `@supabase/ssr`, `@supabase/supabase-js` (already present)

### 2. Authentication Flow

#### Sign Up
- **File**: `app/sign-up/page.tsx`
- **Implementation**: Email/password form with custom UI
- **Email Confirmation**: Users must confirm email before accessing dashboard
- **Function**: `signUp(email, password)` from `lib/supabase-auth.ts`

#### Sign In
- **File**: `app/sign-in/page.tsx`
- **Implementation**: Email/password form with custom UI
- **Function**: `signIn(email, password)` from `lib/supabase-auth.ts`

#### Sign Out
- **Route**: `app/api/auth/signout/route.ts`
- **Behavior**: Signs out user and redirects to home page

### 3. Protected Routes

#### Middleware
- **File**: `middleware.ts`
- **Mechanism**: Uses `createServerClient` from `@supabase/ssr`
- **Protected Routes**: `/dashboard`, `/send`, `/contacts`, `/campaigns`, `/admin`
- **Behavior**: Redirects unauthenticated users to `/sign-in`

#### Server Components
- **Function**: `createServerSupabaseClient()` from `lib/supabase.ts`
- **Usage**: For server-side auth checks in pages

#### Client Components
- **Hook**: `supabase.auth.getUser()` from `lib/supabase.ts`
- **Usage**: For client-side auth state management

### 4. Database Schema Updates

#### Required Migration
Add a column to the `clients` table:
```sql
ALTER TABLE clients 
ADD COLUMN supabase_user_id UUID REFERENCES auth.users(id);
```

#### Update References
Replace all `clerk_id` references with `supabase_user_id`:
- `app/api/v1/campaigns/route.ts` - ✅ Updated
- `app/api/send-sms/route.ts` - ✅ Updated
- `app/api/check-balance/route.ts` - ✅ Updated

### 5. Auth Context

#### Function: `getClientContext(req: NextRequest)`
- **Location**: `lib/auth.ts`
- **Priority**:
  1. Check API key from `x-api-key` header
  2. Check Supabase JWT from `Authorization: Bearer` header
  3. Fall back to demo/preview mode
- **Returns**: `ClientContext` with `clientId`, `isAdmin`, and `supabaseUserId`

### 6. UI Pages

#### Home Page (`app/page.tsx`)
- Removed `ClerkProvider`
- Replaced `UserButton` with custom Sign Out link
- Auth check via `createServerSupabaseClient()`

#### Dashboard (`app/dashboard/page.tsx`)
- Replaced `useAuth()` hook with Supabase client
- Auth check with redirect to sign-in if not authenticated

#### Admin Page (`app/admin/page.tsx`)
- Replaced Clerk auth with `createServerSupabaseClient()`
- Still checks `is_admin` flag in clients table

### 7. Helper Functions

#### New Auth Utilities (`lib/supabase-auth.ts`)
```typescript
- signUp(email, password)
- signIn(email, password)
- signOut()
- getCurrentUser()
- getCurrentSession()
- resetPassword(email)
- updatePassword(newPassword)
- onAuthStateChange(callback)
```

## Database Migration Steps

1. **Add column to clients table**:
```sql
ALTER TABLE clients 
ADD COLUMN supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

2. **Migrate existing Clerk IDs to Supabase IDs** (if migrating existing data):
```sql
-- This would require mapping old Clerk IDs to new Supabase IDs
-- Contact Supabase support for migration assistance
```

3. **Update RLS policies**:
```sql
-- Ensure policies use supabase_user_id instead of clerk_id
CREATE POLICY "Users can see their own data"
  ON clients
  FOR SELECT
  USING (auth.uid() = supabase_user_id);
```

## Testing Checklist

- [ ] Sign up with new email address
- [ ] Verify email confirmation works
- [ ] Sign in with email and password
- [ ] Access dashboard after sign-in
- [ ] Verify API key authentication still works
- [ ] Test sign out functionality
- [ ] Verify redirect to sign-in for protected routes
- [ ] Test admin panel access for admin users
- [ ] Verify middleware protects all protected routes

## Environment Variables

Ensure the following Supabase environment variables are set:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
NEXT_PUBLIC_APP_URL=http://localhost:3000 (or production URL)
```

## Breaking Changes

1. **User IDs**: All user references now use Supabase UUIDs instead of Clerk IDs
2. **Session Management**: Sessions are managed via HTTP-only cookies (automatic)
3. **API Authentication**: JWT tokens must be sent in `Authorization: Bearer` header
4. **Admin Panel**: No longer uses Clerk's user management, relies on `is_admin` flag in database

## Rollback

If needed to revert to Clerk:
1. Restore from git: `git checkout HEAD -- middleware.ts app/layout.tsx`
2. Reinstall Clerk: `npm install @clerk/nextjs`
3. Revert database schema to use `clerk_id`
4. Revert auth implementation to use Clerk helpers

## Support

For issues with Supabase Auth, refer to:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
