import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"
import { REAL_GROWTH_BOOK_TEMPLATE, ChapterTemplate } from "@/lib/book-templates"
import { prisma } from "@/lib/prisma"

// Set maximum duration for Vercel
export const maxDuration = 30 // 30 seconds per chapter - should be plenty
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

    // Find the chapter template
    const chapterTemplate = REAL_GROWTH_BOOK_TEMPLATE.find(t => t.id === chapterId)
    if (!chapterTemplate) {
      return NextResponse.json(
        { error: "Chapter template not found" },
        { status: 404 }
      )
    }

    // Verify book ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { chapters: true },
    })

    if (!book || book.userId !== userId) {
      return NextResponse.json(
        { error: "Book not found or unauthorized" },
        { status: 404 }
      )
    }

    console.log(`[GenerateSingleChapter] Generating: ${chapterTemplate.title}`)

    // Build the prompt
    const chapterPrompt = buildChapterPrompt(chapterTemplate, answers, bookTitle, bookSubtitle)

    // Generate chapter content
    let chapterContent: string
    try {
      chapterContent = await callGPT(chapterPrompt, {
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 3000, // Reduced for faster generation
        systemPrompt: `You are an expert book writer. Write COMPLETE, FULLY-DEVELOPED paragraphs (NOT outlines or bullet points). Each section needs 2-3 FULL PARAGRAPHS (150-200 words each). Write complete thoughts with examples - NO bullet points, NO lists, NO placeholders.`,
      })
    } catch (modelError) {
      console.warn(`[GenerateSingleChapter] gpt-4o failed, trying gpt-4:`, modelError)
      chapterContent = await callGPT(chapterPrompt, {
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 3000,
        systemPrompt: `You are an expert book writer. Write COMPLETE, FULLY-DEVELOPED paragraphs (NOT outlines or bullet points). Each section needs 2-3 FULL PARAGRAPHS (150-200 words each). Write complete thoughts with examples - NO bullet points, NO lists, NO placeholders.`,
      })
    }

    // Format content
    let formattedContent = formatChapterContent(chapterTemplate, chapterContent)
    
    // Validate content
    const wordCount = formattedContent.split(/\s+/).filter(Boolean).length
    const minRequiredWords = chapterTemplate.sections.length * 150
    
    // If too short, expand it
    if (wordCount < minRequiredWords) {
      console.warn(`[GenerateSingleChapter] Content too short (${wordCount} words), expanding...`)
      
      const expansionPrompt = `Expand this into a FULLY WRITTEN chapter with complete paragraphs. Write at least ${minRequiredWords}+ words total. Each section needs 2-3 FULL PARAGRAPHS (150-200 words each). Convert all bullet points to paragraphs.

Content to expand:
${formattedContent}

Context:
Book Title: ${bookTitle || "Your Book"}
Target Reader: ${answers.targetReader || "General audience"}
High-Ticket Offer: ${answers.highTicketOffer || ""}
Transformation: ${answers.transformation || ""}

Write the complete expanded chapter:`
      
      try {
        const expandedContent = await callGPT(expansionPrompt, {
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: 3000,
          systemPrompt: `You are an expert book writer. Expand content into fully-written chapters with complete paragraphs. Write actual content, not bullet points.`,
        })
        formattedContent = formatChapterContent(chapterTemplate, expandedContent)
      } catch (expandError) {
        console.error(`[GenerateSingleChapter] Expansion failed:`, expandError)
      }
    }

    // Find or create the chapter in database
    let chapter = book.chapters.find(ch => ch.order === chapterTemplate.number)
    
    if (chapter) {
      // Update existing chapter
      chapter = await prisma.chapter.update({
        where: { id: chapter.id },
        data: {
          title: chapterTemplate.title,
          content: formattedContent,
        },
      })
    } else {
      // Create new chapter
      chapter = await prisma.chapter.create({
        data: {
          bookId: book.id,
          title: chapterTemplate.title,
          content: formattedContent,
          order: chapterTemplate.number,
        },
      })
    }

    const finalWordCount = formattedContent.split(/\s+/).filter(Boolean).length

    return NextResponse.json({
      chapter: {
        id: chapter.id,
        number: chapter.order,
        title: chapter.title,
        content: chapter.content,
        wordCount: finalWordCount,
      },
      message: "Chapter generated successfully",
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

  const prompt = `Write a COMPLETE, FULLY-WRITTEN chapter for a book. This is NOT an outline - you must write actual paragraphs with full sentences.

${context}

Chapter: ${chapterTemplate.title}
Description: ${chapterTemplate.description}

CRITICAL INSTRUCTIONS:
- Write FULLY WRITTEN BOOK CHAPTER, not an outline
- Each section MUST have 2-3 FULL PARAGRAPHS (150-200 words per section)
- Each paragraph MUST be 3-5 complete sentences
- NO bullet points, NO numbered lists, NO placeholders
- Write complete thoughts with detailed explanations
- Include examples, stories, or case studies in paragraph form
- Personalize using: Target Reader: ${answers.targetReader}, Offer: ${answers.highTicketOffer}, Transformation: ${answers.transformation}
- Write in ${answers.tone || "professional and engaging"} tone
- Minimum ${chapterTemplate.sections.length * 150} words total

FORMATTING:
- Start with: # ${chapterTemplate.title}
- Use ## for each section heading
- Write FULL PARAGRAPHS under each heading (not lists)

This chapter must include the following sections. Write FULL CONTENT for each:

${sectionPrompts}

Now write the COMPLETE, FULLY-WRITTEN chapter with actual paragraphs:`

  return prompt
}

function formatChapterContent(chapterTemplate: ChapterTemplate, aiContent: string): string {
  let formatted = aiContent.trim()
  
  if (!formatted.startsWith(`# ${chapterTemplate.title}`)) {
    formatted = `# ${chapterTemplate.title}\n\n${formatted}`
  }
  
  formatted = formatted.replace(/\n{3,}/g, '\n\n')
  
  return formatted
}
