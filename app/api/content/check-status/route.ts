import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"

/**
 * Check and update status of stuck processing items
 * This endpoint can be called to manually check if items are stuck
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { contentItemId } = await request.json()
    
    if (!contentItemId) {
      return NextResponse.json({ error: "contentItemId is required" }, { status: 400 })
    }

    const item = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
    })

    if (!item) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 })
    }

    if (item.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // If item has been processing for more than 15 minutes, try to retry or mark as error
    if (item.status === "processing") {
      const now = new Date()
      const createdAt = new Date(item.createdAt)
      const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60)
      
      // Parse metadata to check progress
      const metadata = item.metadata ? JSON.parse(item.metadata) : {}
      const progress = metadata.processingProgress || 0
      const processingStage = metadata.processingStage || ""

      // If stuck at 5% (queued) for more than 10 minutes, the worker likely isn't running
      if (progress <= 5 && minutesSinceCreation > 10) {
        // Try to retry processing if it's a YouTube video
        if (item.type === "video" && item.source) {
          const sourceUrl = item.source
          const isYouTube = sourceUrl.includes("youtube.com") || sourceUrl.includes("youtu.be")
          
          if (isYouTube) {
            // Check if Redis/queue is available
            const { isRedisAvailable } = await import("@/lib/queue")
            
            if (!isRedisAvailable()) {
              // No queue available - mark as error with helpful message
              await prisma.contentItem.update({
                where: { id: contentItemId },
                data: {
                  status: "error",
                  error: `Processing timeout after ${Math.round(minutesSinceCreation)} minutes. ` +
                         "The YouTube processing worker is not running or Redis is not configured. " +
                         "Please ensure the YouTube worker is running on a dedicated server with yt-dlp installed.",
                  metadata: JSON.stringify({
                    ...metadata,
                    processingStage: "Error - Worker Not Available",
                    processingProgress: 0,
                    errorDetails: "Worker not running or Redis not configured",
                  }),
                },
              })
              
              return NextResponse.json({
                status: "error",
                message: "Processing failed - worker not available",
                error: "The YouTube processing worker is not running. Please ensure Redis is configured and the worker is running.",
              })
            } else {
              // Queue is available but job might be stuck - try to retry
              try {
                const { getYouTubeQueue } = await import("@/lib/queue")
                const youtubeQueue = getYouTubeQueue()
                
                if (youtubeQueue) {
                  // Check if job exists in queue
                  const jobId = `youtube-${contentItemId}`
                  const job = await youtubeQueue.getJob(jobId)
                  
                  if (job) {
                    // Check if job failed by checking failedReason
                    // BullMQ doesn't return "failed" in getState(), so we check failedReason instead
                    const failedReason = await job.getFailedReason()
                    if (failedReason !== null) {
                      // Retry the job
                      await job.retry()
                      await prisma.contentItem.update({
                        where: { id: contentItemId },
                        data: {
                          metadata: JSON.stringify({
                            ...metadata,
                            processingStage: "Retrying...",
                            processingProgress: 5,
                            retriedAt: new Date().toISOString(),
                          }),
                        },
                      })
                      
                      return NextResponse.json({
                        status: "processing",
                        message: "Job retried successfully",
                        retried: true,
                      })
                    }
                  } else {
                    // Job doesn't exist - create a new one
                    const newJob = await youtubeQueue.add(
                      `youtube-${contentItemId}`,
                      {
                        contentItemId,
                        url: sourceUrl,
                      },
                      {
                        jobId: `youtube-${contentItemId}`,
                        priority: 1,
                      }
                    )
                    
                    await prisma.contentItem.update({
                      where: { id: contentItemId },
                      data: {
                        metadata: JSON.stringify({
                          ...metadata,
                          processingStage: "Queued (Retry)",
                          processingProgress: 5,
                          retriedAt: new Date().toISOString(),
                          jobId: newJob.id,
                        }),
                      },
                    })
                    
                    return NextResponse.json({
                      status: "processing",
                      message: "Job re-queued successfully",
                      requeued: true,
                    })
                  }
                }
              } catch (retryError) {
                console.error("Failed to retry job:", retryError)
              }
            }
          }
        }
      }

      // If still processing after 30 minutes, mark as error
      if (minutesSinceCreation > 30) {
        await prisma.contentItem.update({
          where: { id: contentItemId },
          data: {
            status: "error",
            error: `Processing timeout after ${Math.round(minutesSinceCreation)} minutes. ` +
                   "This usually means the processing worker is not running or the video is too long. " +
                   "Please ensure the YouTube worker is running on a dedicated server with yt-dlp installed.",
            metadata: JSON.stringify({
              ...metadata,
              processingStage: "Error - Timeout",
              processingProgress: 0,
            }),
          },
        })
        
        return NextResponse.json({
          status: "error",
          message: "Item was stuck in processing and has been marked as error",
          error: `Processing timeout after ${Math.round(minutesSinceCreation)} minutes`,
        })
      }
    }

    return NextResponse.json({
      status: item.status,
      error: item.error,
      metadata: item.metadata ? JSON.parse(item.metadata) : null,
    })
  } catch (error) {
    console.error("Error checking status:", error)
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    )
  }
}
