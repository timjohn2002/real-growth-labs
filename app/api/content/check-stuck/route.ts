import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API route to check and mark stuck processing items as errors
 * Items stuck in "processing" for more than 1 hour are marked as errors
 */
export async function POST(request: NextRequest) {
  try {
    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find items stuck in processing for more than 1 hour
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const stuckItems = await prisma.contentItem.findMany({
      where: {
        userId,
        status: "processing",
        updatedAt: {
          lt: oneHourAgo, // Updated more than 1 hour ago
        },
      },
    })

    if (stuckItems.length === 0) {
      return NextResponse.json({
        message: "No stuck items found",
        fixed: 0,
      })
    }

    // Mark stuck items as errors
    const updatePromises = stuckItems.map((item) =>
      prisma.contentItem.update({
        where: { id: item.id },
        data: {
          status: "error",
          error: "Processing timeout - the video processing took too long. This may be due to a very long video, network issues, or the video being unavailable. Please try again or use a shorter video.",
        },
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: `Fixed ${stuckItems.length} stuck item(s)`,
      fixed: stuckItems.length,
      items: stuckItems.map((item) => ({
        id: item.id,
        title: item.title,
      })),
    })
  } catch (error) {
    console.error("Check stuck items error:", error)
    return NextResponse.json(
      { error: "Failed to check stuck items" },
      { status: 500 }
    )
  }
}

