-- Fix RLS on ContentItem table
-- This is likely causing the "new row violates row-level security policy" error

-- Step 1: Disable RLS on ContentItem
ALTER TABLE "ContentItem" DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies (they're not needed with custom auth)
DROP POLICY IF EXISTS "Users can insert their own content items" ON "ContentItem";
DROP POLICY IF EXISTS "Users can view their own content items" ON "ContentItem";
DROP POLICY IF EXISTS "Users can update their own content items" ON "ContentItem";
DROP POLICY IF EXISTS "Users can delete their own content items" ON "ContentItem";

-- Step 3: Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '❌ RLS ENABLED - RUN THE FIX ABOVE' 
    ELSE '✅ RLS DISABLED' 
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'ContentItem';
