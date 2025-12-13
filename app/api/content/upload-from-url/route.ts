import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Handle content upload when file is already uploaded to Supabase Storage
 * This endpoint processes the file URL and creates the content item
 */
export async function POST(request: NextRequest) {
  try {
    // Log connection info
    console.log(`[upload-from-url] DATABASE_URL format: ${process.env.DATABASE_URL?.includes('pooler') ? 'Pooler' : 'Direct'}`)
    console.log(`[upload-from-url] DATABASE_URL host: ${process.env.DATABASE_URL?.match(/@([^:]+)/)?.[1]}`)
    
    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Test database connection with a simple query
    try {
      const testUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })
      console.log(`[upload-from-url] Database connection test: ${testUser ? 'SUCCESS' : 'USER NOT FOUND'}`)
    } catch (testError: any) {
      console.error(`[upload-from-url] Database connection test FAILED:`, testError.message)
      if (testError.message?.includes("row-level security")) {
        return NextResponse.json(
          { 
            error: "Database RLS is still enabled. Connection test failed with RLS error.",
            details: testError.message
          },
          { status: 500 }
        )
      }
    }

    const { fileUrl, filePath, type, title, filename, size, mimeType } = await request.json()

    if (!fileUrl || !type || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create content item in database
    console.log(`[upload-from-url] Creating content item for user: ${userId}`)
    console.log(`[upload-from-url] DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@")}`)
    
    try {
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
      console.log(`[upload-from-url] Content item created: ${contentItem.id}`)

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
    } catch (dbError: any) {
      console.error("[upload-from-url] Database error:", dbError)
      console.error("[upload-from-url] Error code:", dbError.code)
      console.error("[upload-from-url] Error message:", dbError.message)
      console.error("[upload-from-url] Error meta:", dbError.meta)
      
      // Check if it's an RLS error
      if (dbError.message?.includes("row-level security") || dbError.code === "P2003") {
        return NextResponse.json(
          { 
            error: "Database security policy error. Please ensure RLS is disabled on ContentItem table and DATABASE_URL uses direct connection.",
            details: dbError.message,
            code: dbError.code
          },
          { status: 500 }
        )
      }
      
      throw dbError // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("[upload-from-url] Upload error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to process uploaded file"
    return NextResponse.json(
      { error: errorMessage },
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
