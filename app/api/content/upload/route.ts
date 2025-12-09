import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Handle file uploads (audio, video, text)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "audio" | "video" | "text"
    const title = formData.get("title") as string
    const userId = formData.get("userId") as string // TODO: Get from session/auth

    if (!file || !type || !title || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes: Record<string, string[]> = {
      audio: ["audio/mpeg", "audio/wav", "audio/mp3", "audio/x-m4a"],
      video: ["video/mp4", "video/webm", "video/quicktime"],
      text: ["text/plain"],
    }

    if (!allowedTypes[type]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}. Allowed: ${allowedTypes[type]?.join(", ")}` },
        { status: 400 }
      )
    }

    // TODO: Upload file to storage (S3, Supabase Storage, etc.)
    // For now, we'll store the file info and process it
    const fileUrl = `/uploads/${Date.now()}-${file.name}`

    // Create content item in database
    const contentItem = await prisma.contentItem.create({
      data: {
        userId,
        title,
        type,
        status: "pending",
        fileUrl,
        metadata: {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        },
      },
    })

    // Start processing based on type
    if (type === "audio" || type === "video") {
      // Queue transcription job
      // In production, use a job queue (Bull, BullMQ, etc.)
      processTranscription(contentItem.id).catch(console.error)
    } else if (type === "text") {
      // Process text file immediately
      processTextFile(contentItem.id, file).catch(console.error)
    }

    return NextResponse.json({
      id: contentItem.id,
      status: "pending",
      message: "Upload successful. Processing started.",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

// Process transcription (audio/video)
async function processTranscription(contentItemId: string) {
  try {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: "processing" },
    })

    // TODO: Call transcription API
    // This will be implemented in the transcribe route
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/content/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentItemId }),
    })

    if (!response.ok) {
      throw new Error("Transcription failed")
    }
  } catch (error) {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: error instanceof Error ? error.message : "Processing failed",
      },
    })
  }
}

// Process text file
async function processTextFile(contentItemId: string, file: File) {
  try {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: "processing" },
    })

    const text = await file.text()
    const wordCount = text.split(/\s+/).filter(Boolean).length

    // Generate summary (simplified - in production use AI)
    const summary = generateSummary(text)

    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "ready",
        rawText: text,
        transcript: text,
        wordCount,
        summary,
        processedAt: new Date(),
      },
    })
  } catch (error) {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: error instanceof Error ? error.message : "Processing failed",
      },
    })
  }
}

function generateSummary(text: string): string {
  // Simple summary - first 200 characters
  // TODO: Replace with AI-generated summary
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  return sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "")
}

