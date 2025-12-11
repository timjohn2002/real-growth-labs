import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * DELETE /api/content/[id] - Delete a content item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Content ID is required" },
        { status: 400 }
      )
    }

    // Find the content item
    const contentItem = await prisma.contentItem.findUnique({
      where: { id },
    })

    if (!contentItem) {
      return NextResponse.json(
        { error: "Content item not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (contentItem.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to delete this content" },
        { status: 403 }
      )
    }

    // Delete the content item
    await prisma.contentItem.delete({
      where: { id },
    })

    console.log(`✅ Content item deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: "Content item deleted successfully",
    })
  } catch (error) {
    console.error("Delete content error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete content item" },
      { status: 500 }
    )
  }
}

