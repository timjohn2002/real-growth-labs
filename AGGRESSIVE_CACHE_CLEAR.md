# Aggressive Cache Clearing - The Browser is Using Old Code

## The Problem

Your code is correct (deployed), but the browser is using **very persistent cached JavaScript**. The console shows old code is still running.

## Solution: Multiple Methods to Try

### Method 1: Disable Cache in DevTools (Most Reliable)

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Check the box "Disable cache"** (at the top)
4. **Keep DevTools open** (important!)
5. **Refresh the page** (F5 or normal refresh)
6. **Try uploading**

This forces the browser to fetch fresh JavaScript while DevTools is open.

### Method 2: Clear All Site Data

1. **Open DevTools** (F12)
2. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)
3. **In the left sidebar, click "Clear storage"** or "Storage"
4. **Check ALL boxes:**
   - Cookies
   - Cache storage
   - IndexedDB
   - Local storage
   - Session storage
   - Service Workers (if any)
5. **Click "Clear site data"**
6. **Close and reopen the browser**
7. **Log in again**
8. **Try uploading**

### Method 3: Incognito/Private Window (Bypasses All Cache)

1. **Close ALL browser windows**
2. **Open a NEW incognito/private window:**
   - Chrome/Edge: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - Firefox: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. **Go to your app URL**
4. **Log in**
5. **Go to Content Vault**
6. **Try uploading**

This completely bypasses all cache.

### Method 4: Hard Refresh Multiple Times

1. **Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)**
2. **Wait for page to load**
3. **Press `Ctrl+Shift+R` again**
4. **Wait for page to load**
5. **Press `Ctrl+Shift+R` one more time**
6. **Try uploading**

Sometimes you need to do it multiple times.

### Method 5: Check for Service Workers

1. **Open DevTools** (F12)
2. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)
3. **Click "Service Workers" in the left sidebar**
4. **If you see any service workers:**
   - Click "Unregister" for each one
   - Refresh the page
5. **Try uploading**

Service workers can cache JavaScript aggressively.

## Verify New Code is Loaded

After trying any method above, check the console:

✅ **Correct (new code):**
```
[UploadForm] Starting server-side upload for large file...
```

❌ **Wrong (old cached code):**
```
[UploadForm] Starting Supabase Storage upload...
```

## Recommended Order

1. **Try Method 1 first** (Disable cache in DevTools) - easiest
2. **If that doesn't work, try Method 3** (Incognito window) - most reliable
3. **If still not working, try Method 2** (Clear all site data)

## Why This Happens

Next.js bundles JavaScript files with hashed filenames. Sometimes browsers cache these aggressively, especially if:
- You've visited the site many times
- The browser thinks the files haven't changed
- Service workers are caching files

The new code IS deployed, but your browser hasn't fetched it yet.
