# Supabase Storage File Size Limit

## The Error

"The object exceeded the maximum allowed size" means Supabase Storage is rejecting the 70.38 MB file.

## Supabase Storage Limits

Supabase has default file size limits:
- **Free tier**: Usually 50MB per file
- **Pro tier**: Can be configured up to 5GB per file
- **Enterprise**: Custom limits

## Solution: Increase File Size Limit

### Option 1: Increase via Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard** → **Storage**
2. **Click on `content-vault` bucket**
3. **Click "Edit bucket"** (or settings)
4. **Look for "File size limit"** or "Max file size"
5. **Increase it to at least 100MB** (or higher if needed)
6. **Save**

### Option 2: Increase via SQL

Run this in Supabase SQL Editor:

```sql
-- Update bucket file size limit (in bytes)
-- 100MB = 104857600 bytes
-- 500MB = 524288000 bytes
-- 1GB = 1073741824 bytes

UPDATE storage.buckets
SET file_size_limit = 524288000  -- 500MB
WHERE id = 'content-vault';
```

### Option 3: Check Current Limit

First, check what the current limit is:

```sql
SELECT 
  id,
  name,
  file_size_limit,
  CASE 
    WHEN file_size_limit IS NULL THEN 'No limit set (uses default)'
    WHEN file_size_limit < 104857600 THEN CONCAT(ROUND(file_size_limit / 1024 / 1024, 2), ' MB')
    ELSE CONCAT(ROUND(file_size_limit / 1024 / 1024 / 1024, 2), ' GB')
  END as limit_display
FROM storage.buckets
WHERE id = 'content-vault';
```

## Recommended Settings

For video uploads, set the limit to at least **500MB** (524288000 bytes):

```sql
UPDATE storage.buckets
SET file_size_limit = 524288000  -- 500MB
WHERE id = 'content-vault';
```

## After Increasing Limit

1. **Wait a few seconds** for the change to propagate
2. **Try uploading your video file again**
3. **The upload should work now**

## Alternative: Chunked Uploads

If you can't increase the limit, we can implement chunked uploads (splitting the file into smaller pieces). But increasing the limit is much simpler.

## Check Your Supabase Plan

- **Free tier**: May have stricter limits
- **Pro tier**: Can set custom limits
- Check your plan in Supabase Dashboard → Settings → Billing
