# Vercel Database Connection Fix

## Current Error
```
Can't reach database server at 'db.mnquuahylkjkubczkmoy.supabase.co:6543'
```

## Issue
The connection string is pointing to the wrong hostname. It should use the **pooler** hostname, not the direct database hostname.

## Solution

### Step 1: Get the Correct Connection String from Supabase

1. Go to Supabase Dashboard → Your Project → Settings → Database
2. Click "Connection string" or "Connect to your project"
3. Make sure:
   - **Type:** URI
   - **Source:** Primary Database  
   - **Method:** Session pooler
4. Copy the connection string

### Step 2: Verify the Connection String Format

The connection string should look like:
```
postgresql://postgres.mnquuahylkjkubczkmoy:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key points:**
- Hostname should be: `aws-1-us-east-2.pooler.supabase.com` (NOT `db.mnquuahylkjkubczkmoy.supabase.co`)
- Port should be: `6543` (for session pooler)
- Should include: `?pgbouncer=true` at the end

### Step 3: Update Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `DATABASE_URL`
3. **Delete the old one** if it exists
4. **Add new one:**
   - Key: `DATABASE_URL`
   - Value: Paste the connection string from Supabase (with port 6543)
   - Make sure to replace `[YOUR-PASSWORD]` with your actual database password
5. **Important:** Select all environments (Production, Preview, Development)
6. Click "Save"

### Step 4: Check Database Status

1. Go to Supabase Dashboard → Your Project
2. Check if the database is **paused** (free tier databases pause after inactivity)
3. If paused, click "Restore" or "Resume" to wake it up
4. Wait a few minutes for it to fully start

### Step 5: Verify Connection String in Vercel

After updating, the connection string in Vercel should have:
- ✅ Hostname: `aws-1-us-east-2.pooler.supabase.com` (or similar pooler hostname)
- ✅ Port: `6543`
- ✅ `?pgbouncer=true` at the end
- ❌ NOT: `db.mnquuahylkjkubczkmoy.supabase.co` (this is the direct connection, not pooler)

### Step 6: Redeploy

1. After updating the environment variable, trigger a new deployment
2. Or push a new commit to trigger automatic deployment
3. Check the build logs to see if the connection works

## Common Issues

### Issue 1: Database is Paused
- **Symptom:** Connection timeout
- **Solution:** Resume the database in Supabase dashboard

### Issue 2: Wrong Hostname
- **Symptom:** Can't reach database server
- **Solution:** Use pooler hostname (`aws-1-us-east-2.pooler.supabase.com`), not direct (`db.xxx.supabase.co`)

### Issue 3: Wrong Port
- **Symptom:** Connection refused
- **Solution:** Use port `6543` for session pooler, not `5432`

### Issue 4: Missing Password
- **Symptom:** Authentication failed
- **Solution:** Make sure `[YOUR-PASSWORD]` is replaced with actual password

## Testing

After fixing, you should see in Vercel build logs:
- ✅ No "Failed to connect to database" errors
- ✅ Successful Prisma client generation
- ✅ Build completes successfully

