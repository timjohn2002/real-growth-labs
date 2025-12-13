# RLS Troubleshooting Guide

## Still Getting "new row violates row-level security policy" Error?

If you've disabled RLS on `ContentItem` but still get the error, try these steps:

### Step 1: Check All Tables

The error might be coming from a different table. Run this to check which tables have RLS enabled:

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

If any table shows `rowsecurity = true`, disable it:

```sql
ALTER TABLE "TableName" DISABLE ROW LEVEL SECURITY;
```

### Step 2: Disable RLS on All Tables

Run the `DISABLE_ALL_RLS.sql` script to disable RLS on all application tables at once.

### Step 3: Check Your DATABASE_URL

Your `DATABASE_URL` in Vercel should use the **direct connection string** (not the anon key).

**Correct format:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Or the direct connection:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Where to find it:**
1. Go to Supabase Dashboard
2. Settings → Database
3. Connection string → URI (or Transaction mode)
4. Copy the connection string
5. Update `DATABASE_URL` in Vercel

### Step 4: Verify Connection Type

Make sure your `DATABASE_URL` doesn't contain:
- `anon` key
- `service_role` key in the URL path
- PostgREST API endpoints

It should be a direct PostgreSQL connection string.

### Step 5: Check Storage RLS (If Using Supabase Storage)

If you're uploading to Supabase Storage, make sure storage policies are set up correctly (see `SUPABASE_RLS_SETUP_GUIDE.md`).

### Step 6: Test with Direct Query

Try running this in SQL Editor to test if RLS is the issue:

```sql
-- This should work if RLS is properly disabled
INSERT INTO "ContentItem" ("id", "userId", "title", "type", "status", "tags")
VALUES ('test-id', 'test-user', 'Test', 'video', 'pending', '[]');
```

If this fails, RLS might still be enabled or there's another issue.

## Common Issues

### Issue: "Still getting error after disabling RLS"
**Solution:** 
- Check if you're using the correct database connection
- Verify the table name matches exactly (case-sensitive)
- Try disabling RLS on related tables (User, Session)

### Issue: "Error persists after all fixes"
**Solution:**
- Check Vercel logs for the exact error
- Verify your `DATABASE_URL` uses direct connection
- Make sure you're not using Supabase's REST API by mistake

### Issue: "Works in SQL Editor but not in app"
**Solution:**
- Your `DATABASE_URL` might be using a different connection
- Check Vercel environment variables
- Ensure connection string is the direct PostgreSQL connection

## Quick Fix Script

Run this to disable RLS on all tables and verify:

```sql
-- Disable RLS on all tables
ALTER TABLE "ContentItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Book" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Chapter" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Audiobook" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "BookReview" DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('ContentItem', 'User', 'Session', 'Book', 'Chapter', 'Audiobook', 'BookReview');
```

All `rowsecurity` values should be `false`.
