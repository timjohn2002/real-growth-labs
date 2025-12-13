import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Handle content upload when file is already uploaded to Supabase Storage
 * This endpoint processes the file URL and creates the content item
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

    const { fileUrl, filePath, type, title, filename, size, mimeType } = await request.json()

    if (!fileUrl || !type || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create content item in database
    const contentItem = await prisma.contentItem.create({
      data: {
        userId,
        title,
        type,
        status: "pending",
        fileUrl,
        metadata: JSON.stringify({
          filename,
          size,
          mimeType,
          storagePath: filePath,
          uploadedVia: "supabase",
        }),
        tags: "[]",
      },
    })

    // Start processing based on type
    if (type === "video") {
      // For video files, we need to download from Supabase and process
      processVideoFromUrl(contentItem.id, fileUrl, filename, mimeType).catch(console.error)
    } else if (type === "image") {
      // For images, download and process
      processImageFromUrl(contentItem.id, fileUrl, filename, mimeType).catch(console.error)
    } else if (type === "text") {
      // Text files should be handled differently
      return NextResponse.json(
        { error: "Text files should be uploaded directly" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      id: contentItem.id,
      status: "pending",
      message: "Upload successful. Processing started.",
    })
  } catch (error) {
    console.error("Upload from URL error:", error)
    return NextResponse.json(
      { error: "Failed to process uploaded file" },
      { status: 500 }
    )
  }
}

// Process video from Supabase URL
async function processVideoFromUrl(
  contentItemId: string,
  fileUrl: string,
  filename: string,
  mimeType: string
) {
  try {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: "processing" },
    })

    // Download file from Supabase
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer())

    // Use OpenAI Whisper API to transcribe
    const { transcribeAudioFromBuffer } = await import("@/lib/openai")
    const { generateSummary } = await import("@/lib/openai")

    console.log(`Transcribing video file from Supabase: ${filename}`)

    const extension = filename.split(".").pop() || "mp4"
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

    console.log(`✅ Video file processed successfully: ${contentItemId}`)
  } catch (error) {
    console.error("Video processing error:", error)
    const errorMessage = error instanceof Error ? error.message : "Processing failed"

    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: errorMessage,
      },
    })
  }
}

// Process image from Supabase URL
async function processImageFromUrl(
  contentItemId: string,
  fileUrl: string,
  filename: string,
  mimeType: string
) {
  try {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { status: "processing" },
    })

    console.log(`Processing image from Supabase: ${filename}`)

    // Get the content item to use its title for summary
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      select: { title: true },
    })

    // Generate a simple summary based on filename/title
    const summary = contentItem?.title
      ? `Image: ${contentItem.title}`
      : `Image: ${filename}`

    // Update content item with image URL
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "ready",
        fileUrl,
        thumbnail: fileUrl,
        summary,
        wordCount: 0,
        processedAt: new Date(),
        error: null,
      },
    })

    console.log(`✅ Image processed and stored successfully: ${contentItemId}`)
  } catch (error) {
    console.error("Image processing error:", error)
    const errorMessage = error instanceof Error ? error.message : "Processing failed"

    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: errorMessage,
      },
    })
  }
}
