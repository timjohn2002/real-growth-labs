-- Storage RLS Policies for content-vault bucket
-- Run these in Supabase SQL Editor
-- These policies control access to files in Supabase Storage

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to content-vault"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-vault');

-- Policy 2: Allow authenticated users to read their files
CREATE POLICY "Allow authenticated reads from content-vault"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'content-vault');

-- Policy 3: Allow authenticated users to update their files
CREATE POLICY "Allow authenticated updates to content-vault"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content-vault')
WITH CHECK (bucket_id = 'content-vault');

-- Policy 4: Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated deletes from content-vault"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-vault');

-- Verify policies were created
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%content-vault%';
