# Supabase RLS Policy Setup Guide

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
