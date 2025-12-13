# Supabase Service Role Key Setup

## Why This Is Needed

The app uses **custom authentication** (not Supabase Auth), so client-side Supabase uploads can't authenticate with `auth.uid()`. The Storage RLS policies require authentication, which was causing the "new row violates row-level security policy" error.

**Solution**: Use server-side uploads with the **service role key**, which bypasses RLS.

## Setup Steps

### 1. Get Your Service Role Key

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Find the **`service_role`** key (under "Project API keys")
5. **⚠️ IMPORTANT**: This key has admin privileges. Keep it secret!

### 2. Add to Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com)
2. Select your project (`real-growth-labs`)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Paste your service role key from step 1
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

### 3. Redeploy

After adding the environment variable:
- Vercel will automatically redeploy, OR
- Go to **Deployments** tab and click **Redeploy** on the latest deployment

### 4. Test Upload

Try uploading your large video file again. The upload should now work because:
- The server uses the service role key (bypasses RLS)
- Files are uploaded server-side, not client-side
- No authentication issues with Storage RLS

## How It Works

1. **Client** → Sends file to `/api/content/upload-large` (server endpoint)
2. **Server** → Uses `SUPABASE_SERVICE_ROLE_KEY` to upload to Supabase Storage (bypasses RLS)
3. **Server** → Returns file URL
4. **Client** → Calls `/api/content/upload-from-url` to process the file

## Security Note

The service role key has **full admin access** to your Supabase project. It:
- ✅ Bypasses all RLS policies
- ✅ Can read/write any data
- ✅ Should **NEVER** be exposed in client-side code
- ✅ Should **ONLY** be used in server-side API routes

This is safe because it's only used in `/api/content/upload-large`, which is a server-side endpoint.
