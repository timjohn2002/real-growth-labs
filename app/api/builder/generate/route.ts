import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, chapterId, bookId, context } = body

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      )
    }

    // Build the generation prompt
    const systemPrompt = `You are an expert book writer and content creator. Write engaging, well-structured content that provides value to readers. Use clear language, include examples, and maintain a professional yet accessible tone.`

    const fullPrompt = context
      ? `${context}\n\nBased on the above context, ${prompt}`
      : prompt

    // Generate content using GPT
    const generatedContent = await callGPT(fullPrompt, {
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt,
    })

    const wordCount = generatedContent.split(/\s+/).filter(Boolean).length

    return NextResponse.json({
      content: generatedContent,
      wordCount,
    })
  } catch (error) {
    console.error("Content generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    )
  }
}

