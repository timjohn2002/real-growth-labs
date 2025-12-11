/**
 * Audiobook generation worker
 * This file should be run as a separate process or serverless function
 * to process audiobook generation jobs from the queue
 */

import { initializeAudiobookWorker } from "../queue"

// Initialize the worker
const worker = initializeAudiobookWorker()

console.log("Audiobook generation worker started")

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down worker...")
  await worker.close()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down worker...")
  await worker.close()
  process.exit(0)
})
