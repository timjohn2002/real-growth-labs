# How to Get Your OpenAI API Key

## Step-by-Step Guide

### 1. Go to OpenAI Platform
Visit: **https://platform.openai.com/**

### 2. Sign Up or Log In
- If you don't have an account, click "Sign Up"
- If you have an account, click "Log In"
- You can sign up with Google, Microsoft, or email

### 3. Navigate to API Keys
- Once logged in, click on your profile icon (top right)
- Select **"API keys"** from the dropdown menu
- Or go directly to: https://platform.openai.com/api-keys

### 4. Create a New API Key
- Click the **"+ Create new secret key"** button
- Give it a name (e.g., "Real Growth Labs")
- Click **"Create secret key"**
- **⚠️ IMPORTANT:** Copy the key immediately - you won't be able to see it again!

### 5. Add Credits (Required)
- OpenAI requires you to add credits to your account before using the API
- Go to: https://platform.openai.com/account/billing
- Click **"Add payment method"** or **"Add credits"**
- Add at least $5-10 to get started
- The Whisper API (for transcription) is very affordable:
  - **$0.006 per minute** of audio transcribed
  - So $5 = ~833 minutes of transcription

### 6. Set Usage Limits (Optional but Recommended)
- Go to: https://platform.openai.com/account/limits
- Set a monthly spending limit to avoid unexpected charges
- Recommended: Start with $20-50/month limit

## Your API Key Format
Your API key will look like this:
```
sk-proj-abc123xyz789...very-long-string
```

## Security Notes
- ⚠️ **Never commit your API key to Git**
- ⚠️ **Never share your API key publicly**
- ✅ The `.env` file is already in `.gitignore` (safe)
- ✅ Only use the key in server-side code (API routes)

## Pricing Reference
- **Whisper API (Transcription):** $0.006 per minute
- **GPT-3.5 Turbo:** ~$0.0015 per 1K tokens
- **GPT-4:** ~$0.03 per 1K tokens (more expensive)

For Content Vault transcription, Whisper is very cost-effective!

