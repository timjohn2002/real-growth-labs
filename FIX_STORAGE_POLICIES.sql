-- Fix Storage RLS Policies for content-vault bucket
-- This ensures all required policies exist and are correct

-- Drop ALL existing policies for content-vault (clean slate)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname LIKE '%content-vault%'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

-- Create the 4 essential policies
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

-- Verify the policies
SELECT 
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%content-vault%'
ORDER BY cmd;
