# Email Troubleshooting Guide

## Quick Checks

### 1. Verify Environment Variables in Vercel

Go to **Vercel → Your Project → Settings → Environment Variables** and verify:

- ✅ `RESEND_API_KEY` = `re_jURjpv8Q_2RmrRr1S2z71NpUKu5DYJTLA`
- ✅ `RESEND_FROM_EMAIL` = `onboarding@resend.dev` (or your verified domain)
- ✅ `NEXT_PUBLIC_APP_URL` = Your production URL

**Important:** After adding/changing environment variables, you MUST redeploy!

### 2. Check Vercel Function Logs

1. Go to your Vercel deployment
2. Click on **"Logs"** tab
3. Try the forgot password flow again
4. Look for logs that say:
   - `"Attempting to send password reset email to: [email]"`
   - `"✅ Password reset email sent successfully"` OR
   - `"❌ Failed to send password reset email: [error]"`

### 3. Check Resend Dashboard

1. Go to [Resend Dashboard → Logs](https://resend.com/logs)
2. Look for recent email attempts
3. Check the status:
   - ✅ **Delivered** = Email was sent successfully
   - ⚠️ **Bounced** = Email address is invalid
   - ⚠️ **Failed** = There was an error

### 4. Check Your Email

- Check **Spam/Junk folder**
- Check **Promotions tab** (Gmail)
- Verify you're checking the correct email address
- Wait a few minutes (emails can take 1-2 minutes)

## Common Issues

### Issue: "Email service not configured"
**Solution:** `RESEND_API_KEY` is not set in Vercel environment variables

### Issue: "Invalid from address"
**Solution:** 
- Use `onboarding@resend.dev` for testing
- Or verify your domain in Resend and use `noreply@yourdomain.com`

### Issue: Email sent but not received
**Possible causes:**
1. Email went to spam
2. Email provider is blocking it
3. Email address has a typo
4. Email is delayed (wait 2-3 minutes)

### Issue: API returns error
**Check:**
1. Vercel logs for the exact error message
2. Resend dashboard for API errors
3. Verify API key is correct and active

## Testing Steps

1. **Test in Production:**
   ```
   1. Go to: https://your-app.vercel.app/forgot-password
   2. Enter your email
   3. Submit
   4. Check Vercel logs immediately
   5. Check Resend dashboard
   6. Check email inbox (and spam)
   ```

2. **Check API Response:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Submit forgot password form
   - Look at the `/api/auth/forgot-password` response
   - Check for `emailSent: true/false` and `emailError` fields

## Debug Information

The API now returns:
```json
{
  "message": "...",
  "emailSent": true/false,
  "emailId": "...", // If successful
  "emailError": "..." // If failed
}
```

## Next Steps

After checking logs, share:
1. What you see in Vercel logs
2. What you see in Resend dashboard
3. The API response from browser DevTools
4. Any error messages

