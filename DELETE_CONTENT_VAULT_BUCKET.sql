-- Delete all files from content-vault bucket
-- Run this in Supabase SQL Editor

-- Method 1: Delete all files (keeps the bucket)
DELETE FROM storage.objects
WHERE bucket_id = 'content-vault';

-- Verify deletion
SELECT COUNT(*) as remaining_files
FROM storage.objects
WHERE bucket_id = 'content-vault';
-- Should return 0

