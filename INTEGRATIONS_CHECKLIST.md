# Complete Integrations Checklist - Real Growth Labs

This document lists **ALL** integrations, APIs, and services needed for your software to function at 100%.

---

## 🔴 **CRITICAL - Required for Core Functionality**

### 1. **OpenAI API** ✅ (Partially Configured)
**Status:** Code exists, needs API key setup  
**Purpose:** Powers ALL AI features in your app

**What it covers:**
- ✅ **Whisper API** - Transcribes audio/video files (Content Vault)
- ✅ **GPT API** - Generates book content (Book Wizard)
- ✅ **GPT API** - Rewrites/improves content (Book Editor)
- ✅ **GPT API** - Analyzes book quality (Book Review)
- ⚠️ **TTS API** - Text-to-speech for audiobooks (optional, can use alternatives)

**Setup Required:**
- [ ] Get API key from https://platform.openai.com/api-keys
- [ ] Add credits ($20-50 recommended to start)
- [ ] Set spending limits in OpenAI dashboard
- [ ] Add to `.env`: `OPENAI_API_KEY="sk-proj-your-key-here"`

**Cost Estimate:**
- Whisper: $0.006 per minute of audio
- GPT-3.5: ~$0.0015 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- **Recommended budget: $20-50/month**

**Documentation:** See `API_KEYS_GUIDE.md` and `OPENAI_API_SETUP.md`

---

### 2. **Database** ⚠️ (Currently SQLite - Needs Production DB)
**Status:** Using SQLite for dev, needs production database  
**Purpose:** Store users, books, content, audiobooks, reviews

**Options (Choose ONE):**

#### Option A: **Supabase** (Recommended - Easiest)
- ✅ Free tier: 500MB database, 1GB file storage
- ✅ Includes PostgreSQL database + file storage in one
- ✅ Built-in authentication (can replace custom auth)
- ✅ Real-time features available
- **Setup:**
  - [ ] Sign up at https://supabase.com
  - [ ] Create new project
  - [ ] Get connection string from Settings > Database
  - [ ] Add to `.env`: `DATABASE_URL="postgresql://..."`

#### Option B: **Neon** (Serverless PostgreSQL)
- ✅ Free tier: 3GB storage
- ✅ Auto-scaling, serverless
- **Setup:**
  - [ ] Sign up at https://neon.tech
  - [ ] Create project
  - [ ] Copy connection string
  - [ ] Add to `.env`: `DATABASE_URL="postgresql://..."`

#### Option C: **Vercel Postgres**
- ✅ Integrated with Vercel deployment
- ✅ Free tier available
- **Setup:**
  - [ ] Add via Vercel dashboard
  - [ ] Connection string auto-configured

#### Option D: **Railway**
- ✅ Simple PostgreSQL setup
- ✅ $5/month for production use
- **Setup:**
  - [ ] Sign up at https://railway.app
  - [ ] Create PostgreSQL database
  - [ ] Copy connection string

**After Setup:**
- [ ] Update `prisma/schema.prisma` to use `provider = "postgresql"` (currently SQLite)
- [ ] Run: `npm run db:push` to migrate schema
- [ ] Test database connection

---

### 3. **File Storage** ⚠️ (Currently Placeholder)
**Status:** Code structure exists, needs implementation  
**Purpose:** Store uploaded files (audio, video, images, audiobooks)

**Options (Choose ONE):**

#### Option A: **Supabase Storage** (Recommended if using Supabase)
- ✅ Free tier: 1GB storage
- ✅ Integrated with Supabase database
- ✅ CDN included
- **Setup:**
  - [ ] Create storage bucket in Supabase dashboard
  - [ ] Get API keys from Settings > API
  - [ ] Add to `.env`:
    ```
    SUPABASE_URL="https://your-project.supabase.co"
    SUPABASE_ANON_KEY="your-anon-key"
    SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
    STORAGE_PROVIDER="supabase"
    STORAGE_BUCKET="your-bucket-name"
    ```
  - [ ] Implement upload in `lib/storage.ts`

#### Option B: **AWS S3**
- ✅ Highly scalable, industry standard
- ✅ Free tier: 5GB for 12 months
- ✅ Pay-as-you-go after
- **Setup:**
  - [ ] Create AWS account
  - [ ] Create S3 bucket
  - [ ] Create IAM user with S3 permissions
  - [ ] Add to `.env`:
    ```
    AWS_ACCESS_KEY_ID="your-access-key"
    AWS_SECRET_ACCESS_KEY="your-secret-key"
    AWS_REGION="us-east-1"
    AWS_S3_BUCKET="your-bucket-name"
    STORAGE_PROVIDER="s3"
    ```
  - [ ] Install: `npm install @aws-sdk/client-s3`
  - [ ] Implement upload in `lib/storage.ts`

