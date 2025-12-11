import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"
import os from "os"

// Handle file uploads (audio, video, text)
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "audio" | "video" | "text"
    const title = formData.get("title") as string

    if (!file || !type || !title) {
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

    // Read file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Create content item in database first
    const contentItem = await prisma.contentItem.create({
      data: {
        userId,
        title,
        type,
        status: "pending",
        fileUrl: `/uploads/${Date.now()}-${file.name}`, // Placeholder URL
        metadata: JSON.stringify({
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        }),
        tags: "[]",
      },
    })

    // Start processing based on type
    if (type === "audio" || type === "video") {
      // Process transcription with file buffer directly
      processTranscription(contentItem.id, fileBuffer, file.name, file.type).catch(console.error)
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
async function processTranscription(contentItemId: string, fileBuffer: Buffer, filename: string, mimeType: string) {
  let tempPath: string | null = null
  
  try {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: "processing" },
    })

    // Use OpenAI Whisper API to transcribe
    const { transcribeAudioFromBuffer } = await import("@/lib/openai")
    const { generateSummary } = await import("@/lib/openai")
    
    console.log(`Transcribing ${mimeType} file: ${filename}`)
    
    // Determine file extension and content type
    // Whisper API can handle both audio and video files
    const extension = filename.split('.').pop() || (mimeType.includes('video') ? 'mp4' : 'mp3')
    const contentType = mimeType.includes('video') ? 'video/mp4' : 'audio/mpeg'
    
    const transcription = await transcribeAudioFromBuffer(
      fileBuffer,
      `${contentItemId}.${extension}`,
      { language: "en" }
    )

    if (!transcription.text || transcription.text.trim().length === 0) {
      throw new Error("Transcription returned empty text")
    }

    console.log(`Transcription complete. Text length: ${transcription.text.length}`)

    // Generate summary
    const summary = await generateSummary(transcription.text)
    const wordCount = transcription.text.split(/\s+/).filter(Boolean).length

    // Update content item
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "ready",
        transcript: transcription.text,
        rawText: transcription.text,
        wordCount,
        summary,
        processedAt: new Date(),
        error: null,
      },
    })

    console.log(`✅ ${mimeType} file processed successfully: ${contentItemId}`)
  } catch (error) {
    console.error("Transcription error:", error)
    const errorMessage = error instanceof Error ? error.message : "Processing failed"
    
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: errorMessage,
      },
    })
  } finally {
    // Clean up temp file
    if (tempPath) {
      try {
        await fs.unlink(tempPath)
      } catch (e) {
        console.error("Failed to delete temp file:", e)
      }
    }
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

    // Generate summary using AI
    const summary = await generateSummary(text)

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

