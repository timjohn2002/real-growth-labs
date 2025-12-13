import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"
import { isYouTubeUrl } from "@/lib/youtube"

/**
 * Retry processing for a stuck content item
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

    // Only allow retry for processing/error items
    if (item.status !== "processing" && item.status !== "error") {
      return NextResponse.json(
        { error: "Can only retry processing or error items" },
        { status: 400 }
      )
    }

    // For YouTube videos, try to re-queue
    if (item.type === "video" && item.source) {
      const sourceUrl = item.source
      const isYouTube = isYouTubeUrl(sourceUrl)
      
      if (isYouTube) {
        const { getYouTubeQueue, isRedisAvailable } = await import("@/lib/queue")
        
        if (isRedisAvailable()) {
          const youtubeQueue = getYouTubeQueue()
          
          if (youtubeQueue) {
            // Remove old job if it exists
            const jobId = `youtube-${contentItemId}`
            try {
              const oldJob = await youtubeQueue.getJob(jobId)
              if (oldJob) {
                await oldJob.remove()
              }
            } catch (e) {
              // Job might not exist, continue
            }
            
            // Create new job
            const job = await youtubeQueue.add(
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
            
            // Update content item
            await prisma.contentItem.update({
              where: { id: contentItemId },
              data: {
                status: "processing",
                error: null,
                metadata: JSON.stringify({
                  processingStage: "Queued (Retry)",
                  processingProgress: 5,
                  retriedAt: new Date().toISOString(),
                  jobId: job.id,
                }),
              },
            })
            
            return NextResponse.json({
              success: true,
              message: "Video processing re-queued successfully",
              jobId: job.id,
            })
          }
        }
        
        // If queue not available, return error
        return NextResponse.json(
          {
            error: "YouTube processing worker is not available. Please ensure Redis is configured and the YouTube worker is running on a dedicated server.",
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: "Retry is only available for YouTube videos" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error retrying content item:", error)
    return NextResponse.json(
      { error: "Failed to retry processing" },
      { status: 500 }
    )
  }
}
