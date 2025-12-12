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

    // If item has been processing for more than 30 minutes, mark as error
    if (item.status === "processing") {
      const now = new Date()
      const createdAt = new Date(item.createdAt)
      const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60)

      if (minutesSinceCreation > 30) {
        await prisma.contentItem.update({
          where: { id: contentItemId },
          data: {
            status: "error",
            error: `Processing timeout after ${Math.round(minutesSinceCreation)} minutes. ` +
                   "This usually means yt-dlp is not available in the serverless environment. " +
                   "Please use a dedicated worker process with yt-dlp installed, or try a shorter video.",
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
