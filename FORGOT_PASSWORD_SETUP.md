# Forgot Password Feature Setup

## ✅ Current Status

The forgot password feature is now configured to use your verified Resend domain: **labs.realgrowth.art**

## 📧 Email Configuration

### Default From Email
The system now defaults to: `noreply@labs.realgrowth.art`

### Environment Variables

Make sure these are set in your Vercel environment variables:

1. **RESEND_API_KEY** (Required)
   - Your Resend API key
   - Get it from: https://resend.com/api-keys

2. **RESEND_FROM_EMAIL** (Optional)
   - Default: `noreply@labs.realgrowth.art`
   - You can override this if you want to use a different email address from your domain
   - Examples:
     - `noreply@labs.realgrowth.art`
     - `support@labs.realgrowth.art`
     - `no-reply@labs.realgrowth.art`

3. **NEXT_PUBLIC_APP_URL** (Optional but recommended)
   - Your production app URL (e.g., `https://your-app.vercel.app`)
   - Used for password reset links
   - If not set, the system will use Vercel's automatic URL detection

## 🔧 How It Works

1. **User requests password reset:**
   - User goes to `/forgot-password`
   - Enters their email address
   - System generates a unique reset token

2. **Email is sent:**
   - Email sent from `noreply@labs.realgrowth.art` (or your custom RESEND_FROM_EMAIL)
   - Contains a reset link with token
   - Link expires in 1 hour

3. **User resets password:**
   - User clicks link in email
   - Redirected to `/reset-password?token=...`
   - User enters new password
   - Password is updated and user can login

## 🧪 Testing

### Test the Flow:

1. Go to `/forgot-password`
2. Enter a registered email address
3. Check your email inbox (and spam folder)
4. Click the reset link
5. Enter a new password
6. Try logging in with the new password

### Check Vercel Logs:

Look for these log messages:
- `✅ User found in database. Proceeding with password reset email.`
- `📧 ATTEMPTING TO SEND PASSWORD RESET EMAIL`
- `✅ Password reset email sent successfully`

## 🐛 Troubleshooting

### Email Not Sending?

1. **Check Resend API Key:**
   - Verify `RESEND_API_KEY` is set in Vercel
   - Check it's valid in Resend dashboard

2. **Check Domain Verification:**
   - Ensure `labs.realgrowth.art` is verified in Resend
   - Check DNS records are correct

3. **Check From Email:**
   - Must be from your verified domain
   - Format: `something@labs.realgrowth.art`

4. **Check Resend Dashboard:**
   - Go to https://resend.com/emails
   - Check if emails are being sent
   - Look for any error messages

### Reset Link Not Working?

1. **Check App URL:**
   - Verify `NEXT_PUBLIC_APP_URL` is set correctly
   - Should be your production URL (not localhost)

2. **Check Token Expiration:**
   - Tokens expire after 1 hour
   - Request a new reset link if expired

3. **Check Database:**
   - Verify user exists
   - Check `resetToken` and `resetTokenExpires` fields

## 📝 Code Files

- **Email sending:** `lib/email.ts`
- **Forgot password API:** `app/api/auth/forgot-password/route.ts`
- **Reset password API:** `app/api/auth/reset-password/route.ts`
- **Forgot password page:** `app/forgot-password/page.tsx`
- **Reset password page:** `app/reset-password/page.tsx`

## ✅ Next Steps

1. **Set Environment Variables in Vercel:**
   - Go to your Vercel project settings
   - Add/update environment variables:
     - `RESEND_API_KEY` (your Resend API key)
     - `RESEND_FROM_EMAIL` (optional, defaults to `noreply@labs.realgrowth.art`)
     - `NEXT_PUBLIC_APP_URL` (your production URL)

2. **Test the Flow:**
   - Try the forgot password flow
   - Check that emails are received
   - Verify reset links work

3. **Monitor:**
   - Check Resend dashboard for email delivery
   - Monitor Vercel logs for any errors
