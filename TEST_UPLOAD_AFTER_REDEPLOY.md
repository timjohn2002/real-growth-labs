# Test Upload After Redeploy

## ✅ Environment Variable is Set

Your `SUPABASE_SERVICE_ROLE_KEY` is already configured in Vercel. The value format (JWT starting with `eyJ...`) is correct.

## Next Steps

### 1. Redeploy Your App

The new code that uses the service role key needs to be deployed:

1. Go to **Deployments** tab in Vercel
2. Find your latest deployment
3. Click the **three dots** (⋯) menu
4. Click **Redeploy**
5. **Important**: Uncheck "Use existing Build Cache" to ensure fresh build
6. Wait for deployment to complete

### 2. Test the Upload

After redeployment completes:

1. Go to your Content Vault
2. Click **Add Content** → **Video Upload**
3. Select your large video file (the 70.38 MB one)
4. Add a title and tags
5. Click **Upload**

### 3. What Should Happen

✅ **Success indicators:**
- File uploads without RLS errors
- You see "Uploading..." then "Upload successful"
- File appears in Content Vault
- Processing starts (for video transcription)

❌ **If you still see errors:**
- Check browser console (F12) for any client-side errors
- Check Vercel logs for `[upload-large]` entries
- Share the error message

## How to Check Logs

If you want to verify it's working:

1. **Browser Console** (F12):
   - Look for `[UploadForm] Starting server-side upload...`
   - Should NOT see "StorageApiError: new row violates row-level security policy"

2. **Vercel Logs**:
   - Go to **Deployments** → Click on latest deployment
   - Go to **Functions** tab
   - Look for `/api/content/upload-large` function logs
   - Should see: `[upload-large] Uploading file to Supabase Storage...`
   - Should see: `[upload-large] File uploaded successfully`

## Expected Flow

1. **Client** → Sends file to `/api/content/upload-large` (server)
2. **Server** → Uses `SUPABASE_SERVICE_ROLE_KEY` to upload to Supabase Storage ✅ (bypasses RLS)
3. **Server** → Returns file URL
4. **Client** → Calls `/api/content/upload-from-url` to process file
5. **Server** → Creates ContentItem in database ✅ (RLS disabled on ContentItem table)

The RLS error should be completely gone now!
