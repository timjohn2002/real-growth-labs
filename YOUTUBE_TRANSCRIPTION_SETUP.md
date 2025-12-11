# YouTube Transcription Setup

## Overview
YouTube transcription is now implemented using `yt-dlp-wrap` and OpenAI Whisper API.

## How It Works
1. User pastes a YouTube URL in Content Vault
2. System detects it's a YouTube URL
3. Downloads audio using yt-dlp
4. Transcribes using OpenAI Whisper API
5. Generates summary and saves to database

## Requirements

### 1. yt-dlp Installation
`yt-dlp-wrap` requires `yt-dlp` to be installed on the system:

**For Local Development (macOS):**
```bash
brew install yt-dlp
```

**For Local Development (Linux):**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

**For Vercel/Serverless:**
Vercel doesn't support installing system binaries. You have two options:

**Option A: Use a Lambda Layer or Docker**
- Deploy to a service that supports Docker (like Railway, Render, or AWS Lambda with layers)
- Include yt-dlp in your Docker image

**Option B: Use a Third-Party API**
- Use a service like AssemblyAI, Deepgram, or similar that handles YouTube transcription
- Modify the code to call their API instead

### 2. Environment Variables
Make sure `OPENAI_API_KEY` is set in your environment variables.

## Testing
1. Go to Content Vault
2. Click "Add Content"
3. Select "Paste URL"
4. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=...`)
5. The system will:
   - Fetch video metadata
   - Download audio
   - Transcribe using Whisper
   - Generate summary
   - Save to database

## Troubleshooting

### Error: "yt-dlp not found"
- Make sure yt-dlp is installed: `which yt-dlp`
- For Vercel, consider using a different deployment platform or API service

### Error: "Failed to download audio"
- Check if the YouTube URL is valid
- Some videos may be restricted or unavailable
- Check network connectivity

### Error: "OpenAI API error"
- Verify `OPENAI_API_KEY` is set correctly
- Check your OpenAI account has credits
- Verify the audio file isn't too large (Whisper has file size limits)

## File Size Limits
- OpenAI Whisper API accepts files up to 25MB
- For longer videos, consider:
  - Splitting the audio into chunks
  - Using a different transcription service
  - Processing in the background with chunking

## Future Improvements
- Add progress tracking for long videos
- Implement chunking for videos > 25MB
- Add support for other video platforms (Vimeo, etc.)
- Cache transcriptions to avoid re-processing

