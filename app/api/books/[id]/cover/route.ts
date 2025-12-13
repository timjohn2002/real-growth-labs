import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = "https://api.openai.com/v1"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { introductionContent } = body

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      )
    }

    // Get book data
    const book = await prisma.book.findUnique({
      where: { id },
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

    // Get introduction chapter content
    let introText = introductionContent || ""
    if (!introText) {
      // Find the first chapter (likely introduction)
      const introChapter = book.chapters.find(
        (ch) => ch.title.toLowerCase().includes("intro") || ch.order === 1
      )
      if (introChapter?.content) {
        // Strip HTML tags
        introText = introChapter.content.replace(/<[^>]*>/g, "").trim()
      }
    }

    if (!introText) {
      return NextResponse.json(
        { error: "No introduction content found. Please ensure your book has an introduction chapter." },
        { status: 400 }
      )
    }

    // Create a prompt for DALL-E based on the introduction
    // Limit intro text to first 500 characters for prompt
    const introSummary = introText.substring(0, 500)
    
    const prompt = `Create a simple, minimal, and enticing book cover design for a book. The book is about: ${introSummary}. 
    
Design requirements:
- Simple and minimal aesthetic
- Clean, modern design
- Professional and enticing
- Suitable for a book cover
- No text on the cover (just visual design)
- High quality, artistic illustration`

    console.log(`[generateBookCover] Generating cover for book "${book.title}"...`)

    // Generate image using DALL-E 3
    const imageResponse = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    })

    if (!imageResponse.ok) {
      const error = await imageResponse.text()
      console.error("[generateBookCover] OpenAI API error:", error)
      return NextResponse.json(
        { error: `Failed to generate cover: ${error}` },
        { status: 500 }
      )
    }

    const imageData = await imageResponse.json()
    const imageUrl = imageData.data[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL returned from OpenAI" },
        { status: 500 }
      )
    }

    console.log(`[generateBookCover] Cover generated successfully: ${imageUrl}`)

    // Download the image and upload to Supabase Storage
    const imageResponse2 = await fetch(imageUrl)
    if (!imageResponse2.ok) {
      return NextResponse.json(
        { error: "Failed to download generated image" },
        { status: 500 }
      )
    }

    const imageBuffer = Buffer.from(await imageResponse2.arrayBuffer())

    // Upload to Supabase Storage
    const { uploadFile } = await import("@/lib/storage")
    const filename = `book-cover-${id}-${Date.now()}.png`
    
    // Upload the buffer directly (uploadFile handles Buffer)
    const coverImageUrl = await uploadFile(imageBuffer, filename, {
      provider: (process.env.STORAGE_PROVIDER as any) || "supabase",
      bucket: process.env.STORAGE_BUCKET || "content-vault",
      folder: "book-covers",
    })

    // Update book with cover image URL
    await prisma.book.update({
      where: { id },
      data: {
        coverImage: coverImageUrl,
        updatedAt: new Date(),
      },
    })

    console.log(`[generateBookCover] Cover saved to book: ${coverImageUrl}`)

    return NextResponse.json({
      success: true,
      coverImageUrl,
      message: "Book cover generated successfully",
    })
  } catch (error) {
    console.error("[generateBookCover] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate book cover" },
      { status: 500 }
    )
  }
}
