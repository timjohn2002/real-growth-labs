import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, voice, options } = body

    if (!bookId || !voice) {
      return NextResponse.json(
        { error: "bookId and voice are required" },
        { status: 400 }
      )
    }

    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      )
    }

    // Create audiobook record
    const audiobook = await prisma.audiobook.create({
      data: {
        bookId,
        voice,
        options: options || { addIntro: false, addOutro: false },
        status: "pending",
        jobId: `job-${Date.now()}`, // Temporary job ID
      },
    })

    // TODO: In production, this would:
    // 1. Queue a background job for TTS generation
    // 2. Process chapters one by one
    // 3. Combine audio files
    // 4. Upload to storage
    // 5. Update audiobook record with audioUrl and status

    // For now, return the audiobook ID so the frontend can track it
    return NextResponse.json({
      message: "Audiobook generation started",
      audiobookId: audiobook.id,
      jobId: audiobook.jobId,
      estimatedTime: "5-10 minutes",
    })
  } catch (error) {
    console.error("Audiobook generation error:", error)
    return NextResponse.json(
      { error: "Failed to start audiobook generation" },
      { status: 500 }
    )
  }
}

