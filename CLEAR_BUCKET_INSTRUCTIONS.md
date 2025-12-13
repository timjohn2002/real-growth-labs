# Clear Content Vault Bucket - Multiple Methods

## Method 1: Delete All Files (Keeps Bucket) - RECOMMENDED

### Via SQL Editor (Fastest)

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Run this SQL:**

```sql
-- Delete all files from content-vault bucket
DELETE FROM storage.objects
WHERE bucket_id = 'content-vault';

-- Verify deletion
SELECT COUNT(*) as remaining_files
FROM storage.objects
WHERE bucket_id = 'content-vault';
```

3. **The count should be 0** - all files deleted ✅

### Via Supabase Dashboard (Visual)

1. **Go to Supabase Dashboard** → **Storage**
2. **Click on `content-vault` bucket**
3. **Select all files** (check the box at the top)
4. **Click "Delete" button**
5. **Confirm deletion**

## Method 2: Delete Entire Bucket (Complete Reset)

If you want to delete the bucket entirely and start fresh:

### Via SQL Editor

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Run this SQL:**

```sql
-- Step 1: Delete all files
DELETE FROM storage.objects
WHERE bucket_id = 'content-vault';

-- Step 2: Delete the bucket
DELETE FROM storage.buckets
WHERE id = 'content-vault';
```

3. **Recreate the bucket** (if needed):

```sql
-- Create the bucket again
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-vault', 'content-vault', false);
```

4. **Re-run Storage RLS policies** (from `FIX_STORAGE_POLICIES.sql`)

### Via Supabase Dashboard

1. **Go to Supabase Dashboard** → **Storage**
2. **Click on `content-vault` bucket**
3. **Click the three dots** (⋯) menu
4. **Click "Delete bucket"**
5. **Confirm deletion**
6. **Create a new bucket** named `content-vault` (private)
7. **Re-run Storage RLS policies**

## Method 3: Quick Reset (Recommended for Fresh Start)

If you want to completely start over:

1. **Delete all files** (Method 1)
2. **Keep the bucket** (no need to recreate)
3. **Re-run Storage RLS policies** (just to be safe):

```sql
-- From FIX_STORAGE_POLICIES.sql
DROP POLICY IF EXISTS "Allow authenticated uploads to content-vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from content-vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to content-vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from content-vault" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to content-vault"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-vault');

CREATE POLICY "Allow authenticated reads from content-vault"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'content-vault');

CREATE POLICY "Allow authenticated updates to content-vault"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content-vault');

CREATE POLICY "Allow authenticated deletes from content-vault"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-vault');
```

## After Clearing

Once you've cleared the bucket:

1. ✅ **Bucket is empty**
2. ✅ **Storage RLS policies are set** (if you re-ran them)
3. ✅ **Database RLS is disabled** on ContentItem ✅
4. ✅ **Service role key is set** in Vercel ✅
5. ✅ **New code is deployed** (but browser cache issue remains)

## Next Steps After Clearing

1. **Clear browser cache** (use incognito window)
2. **Try uploading again**
3. **The upload should work** because:
   - Server uses service role key (bypasses Storage RLS)
   - Database RLS is disabled
   - Fresh bucket with no conflicts

## Quick SQL (Copy-Paste Ready)

**Just delete files (recommended):**
```sql
DELETE FROM storage.objects WHERE bucket_id = 'content-vault';
```

**Delete everything and recreate:**
```sql
DELETE FROM storage.objects WHERE bucket_id = 'content-vault';
DELETE FROM storage.buckets WHERE id = 'content-vault';
INSERT INTO storage.buckets (id, name, public) VALUES ('content-vault', 'content-vault', false);
```

