/**
 * YouTube video processing worker
 * This file should be run as a separate process or serverless function
 * to process YouTube video transcription jobs from the queue
 */

import { initializeYouTubeWorker } from "../queue"

// Initialize the worker
const worker = initializeYouTubeWorker()

if (!worker) {
  console.error("Failed to initialize YouTube worker. Redis may not be configured.")
  console.error("Worker process will exit. Please configure Redis to use the job queue.")
  process.exit(1)
}

console.log("YouTube video processing worker started")

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down worker...")
  if (worker) {
    await worker.close()
  }
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down worker...")
  if (worker) {
    await worker.close()
  }
  process.exit(0)
})
