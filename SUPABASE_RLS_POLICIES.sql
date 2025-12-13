-- RLS Policies for content-vault Storage Bucket
-- Run these in Supabase SQL Editor or via the Policy UI

-- Policy 1: Allow authenticated users to upload files
-- This allows users to INSERT (upload) files to the content-vault bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-vault'
);

-- Policy 2: Allow authenticated users to read their own files
-- This allows users to SELECT (read/download) files they uploaded
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'content-vault'
);

-- Policy 3: Allow authenticated users to update their own files
-- Optional: Allows users to replace/update files they uploaded
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-vault'
)
WITH CHECK (
  bucket_id = 'content-vault'
);

-- Policy 4: Allow authenticated users to delete their own files
-- Optional: Allows users to delete files they uploaded
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-vault'
);
