import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, style, tone, instruction } = body

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      )
    }

    // Build the rewrite prompt
    let systemPrompt = "You are an expert editor and writer. Rewrite the following content to improve clarity, engagement, and quality."
    
    if (style) {
      systemPrompt += ` Use a ${style} writing style.`
    }
    
    if (tone) {
      systemPrompt += ` Maintain a ${tone} tone.`
    }

    const prompt = instruction
      ? `${instruction}\n\nOriginal content:\n${content}`
      : `Rewrite and improve the following content while maintaining its core message and meaning:\n\n${content}`

    // Generate rewritten content using GPT
    const rewrittenContent = await callGPT(prompt, {
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt,
    })

    const wordCount = rewrittenContent.split(/\s+/).filter(Boolean).length

    return NextResponse.json({
      content: rewrittenContent,
      wordCount,
    })
  } catch (error) {
    console.error("Content rewrite error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to rewrite content" },
      { status: 500 }
    )
  }
}

