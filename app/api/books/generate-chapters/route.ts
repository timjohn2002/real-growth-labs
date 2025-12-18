import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"
import { REAL_GROWTH_BOOK_TEMPLATE, ChapterTemplate } from "@/lib/book-templates"

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

    const body = await request.json()
    const { answers, bookTitle, bookSubtitle } = body

    if (!answers) {
      return NextResponse.json(
        { error: "answers are required" },
        { status: 400 }
      )
    }

    // Generate full content for each chapter using AI
    const generatedChapters = []
    const totalChapters = REAL_GROWTH_BOOK_TEMPLATE.length

    for (let i = 0; i < REAL_GROWTH_BOOK_TEMPLATE.length; i++) {
      const chapterTemplate = REAL_GROWTH_BOOK_TEMPLATE[i]
      try {
        // Build the prompt for this chapter based on template and user answers
        const chapterPrompt = buildChapterPrompt(chapterTemplate, answers, bookTitle, bookSubtitle)
        
        console.log(`[GenerateChapters] Generating chapter ${i + 1}/${totalChapters}: ${chapterTemplate.title}`)
        
        // Generate full chapter content using GPT
        const chapterContent = await callGPT(chapterPrompt, {
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: 4000, // More tokens for full chapter content
          systemPrompt: `You are an expert book writer specializing in creating high-value, engaging content that helps readers transform their lives. Write in a clear, professional, and engaging tone. Use the Real Growth framework structure provided. Write complete, fully-developed content (minimum 200-300 words per section) - not placeholders or outlines.`,
        })

        // Format the content with proper headings
        const formattedContent = formatChapterContent(chapterTemplate, chapterContent)
        
        generatedChapters.push({
          id: chapterTemplate.id,
          number: chapterTemplate.number,
          title: chapterTemplate.title,
          content: formattedContent,
        })

        console.log(`[GenerateChapters] ✅ Generated chapter ${i + 1}/${totalChapters}: ${chapterTemplate.title} (${chapterContent.length} chars)`)
      } catch (error) {
        console.error(`[GenerateChapters] ❌ Failed to generate chapter ${chapterTemplate.number}:`, error)
        // Fallback to template structure if AI generation fails
        generatedChapters.push({
          id: chapterTemplate.id,
          number: chapterTemplate.number,
          title: chapterTemplate.title,
          content: `# ${chapterTemplate.title}\n\n${chapterTemplate.description}\n\n[Content generation failed. Please edit manually.]`,
        })
      }
    }

    return NextResponse.json({
      chapters: generatedChapters,
      message: "Chapters generated successfully",
    })
  } catch (error) {
    console.error("Generate chapters error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate chapters" },
      { status: 500 }
    )
  }
}

function buildChapterPrompt(
  chapterTemplate: ChapterTemplate,
  answers: any,
  bookTitle?: string,
  bookSubtitle?: string
): string {
  // Build context from user answers
  const context = `
Book Title: ${bookTitle || "Your Book"}
Book Subtitle: ${bookSubtitle || ""}

Target Reader: ${answers.targetReader || "General audience"}
High-Ticket Offer: ${answers.highTicketOffer || ""}
Offer Details: ${answers.offerDetails || ""}
Transformation: ${answers.transformation || ""}
Tone: ${answers.tone || "Professional and engaging"}
Additional Content: ${answers.additionalContent || ""}
`

  // Build section prompts based on chapter template
  const sectionPrompts = chapterTemplate.sections.map((section, index) => {
    return `${index + 1}. ${section.title}\n   ${section.placeholder}`
  }).join("\n\n")

  const prompt = `Write a complete, fully-written chapter for a book using the Real Growth framework.

${context}

Chapter: ${chapterTemplate.title}
Description: ${chapterTemplate.description}

This chapter should include the following sections (write full content for each, not just placeholders):

${sectionPrompts}

Requirements:
- Write complete, engaging content for each section (minimum 200-300 words per section)
- Use the user's answers to personalize the content
- Maintain consistency with the book's theme and target audience
- Include specific examples, stories, or case studies where relevant
- Write in a ${answers.tone || "professional and engaging"} tone
- Use proper markdown formatting with headings (## for section titles)
- Make it valuable and actionable for the reader
- Connect each section logically to create a cohesive chapter

Format the response as markdown with:
- # ${chapterTemplate.title} as the main heading
- ## [Section Title] for each section
- Proper paragraphs, lists, and formatting

Write the complete chapter now:`

  return prompt
}

function formatChapterContent(chapterTemplate: ChapterTemplate, aiContent: string): string {
  // Ensure the content starts with the chapter title
  let formatted = aiContent.trim()
  
  // If content doesn't start with the chapter title, add it
  if (!formatted.startsWith(`# ${chapterTemplate.title}`)) {
    formatted = `# ${chapterTemplate.title}\n\n${formatted}`
  }
  
  // Ensure proper spacing
  formatted = formatted.replace(/\n{3,}/g, '\n\n')
  
  return formatted
}
