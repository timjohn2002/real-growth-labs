import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSummary } from "@/lib/openai"

/**
 * Improve the summary of a content item using AI
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

    const { contentItemId } = await request.json()

    if (!contentItemId) {
      return NextResponse.json(
        { error: "contentItemId is required" },
        { status: 400 }
      )
    }

    // Get the content item
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
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
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Need transcript or rawText to generate improved summary
    const textToSummarize = contentItem.transcript || contentItem.rawText

    if (!textToSummarize) {
      return NextResponse.json(
        { error: "No transcript or text available to improve summary" },
        { status: 400 }
      )
    }

    // Generate improved summary using AI
    // Create a more detailed prompt for better summary quality
    const { generateText } = await import("@/lib/openai")
    
    const prompt = `Create an improved, comprehensive summary of the following content. The summary should:
- Be clear and concise (around 300-400 words)
- Highlight the main points and key takeaways
- Be engaging and informative
- Focus on the most valuable information

Content to summarize:
${textToSummarize.substring(0, 8000)}`

    const improvedSummary = await generateText(prompt, "gpt-4o", 500)

    // Update the content item with improved summary
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        summary: improvedSummary,
      },
    })

    return NextResponse.json({
      success: true,
      summary: improvedSummary,
      message: "Summary improved successfully",
    })
  } catch (error) {
    console.error("Improve summary error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to improve summary" },
      { status: 500 }
    )
  }
}

