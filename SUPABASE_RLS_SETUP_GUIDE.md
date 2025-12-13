# Supabase RLS Policy Setup Guide

## ⚠️ IMPORTANT: Two Types of RLS Policies

Supabase has **TWO separate RLS systems**:
1. **Database Table RLS** - Controls access to database tables (ContentItem, User, etc.)
2. **Storage Bucket RLS** - Controls access to files in Storage buckets (content-vault)

You need to configure BOTH!

---

## Part 1: Storage Bucket RLS Policies (For File Uploads)

This is what's causing your upload error! The `storage.objects` table needs RLS policies.

### Step 1: Go to Storage Policies

1. In Supabase Dashboard, go to **Storage**
2. Click on your **"content-vault"** bucket
3. Go to the **"Policies"** tab
4. You should see sections for "Buckets" and "Schema"

### Step 2: Create Storage Policies

Under the **"OTHER POLICIES UNDER STORAGE.OBJECTS"** section, click **"New policy"** and create these:

**Policy 1: Allow authenticated uploads (INSERT)**
- Policy name: `Allow authenticated uploads to content-vault`
- Allowed operation: `INSERT`
- Policy definition:
  ```sql
  bucket_id = 'content-vault'
  ```
- Target roles: `authenticated`

**Policy 2: Allow authenticated reads (SELECT)**
- Policy name: `Allow authenticated reads from content-vault`
- Allowed operation: `SELECT`
- Policy definition:
  ```sql
  bucket_id = 'content-vault'
  ```
- Target roles: `authenticated`

**Policy 3: Allow authenticated updates (UPDATE)**
- Policy name: `Allow authenticated updates to content-vault`
- Allowed operation: `UPDATE`
- Policy definition:
  ```sql
  bucket_id = 'content-vault'
  ```
- Target roles: `authenticated`

**Policy 4: Allow authenticated deletes (DELETE)**
- Policy name: `Allow authenticated deletes from content-vault`
- Allowed operation: `DELETE`
- Policy definition:
  ```sql
  bucket_id = 'content-vault'
  ```
- Target roles: `authenticated`

### Alternative: SQL Method for Storage Policies

If you prefer SQL, run this in SQL Editor:

```sql
-- Storage policies for content-vault bucket
CREATE POLICY "Allow authenticated uploads to content-vault"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-vault');

CREATE POLICY "Allow authenticated reads from content-vault"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'content-vault');

CREATE POLICY "Allow authenticated updates to content-vault"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content-vault')
WITH CHECK (bucket_id = 'content-vault');

CREATE POLICY "Allow authenticated deletes from content-vault"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-vault');
```

---

## Part 2: Database Table RLS Policies (For Database Inserts)

## Quick Setup via Policy UI (Recommended)

### Step 1: Create Upload Policy

1. In Supabase Dashboard, go to **Storage** → **Policies** tab
2. Find your **"CONTENT-VAULT"** bucket
3. Click **"New policy"** button next to it
4. Choose **"For full customization"** (or "Create policy from scratch")
5. Fill in the following:

**Policy Name:** `Allow authenticated uploads`

**Allowed Operation:** `INSERT`

**Policy Definition:**
```sql
bucket_id = 'content-vault'
```

**Target Roles:** Check `authenticated`

6. Click **"Review"** then **"Save policy"**

### Step 2: Create Read Policy

1. Click **"New policy"** again for the same bucket
2. Choose **"For full customization"**
3. Fill in:

**Policy Name:** `Allow authenticated reads`

**Allowed Operation:** `SELECT`

**Policy Definition:**
```sql
bucket_id = 'content-vault'
```

**Target Roles:** Check `authenticated`

4. Click **"Review"** then **"Save policy"**

### Step 3: (Optional) Create Update Policy

1. Click **"New policy"** again
2. Choose **"For full customization"**
3. Fill in:

**Policy Name:** `Allow authenticated updates`

**Allowed Operation:** `UPDATE`

**Policy Definition:**
```sql
bucket_id = 'content-vault'
```

**Target Roles:** Check `authenticated`

4. Click **"Review"** then **"Save policy"**

### Step 4: (Optional) Create Delete Policy

1. Click **"New policy"** again
2. Choose **"For full customization"**
3. Fill in:

**Policy Name:** `Allow authenticated deletes`

**Allowed Operation:** `DELETE`

**Policy Definition:**
```sql
bucket_id = 'content-vault'
```

**Target Roles:** Check `authenticated`

4. Click **"Review"** then **"Save policy"**

## Alternative: SQL Editor Method

If you prefer using SQL:

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New query"**
3. Copy and paste the contents of `SUPABASE_RLS_POLICIES.sql`
4. Click **"Run"** to execute all policies at once

## Verify Policies

After creating policies:

1. Go back to **Storage** → **Policies**
2. You should see your policies listed under "CONTENT-VAULT"
3. Each policy should show:
   - Policy name
   - Operation (INSERT, SELECT, etc.)
   - Target roles (authenticated)

## Testing

1. Try uploading a large video file (> 4.5MB) through your app
2. If upload succeeds, policies are working correctly
3. If you get "permission denied" errors, check:
   - Policy definitions are correct
   - `authenticated` role is selected
   - Bucket name matches exactly: `content-vault`

## Security Notes

- These policies allow **all authenticated users** to access the bucket
- For stricter security, you can add user-specific checks:
  ```sql
  -- Only allow users to access their own files
  (storage.foldername(name))[1] = auth.uid()::text
  ```
- The bucket should remain **Private** (not public)

## Troubleshooting

### "Permission denied" error
- Check that policies are created and enabled
- Verify the bucket name matches exactly
- Ensure user is authenticated

### "Bucket not found" error
- Verify bucket name is `content-vault` (lowercase with hyphen)
- Check bucket exists in Storage → Buckets

### Policies not showing up
- Refresh the page
- Check you're looking at the correct bucket
- Verify policies were saved successfully
