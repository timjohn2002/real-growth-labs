# Audiobook Generator Setup Guide

## Overview

The audiobook generator now includes:
1. ✅ Proper MP3 audio concatenation
2. ✅ Real-time status polling
3. ✅ Background job processing with BullMQ

## Features

### 1. Audio Concatenation
- Uses `fluent-ffmpeg` for proper MP3 concatenation when available
- Falls back to simple concatenation for serverless environments
- Handles multiple audio chunks correctly

### 2. Real-time Status Polling
- Frontend polls the API every 2 seconds for status updates
- Progress and current task are tracked in the database
- UI updates in real-time as generation progresses

### 3. Background Job Processing
- Uses BullMQ for job queue management
- Requires Redis for job queue (optional - falls back to direct execution)
- Supports retries, priorities, and job monitoring

## Setup Instructions

### Basic Setup (Without Redis)

The system works out of the box without Redis. Jobs will run in the background directly.

### Advanced Setup (With Redis - Recommended for Production)

1. **Install Redis**
   - Local: `brew install redis` (Mac) or `apt-get install redis` (Linux)
   - Cloud: Use Redis Cloud, Upstash, or AWS ElastiCache

2. **Configure Environment Variables**
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_password_if_needed
   # OR use Redis URL
   REDIS_URL=redis://localhost:6379
   ```

3. **Start the Worker Process**
   ```bash
   npm run worker
   ```
   
   Or run it as a separate process:
   ```bash
   tsx lib/workers/audiobook-worker.ts
   ```

4. **For Production/Serverless**
   - Deploy the worker as a separate service/function
   - Use Vercel Background Functions or AWS Lambda
   - Or run the worker on a separate server/container

## How It Works

### Generation Flow

1. User clicks "Generate" in the UI
2. API creates an audiobook record with status "pending"
3. If Redis is available:
   - Job is added to BullMQ queue
   - Worker process picks up the job
   - Worker calls `generateAudiobook()` function
4. If Redis is not available:
   - Job runs directly in background (non-blocking)
   - Uses the same `generateAudiobook()` function
5. Progress is updated in database as generation proceeds
6. Frontend polls API for status updates
7. When complete, status changes to "completed" and audio URL is available

### Status Updates

The `options` field in the Audiobook model stores JSON with:
```json
{
  "addIntro": true,
  "addOutro": true,
  "progress": 45,
  "currentTask": "Generating audio chunk 3/10..."
}
```

## Troubleshooting

### Audio Concatenation Issues

- **Problem**: Audio files are corrupted or don't play
- **Solution**: Ensure ffmpeg is installed for proper concatenation
  ```bash
  # Check if ffmpeg is available
  ffmpeg -version
  
  # Install if needed (Mac)
  brew install ffmpeg
  ```

### Redis Connection Issues

- **Problem**: Jobs not processing
- **Solution**: 
  - Check Redis is running: `redis-cli ping` (should return "PONG")
  - Verify environment variables are set correctly
  - System will fall back to direct execution if Redis is unavailable

### Worker Not Processing Jobs

- **Problem**: Jobs stay in queue
- **Solution**:
  - Ensure worker process is running: `npm run worker`
  - Check worker logs for errors
  - Verify Redis connection

## Production Deployment

### Vercel Deployment

1. **For API Routes**: Works automatically, uses direct execution
2. **For Worker**: Deploy worker as a separate Vercel Background Function or external service

### Docker Deployment

```dockerfile
# Worker container
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "worker"]
```

### Environment Variables

Required:
- `OPENAI_API_KEY` - For TTS generation
- `DATABASE_URL` - For database access

Optional (for job queue):
- `REDIS_HOST` or `REDIS_URL`
- `REDIS_PORT`
- `REDIS_PASSWORD`

## Monitoring

### Queue Monitoring

You can monitor the queue using BullMQ Dashboard or Redis CLI:

```bash
# Check queue length
redis-cli LLEN bull:audiobook-generation:waiting

# Check active jobs
redis-cli LLEN bull:audiobook-generation:active
```

### Job Status

Check job status via API:
```bash
GET /api/audiobook/{audiobookId}
```

Response includes:
- `status`: "pending" | "generating" | "completed" | "failed"
- `options.progress`: 0-100
- `options.currentTask`: Current task description
- `audioUrl`: URL when completed
- `error`: Error message if failed
