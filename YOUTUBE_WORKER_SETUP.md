# YouTube Worker Setup Guide

This guide will help you set up a production worker to process YouTube videos using yt-dlp and OpenAI Whisper (or AssemblyAI).

## Overview

The worker runs as a separate process that:
1. Listens for YouTube video processing jobs from Redis
2. Downloads audio using yt-dlp
3. Transcribes using OpenAI Whisper (or AssemblyAI if configured)
4. Updates the database with the transcript

## Step 1: Set Up Redis (Upstash - Free Tier)

### Option A: Upstash (Recommended - Free Tier Available)

1. Go to [Upstash](https://upstash.com/)
2. Sign up for a free account
3. Create a new Redis database:
   - Click "Create Database"
   - Choose a region close to your Vercel deployment
   - Name it (e.g., "real-growth-labs-redis")
   - Click "Create"
4. Copy the **Redis URL** (looks like: `rediss://default:xxxxx@xxxxx.upstash.io:6379`)

### Option B: Railway (Alternative)

1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Add Redis service
4. Copy the Redis URL from the service variables

## Step 2: Add Redis URL to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Name**: `REDIS_URL`
   - **Value**: Your Redis URL from Step 1
4. Make sure it's available for **Production**, **Preview**, and **Development**
5. Redeploy your application

## Step 3: Choose Your Worker Hosting Platform

### Option A: Railway (Recommended - Easy Setup)

Railway is great for workers because:
- Easy deployment
- Automatic restarts
- Free tier available
- Simple configuration

#### Setup Steps:

1. **Install Railway CLI** (optional, or use web interface):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Create a new Railway project**:
   ```bash
   railway init
   ```

3. **Add environment variables in Railway dashboard**:
   - `REDIS_URL` - Your Redis URL from Step 1
   - `DATABASE_URL` - Your PostgreSQL database URL (same as Vercel)
   - `OPENAI_API_KEY` - Your OpenAI API key (optional if using AssemblyAI)
   - `ASSEMBLYAI_API_KEY` - Your AssemblyAI API key (optional, if using AssemblyAI)
   - `NODE_ENV=production`

4. **Create a `railway.json` or use Procfile**:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run youtube-worker",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

### Option B: Render (Alternative)

1. Go to [Render](https://render.com/)
2. Create a new **Background Worker**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run youtube-worker`
   - **Environment Variables**: Add all the same variables as Railway
5. Deploy

### Option C: DigitalOcean App Platform

1. Go to [DigitalOcean](https://www.digitalocean.com/)
2. Create a new App
3. Add a Worker component
4. Configure:
   - **Run Command**: `npm run youtube-worker`
   - Add all environment variables
5. Deploy

### Option D: VPS (Most Control)

If you have a VPS (DigitalOcean Droplet, AWS EC2, etc.):

1. **SSH into your server**
2. **Install Node.js and npm**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install yt-dlp**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install -y python3-pip
   pip3 install yt-dlp
   
   # Or using snap
   sudo snap install yt-dlp
   ```

4. **Clone your repository**:
   ```bash
   git clone https://github.com/your-username/real-growth-labs.git
   cd real-growth-labs
   npm install
   ```

5. **Create a `.env` file**:
   ```bash
   nano .env
   ```
   Add all environment variables (REDIS_URL, DATABASE_URL, etc.)

6. **Install PM2** (process manager):
   ```bash
   npm install -g pm2
   ```

7. **Start the worker with PM2**:
   ```bash
   pm2 start npm --name "youtube-worker" -- run youtube-worker
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start on reboot
   ```

## Step 4: Install yt-dlp on Worker Server

The worker needs `yt-dlp` installed. Here's how for each platform:

### Railway/Render/DigitalOcean:
These platforms use Docker. You'll need to create a custom Dockerfile or use a buildpack that includes Python and yt-dlp.

**Create `Dockerfile.worker`**:
```dockerfile
FROM node:20-slim

# Install Python and yt-dlp
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && pip3 install yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Start worker
CMD ["npm", "run", "youtube-worker"]
```

### VPS:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y python3-pip ffmpeg
pip3 install yt-dlp

# Verify installation
yt-dlp --version
```

## Step 5: Test the Worker

1. **Check Redis connection**:
   - The worker should log: "YouTube video processing worker started"
   - No errors about Redis connection

2. **Upload a YouTube video** in your app
3. **Check worker logs**:
   - Railway: View logs in dashboard
   - Render: View logs in dashboard
   - VPS: `pm2 logs youtube-worker`

4. **Verify processing**:
   - Video should move from "processing" to "ready"
   - Transcript should appear in Content Vault

## Step 6: Monitor and Maintain

### Check Worker Status:

**Railway/Render/DigitalOcean**: Check dashboard for worker status

**VPS with PM2**:
```bash
pm2 status
pm2 logs youtube-worker
pm2 restart youtube-worker  # If needed
```

### Common Issues:

1. **Worker not processing jobs**:
   - Check Redis connection
   - Verify REDIS_URL is correct
   - Check worker logs for errors

2. **yt-dlp not found**:
   - Verify yt-dlp is installed: `which yt-dlp`
   - Check PATH includes yt-dlp location

3. **Jobs stuck in queue**:
   - Restart worker
   - Check Redis connection
   - Verify database connection

## Cost Estimates

- **Upstash Redis**: Free tier (10,000 commands/day) or $0.20/100K commands
- **Railway**: Free tier (500 hours/month) or $5/month for hobby
- **Render**: Free tier (750 hours/month) or $7/month
- **DigitalOcean**: $5/month for basic droplet

## Next Steps

Once your worker is running:
1. ✅ YouTube videos will be queued automatically
2. ✅ Worker will process them in the background
3. ✅ Transcripts will appear in Content Vault
4. ✅ No more stuck "processing" status!

## Troubleshooting

If you encounter issues, check:
1. Worker logs for errors
2. Redis connection status
3. yt-dlp installation
4. Environment variables are set correctly
5. Database connection is working

For help, check the worker logs or Vercel function logs when jobs are created.
