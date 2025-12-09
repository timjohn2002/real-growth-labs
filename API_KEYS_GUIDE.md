# API Keys Guide - What You Need

## ✅ One OpenAI API Key Covers Everything!

**Good news:** You only need **ONE OpenAI API key** for all AI features in the app!

### What One OpenAI API Key Covers:

#### 1. **Content Vault** ✅
- **Whisper API** - Transcribes audio/video files
- Uses: `OPENAI_API_KEY`
- Cost: ~$0.006 per minute of audio

#### 2. **Book Wizard** ✅
- **GPT API** - Generates book content, chapters, outlines
- Uses: `OPENAI_API_KEY`
- Cost: ~$0.0015 per 1K tokens (GPT-3.5) or ~$0.03 per 1K tokens (GPT-4)

#### 3. **Book Editor AI Tools** ✅
- **GPT API** - Rewrite, expand, shorten, improve content
- Uses: `OPENAI_API_KEY`
- Cost: Same as above

#### 4. **Book Review** ✅ (when implemented)
- **GPT API** - Analyzes book quality, provides insights
- Uses: `OPENAI_API_KEY`

#### 5. **Audiobook Generation** ⚠️ (Optional)
- **OpenAI TTS API** - Text-to-speech (if using OpenAI)
- Uses: `OPENAI_API_KEY`
- **OR** use a different service (ElevenLabs, Google Cloud TTS, etc.)

## 📋 Your `.env` File

You only need **ONE** OpenAI API key:

```env
# OpenAI API Key (covers ALL AI features)
OPENAI_API_KEY="sk-proj-your-key-here"

# Database
DATABASE_URL="postgresql://..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 💰 Cost Breakdown

### Content Vault (Whisper)
- **$0.006 per minute** of audio transcribed
- Example: 1 hour podcast = $0.36

### Book Generation (GPT)
- **GPT-3.5 Turbo:** ~$0.0015 per 1K tokens
- **GPT-4:** ~$0.03 per 1K tokens (more expensive, better quality)
- Example: 10,000-word book = ~13,000 tokens = $0.02 (GPT-3.5) or $0.39 (GPT-4)

### Recommended Starting Budget
- **$20-50/month** should cover moderate usage
- Set spending limits in OpenAI dashboard to avoid surprises

## 🔐 Security Best Practices

1. **Never commit** your API key to Git (`.env` is already in `.gitignore`)
2. **Use environment variables** - Never hardcode keys
3. **Set spending limits** in OpenAI dashboard
4. **Monitor usage** regularly at https://platform.openai.com/usage

## 🎯 Optional: Separate Keys for Different Environments

If you want to separate development/production:

```env
# Development
OPENAI_API_KEY_DEV="sk-proj-dev-key"

# Production  
OPENAI_API_KEY_PROD="sk-proj-prod-key"
```

Then in your code:
```typescript
const apiKey = process.env.NODE_ENV === 'production' 
  ? process.env.OPENAI_API_KEY_PROD 
  : process.env.OPENAI_API_KEY_DEV
```

But for most cases, **one key is fine**!

## 📝 Summary

**Answer: ONE OpenAI API key covers everything!**

- ✅ Content Vault transcription
- ✅ Book Wizard generation
- ✅ Book Editor AI tools
- ✅ Book Review analysis
- ✅ Audiobook (if using OpenAI TTS)

Just add `OPENAI_API_KEY` to your `.env` file and you're good to go!

