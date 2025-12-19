import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"
import { getUserIdFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const { bookId, currentSubtitle, bookTitle, questionAnswers } = body

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId is required" },
        { status: 400 }
      )
    }

    // Verify book ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book || book.userId !== userId) {
      return NextResponse.json(
        { error: "Book not found or unauthorized" },
        { status: 404 }
      )
    }

    // Generate new subtitle using AI
    const prompt = `Generate a compelling book subtitle based on the following information:

Book Title: ${bookTitle || "Untitled"}
Current Subtitle: ${currentSubtitle || ""}
Target Reader: ${questionAnswers?.targetReader || "General audience"}
High-Ticket Offer: ${questionAnswers?.highTicketOffer || ""}
Transformation: ${questionAnswers?.transformation || ""}

Generate a new, compelling book subtitle that:
- Complements the book title
- Clearly explains what the reader will learn or achieve
- Appeals to the target reader
- Is between 8-20 words
- Does not include quotes or special formatting

Return only the subtitle, nothing else.`

    const newSubtitle = await callGPT(prompt, {
      model: "gpt-4o",
      temperature: 0.8,
      maxTokens: 80,
      systemPrompt: "You are an expert book subtitle generator. Generate compelling, descriptive book subtitles.",
    })

    return NextResponse.json({
      subtitle: newSubtitle.trim().replace(/^["']|["']$/g, ""), // Remove quotes if present
    })
  } catch (error) {
    console.error("Regenerate subtitle error:", error)
    return NextResponse.json(
      { error: "Failed to regenerate subtitle" },
      { status: 500 }
    )
  }
}
