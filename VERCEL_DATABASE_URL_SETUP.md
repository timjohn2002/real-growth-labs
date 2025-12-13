# Vercel DATABASE_URL Setup for Supabase

## The Problem

Your direct connection string shows "Not IPv4 compatible", but Vercel runs on IPv4 networks. This can cause connection issues.

## Solution: Use Session Pooler

### Step 1: Get Session Pooler Connection String

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Find **"Connection string"** section
3. Change the dropdown from **"Direct connection"** to **"Session Pooler"**
4. Keep **"URI"** selected
5. Copy the connection string (it will look different)

**Session Pooler format:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 2: Update Vercel Environment Variable

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. Update it with the **Session Pooler** connection string
5. Make sure to replace `[YOUR_PASSWORD]` with your actual database password
6. Click **"Save"**
7. **Redeploy** your application (or wait for auto-deploy)

### Step 3: Verify Connection

After updating, your connection should work. The Session Pooler:
- ✅ Is IPv4 compatible (works with Vercel)
- ✅ Handles connection pooling better
- ✅ Works well with serverless functions

## Alternative: Transaction Mode Pooler

If Session Pooler doesn't work, try **"Transaction mode"** pooler:
- Same steps as above
- Select **"Transaction mode"** instead of "Session Pooler"
- Copy that connection string

## Important Notes

1. **Password**: Make sure you replace `[YOUR_PASSWORD]` with your actual database password
   - You can reset it in Supabase Dashboard → Settings → Database → Reset database password

2. **Connection String Format**: Should look like:
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   NOT like:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```

3. **Redeploy**: After changing environment variables, Vercel needs to redeploy for changes to take effect

## Still Getting RLS Error?

Even with the correct connection string, if you still get RLS errors:

1. Make sure RLS is disabled on all tables (run `DISABLE_ALL_RLS.sql`)
2. Verify in SQL Editor:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```
3. All `rowsecurity` should be `false`
