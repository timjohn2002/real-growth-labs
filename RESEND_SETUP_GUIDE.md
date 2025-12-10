# Resend Email Setup Guide

This guide will help you set up Resend to send password reset emails and other transactional emails.

## Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Get Your API Key

1. Once logged in, go to the [API Keys](https://resend.com/api-keys) page
2. Click "Create API Key"
3. Give it a name (e.g., "Real Growth Labs Production")
4. Copy the API key (you'll only see it once!)

## Step 3: Verify Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to [Domains](https://resend.com/domains) in Resend
2. Click "Add Domain"
3. Enter your domain (e.g., `realgrowthlabs.com`)
4. Follow the DNS setup instructions to add the required DNS records
5. Wait for verification (usually takes a few minutes)

**Note:** For testing, you can use the default `onboarding@resend.dev` sender email without domain verification.

## Step 4: Add Environment Variables

Add these to your `.env.local` file:

```env
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# From email address (use your verified domain or onboarding@resend.dev for testing)
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Your app URL (for password reset links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production (Vercel), add these same variables in:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable for "Production", "Preview", and "Development" environments

## Step 5: Test the Email

1. Start your development server: `npm run dev`
2. Go to `/forgot-password`
3. Enter your email address
4. Submit the form
5. Check your email inbox for the password reset link

## Troubleshooting

### Email not sending?
- Check that `RESEND_API_KEY` is set correctly
- Verify the API key is active in Resend dashboard
- Check the server console for error messages
- In development, the reset link will also be logged to the console

### Using default sender email?
- The default `onboarding@resend.dev` works for testing
- For production, verify your domain and use a custom email like `noreply@yourdomain.com`

### Rate Limits
- Free tier: 100 emails/day
- Paid plans start at $20/month for 50,000 emails

## What's Configured

✅ Password reset emails  
✅ Welcome emails (ready to use)  
✅ HTML and plain text email templates  
✅ Error handling and fallbacks  

## Next Steps

1. Set up your Resend account
2. Add the API key to your environment variables
3. Test the password reset flow
4. (Optional) Verify your domain for production use

