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
      image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"],
    }

    if (!allowedTypes[type]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}. Allowed: ${allowedTypes[type]?.join(", ")}` },
        { status: 400 }
      )
    }

    // Read file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // For images, we'll store the data URL directly, so set a temporary placeholder
    // For other types, use placeholder URL
    const initialFileUrl = type === "image" 
      ? "processing" // Will be replaced with data URL
      : `/uploads/${Date.now()}-${file.name}` // Placeholder URL
    
    // Create content item in database first
    const contentItem = await prisma.contentItem.create({
      data: {
        userId,
        title,
        type,
        status: "pending",
        fileUrl: initialFileUrl,
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
    } else if (type === "image") {
      // Process image - upload and store as image (no OCR)
      processImage(contentItem.id, fileBuffer, file.name, file.type).catch(console.error)
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

// Process image - upload and store as image (no OCR)
async function processImage(contentItemId: string, fileBuffer: Buffer, filename: string, mimeType: string) {
  let tempPath: string | null = null
  
  try {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: "processing" },
    })

    console.log(`Processing image upload: ${filename}`)
    
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "-")
    const uniqueFilename = `${contentItemId}-${timestamp}-${sanitizedFilename}`
    
    // For images, convert to base64 data URL and store in database
    // This works in serverless environments without file system access
    // Note: Base64 increases size by ~33%, so we check file size first
    const maxSizeBytes = 10 * 1024 * 1024 // 10MB limit for base64 encoding
    if (fileBuffer.length > maxSizeBytes) {
      throw new Error(`Image is too large (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`)
    }
    
    const base64Image = fileBuffer.toString("base64")
    const dataUrl = `data:${mimeType};base64,${base64Image}`
    
    // Use data URL as the image URL (stored in database)
    const imageUrl = dataUrl

    console.log(`Image uploaded successfully. Size: ${(fileBuffer.length / 1024).toFixed(2)}KB, Base64 size: ${(dataUrl.length / 1024).toFixed(2)}KB`)

    // Get the content item to use its title for summary
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      select: { title: true },
    })

    // Generate a simple summary based on filename/title
    const summary = contentItem?.title 
      ? `Image: ${contentItem.title}`
      : `Image: ${filename}`

    // Update content item with image URL (no text extraction)
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "ready",
        fileUrl: imageUrl, // Store the image URL
        thumbnail: imageUrl, // Use same URL as thumbnail
        summary,
        wordCount: 0, // Images don't have word count
        processedAt: new Date(),
        error: null,
        // Don't set transcript or rawText - keep image as image
      },
    })

    console.log(`✅ Image processed and stored successfully: ${contentItemId}`)
  } catch (error) {
    console.error("Image processing error:", error)
    const errorMessage = error instanceof Error ? error.message : "Processing failed"
    
    // Log full error details for debugging
    console.error("Full error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      contentItemId,
      filename,
    })
    
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: errorMessage,
      },
    })
  } finally {
    // Clean up temp file if any
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

