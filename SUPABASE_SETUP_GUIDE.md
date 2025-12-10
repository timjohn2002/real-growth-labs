# Supabase Setup Guide - Complete Step-by-Step

This guide will help you set up Supabase for your database and file storage.

---

## Step 1: Create Supabase Account & Project

1. **Go to Supabase**: https://supabase.com
2. **Sign up** (or log in if you have an account)
   - You can sign up with GitHub, Google, or email
3. **Create a new project**:
   - Click "New Project"
   - **Name**: `real-growth-labs` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `US East (North Virginia)`)
   - **Pricing Plan**: Start with Free tier
   - Click "Create new project"
4. **Wait 2-3 minutes** for project to initialize

---

## Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** (gear icon in sidebar)
2. Click **Database** in the left menu
3. Scroll down to **Connection string**
4. Select **URI** tab
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with the database password you created in Step 1
7. **Save this connection string** - you'll need it for `.env.local` and Vercel

---

## Step 3: Update Prisma Schema

Your schema needs to be updated to use PostgreSQL instead of SQLite.

1. **Open** `prisma/schema.prisma`
2. **Change line 9** from:
   ```prisma
   provider = "sqlite" // Using SQLite for local development (no setup required)
   ```
   To:
   ```prisma
   provider = "postgresql" // Using PostgreSQL via Supabase
   ```
3. **Save the file**

---

## Step 4: Set Up Local Environment

1. **Update your `.env.local` file** (create it if it doesn't exist):
   ```env
   # Database (Supabase PostgreSQL)
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

   # OpenAI (already set up)
   OPENAI_API_KEY="your-openai-api-key-here"

   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

2. **Replace `YOUR_PASSWORD`** with your actual Supabase database password
3. **Replace the connection string** with the one from Step 2

---

## Step 5: Run Database Migrations Locally

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Push schema to Supabase**:
   ```bash
   npm run db:push
   ```

   This will create all your tables in Supabase!

3. **Verify** - Go to Supabase dashboard → **Table Editor** to see your tables

---

## Step 6: Set Up Supabase Storage

1. In Supabase dashboard, go to **Storage** (in left sidebar)
2. **Create a bucket**:
   - Click "New bucket"
   - **Name**: `audiobooks`
   - **Public bucket**: ✅ Enable (so files can be accessed via URL)
   - Click "Create bucket"
3. **Create another bucket**:
   - Click "New bucket" again
   - **Name**: `uploads`
   - **Public bucket**: ✅ Enable
   - Click "Create bucket"

---

## Step 7: Get Supabase API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (long string) - **Keep this secret!**

3. **Copy these values** - you'll need them for Vercel

---

## Step 8: Update Storage Code (Optional - For Production)

The storage code is already set up to support Supabase. You just need to add the environment variables.

---

## Step 9: Add Environment Variables to Vercel

Go to your Vercel dashboard and add these environment variables:

### 1. Database URL
- **Key**: `DATABASE_URL`
- **Value**: Your Supabase connection string (from Step 2)
- **Environments**: All Environments
- **Sensitive**: ✅ Enable

### 2. Supabase URL
- **Key**: `SUPABASE_URL`
- **Value**: Your Project URL (from Step 7)
- **Environments**: All Environments

### 3. Supabase Anon Key
- **Key**: `SUPABASE_ANON_KEY`
- **Value**: Your anon public key (from Step 7)
- **Environments**: All Environments

### 4. Supabase Service Role Key
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your service_role key (from Step 7)
- **Environments**: All Environments
- **Sensitive**: ✅ Enable (very important!)

### 5. Storage Provider
- **Key**: `STORAGE_PROVIDER`
- **Value**: `supabase`
- **Environments**: All Environments

### 6. Storage Bucket
- **Key**: `STORAGE_BUCKET`
- **Value**: `audiobooks`
- **Environments**: All Environments

---

## Step 10: Redeploy on Vercel

1. After adding all environment variables, **redeploy** your application
2. Vercel will automatically run `prisma generate` and connect to Supabase

---

## Step 11: Verify Everything Works

1. **Check Supabase Dashboard**:
   - Go to **Table Editor** - you should see all your tables
   - Go to **Storage** - you should see your buckets

2. **Test your app**:
   - Try creating a user account
   - Try uploading content
   - Try generating a book

---

## 🎯 Quick Checklist

- [ ] Created Supabase account and project
- [ ] Got database connection string
- [ ] Updated `prisma/schema.prisma` to use PostgreSQL
- [ ] Updated `.env.local` with `DATABASE_URL`
- [ ] Ran `npm run db:generate`
- [ ] Ran `npm run db:push`
- [ ] Created storage buckets (`audiobooks` and `uploads`)
- [ ] Got Supabase API keys
- [ ] Added all environment variables to Vercel
- [ ] Redeployed on Vercel
- [ ] Verified tables exist in Supabase

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Prisma + Supabase**: https://www.prisma.io/docs/guides/database/using-prisma-with-supabase
- **Supabase Storage**: https://supabase.com/docs/guides/storage

---

## ⚠️ Important Notes

1. **Never commit** your `.env.local` file (already in `.gitignore`)
2. **Keep your service_role key secret** - it has admin access
3. **Free tier limits**:
   - 500MB database storage
   - 1GB file storage
   - 2GB bandwidth/month
4. **Upgrade when needed** - Pro plan is $25/month for more resources

---

## 🆘 Troubleshooting

### "Connection refused" error
- Check your database password is correct
- Verify the connection string format
- Make sure you replaced `[YOUR-PASSWORD]` in the connection string

### "Table does not exist" error
- Run `npm run db:push` again
- Check Supabase Table Editor to see if tables were created

### Storage upload fails
- Verify buckets are created and public
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly

---

**You're all set!** Your app will now use Supabase for database and storage. 🚀

