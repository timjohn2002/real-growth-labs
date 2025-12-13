-- Verify RLS is disabled on all tables
-- Run this to check the current RLS status

SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '❌ RLS ENABLED' 
    ELSE '✅ RLS DISABLED' 
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ContentItem', 'User', 'Session', 'Book', 'Chapter', 'Audiobook', 'BookReview')
ORDER BY tablename;

-- Also check if there are any RLS policies still active
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('ContentItem', 'User', 'Session', 'Book', 'Chapter', 'Audiobook', 'BookReview')
ORDER BY tablename, policyname;
