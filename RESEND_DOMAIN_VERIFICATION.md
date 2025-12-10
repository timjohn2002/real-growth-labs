# Resend Domain Verification Guide

## The Problem

You're seeing a `403 Forbidden` error with the message:
> "You can only send testing emails to your own email address (jay@realgrowth.art). To send emails to other recipient:"

This happens because:
- You're using `onboarding@resend.dev` as the sender (testing mode)
- Resend's free tier only allows sending to your verified email address
- To send to ANY email address, you need to verify your domain

## Solution: Verify Your Domain in Resend

### Step 1: Add Your Domain

1. Go to [Resend Dashboard → Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `realgrowthlabs.com` or `realgrowth.art`)
4. Click **"Add"**

### Step 2: Add DNS Records

Resend will show you DNS records to add. You need to add these to your domain's DNS settings:

**Required Records:**
1. **SPF Record** - Verifies you own the domain
2. **DKIM Record** - Adds email authentication
3. **DMARC Record** (optional but recommended) - Email security

**Where to Add:**
- If using a domain registrar (GoDaddy, Namecheap, etc.): Add in their DNS settings
- If using Vercel: Add in Vercel's DNS settings
- If using Cloudflare: Add in Cloudflare DNS

### Step 3: Wait for Verification

- DNS changes can take 5 minutes to 48 hours
- Resend will automatically verify when DNS records are found
- Check the Resend dashboard for verification status

### Step 4: Update Environment Variables

Once verified, update your `.env.local` and Vercel:

```env
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

Replace `yourdomain.com` with your verified domain.

## Alternative: Use Your Verified Email for Testing

If you just want to test quickly:

1. Use `jay@realgrowth.art` as the test email address
2. Or verify `realgrowth.art` domain in Resend
3. Then use `noreply@realgrowth.art` as the sender

## Quick Test

After domain verification:
1. Update `RESEND_FROM_EMAIL` to your verified domain email
2. Try password reset again
3. Check Resend logs - should show `200` status
4. Email should arrive in inbox (not just to verified address)

## Current Status

- ✅ API key is working
- ✅ Email sending code is working
- ❌ Domain not verified (can only send to `jay@realgrowth.art`)
- ❌ Using `onboarding@resend.dev` (testing mode)

## Next Steps

1. **For Production:** Verify your domain in Resend
2. **For Testing:** Use `jay@realgrowth.art` as test email
3. **Update:** Change `RESEND_FROM_EMAIL` to your verified domain email

