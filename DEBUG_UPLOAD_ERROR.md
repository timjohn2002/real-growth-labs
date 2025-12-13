# Debug Upload Error

## The Error is Still Happening

The "new row violates row-level security policy" error could be coming from:

1. **Storage RLS** (if the new code isn't deployed yet)
2. **Database RLS** on `ContentItem` table (more likely)

## Quick Debug Steps

### 1. Check Browser Console

Open browser console (F12) and look for:
- Which endpoint is failing?
- Is it `/api/content/upload-large` or `/api/content/upload-from-url`?
- What's the exact error message?

### 2. Check Vercel Logs

1. Go to Vercel → **Deployments**
2. Click on the latest deployment
3. Go to **Functions** tab
4. Look for logs from:
   - `/api/content/upload-large`
   - `/api/content/upload-from-url`

Look for:
- `[upload-large] Uploading file to Supabase Storage...` (should appear)
- `[upload-from-url] Creating content item...` (might show RLS error here)

### 3. Verify Database RLS is Disabled

Run this in Supabase SQL Editor:

```sql
-- Check if RLS is disabled on ContentItem
SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '❌ RLS ENABLED' 
    ELSE '✅ RLS DISABLED' 
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'ContentItem';
```

If it shows "RLS ENABLED", run:

```sql
ALTER TABLE "ContentItem" DISABLE ROW LEVEL SECURITY;
```

### 4. Verify Code is Deployed

Check if the new `/api/content/upload-large` endpoint exists:
- In Vercel logs, you should see `[upload-large]` log entries
- If you don't see them, the code might not be deployed yet

## Most Likely Issue

The error is probably from the **database insert** in `/api/content/upload-from-url` when it tries to create a `ContentItem`. The `ContentItem` table might still have RLS enabled.

**Fix**: Disable RLS on `ContentItem` table (see step 3 above).
