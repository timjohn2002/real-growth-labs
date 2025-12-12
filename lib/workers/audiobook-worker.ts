/**
 * Audiobook generation worker
 * This file should be run as a separate process or serverless function
 * to process audiobook generation jobs from the queue
 */

import { initializeAudiobookWorker } from "../queue"

// Initialize the worker
const worker = initializeAudiobookWorker()

if (!worker) {
  console.error("Failed to initialize audiobook worker. Redis may not be configured.")
  console.error("Worker process will exit. Please configure Redis to use the job queue.")
  process.exit(1)
}

console.log("Audiobook generation worker started")

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
