-- Storage RLS Policies for content-vault bucket
-- This script drops existing policies and recreates them
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist (to avoid "already exists" errors)
DROP POLICY IF EXISTS "Allow authenticated uploads to content-vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from content-vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to content-vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from content-vault" ON storage.objects;

-- Create policies
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
USING (bucket_id = 'content-vault')
WITH CHECK (bucket_id = 'content-vault');

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
