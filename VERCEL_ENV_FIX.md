# Fix Vercel Environment Variables

## The Problem

Your `NEXT_PUBLIC_APP_URL` is currently set to a Supabase database URL instead of your Vercel app URL. This causes password reset links to be broken.

## The Solution

You have two options:

### Option 1: Remove NEXT_PUBLIC_APP_URL (Recommended)

1. Go to **Vercel → Your Project → Settings → Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Click the `...` menu and select **Delete**
4. The code will now automatically use Vercel's `VERCEL_URL` (which is set automatically)

**Why this is better:** Vercel automatically sets `VERCEL_URL` for you, so you don't need to manually maintain it.

### Option 2: Set NEXT_PUBLIC_APP_URL to Your Vercel URL

1. Go to **Vercel → Your Project → Settings → Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Click to edit it
4. Set it to your actual Vercel app URL:
   - `https://real-growth-labs-git-main-evgenys-projects-a6c7417d.vercel.app`
   - OR your custom domain if you have one: `https://realgrowthlabs.com`

## After Making Changes

1. **Redeploy** your project (Vercel will auto-deploy if connected to Git, or click "Redeploy" manually)
2. **Test** the password reset flow again
3. **Check** that the reset link in the email points to your Vercel app, not Supabase

## Current Status

✅ **Resend is working** - The `POST /emails` with 200 status shows emails are being sent  
❌ **Reset links are broken** - They're pointing to Supabase URL instead of your app  
✅ **Code is fixed** - Now prioritizes Vercel's automatic URL

## What Changed in the Code

The code now:
1. Uses `VERCEL_URL` first (automatically set by Vercel)
2. Only uses `NEXT_PUBLIC_APP_URL` if it's a valid app URL (not a database URL)
3. Falls back to localhost for local development

