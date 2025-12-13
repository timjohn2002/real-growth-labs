# Verify Deployment and Test Upload

## ✅ Database RLS is Fixed

Your `ContentItem` table now shows:
- `rowsecurity`: `false` ✅
- `status`: `✔ RLS DISABLED` ✅

## Next Steps

### 1. Verify Code is Deployed

The new `/api/content/upload-large` endpoint needs to be deployed. Check:

1. **Go to Vercel → Deployments**
2. **Check the latest deployment:**
   - Is it from after we created the new endpoint?
   - Look for a deployment that includes the new `/api/content/upload-large` file
3. **If not deployed yet:**
   - Go to **Deployments** tab
   - Click **three dots** (⋯) on latest deployment
   - Click **Redeploy**
   - **Uncheck** "Use existing Build Cache"
   - Wait for deployment to complete

### 2. Clear Browser Cache

The browser might be using old JavaScript:

1. **Hard refresh** the page:
   - **Chrome/Edge**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - **Firefox**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. Or **open in incognito/private window**

### 3. Test Upload with Console Open

1. **Open browser console** (F12)
2. **Go to Console tab**
3. **Try uploading your video file**
4. **Look for these log messages:**
   - `[UploadForm] Starting server-side upload for large file...` ✅ (new code)
   - `[upload-large] Uploading file to Supabase Storage...` ✅ (server logs)
   - `[UploadForm] File uploaded successfully to Supabase Storage` ✅

**If you see:**
- `[UploadForm] Starting Supabase Storage upload...` ❌ (old code - not deployed yet)
- `StorageApiError: new row violates row-level security policy` ❌ (old code or storage RLS issue)

### 4. Check Vercel Logs

1. **Go to Vercel → Deployments**
2. **Click on latest deployment**
3. **Go to Functions tab**
4. **Look for `/api/content/upload-large` function**
5. **Check logs during upload attempt**

You should see:
- `[upload-large] Uploading file to Supabase Storage: content-vault/...`
- `[upload-large] File uploaded successfully: ...`

## Expected Flow (New Code)

1. ✅ Client sends file to `/api/content/upload-large` (server)
2. ✅ Server uses `SUPABASE_SERVICE_ROLE_KEY` → uploads to Storage (bypasses RLS)
3. ✅ Server returns file URL
4. ✅ Client calls `/api/content/upload-from-url`
5. ✅ Server creates `ContentItem` in database (RLS disabled ✅)

## If Still Getting Errors

Share:
1. **Browser console logs** (F12 → Console tab)
2. **Vercel function logs** (from `/api/content/upload-large`)
3. **Exact error message**
