-- RLS Policies for ContentItem table
-- IMPORTANT: You're using custom authentication (not Supabase Auth)
-- Since Prisma uses direct database connection, the simplest solution is to DISABLE RLS

-- Option 1: DISABLE RLS (Recommended for custom auth with Prisma)
-- This allows Prisma to access the table directly without RLS restrictions
ALTER TABLE "ContentItem" DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, you need to ensure your DATABASE_URL
-- uses a connection that bypasses RLS. Check your DATABASE_URL in Vercel:
-- It should use the direct connection string (not the anon key connection)
-- Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

-- Option 3: If you must use RLS with custom auth, create policies that allow service role
-- (This is complex and not recommended - Option 1 is better)
