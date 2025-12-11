import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Get all content items for a user
export async function GET(request: NextRequest) {
  try {
    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const where: any = { userId }
    if (type) where.type = type
    if (status) where.status = status

    const contentItems = await prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    // Format response
    const formatted = contentItems.map((item) => {
      // Parse tags from JSON string to array
      let tags: string[] = []
      try {
        if (item.tags) {
          const parsed = typeof item.tags === "string" ? JSON.parse(item.tags) : item.tags
          tags = Array.isArray(parsed) ? parsed : []
        }
      } catch (e) {
        console.error("Error parsing tags:", e)
        tags = []
      }

      return {
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        wordCount: item.wordCount,
        summary: item.summary,
        thumbnail: item.thumbnail,
        source: item.source,
        duration: item.duration,
        transcript: item.transcript || item.rawText || undefined, // Use rawText as fallback
        error: item.error,
        tags,
        uploadedAt: formatTimeAgo(item.createdAt),
        createdAt: item.createdAt,
      }
    })

    return NextResponse.json({ items: formatted })
  } catch (error) {
    console.error("Get content error:", error)
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}

// Create text content directly
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

    const { title, text, tags } = await request.json()

    if (!title || !text) {
      return NextResponse.json(
        { error: "title and text are required" },
        { status: 400 }
      )
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length
    const summary = await generateSummary(text)

    const contentItem = await prisma.contentItem.create({
      data: {
        userId,
        title,
        type: "text",
        status: "ready",
        rawText: text,
        transcript: text,
        wordCount,
        summary,
        tags: JSON.stringify(tags || []),
        processedAt: new Date(),
      },
    })

    return NextResponse.json({
      id: contentItem.id,
      status: "ready",
      message: "Text content created successfully",
    })
  } catch (error) {
    console.error("Create content error:", error)
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`
}

async function generateSummary(text: string): Promise<string> {
  // Use AI-generated summary if available
  try {
    const { generateSummary } = await import("@/lib/openai")
    return await generateSummary(text)
  } catch (error) {
    // Fallback to simple summary
    const sentences = text.split(/[.!?]+/).filter(Boolean)
    return sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "")
  }
}

