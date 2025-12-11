import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, content, selectedText, tone, context } = body

    if (!action) {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      )
    }

    // Use selected text if available, otherwise use full content
    const textToProcess = selectedText || content || ""

    if (!textToProcess) {
      return NextResponse.json(
        { error: "content or selectedText is required" },
        { status: 400 }
      )
    }

    let prompt = ""
    let systemPrompt = "You are an expert editor and writer. Help improve the content while maintaining its core message and meaning."

    switch (action) {
      case "rewrite":
        systemPrompt = "You are an expert editor. Rewrite the following content to improve clarity, engagement, and quality while maintaining the original meaning."
        prompt = `Rewrite and improve the following content:\n\n${textToProcess}`
        break

      case "shorten":
        systemPrompt = "You are an expert editor. Condense the following content while preserving all key points and meaning."
        prompt = `Shorten and condense the following content while keeping all important information:\n\n${textToProcess}`
        break

      case "expand":
        systemPrompt = "You are an expert writer. Expand the following content with more detail, examples, and explanations."
        prompt = `Expand the following content with more detail, examples, and explanations:\n\n${textToProcess}`
        break

      case "changeTone":
        const toneMap: { [key: string]: string } = {
          professional: "professional and formal",
          conversational: "conversational and friendly",
          punchy: "bold and punchy",
          bold: "bold and impactful",
          friendly: "warm and friendly",
          "story-driven": "narrative and story-driven",
        }
        const toneDescription = toneMap[tone] || tone || "professional"
        systemPrompt = `You are an expert writer. Rewrite the content with a ${toneDescription} tone.`
        prompt = `Rewrite the following content with a ${toneDescription} tone:\n\n${textToProcess}`
        break

      case "addStory":
        systemPrompt = "You are an expert storyteller. Add a relevant story or example that illustrates the point."
        prompt = `Add a relevant story or example to illustrate the following content. Make it engaging and relevant:\n\n${textToProcess}`
        break

      case "addCaseStudy":
        systemPrompt = "You are an expert writer. Add a client case study or real-world example."
        prompt = `Add a client case study or real-world example that demonstrates the following concept:\n\n${textToProcess}`
        break

      case "addAnalogy":
        systemPrompt = "You are an expert writer. Add a helpful analogy to explain the concept."
        prompt = `Add a helpful analogy to explain the following concept:\n\n${textToProcess}`
        break

      case "suggestHeading":
      case "improveHeading":
        systemPrompt = "You are an expert editor. Suggest a better, more engaging heading."
        prompt = `Suggest a better heading for the following content:\n\n${textToProcess}`
        break

      case "suggestCTA":
      case "addCTA":
        systemPrompt = "You are an expert copywriter. Suggest a compelling call-to-action for this chapter."
        prompt = `Based on the following chapter content, suggest a compelling call-to-action:\n\n${textToProcess}`
        break

      case "summarize":
        systemPrompt = "You are an expert editor. Create a concise summary."
        prompt = `Summarize the following content:\n\n${textToProcess}`
        break

      case "clarify":
        systemPrompt = "You are an expert editor. Clarify and simplify the explanation."
        prompt = `Clarify and simplify the following explanation to make it easier to understand:\n\n${textToProcess}`
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Add context if provided
    const fullPrompt = context
      ? `${context}\n\n${prompt}`
      : prompt

    // Generate content using GPT
    const result = await callGPT(fullPrompt, {
      model: "gpt-4-turbo",
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt,
    })

    return NextResponse.json({
      content: result,
      action,
    })
  } catch (error) {
    console.error("AI Tools error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process AI action" },
      { status: 500 }
    )
  }
}

