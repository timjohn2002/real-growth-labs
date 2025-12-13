-- Check existing Storage policies for content-vault bucket
-- Run this to see what policies currently exist

SELECT 
  policyname,
  cmd as operation,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%content-vault%'
ORDER BY policyname;
