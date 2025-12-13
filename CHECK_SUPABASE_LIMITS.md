# Check Supabase Project Limits

## The Issue

Even though your bucket limit is set to 500MB, you're getting "The object exceeded the maximum allowed size" error for a 70MB file.

This suggests there might be a **project-level limit** that's different from the bucket limit.

## Check Project Settings

1. **Go to Supabase Dashboard** → **Settings** → **API**
2. **Look for "File size limits"** or "Storage limits"
3. **Check your plan limits:**
   - Free tier might have stricter limits
   - Pro tier should allow larger files

## Check Storage Settings

1. **Go to Supabase Dashboard** → **Storage**
2. **Click on Settings** (gear icon)
3. **Look for global file size limits**

## Alternative: Use Direct Storage Hostname

Supabase recommends using the direct storage hostname for large file uploads for better performance:

Instead of: `https://project-id.supabase.co`
Use: `https://project-id.storage.supabase.co`

This is already handled by the Supabase client library, but you can verify it's using the correct endpoint.

## Check Your Supabase Plan

- **Free tier**: May have a 50MB limit per file
- **Pro tier**: Should support up to 5GB per file
- **Enterprise**: Custom limits

## Solution: Upgrade Plan or Contact Support

If you're on the free tier and hitting limits:
1. **Upgrade to Pro tier** (if needed)
2. **Or contact Supabase support** to increase limits
3. **Or implement TUS resumable uploads** (more complex but works on all plans)

## Quick Check

Run this SQL to check all bucket limits:

```sql
SELECT 
  id,
  name,
  file_size_limit,
  CASE 
    WHEN file_size_limit IS NULL THEN 'No limit set'
    ELSE CONCAT(ROUND(file_size_limit / 1024 / 1024, 2), ' MB')
  END as limit_display
FROM storage.buckets;
```

## Next Steps

1. Check your Supabase plan and limits
2. If on free tier, consider upgrading or using resumable uploads
3. Contact Supabase support if limits seem incorrect
