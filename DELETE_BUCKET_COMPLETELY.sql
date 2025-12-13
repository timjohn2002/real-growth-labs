-- Delete the entire content-vault bucket and all its files
-- Run this in Supabase SQL Editor

-- Step 1: Delete all files first
DELETE FROM storage.objects
WHERE bucket_id = 'content-vault';

-- Step 2: Delete the bucket itself
DELETE FROM storage.buckets
WHERE id = 'content-vault';

-- Verify deletion
SELECT * FROM storage.buckets WHERE id = 'content-vault';
-- Should return no rows

-- If you want to recreate it later, run:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('content-vault', 'content-vault', false);