#### Option C: **Cloudinary**
- ✅ Great for images/videos with transformations
- ✅ Free tier: 25GB storage, 25GB bandwidth
- **Setup:**
  - [ ] Sign up at https://cloudinary.com
  - [ ] Get API credentials
  - [ ] Add to `.env`:
    ```
    CLOUDINARY_CLOUD_NAME="your-cloud-name"
    CLOUDINARY_API_KEY="your-api-key"
    CLOUDINARY_API_SECRET="your-api-secret"
    STORAGE_PROVIDER="cloudinary"
    ```
  - [ ] Install: `npm install cloudinary`
  - [ ] Implement upload in `lib/storage.ts`

**Files to Update:**
- `lib/storage.ts` - Implement actual upload functions
- `app/api/storage/upload/route.ts` - Connect to storage service
- `app/api/content/upload/route.ts` - Use storage for content uploads
- `app/api/audiobook/generate/route.ts` - Store generated audiobooks

---

### 4. **Authentication** ⚠️ (Currently Placeholder)
**Status:** Basic structure exists, needs implementation  
**Purpose:** User login, signup, session management

**Options (Choose ONE):**

#### Option A: **NextAuth.js** (Recommended)
- ✅ Industry standard for Next.js
- ✅ Supports multiple providers (email, Google, GitHub, etc.)
- ✅ Built-in session management
- **Setup:**
  - [ ] Install: `npm install next-auth @auth/prisma-adapter`
  - [ ] Create `app/api/auth/[...nextauth]/route.ts`
  - [ ] Add to `.env`:
    ```
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="generate-random-secret-here"
    ```
  - [ ] Update `app/api/auth/login/route.ts` and `app/api/auth/signup/route.ts`

