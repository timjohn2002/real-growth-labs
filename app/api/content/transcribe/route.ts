import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transcribeAudio, generateSummary } from "@/lib/openai"

// Transcribe audio/video using Whisper API
export async function POST(request: NextRequest) {
  try {
    const { contentItemId } = await request.json()

    if (!contentItemId) {
      return NextResponse.json(
        { error: "contentItemId is required" },
        { status: 400 }
      )
    }

    const contentItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
    })

    if (!contentItem) {
      return NextResponse.json(
        { error: "Content item not found" },
        { status: 404 }
      )
    }

    if (!contentItem.fileUrl) {
      return NextResponse.json(
        { error: "No file URL found" },
        { status: 400 }
      )
    }

    // Update status to processing
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: "processing" },
    })

    // TODO: Extract audio from video if needed
    // For video files, extract audio first using ffmpeg or similar

    // Call OpenAI Whisper API
    const transcription = await transcribeAudio(contentItem.fileUrl)

    if (!transcription) {
      throw new Error("Transcription failed")
    }

    const wordCount = transcription.text.split(/\s+/).filter(Boolean).length
    const summary = await generateSummary(transcription.text)

    // Update content item with transcription
    const existingMetadata = contentItem.metadata ? JSON.parse(contentItem.metadata) : {}
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "ready",
        transcript: transcription.text,
        rawText: transcription.text,
        wordCount,
        summary,
        processedAt: new Date(),
        metadata: JSON.stringify({
          ...existingMetadata,
          language: transcription.language,
          duration: transcription.duration,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      transcript: transcription.text,
      wordCount,
      summary,
    })
  } catch (error) {
    console.error("Transcription error:", error)

    // Update content item with error
    const { contentItemId: itemId } = await request.json().catch(() => ({ contentItemId: null }))
    if (itemId) {
      await prisma.contentItem.update({
        where: { id: itemId },
        data: {
          status: "error",
          error: error instanceof Error ? error.message : "Transcription failed",
        },
      }).catch(console.error)
    }

    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    )
  }
}


