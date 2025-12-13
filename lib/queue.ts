/**
 * Job queue setup for background processing
 * Uses BullMQ for job queue management
 */

import { Queue, Worker, QueueEvents } from "bullmq"
import IORedis from "ioredis"

// Lazy Redis connection - only created when needed
let redisConnection: IORedis | null = null

function getRedisConnection(): IORedis | null {
  // Check if Redis is configured
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    return null
  }

  // Return existing connection if available
  if (redisConnection) {
    return redisConnection
  }

  try {
    // Create connection lazily
    redisConnection = process.env.REDIS_URL
      ? new IORedis(process.env.REDIS_URL, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          lazyConnect: true, // Don't connect immediately
          retryStrategy: () => null, // Don't retry on connection failure
        })
      : new IORedis({
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379"),
          password: process.env.REDIS_PASSWORD,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          lazyConnect: true, // Don't connect immediately
          retryStrategy: () => null, // Don't retry on connection failure
        })

    return redisConnection
  } catch (error) {
    console.warn("Failed to create Redis connection:", error)
    return null
  }
}

// Lazy queue initialization - only created when needed
let _audiobookQueue: Queue | null = null
let _audiobookQueueEvents: QueueEvents | null = null

export function getAudiobookQueue(): Queue | null {
  if (_audiobookQueue) {
    return _audiobookQueue
  }

  const connection = getRedisConnection()
  if (!connection) {
    return null
  }

  try {
    _audiobookQueue = new Queue("audiobook-generation", {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    })
    return _audiobookQueue
  } catch (error) {
    console.warn("Failed to create audiobook queue:", error)
    return null
  }
}

export function getAudiobookQueueEvents(): QueueEvents | null {
  if (_audiobookQueueEvents) {
    return _audiobookQueueEvents
  }

  const connection = getRedisConnection()
  if (!connection) {
    return null
  }

  try {
    _audiobookQueueEvents = new QueueEvents("audiobook-generation", {
      connection,
    })
    return _audiobookQueueEvents
  } catch (error) {
    console.warn("Failed to create audiobook queue events:", error)
    return null
  }
}

// YouTube video processing queue
let _youtubeQueue: Queue | null = null

export function getYouTubeQueue(): Queue | null {
  if (_youtubeQueue) {
    return _youtubeQueue
  }

  const connection = getRedisConnection()
  if (!connection) {
    return null
  }

  try {
    _youtubeQueue = new Queue("youtube-processing", {
      connection,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 500,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    })
    return _youtubeQueue
  } catch (error) {
    console.warn("Failed to create YouTube queue:", error)
    return null
  }
}

// Note: Use getAudiobookQueue() instead of direct export to avoid connection errors during build

/**
 * Initialize the audiobook worker
 * This should be called in a separate worker process or serverless function
 */
export function initializeAudiobookWorker() {
  const connection = getRedisConnection()
  if (!connection) {
    console.warn("Cannot initialize audiobook worker: Redis is not configured")
    return null
  }

  try {
    const worker = new Worker(
      "audiobook-generation",
      async (job) => {
        const { audiobookId, book, voice, options } = job.data

        // Note: generateAudiobook is now handled directly in the route
        // This worker is for YouTube processing only
        throw new Error("Audiobook generation worker is deprecated. Use the API route directly.")
        
        return { success: true, audiobookId }
      },
      {
        connection,
        concurrency: 2, // Process 2 jobs concurrently
        limiter: {
          max: 5, // Max 5 jobs per duration
          duration: 60000, // Per minute
        },
      }
    )

    worker.on("completed", (job) => {
      console.log(`Audiobook generation job ${job.id} completed`)
    })

    worker.on("failed", (job, err) => {
      console.error(`Audiobook generation job ${job?.id} failed:`, err)
    })

    return worker
  } catch (error) {
    console.error("Failed to initialize audiobook worker:", error)
    return null
  }
}

/**
 * Initialize the YouTube video processing worker
 * This should be called in a separate worker process or serverless function
 */
export function initializeYouTubeWorker() {
  const connection = getRedisConnection()
  if (!connection) {
    console.warn("Cannot initialize YouTube worker: Redis is not configured")
    return null
  }

  try {
    const worker = new Worker(
      "youtube-processing",
      async (job) => {
        const { contentItemId, url } = job.data

        // Import the processing function dynamically to avoid circular dependencies
        const { processYouTubeVideo } = await import("@/app/api/content/scrape/route")
        
        // Call the processing function
        await processYouTubeVideo(contentItemId, url)
        
        return { success: true, contentItemId }
      },
      {
        connection,
        concurrency: 1, // Process 1 job at a time (YouTube downloads can be resource-intensive)
        limiter: {
          max: 3, // Max 3 jobs per duration
          duration: 60000, // Per minute
        },
      }
    )

    worker.on("completed", (job) => {
      console.log(`YouTube processing job ${job.id} completed`)
    })

    worker.on("failed", (job, err) => {
      console.error(`YouTube processing job ${job?.id} failed:`, err)
    })

    return worker
  } catch (error) {
    console.error("Failed to initialize YouTube worker:", error)
    return null
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  try {
    // Check if Redis environment variables are set
    const hasRedisConfig = !!(process.env.REDIS_HOST || process.env.REDIS_URL)
    
    if (!hasRedisConfig) {
      return false
    }

    // Try to create a test connection (non-blocking check)
    // In production, you might want to do a more thorough check
    return true
  } catch {
    return false
  }
}