#### Option B: **Supabase Auth** (If using Supabase)
- ✅ Integrated with Supabase
- ✅ Pre-built auth UI components
- ✅ Magic links, OAuth providers
- **Setup:**
  - [ ] Install: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs`
  - [ ] Configure in Supabase dashboard
  - [ ] Update auth routes

#### Option C: **Custom JWT Auth** (Current approach)
- ⚠️ More work, but full control
- **Setup:**
  - [ ] Install: `npm install jsonwebtoken @types/jsonwebtoken`
  - [ ] Implement JWT generation/verification
  - [ ] Update login/signup routes
  - [ ] Add middleware for protected routes

**Files to Update:**
- `app/api/auth/login/route.ts` - Implement actual login
- `app/api/auth/signup/route.ts` - Implement user creation
- `lib/prisma.ts` - Ensure user/session models work
- Add authentication middleware

---

## 🟡 **IMPORTANT - Needed for Full Features**

### 5. **Email Service** ⚠️ (Not Implemented)
**Status:** Contact form exists but doesn't send emails  
**Purpose:** Contact form submissions, user notifications, password resets

**Options (Choose ONE):**

#### Option A: **Resend** (Recommended for Next.js)
- ✅ Built for modern apps, great DX
- ✅ Free tier: 3,000 emails/month
- ✅ React Email templates
- **Setup:**
  - [ ] Sign up at https://resend.com
  - [ ] Get API key
  - [ ] Add to `.env`: `RESEND_API_KEY="re_..."`
  - [ ] Install: `npm install resend`
  - [ ] Create `app/api/contact/route.ts` to send emails

#### Option B: **SendGrid**
- ✅ Industry standard, reliable
- ✅ Free tier: 100 emails/day
- **Setup:**
  - [ ] Sign up at https://sendgrid.com
  - [ ] Verify sender email
  - [ ] Get API key
  - [ ] Add to `.env`: `SENDGRID_API_KEY="SG...."`
  - [ ] Install: `npm install @sendgrid/mail`

#### Option C: **AWS SES**
- ✅ Very cheap ($0.10 per 1,000 emails)
- ✅ Requires AWS account setup
- **Setup:**
  - [ ] Set up AWS account
  - [ ] Verify domain/email in SES
  - [ ] Get credentials
  - [ ] Install: `npm install @aws-sdk/client-ses`

**Files to Update:**
- `sections/contact/form.tsx` - Connect form to API
- `app/api/contact/route.ts` - Create email sending endpoint (if doesn't exist)

---

### 6. **Payment Processing** ⚠️ (Not Implemented)
**Status:** Pricing page exists, no payment integration  
**Purpose:** Handle subscriptions, one-time payments

**Recommended: Stripe**
- ✅ Industry standard, excellent docs
- ✅ Free to start (2.9% + $0.30 per transaction)
- ✅ Built-in subscription management
- ✅ Webhook support for subscription events

**Setup:**
- [ ] Sign up at https://stripe.com
- [ ] Get API keys (test and live)
- [ ] Add to `.env`:
  ```
  STRIPE_SECRET_KEY="sk_test_..."
  STRIPE_PUBLISHABLE_KEY="pk_test_..."
  STRIPE_WEBHOOK_SECRET="whsec_..." (for webhooks)
  ```
- [ ] Install: `npm install stripe @stripe/stripe-js`
- [ ] Create checkout session API route
- [ ] Create webhook handler for subscription events
- [ ] Update `User` model to include subscription status
- [ ] Add subscription checks to protected routes

**Files to Create/Update:**
- `app/api/stripe/checkout/route.ts` - Create checkout sessions
- `app/api/stripe/webhook/route.ts` - Handle Stripe webhooks
- `lib/stripe.ts` - Stripe client initialization
- `prisma/schema.prisma` - Add subscription fields to User model
- `components/PricingTable.tsx` - Connect buttons to checkout

---

### 7. **Audiobook Text-to-Speech** ⚠️ (Optional - If not using OpenAI TTS)
**Status:** Code structure exists, needs TTS provider  
**Purpose:** Generate audiobook audio from text

**Options:**

#### Option A: **OpenAI TTS** (Simplest - Uses same API key)
- ✅ Same API key as other OpenAI features
- ✅ Good quality voices
- ✅ $15 per 1M characters (~$0.015 per 1K words)
- **Setup:** Already have API key, just implement in `app/api/audiobook/generate/route.ts`

#### Option B: **ElevenLabs** (Best Quality)
- ✅ Best voice quality and naturalness
- ✅ Free tier: 10,000 characters/month
- ✅ Paid: $5/month for 30,000 characters
- **Setup:**
  - [ ] Sign up at https://elevenlabs.io
  - [ ] Get API key
  - [ ] Add to `.env`: `ELEVENLABS_API_KEY="..."`
  - [ ] Install: `npm install elevenlabs`
  - [ ] Implement in audiobook generation route

#### Option C: **Google Cloud TTS**
- ✅ Good quality, competitive pricing
- ✅ $4 per 1M characters
- **Setup:**
  - [ ] Set up Google Cloud account
  - [ ] Enable Cloud Text-to-Speech API
  - [ ] Get service account credentials
  - [ ] Install: `npm install @google-cloud/text-to-speech`

**Files to Update:**
- `app/api/audiobook/generate/route.ts` - Implement TTS generation
- `app/api/audiobook/[id]/route.ts` - Check generation status

---

## 🟢 **RECOMMENDED - For Production Quality**

### 8. **Deployment Platform**
**Recommended: Vercel**
- ✅ Best for Next.js (made by Next.js team)
- ✅ Free tier: Unlimited personal projects
- ✅ Automatic deployments from GitHub
- ✅ Built-in analytics, edge functions
- **Setup:** See `DEPLOYMENT.md`

**Alternative Options:**
- Netlify
- Railway
- AWS Amplify

---

### 9. **Analytics** (Optional but Recommended)
**Purpose:** Track user behavior, page views, conversions

**Options:**

#### Option A: **Vercel Analytics** (If using Vercel)
- ✅ Free tier available
- ✅ Zero configuration
- **Setup:** Add `@vercel/analytics` package

#### Option B: **Google Analytics**
- ✅ Free, industry standard
- ✅ Comprehensive tracking
- **Setup:**
  - [ ] Create GA4 property
  - [ ] Get measurement ID
  - [ ] Add to `.env`: `NEXT_PUBLIC_GA_ID="G-..."`
  - [ ] Install: `npm install @next/third-parties`

#### Option C: **PostHog**
- ✅ Open source, privacy-focused
- ✅ Product analytics + feature flags
- **Setup:**
  - [ ] Sign up at https://posthog.com
  - [ ] Get API key
  - [ ] Install: `npm install posthog-js`

**Files to Update:**
- `app/layout.tsx` - Add analytics script
- `lib/analytics.ts` - Implement tracking functions

---

### 10. **Error Monitoring** (Optional but Recommended)
**Purpose:** Track errors in production, get alerts

**Recommended: Sentry**
- ✅ Free tier: 5,000 events/month
- ✅ Excellent error tracking
- ✅ Source maps support
- **Setup:**
  - [ ] Sign up at https://sentry.io
  - [ ] Create project
  - [ ] Get DSN
  - [ ] Add to `.env`: `SENTRY_DSN="https://..."`
  - [ ] Install: `npm install @sentry/nextjs`
  - [ ] Run: `npx @sentry/wizard@latest -i nextjs`

---

### 11. **Job Queue** (Optional - For Background Processing)
**Purpose:** Process long-running tasks (audiobook generation, transcription)

**Recommended: BullMQ + Redis**
- ✅ Handles async jobs efficiently
- ✅ Retry logic, job prioritization
- **Setup:**
  - [ ] Set up Redis (Upstash, Railway, or Redis Cloud)
  - [ ] Install: `npm install bullmq ioredis`
  - [ ] Create queue workers
  - [ ] Update audiobook/transcription routes to use queues

**Alternative:** Use Vercel Cron Jobs for simpler use cases

---

## 📋 **Environment Variables Checklist**

Create a `.env` file (or `.env.local`) with all required variables:

```env
# Database
DATABASE_URL="postgresql://..." # or "file:./dev.db" for SQLite dev

