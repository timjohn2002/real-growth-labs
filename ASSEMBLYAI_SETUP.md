# AssemblyAI Setup Guide

## Overview

AssemblyAI integration has been added to handle YouTube video transcription. This replaces the need for `yt-dlp` and works perfectly in Vercel's serverless environment.

## Benefits

✅ **No download needed** - AssemblyAI accepts YouTube URLs directly  
✅ **Works in serverless** - No need for `yt-dlp` or file system access  
✅ **Free tier available** - $50 in credits (about 100 hours of audio)  
✅ **Faster processing** - No download step required  
✅ **Automatic fallback** - Falls back to yt-dlp if AssemblyAI is not configured  

## Setup Instructions

### 1. Get Your AssemblyAI API Key

1. Go to [AssemblyAI](https://www.assemblyai.com/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key

### 2. Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `ASSEMBLYAI_API_KEY`
   - **Value**: Your AssemblyAI API key
4. Make sure it's available for **Production**, **Preview**, and **Development**
5. Redeploy your application

### 3. Test the Integration

1. Upload a YouTube video URL in the Content Vault
2. The system will automatically use AssemblyAI if the API key is configured
3. Check the processing status - it should show "Submitting video to AssemblyAI for transcription..."

## How It Works

1. **AssemblyAI (Preferred)**: If `ASSEMBLYAI_API_KEY` is set, videos are transcribed directly using AssemblyAI's YouTube URL support. No download needed!

2. **yt-dlp (Fallback)**: If AssemblyAI is not configured, the system falls back to the yt-dlp method (requires a dedicated worker with yt-dlp installed).

## Pricing

- **Free Tier**: $50 in credits (about 100 hours of audio)
- **Paid**: $0.00025 per second (~$0.90/hour) after free credits

## Troubleshooting

### "ASSEMBLYAI_API_KEY is not configured"

- Make sure you've added the environment variable in Vercel
- Redeploy your application after adding the variable
- Check that the variable name is exactly `ASSEMBLYAI_API_KEY`

### "Transcription failed"

- Check that the YouTube URL is valid and publicly accessible
- Verify your AssemblyAI account has credits remaining
- Check Vercel logs for detailed error messages

### Still using yt-dlp?

- The system automatically detects if AssemblyAI is configured
- If you see "Downloading audio from YouTube...", AssemblyAI is not configured
- If you see "Submitting video to AssemblyAI...", AssemblyAI is working!

## Next Steps

Once AssemblyAI is configured:
- ✅ YouTube videos will process without getting stuck
- ✅ No need for dedicated workers or yt-dlp
- ✅ Works perfectly in Vercel's serverless environment
- ✅ Faster processing (no download step)
