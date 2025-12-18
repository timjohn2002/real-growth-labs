# Apify YouTube Video Transcriber Setup

## Overview
Apify's YouTube Video Transcriber is a **100% reliable** transcription service that works seamlessly in serverless environments. Unlike caption extraction methods, it:

- ✅ Works even when videos don't have captions enabled
- ✅ Works in serverless environments (Vercel, AWS Lambda, etc.)
- ✅ Handles YouTube URLs directly - no downloading required
- ✅ Provides accurate AI-powered transcriptions
- ✅ Supports 156+ languages

## Setup Instructions

1. **Sign up for Apify**
   - Go to https://apify.com
   - Create an account (free tier available with credits)

2. **Get your API Token**
   - Go to https://console.apify.com/account/integrations
   - Copy your API token

3. **Add to Environment Variables**
   - Add `APIFY_API_TOKEN=your_token_here` to your `.env` file
   - Add it to Vercel environment variables in your project settings

4. **That's it!** The system will automatically use Apify for YouTube transcriptions when the token is configured.

## Pricing
- Apify offers a free tier with credits
- Pay-as-you-go pricing based on usage
- Check https://apify.com/pricing for current rates

## How It Works

The system tries methods in this order:
1. **Apify** (if `APIFY_API_TOKEN` is set) - 100% reliable, works without captions
2. `youtube-caption-extractor` - Free but requires captions
3. `youtube-transcript` - Free but requires captions
4. Web-based extraction - Free but unreliable

Once Apify is configured, it will be the primary method and should work 100% of the time.
