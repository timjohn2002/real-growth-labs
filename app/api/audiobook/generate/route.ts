import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTTS } from "@/lib/openai"
import { uploadFile } from "@/lib/storage"

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
        options: JSON.stringify(options || { addIntro: false, addOutro: false }),
        status: "generating",
        jobId: `job-${Date.now()}`,
      },
    })

    // Start generation in background (in production, use a job queue)
    generateAudiobook(audiobook.id, book, voice, options || {}).catch((error) => {
      console.error("Audiobook generation error:", error)
      prisma.audiobook.update({
        where: { id: audiobook.id },
        data: {
          status: "failed",
          error: error instanceof Error ? error.message : "Generation failed",
        },
      }).catch(console.error)
    })

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

// Generate audiobook audio
async function generateAudiobook(
  audiobookId: string,
  book: { chapters: Array<{ title: string; content: string | null }> },
  voice: string,
  options: { addIntro?: boolean; addOutro?: boolean }
) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured")
    }

    // Combine all chapter content
    let fullText = ""
    
    if (options.addIntro) {
      fullText += `Welcome to ${book.chapters[0]?.title || "this book"}. Let's begin.\n\n`
    }

    for (const chapter of book.chapters) {
      if (chapter.content) {
        const cleanContent = chapter.content.replace(/<[^>]*>/g, "").trim()
        fullText += `${chapter.title}\n\n${cleanContent}\n\n`
      }
    }

    if (options.addOutro) {
      fullText += "\n\nThank you for listening. We hope you enjoyed this book."
    }

    // Split into chunks (OpenAI TTS has limits)
    const maxChunkLength = 4000 // characters
    const chunks: string[] = []
    
    for (let i = 0; i < fullText.length; i += maxChunkLength) {
      chunks.push(fullText.substring(i, i + maxChunkLength))
    }

    // Update status to generating
    await prisma.audiobook.update({
      where: { id: audiobookId },
      data: { status: "generating" },
    })

    // Generate audio for each chunk
    const audioBuffers: Buffer[] = []
    const totalChunks = chunks.length
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`[generateAudiobook] Generating audio chunk ${i + 1}/${totalChunks}...`)
      
      const audioBuffer = await generateTTS(chunk, {
        voice: voice as any,
        model: "tts-1-hd", // Higher quality
      })
      audioBuffers.push(audioBuffer)
      
      // Update progress (0-80% for generation, 80-100% for upload)
      const generationProgress = Math.floor(((i + 1) / totalChunks) * 80)
      console.log(`[generateAudiobook] Progress: ${generationProgress}%`)
    }

    // Combine audio buffers
    // Note: Simply concatenating MP3 buffers works for OpenAI TTS output
    // as they produce valid MP3 files that can be concatenated
    console.log(`[generateAudiobook] Combining ${audioBuffers.length} audio chunks...`)
    const combinedBuffer = Buffer.concat(audioBuffers)
    console.log(`[generateAudiobook] Combined buffer size: ${(combinedBuffer.length / 1024 / 1024).toFixed(2)} MB`)
    
    // Upload to storage (use Supabase by default)
    const filename = `audiobook-${audiobookId}-${Date.now()}.mp3`
    console.log(`[generateAudiobook] Uploading audiobook file: ${filename} (${(combinedBuffer.length / 1024 / 1024).toFixed(2)} MB)`)
    
    const audioUrl = await uploadFile(combinedBuffer, filename, {
      provider: (process.env.STORAGE_PROVIDER as any) || "supabase",
      bucket: process.env.STORAGE_BUCKET || "content-vault",
      folder: "audiobooks",
    })
    
    console.log(`[generateAudiobook] Audiobook uploaded successfully: ${audioUrl}`)
    
    if (!audioUrl) {
      throw new Error("Failed to upload audiobook file - no URL returned")
    }

    // Calculate duration (rough estimate: ~150 words per minute)
    const wordCount = fullText.split(/\s+/).length
    const estimatedDuration = Math.ceil((wordCount / 150) * 60) // seconds

    // Update audiobook record
    await prisma.audiobook.update({
      where: { id: audiobookId },
      data: {
        status: "completed",
        audioUrl,
        duration: estimatedDuration,
        fileSize: combinedBuffer.length,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Audiobook generation error:", error)
    await prisma.audiobook.update({
      where: { id: audiobookId },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Generation failed",
      },
    }).catch(console.error)
    throw error
  }
}

