# Verify Vercel Environment Variable

## The Variable Already Exists

The error message shows that `SUPABASE_SERVICE_ROLE_KEY` already exists in Vercel. This is good! You just need to verify it's correct.

## Steps to Verify

### 1. Check Existing Variables

1. In Vercel, go to **Settings** → **Environment Variables**
2. Look for `SUPABASE_SERVICE_ROLE_KEY` in the list
3. Click on it to view/edit (you should see the value masked)

### 2. Verify the Value

The value should start with `sb_secret_` (Supabase service role keys always start with this prefix).

If the value looks correct:
- ✅ You're all set! Just need to redeploy.

If you need to update it:
- Click **Edit** on the existing variable
- Update the value
- Save

### 3. Redeploy

After verifying/updating:
1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Make sure **"Use existing Build Cache"** is **unchecked** (to ensure env vars are refreshed)

## Quick Test

After redeploying, try uploading your video file again. The upload should work now!

## If You Still Get Errors

If you still see RLS errors after redeploying:
1. Check Vercel logs during upload
2. Look for `[upload-large]` log entries
3. Verify the service role key is being used (you'll see "Uploading file to Supabase Storage" in logs)
