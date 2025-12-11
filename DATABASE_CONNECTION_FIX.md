# Database Connection Fix

## Issue
The error shows: `Can't reach database server at aws-1-us-east-2.pooler.supabase.com:5432`

## Solution

### For Vercel Deployment

1. **Check your DATABASE_URL in Vercel Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Make sure `DATABASE_URL` is set correctly

2. **Use Session Pooler Connection String (Recommended for Serverless)**
   
   Supabase provides two types of connection strings:
   - **Direct Connection** (port 5432) - Can have connection limits
   - **Session Pooler** (port 6543) - Better for serverless/Vercel
   
   **For Vercel, use the Session Pooler connection string:**
   
   Format: `postgresql://postgres:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true`
   
   Note: Port should be **6543** (session pooler), not 5432 (direct connection)

3. **Get the Correct Connection String from Supabase:**
   - Go to Supabase Dashboard → Your Project → Settings → Database
   - Under "Connection string", select **"Session mode"** (not Transaction mode)
   - Copy the connection string
   - It should look like: `postgresql://postgres.xxxxx:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres`
   - Make sure it has `?pgbouncer=true` at the end

4. **Update Vercel Environment Variable:**
   - Replace the `DATABASE_URL` in Vercel with the Session Pooler connection string
   - Redeploy your application

### For Local Development

Make sure your `.env.local` file has the correct connection string:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Why This Happens

- Vercel serverless functions have connection limits
- Direct connections (port 5432) can exhaust connection pools
- Session pooler (port 6543) is designed for serverless environments
- The pooler manages connections more efficiently

## Testing

After updating the connection string:
1. Redeploy on Vercel
2. Try uploading a YouTube video again
3. The transcription should now save to the database successfully

## Additional Notes

- The retry logic I added will help with temporary connection issues
- But the root cause is likely the connection string format
- Always use Session Pooler for Vercel/serverless deployments

