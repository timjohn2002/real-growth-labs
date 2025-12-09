# Integrations Quick Reference

## 🔴 Critical (Must Have)

| Service | Purpose | Cost | Status |
|---------|---------|------|--------|
| **OpenAI API** | AI features (transcription, content generation, book review) | $20-50/mo | ⚠️ Needs API key |
| **PostgreSQL Database** | Store all app data | Free-$25/mo | ⚠️ Currently SQLite |
| **File Storage** | Store uploads (audio, video, audiobooks) | Free-$25/mo | ⚠️ Not implemented |
| **Authentication** | User login/signup | Free | ⚠️ Placeholder only |

## 🟡 Important (Needed Soon)

| Service | Purpose | Cost | Status |
|---------|---------|------|--------|
| **Email Service** | Contact form, notifications | Free-$20/mo | ❌ Not implemented |
| **Payment Processing** | Subscriptions, payments | 2.9% + $0.30 | ❌ Not implemented |
| **Audiobook TTS** | Generate audiobook audio | Free-$15/mo | ⚠️ Optional |

## 🟢 Recommended (Production)

| Service | Purpose | Cost | Status |
|---------|---------|------|--------|
| **Vercel** | Hosting/deployment | Free-$20/mo | ✅ Ready |
| **Analytics** | User tracking | Free | ❌ Not implemented |
| **Error Monitoring** | Track production errors | Free-$26/mo | ❌ Not implemented |

---

## 🎯 Recommended Stack (Easiest Setup)

1. **OpenAI** - One API key for all AI features
2. **Supabase** - Database + Storage + Auth in one
3. **Resend** - Email service
4. **Stripe** - Payments
5. **Vercel** - Hosting
6. **Vercel Analytics** - Built-in analytics

**Total Monthly Cost (Free Tier): ~$20-50/month**

---

## 📝 Quick Setup Commands

```bash
# Install additional packages as needed
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install resend
npm install stripe @stripe/stripe-js
npm install next-auth @auth/prisma-adapter
npm install @vercel/analytics
npm install @sentry/nextjs
```

---

See `INTEGRATIONS_CHECKLIST.md` for detailed setup instructions.

