import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
    const transcription = await transcribeWithWhisper(contentItem.fileUrl)

    if (!transcription) {
      throw new Error("Transcription failed")
    }

    const wordCount = transcription.text.split(/\s+/).filter(Boolean).length
    const summary = generateSummary(transcription.text)

    // Update content item with transcription
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "ready",
        transcript: transcription.text,
        rawText: transcription.text,
        wordCount,
        summary,
        processedAt: new Date(),
        metadata: {
          ...(contentItem.metadata as object || {}),
          language: transcription.language,
          duration: transcription.duration,
        },
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

async function transcribeWithWhisper(fileUrl: string) {
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not configured. Using mock transcription.")
    return {
      text: "This is a placeholder transcription. Please configure OPENAI_API_KEY to enable real transcription.",
      language: "en",
      duration: 0,
    }
  }

  try {
    // Fetch the file (in production, this should be from your storage)
    // For now, we'll assume the file is accessible
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error("Failed to fetch file")
    }

    const formData = new FormData()
    const blob = await fileResponse.blob()
    formData.append("file", blob, "audio.mp3")
    formData.append("model", "whisper-1")
    formData.append("language", "en")

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    return {
      text: data.text,
      language: data.language || "en",
      duration: data.duration || 0,
    }
  } catch (error) {
    console.error("Whisper API error:", error)
    throw error
  }
}

function generateSummary(text: string): string {
  // Simple summary - first 200 characters
  // TODO: Replace with AI-generated summary using GPT
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  return sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "")
}