# OpenAI (Required)
OPENAI_API_KEY="sk-proj-..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Storage (Choose one provider)
STORAGE_PROVIDER="supabase" # or "s3" or "cloudinary"
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
STORAGE_BUCKET="your-bucket-name"

# OR for AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="..."

# OR for Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Authentication (If using NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret"

# Email Service (Choose one)
RESEND_API_KEY="re_..."
# OR
SENDGRID_API_KEY="SG...."
# OR
AWS_SES_REGION="us-east-1"
AWS_SES_ACCESS_KEY_ID="..."
AWS_SES_SECRET_ACCESS_KEY="..."

# Payment Processing
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Audiobook TTS (If not using OpenAI)
ELEVENLABS_API_KEY="..."

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="G-..."

# Error Monitoring (Optional)
SENTRY_DSN="https://..."

# Job Queue (Optional)
REDIS_URL="redis://..."
```

---

## 🎯 **Priority Order for Implementation**

### Phase 1: Core Functionality (Week 1)
1. ✅ **OpenAI API** - Get API key, add credits
2. ⚠️ **Database** - Set up PostgreSQL (Supabase recommended)
3. ⚠️ **File Storage** - Set up Supabase Storage or S3
4. ⚠️ **Authentication** - Implement NextAuth or Supabase Auth

### Phase 2: Essential Features (Week 2)
5. ⚠️ **Email Service** - Set up Resend for contact form
6. ⚠️ **Audiobook TTS** - Implement OpenAI TTS or ElevenLabs

### Phase 3: Monetization (Week 3)
7. ⚠️ **Payment Processing** - Set up Stripe for subscriptions

### Phase 4: Production Polish (Week 4)
8. ✅ **Deployment** - Deploy to Vercel
9. ⚠️ **Analytics** - Add Vercel Analytics or Google Analytics
10. ⚠️ **Error Monitoring** - Set up Sentry

---

## 💰 **Estimated Monthly Costs**

### Free Tier (Getting Started)
- OpenAI: $20-50/month (pay-as-you-go)
- Supabase: Free (500MB DB + 1GB storage)
- Resend: Free (3,000 emails/month)
- Vercel: Free (personal projects)
- **Total: ~$20-50/month**

### Production Tier (100+ users)
- OpenAI: $100-300/month
- Supabase Pro: $25/month (8GB DB + 100GB storage)
- Resend: $20/month (50,000 emails)
- Stripe: 2.9% + $0.30 per transaction
- Vercel Pro: $20/month (if needed)
- **Total: ~$165-395/month + transaction fees**

---

## ✅ **Quick Start Checklist**

- [ ] Get OpenAI API key and add credits
- [ ] Set up Supabase (database + storage)
- [ ] Update Prisma schema to PostgreSQL
- [ ] Run database migrations
- [ ] Implement file storage uploads
- [ ] Set up authentication (NextAuth or Supabase Auth)
- [ ] Set up email service (Resend)
- [ ] Implement audiobook TTS (OpenAI or ElevenLabs)
- [ ] Set up Stripe for payments
- [ ] Deploy to Vercel
- [ ] Add analytics
- [ ] Set up error monitoring

---

## 📚 **Additional Resources**

- OpenAI API Docs: https://platform.openai.com/docs
- Supabase Docs: https://supabase.com/docs
- NextAuth.js Docs: https://next-auth.js.org
- Stripe Docs: https://stripe.com/docs
- Vercel Docs: https://vercel.com/docs
- Resend Docs: https://resend.com/docs

---

**Last Updated:** Based on codebase analysis as of current date
**Status:** This checklist covers all integrations needed for 100% functionality

