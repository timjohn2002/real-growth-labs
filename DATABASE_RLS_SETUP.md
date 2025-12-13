# Database RLS Policy Setup for ContentItem Table

## The Problem

You're getting "new row violates row-level security policy" because Supabase has RLS enabled on your database tables. Since you're using **custom authentication** (not Supabase Auth) with Prisma, RLS is blocking your database operations.

## Quick Fix (Recommended)

Since you're using **custom authentication with Prisma**, the simplest solution is to **disable RLS** for tables accessed via Prisma. Your API routes already handle authorization, so RLS is redundant.

### Disable RLS (Recommended)

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **"New query"**
3. Run this command:
   ```sql
   ALTER TABLE "ContentItem" DISABLE ROW LEVEL SECURITY;
   ```
4. Click **"Run"**

This allows Prisma (which uses direct database connection) to access the table without RLS restrictions. Your API routes already check authentication via `getUserIdFromRequest()`, so security is maintained.

### Alternative: Check Your DATABASE_URL

If you want to keep RLS enabled, ensure your `DATABASE_URL` in Vercel uses the **direct connection string** (not the anon key). 

**Check your DATABASE_URL format:**
- ✅ Correct: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
- ❌ Wrong: Uses `anon` key or PostgREST API

You can find the direct connection string in Supabase Dashboard → Settings → Database → Connection string → URI

---

## If You Must Use RLS (Not Recommended)

### Option 1: SQL Editor

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **"New query"**
3. Copy and paste the contents of `SUPABASE_DATABASE_RLS_POLICIES.sql`
4. Click **"Run"** to execute

### Option 2: Table Editor

1. Go to **Table Editor** in Supabase Dashboard
2. Find the **"ContentItem"** table
3. Click on it, then go to **"Policies"** tab
4. Click **"New Policy"**

**For INSERT Policy:**
- Policy name: `Users can insert their own content items`
- Allowed operation: `INSERT`
- Policy definition:
  ```sql
  "userId" = auth.uid()::text
  ```
- Target roles: `authenticated`

**For SELECT Policy:**
- Policy name: `Users can view their own content items`
- Allowed operation: `SELECT`
- Policy definition:
  ```sql
  "userId" = auth.uid()::text
  ```
- Target roles: `authenticated`

**For UPDATE Policy:**
- Policy name: `Users can update their own content items`
- Allowed operation: `UPDATE`
- Policy definition (USING):
  ```sql
  "userId" = auth.uid()::text
  ```
- Policy definition (WITH CHECK):
  ```sql
  "userId" = auth.uid()::text
  ```
- Target roles: `authenticated`

**For DELETE Policy:**
- Policy name: `Users can delete their own content items`
- Allowed operation: `DELETE`
- Policy definition:
  ```sql
  "userId" = auth.uid()::text
  ```
- Target roles: `authenticated`

## Important Note About User IDs

Your `ContentItem.userId` field is a `String` type. If your authentication system uses Supabase Auth, you need to ensure that:

1. The `userId` stored in `ContentItem` matches the authenticated user's ID
2. If using custom auth (not Supabase Auth), you may need different policies

### If Using Custom Auth (Not Supabase Auth)

If you're using a custom authentication system (not Supabase Auth), the `auth.uid()` function won't work. You'll need to:

1. **Option A**: Disable RLS for this table (not recommended for production)
   ```sql
   ALTER TABLE "ContentItem" DISABLE ROW LEVEL SECURITY;
   ```

2. **Option B**: Use service role key for database operations (your API routes already do this via Prisma with `DATABASE_URL`)

3. **Option C**: Create a function that maps your custom auth to Supabase auth

## Verify Policies

After creating policies:

1. Go to **Table Editor** → **ContentItem** → **Policies** tab
2. You should see 4 policies listed:
   - Users can insert their own content items (INSERT)
   - Users can view their own content items (SELECT)
   - Users can update their own content items (UPDATE)
   - Users can delete their own content items (DELETE)

## Testing

1. Try uploading a video file again
2. If it works, the policies are set up correctly
3. If you still get errors, check:
   - Policies are enabled (not disabled)
   - `userId` field matches your auth system
   - User is authenticated

## Troubleshooting

### "permission denied" still appears
- Check that policies are created and enabled
- Verify `userId` field type matches your auth system
- Ensure user is authenticated

### Policies not working
- Make sure RLS is enabled: `ALTER TABLE "ContentItem" ENABLE ROW LEVEL SECURITY;`
- Check that policies are not disabled
- Verify the policy conditions match your data structure
