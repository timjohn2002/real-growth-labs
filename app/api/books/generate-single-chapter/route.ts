import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"
import { REAL_GROWTH_BOOK_TEMPLATE, ChapterTemplate } from "@/lib/book-templates"
import { prisma } from "@/lib/prisma"

export const maxDuration = 30 // 30 seconds per chapter is plenty
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookId, chapterId, answers, bookTitle, bookSubtitle } = body

    if (!bookId || !chapterId || !answers) {
      return NextResponse.json(
        { error: "bookId, chapterId, and answers are required" },
        { status: 400 }
      )
    }

    // Verify book belongs to user
    const book = await prisma.book.findFirst({
      where: { id: bookId, userId },
      include: { chapters: true },
    })

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      )
    }

    // Find the chapter template
    const chapterTemplate = REAL_GROWTH_BOOK_TEMPLATE.find(
      (ch) => ch.id === chapterId
    )

    if (!chapterTemplate) {
      return NextResponse.json(
        { error: "Chapter template not found" },
        { status: 404 }
      )
    }

    console.log(`[GenerateSingleChapter] Generating: ${chapterTemplate.title}`)

    // Build the prompt
    const chapterPrompt = buildChapterPrompt(chapterTemplate, answers, bookTitle, bookSubtitle)

    // Generate content
    let chapterContent: string
    try {
      chapterContent = await callGPT(chapterPrompt, {
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 4000,
        systemPrompt: `You are an expert book writer. You MUST write FULLY DEVELOPED paragraphs with actual content. 

CRITICAL RULES:
- Write at least 2-3 FULL PARAGRAPHS per section (minimum 150-200 words per section)
- Each paragraph must be 3-5 sentences minimum
- NO bullet points, NO numbered lists, NO placeholders
- Write complete thoughts with examples and explanations
- If a chapter has ${chapterTemplate.sections.length} sections, write at least ${chapterTemplate.sections.length * 150} words total
- Write as if teaching a real person - use full sentences and detailed explanations`,
      })
    } catch (modelError) {
      console.warn(`[GenerateSingleChapter] gpt-4o failed, trying gpt-4:`, modelError)
      chapterContent = await callGPT(chapterPrompt, {
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 4000,
        systemPrompt: `You are an expert book writer. You MUST write FULLY DEVELOPED paragraphs with actual content. 

CRITICAL RULES:
- Write at least 2-3 FULL PARAGRAPHS per section (minimum 150-200 words per section)
- Each paragraph must be 3-5 sentences minimum
- NO bullet points, NO numbered lists, NO placeholders
- Write complete thoughts with examples and explanations
- If a chapter has ${chapterTemplate.sections.length} sections, write at least ${chapterTemplate.sections.length * 150} words total
- Write as if teaching a real person - use full sentences and detailed explanations`,
      })
    }

    // Format content
    let formattedContent = formatChapterContent(chapterTemplate, chapterContent)
    
    // Validate and expand if needed
    const wordCount = formattedContent.split(/\s+/).filter(Boolean).length
    const minRequiredWords = chapterTemplate.sections.length * 150
    
    if (wordCount < minRequiredWords) {
      console.warn(`[GenerateSingleChapter] Content too short (${wordCount} words), expanding...`)
      
      const context = `
Book Title: ${bookTitle || "Your Book"}
Book Subtitle: ${bookSubtitle || ""}
Target Reader: ${answers.targetReader || "General audience"}
High-Ticket Offer: ${answers.highTicketOffer || ""}
Transformation: ${answers.transformation || ""}
`
      
      const expansionPrompt = `CRITICAL: This content is too short. Expand it into a FULLY WRITTEN chapter with at least ${minRequiredWords} words.

Current Content:
${formattedContent}

Context: ${context}

Write at least 2-3 FULL PARAGRAPHS per section (150-200 words each). Write complete thoughts with examples.`

      try {
        const expandedContent = await callGPT(expansionPrompt, {
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: 4000,
          systemPrompt: `You are an expert book writer. Expand content into fully-written chapters with complete paragraphs. Write actual content, not bullet points.`,
        })
        formattedContent = formatChapterContent(chapterTemplate, expandedContent)
      } catch (expandError) {
        console.error(`[GenerateSingleChapter] Expansion failed:`, expandError)
      }
    }

    // Update chapter in database
    const chapter = await prisma.chapter.findFirst({
      where: { bookId, order: chapterTemplate.number },
    })

    if (chapter) {
      await prisma.chapter.update({
        where: { id: chapter.id },
        data: { content: formattedContent },
      })
    }

    const finalWordCount = formattedContent.split(/\s+/).filter(Boolean).length
    console.log(`[GenerateSingleChapter] ✅ Generated ${chapterTemplate.title}: ${finalWordCount} words`)

    return NextResponse.json({
      success: true,
      chapter: {
        id: chapterTemplate.id,
        number: chapterTemplate.number,
        title: chapterTemplate.title,
        content: formattedContent,
        wordCount: finalWordCount,
      },
    })
  } catch (error) {
    console.error("Generate single chapter error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate chapter"
    return NextResponse.json(
      { error: errorMessage },
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

  const sectionPrompts = chapterTemplate.sections.map((section) => {
    return `## ${section.title}
${section.placeholder}

MANDATORY: Write at least 2-3 FULL PARAGRAPHS (150-200 words minimum) for this section. Each paragraph must:
- Be 3-5 complete sentences
- Explain concepts in detail with examples
- Include specific advice or actionable steps
- Reference: ${answers.targetReader || "the target reader"}, ${answers.highTicketOffer || "the offer"}, ${answers.transformation || "the transformation"}
- Use real scenarios and case studies in paragraph form (not lists)`
  }).join("\n\n")

  return `Write a COMPLETE, FULLY-WRITTEN chapter for a book. This is NOT an outline - you must write actual paragraphs with full sentences and complete thoughts.

${context}

Chapter: ${chapterTemplate.title}
Description: ${chapterTemplate.description}

CRITICAL INSTRUCTIONS:
- You are writing a FULLY WRITTEN BOOK CHAPTER, not an outline
- Write COMPLETE PARAGRAPHS (minimum 150-200 words per section)
- Do NOT write bullet points, numbered lists, or outlines
- Write actual content as if you're teaching a reader

This chapter must include the following sections. Write FULL CONTENT for each:

${sectionPrompts}

MANDATORY REQUIREMENTS:
1. Each section MUST have at least 2-3 FULL PARAGRAPHS (minimum 150-200 words per section)
2. Each paragraph MUST be 3-5 complete sentences
3. Write complete thoughts with detailed explanations
4. Include specific examples, stories, or case studies in paragraph form
5. Personalize content using: Target Reader: ${answers.targetReader}, Offer: ${answers.highTicketOffer}, Transformation: ${answers.transformation}
6. Write in ${answers.tone || "professional and engaging"} tone
7. MINIMUM ${chapterTemplate.sections.length * 150} words total
8. DO NOT write just headings - you MUST write full paragraphs under each heading

FORMATTING:
- Start with: # ${chapterTemplate.title}
- Use ## for each section heading
- Write FULL PARAGRAPHS under each heading (not lists or bullet points)

Now write the COMPLETE, FULLY-WRITTEN chapter with actual paragraphs:`
}

function formatChapterContent(chapterTemplate: ChapterTemplate, aiContent: string): string {
  let formatted = aiContent.trim()
  if (!formatted.startsWith(`# ${chapterTemplate.title}`)) {
    formatted = `# ${chapterTemplate.title}\n\n${formatted}`
  }
  formatted = formatted.replace(/\n{3,}/g, '\n\n')
  return formatted
}
