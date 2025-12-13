-- Disable RLS on all tables used by the application
-- Run this in Supabase SQL Editor if you're still getting RLS errors

-- Disable RLS on ContentItem
ALTER TABLE "ContentItem" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on User (if enabled)
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Session (if enabled)
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Book (if enabled)
ALTER TABLE "Book" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Chapter (if enabled)
ALTER TABLE "Chapter" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Audiobook (if enabled)
ALTER TABLE "Audiobook" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on BookReview (if enabled)
ALTER TABLE "BookReview" DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled (optional - check results)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ContentItem', 'User', 'Session', 'Book', 'Chapter', 'Audiobook', 'BookReview')
ORDER BY tablename;
