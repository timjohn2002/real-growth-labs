import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"
import { getUserIdFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { htmlToMarkdown } from "@/lib/markdown-to-html"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookId, chapterId, currentContent } = body

    if (!bookId || !chapterId) {
      return NextResponse.json(
        { error: "bookId and chapterId are required" },
        { status: 400 }
      )
    }

    // Verify book ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { chapters: true },
    })

    if (!book || book.userId !== userId) {
      return NextResponse.json(
        { error: "Book not found or unauthorized" },
        { status: 404 }
      )
    }

    const chapter = book.chapters.find(ch => ch.id === chapterId)
    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      )
    }

    // Convert HTML to markdown for processing
    const markdownContent = htmlToMarkdown(currentContent || chapter.content || "")

    // Generate improved outline/content
    const prompt = `Regenerate and improve the following chapter content. Make it more engaging, detailed, and valuable:

Current Content:
${markdownContent}

Chapter Title: ${chapter.title}

Generate improved content that:
- Maintains the chapter structure
- Expands on key points with more detail
- Adds examples and actionable advice
- Is well-written and engaging
- Uses markdown format with proper headings

Return the complete regenerated chapter content in markdown format.`

    const regeneratedContent = await callGPT(prompt, {
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 3000,
      systemPrompt: "You are an expert book editor. Regenerate chapter content to be more engaging, detailed, and valuable while maintaining structure.",
    })

    return NextResponse.json({
      content: regeneratedContent.trim(),
    })
  } catch (error) {
    console.error("Regenerate outline error:", error)
    return NextResponse.json(
      { error: "Failed to regenerate outline" },
      { status: 500 }
    )
  }
}
