# YouTube Video Processing Setup Guide

## Current Issue

YouTube video processing requires `yt-dlp` to download videos, which is **not available in Vercel's serverless environment**. This is why videos get stuck in "processing" status.

## Solutions

### Option 1: Use a Dedicated Worker (Recommended)

Run the YouTube worker on a server that has `yt-dlp` installed:

1. **Install yt-dlp on your server:**
   ```bash
   # macOS
   brew install yt-dlp
   
   # Linux
   pip install yt-dlp
   # or
   sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
   sudo chmod a+rx /usr/local/bin/yt-dlp
   ```

2. **Set up Redis** (if not already done):
   - Use Upstash Redis (free tier available)
   - Set `REDIS_URL` in Vercel environment variables

3. **Run the YouTube worker:**
   ```bash
   npm run youtube-worker
   ```
   
   Or use PM2 to keep it running:
   ```bash
   pm2 start npm --name "youtube-worker" -- run youtube-worker
   ```

### Option 2: Use Vercel Background Functions (If Available)

If you have Vercel Pro, you can use Background Functions which have longer timeouts.

### Option 3: Use a Third-Party Service

Consider using services like:
- AssemblyAI (has YouTube URL support)
- Deepgram
- Rev.ai

These services can process YouTube URLs directly without needing `yt-dlp`.

## Troubleshooting

### Video Stuck in "Processing"

1. **Check the error status:**
   - Open the video in Content Vault
   - Check the "Error Details" section in the drawer
   - Look for error messages about `yt-dlp` not being available

2. **Check Vercel logs:**
   - Go to Vercel dashboard → Your deployment → Functions
   - Look for errors in `/api/content/scrape` route
   - Check for "yt-dlp not found" or timeout errors

3. **Manual fix:**
   - If a video is stuck, you can delete it and re-upload
   - Or wait for the 30-minute timeout to trigger

### Common Errors

- **"yt-dlp is not installed"**: The server doesn't have yt-dlp. Install it or use a dedicated worker.
- **"Processing timeout"**: Video is too long (>30 minutes) or download failed.
- **"Private video"**: The YouTube video is private or unavailable.
- **"Download timeout"**: The video download took longer than 20 minutes.

## Current Status

The code now:
- ✅ Detects serverless environments and provides helpful errors
- ✅ Supports job queue for background processing
- ✅ Has better error messages and logging
- ✅ Exports `processYouTubeVideo` for use in workers

**Next Steps:**
1. Set up Redis (Upstash recommended)
2. Install `yt-dlp` on a server/worker machine
3. Run `npm run youtube-worker` to process videos
4. Videos will be queued and processed by the worker
