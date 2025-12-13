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

    // Use GPT-4o to generate an optimized prompt for DALL-E 3
    const introSummary = introText.substring(0, 1000) // Use more context for GPT-4o
    
    console.log(`[generateBookCover] Generating optimized prompt with GPT-4o for book "${book.title}"...`)
    
    const { callGPT } = await import("@/lib/openai")
    
    const promptGenerationPrompt = `You are a professional book cover designer. Create an optimized, detailed prompt for DALL-E 3 to generate a book cover.

Book Title: "${book.title}"
Book Introduction/Content: ${introSummary}

Requirements for the DALL-E 3 prompt:
1. Must be a flat, graphic book cover design (NOT a photograph of a physical book)
2. DO NOT include any text, words, or letters in the design - this will be added separately
3. Should reflect the book's content and theme based on the introduction
4. Simple, minimal, and modern aesthetic
5. Professional and enticing design
6. Suitable for both print and digital formats
7. Pure graphic design - no 3D effects, shadows, or photographic elements
8. High quality, artistic illustration
9. Leave space in the center or top area for text overlay (title will be added programmatically)

Generate a concise, effective prompt (2-3 sentences max) that DALL-E 3 can use to create this cover. Focus ONLY on visual elements, color palette suggestions, and design style that matches the book's theme. Do not mention text or words.`

    const optimizedPrompt = await callGPT(promptGenerationPrompt, {
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 200,
      systemPrompt: "You are an expert at creating detailed, effective prompts for AI image generation. Your prompts are clear, specific, and produce high-quality results.",
    })

    console.log(`[generateBookCover] Optimized prompt from GPT-4o: ${optimizedPrompt}`)
    console.log(`[generateBookCover] Generating cover with DALL-E 3...`)

    // Generate image using DALL-E 3
    const imageResponse = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: optimizedPrompt.trim(),
        n: 1,
        size: "1024x1024",
        quality: "hd", // Use HD quality for better results
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

    let imageBuffer = Buffer.from(await imageResponse2.arrayBuffer())

    // Overlay book title on the cover using sharp
    try {
      const sharp = (await import("sharp")).default
      
      // Load the image
      const image = sharp(imageBuffer)
      const metadata = await image.metadata()
      const width = metadata.width || 1024
      const height = metadata.height || 1024
      
      // Calculate font size based on image dimensions and title length
      const title = book.title
      const titleLength = title.length
      // Adjust font size based on title length - longer titles need smaller fonts
      let baseFontSize = Math.floor(width * 0.12)
      if (titleLength > 30) {
        baseFontSize = Math.floor(width * 0.08)
      } else if (titleLength > 20) {
        baseFontSize = Math.floor(width * 0.09)
      }
      
      // Escape HTML entities in title
      const escapedTitle = title
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
      
      // Split long titles into multiple lines (approximately 25 characters per line)
      const words = title.split(" ")
      const lines: string[] = []
      let currentLine = ""
      
      for (const word of words) {
        if ((currentLine + " " + word).length <= 25 && currentLine.length > 0) {
          currentLine += " " + word
        } else {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        }
      }
      if (currentLine) lines.push(currentLine)
      
      // If title is short, use single line
      const finalLines = lines.length > 1 && titleLength > 20 ? lines : [title]
      const lineHeight = baseFontSize * 1.2
      const totalTextHeight = finalLines.length * lineHeight
      const startY = height / 2 - (totalTextHeight / 2) + (lineHeight / 2)
      
      // Create SVG with text overlay
      const textElements = finalLines
        .map((line, index) => {
          const y = startY + index * lineHeight
          const escapedLine = line
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
          
          return `
            <!-- Shadow for line ${index + 1} -->
            <text x="${width / 2}" y="${y + 3}" class="title-shadow">${escapedLine}</text>
            <text x="${width / 2}" y="${y}" class="title-text">${escapedLine}</text>
          `
        })
        .join("")
      
      const svgText = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              .title-text {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-weight: bold;
                font-size: ${baseFontSize}px;
                fill: white;
                text-anchor: middle;
                dominant-baseline: middle;
                letter-spacing: 1px;
              }
              .title-shadow {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-weight: bold;
                font-size: ${baseFontSize}px;
                fill: rgba(0, 0, 0, 0.6);
                text-anchor: middle;
                dominant-baseline: middle;
                letter-spacing: 1px;
              }
            </style>
          </defs>
          ${textElements}
        </svg>
      `
      
      // Composite the text overlay onto the image
      const compositeBuffer = await image
        .composite([
          {
            input: Buffer.from(svgText),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer()
      
      // Convert to standard Buffer type to fix TypeScript compatibility
      imageBuffer = Buffer.from(compositeBuffer)
      
      console.log(`[generateBookCover] Title "${title}" overlaid on cover successfully (${finalLines.length} line(s))`)
    } catch (overlayError) {
      console.warn(`[generateBookCover] Failed to overlay text, using original image:`, overlayError)
      // Continue with original image if text overlay fails
    }

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
