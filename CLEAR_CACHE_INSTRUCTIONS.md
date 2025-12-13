# Clear Browser Cache - Step by Step

## The Problem

Your browser is using **cached JavaScript** from before the deployment. The console shows the old code is still running.

## Solution: Force Reload New Code

### Option 1: Hard Refresh (Easiest)

1. **Make sure you're on the Content Vault page**
2. **Press these keys at the same time:**
   - **Windows/Linux**: `Ctrl + Shift + R`
   - **Mac**: `Cmd + Shift + R`
3. **Wait for the page to reload**
4. **Try uploading again**

### Option 2: Clear Cache via DevTools

1. **Open DevTools** (F12)
2. **Right-click the refresh button** (next to the address bar)
3. **Select "Empty Cache and Hard Reload"**
4. **Wait for the page to reload**
5. **Try uploading again**

### Option 3: Incognito/Private Window (Most Reliable)

1. **Open a new incognito/private window:**
   - **Chrome**: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - **Firefox**: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - **Edge**: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
2. **Log in to your app**
3. **Go to Content Vault**
4. **Try uploading**

### Option 4: Clear All Site Data

1. **Open DevTools** (F12)
2. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)
3. **Click "Clear site data"** or "Clear storage"
4. **Check all boxes**
5. **Click "Clear site data"**
6. **Refresh the page**
7. **Log in again**
8. **Try uploading**

## Verify New Code is Loaded

After clearing cache, open the console (F12) and look for:

✅ **New code (correct):**
```
[UploadForm] Starting server-side upload for large file...
```

❌ **Old code (wrong - cache still active):**
```
[UploadForm] Starting Supabase Storage upload...
```

## After Cache is Cleared

Once you see "Starting server-side upload", the upload should work because:
- File goes to `/api/content/upload-large` (server)
- Server uses service role key (bypasses Storage RLS)
- Database RLS is disabled ✅

Try it now!
