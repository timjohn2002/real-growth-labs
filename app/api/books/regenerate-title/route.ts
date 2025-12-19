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
    const { bookId, currentTitle, questionAnswers } = body

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

    // Generate new title using AI
    const prompt = `Generate a compelling book title based on the following information:

Current Title: ${currentTitle || "Untitled"}
Target Reader: ${questionAnswers?.targetReader || "General audience"}
High-Ticket Offer: ${questionAnswers?.highTicketOffer || ""}
Transformation: ${questionAnswers?.transformation || ""}

Generate a new, compelling book title that:
- Is engaging and attention-grabbing
- Clearly communicates the value proposition
- Appeals to the target reader
- Is between 5-12 words
- Does not include quotes or special formatting

Return only the title, nothing else.`

    const newTitle = await callGPT(prompt, {
      model: "gpt-4o",
      temperature: 0.8,
      maxTokens: 50,
      systemPrompt: "You are an expert book title generator. Generate compelling, concise book titles.",
    })

    return NextResponse.json({
      title: newTitle.trim().replace(/^["']|["']$/g, ""), // Remove quotes if present
    })
  } catch (error) {
    console.error("Regenerate title error:", error)
    return NextResponse.json(
      { error: "Failed to regenerate title" },
      { status: 500 }
    )
  }
}
