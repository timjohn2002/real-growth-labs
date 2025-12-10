# Production Deployment Checklist

## ✅ Environment Variables in Vercel

Make sure these are set in **Vercel → Your Project → Settings → Environment Variables**:

### Required Variables:

1. **`RESEND_API_KEY`**
   - Value: `re_jURjpv8Q_2RmrRr1S2z71NpUKu5DYJTLA`
   - Environments: Production, Preview, Development

2. **`RESEND_FROM_EMAIL`**
   - Value: `onboarding@resend.dev` (or your verified domain email)
   - Environments: Production, Preview, Development

3. **`NEXT_PUBLIC_APP_URL`**
   - Value: Your production URL (e.g., `https://realgrowthlabs.com` or your Vercel URL)
   - Environments: Production, Preview, Development
   - ⚠️ **Important**: This must be your actual production URL for password reset links to work!

4. **`DATABASE_URL`**
   - Value: Your Supabase connection string
   - Environments: Production, Preview, Development

5. **`OPENAI_API_KEY`**
   - Value: Your OpenAI API key
   - Environments: Production, Preview, Development

6. **`SUPABASE_URL`** (if using Supabase features)
   - Value: Your Supabase project URL

7. **`SUPABASE_ANON_KEY`** (if using Supabase features)
   - Value: Your Supabase anonymous key

## 🧪 Testing Checklist

After deployment, test these features:

### Authentication
- [ ] Sign up with a new account
- [ ] Log in with existing account
- [ ] Forgot password flow:
  - [ ] Submit email on `/forgot-password`
  - [ ] Check email inbox for reset link
  - [ ] Click reset link
  - [ ] Set new password
  - [ ] Log in with new password

### Dashboard
- [ ] Access `/dashboard` (should require login)
- [ ] View user's books
- [ ] Create a new book

### API Routes
- [ ] `/api/books` - Get user's books
- [ ] `/api/auth/login` - Login
- [ ] `/api/auth/signup` - Signup
- [ ] `/api/auth/forgot-password` - Password reset

## 🔍 Troubleshooting

### Password Reset Not Working?
1. Check `NEXT_PUBLIC_APP_URL` is set to your production URL
2. Verify `RESEND_API_KEY` is correct
3. Check Vercel function logs for errors
4. Verify email is being sent in Resend dashboard

### Emails Not Sending?
1. Check Resend dashboard for delivery status
2. Verify `RESEND_FROM_EMAIL` is set correctly
3. Check Vercel logs: `vercel logs --follow`

### Database Connection Issues?
1. Verify `DATABASE_URL` is correct
2. Check Supabase connection pooler settings
3. Ensure database is accessible from Vercel's IPs

## 📊 Monitoring

- **Vercel Analytics**: Monitor deployment status and errors
- **Resend Dashboard**: Monitor email delivery rates
- **Supabase Dashboard**: Monitor database connections and queries

## 🚀 Next Steps

1. Set up custom domain (if not already done)
2. Configure domain in Resend for better email deliverability
3. Set up error monitoring (Sentry, etc.)
4. Configure analytics tracking

