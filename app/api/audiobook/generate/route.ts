import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTTS } from "@/lib/openai"
import { uploadFile } from "@/lib/storage"
import { concatenateMP3Buffers } from "@/lib/audio-utils"
import { audiobookQueue, isRedisAvailable } from "@/lib/queue"

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
        status: "pending",
        jobId: `job-${Date.now()}`,
      },
    })

    // Use job queue if Redis is available, otherwise run in background
    if (isRedisAvailable()) {
      try {
        // Add job to queue
        const job = await audiobookQueue.add(
          `audiobook-${audiobook.id}`,
          {
            audiobookId: audiobook.id,
            book: {
              chapters: book.chapters.map((ch) => ({
                title: ch.title,
                content: ch.content,
              })),
            },
            voice,
            options: options || {},
          },
          {
            jobId: audiobook.jobId,
            priority: 1,
          }
        )

        // Update audiobook with job ID
        await prisma.audiobook.update({
          where: { id: audiobook.id },
          data: {
            jobId: job.id,
            status: "generating",
          },
        })

        return NextResponse.json({
          message: "Audiobook generation queued",
          audiobookId: audiobook.id,
          jobId: job.id,
          estimatedTime: "5-10 minutes",
        })
      } catch (queueError) {
        console.error("Failed to queue job, falling back to direct execution:", queueError)
        // Fall through to direct execution
      }
    }

    // Fallback: Start generation in background (for environments without Redis)
    // Update status to generating
    await prisma.audiobook.update({
      where: { id: audiobook.id },
      data: { status: "generating" },
    })

    // Run generation in background (non-blocking)
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

// Generate audiobook audio (exported for use in worker)
export async function generateAudiobook(
  audiobookId: string,
  book: { chapters: Array<{ title: string; content: string | null }> },
  voice: string,
  options: { addIntro?: boolean; addOutro?: boolean }
) {
  const prisma = (await import("@/lib/prisma")).prisma
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured")
    }

    // Update status to generating
    await prisma.audiobook.update({
      where: { id: audiobookId },
      data: {
        status: "generating",
        options: JSON.stringify({ ...options, progress: 0, currentTask: "Preparing chapters..." }),
      },
    })

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

    // Update progress: Preparing chunks
    await prisma.audiobook.update({
      where: { id: audiobookId },
      data: {
        options: JSON.stringify({ ...options, progress: 10, currentTask: `Prepared ${chunks.length} audio chunks` }),
      },
    })

    // Generate audio for each chunk
    const audioBuffers: Buffer[] = []
    const totalChunks = chunks.length
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const progress = 10 + Math.floor((i / totalChunks) * 70) // 10% to 80%
      
      // Update progress
      await prisma.audiobook.update({
        where: { id: audiobookId },
        data: {
          options: JSON.stringify({
            ...options,
            progress,
            currentTask: `Generating audio chunk ${i + 1}/${totalChunks}...`,
          }),
        },
      })

      console.log(`Generating audio for chunk ${i + 1}/${chunks.length}...`)
      const audioBuffer = await generateTTS(chunk, {
        voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
        model: "tts-1-hd", // Higher quality
      })
      audioBuffers.push(audioBuffer)
    }

    // Update progress: Concatenating
    await prisma.audiobook.update({
      where: { id: audiobookId },
      data: {
        options: JSON.stringify({
          ...options,
          progress: 80,
          currentTask: "Concatenating audio files...",
        }),
      },
    })

    // Properly concatenate MP3 buffers using audio utility
    console.log(`Concatenating ${audioBuffers.length} audio chunks...`)
    const combinedBuffer = await concatenateMP3Buffers(audioBuffers)
    
    // Update progress: Uploading
    await prisma.audiobook.update({
      where: { id: audiobookId },
      data: {
        options: JSON.stringify({
          ...options,
          progress: 90,
          currentTask: "Uploading audio file...",
        }),
      },
    })
    
    // Upload to storage
    const filename = `audiobook-${audiobookId}-${Date.now()}.mp3`
    const audioUrl = await uploadFile(combinedBuffer, filename, {
      provider: (process.env.STORAGE_PROVIDER as any) || "local",
      bucket: process.env.STORAGE_BUCKET,
      folder: "audiobooks",
    })

    // Calculate duration (rough estimate: ~150 words per minute)
    const wordCount = fullText.split(/\s+/).length
    const estimatedDuration = Math.ceil((wordCount / 150) * 60) // seconds

    // Update audiobook record - completed
    await prisma.audiobook.update({
      where: { id: audiobookId },
      data: {
        status: "completed",
        audioUrl,
        duration: estimatedDuration,
        fileSize: combinedBuffer.length,
        options: JSON.stringify({ ...options, progress: 100, currentTask: "Completed!" }),
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
        options: JSON.stringify({
          progress: 0,
          currentTask: `Error: ${error instanceof Error ? error.message : "Generation failed"}`,
        }),
      },
    }).catch(console.error)
    throw error
  }
}

