# Supabase Storage Setup for Large File Uploads

This guide will help you set up Supabase Storage to enable large video file uploads (bypassing Vercel's 4.5MB limit).

## Why This is Needed

Vercel has a hard 4.5MB limit for serverless function request bodies. For larger video files, we use direct client-side uploads to Supabase Storage, which bypasses this limit entirely.

## Setup Steps

### 1. Create Supabase Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Name it: `content-vault`
5. Set it to **Private** (not public)
6. Click **"Create bucket"**

### 2. Set Up Bucket Policies (RLS)

1. In the Storage section, click on the `content-vault` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**
4. Create a policy that allows authenticated users to upload:

**Policy Name:** `Allow authenticated uploads`

**Policy Definition:**
```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-vault');

-- Allow authenticated users to read their own files
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'content-vault');
```

### 3. Configure Environment Variables

Add these to your Vercel environment variables:

```
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find these:**
- Go to Supabase Dashboard → Settings → API
- `SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (keep this secret!)

### 4. Test the Upload

1. Try uploading a video file larger than 4.5MB
2. The file should upload directly to Supabase Storage
3. Processing will start automatically after upload completes

## How It Works

1. **Small files (< 4.5MB)**: Upload through Vercel API route (traditional method)
2. **Large files (> 4.5MB)**: 
   - Get upload path from API
   - Upload directly to Supabase Storage from client
   - Notify API with file URL
   - API downloads and processes the file

## Troubleshooting

### "Bucket not found" error
- Make sure you created the `content-vault` bucket in Supabase Storage
- Check that the bucket name matches exactly

### "Failed to upload file to storage" error
- Check your RLS policies are set up correctly
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- Make sure the bucket is accessible

### "Unauthorized" error
- Check that your user is authenticated
- Verify RLS policies allow authenticated users

## File Size Limits

- **Supabase Free Tier**: 50MB per file
- **Supabase Pro Tier**: 5GB per file
- **Recommended**: Keep files under 100MB for best performance

## Security Notes

- The `content-vault` bucket should be **Private** (not public)
- RLS policies ensure users can only access their own files
- Service role key should never be exposed to the client
