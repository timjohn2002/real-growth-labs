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
          maxTokens: 6000, // Increased tokens for full chapter content with multiple sections
          systemPrompt: `You are an expert book writer specializing in creating high-value, engaging content that helps readers transform their lives. 

CRITICAL INSTRUCTIONS:
- Write COMPLETE, FULLY-DEVELOPED paragraphs - NOT outlines, bullet points, or placeholders
- Each section must have 300-500+ words of actual written content
- Write full sentences, complete thoughts, and detailed explanations
- Include examples, stories, and actionable advice in paragraph form
- Do NOT write lists or bullet points as the main content - use paragraphs
- The user wants a FULLY WRITTEN BOOK, not an outline`,
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
  // Make it clear these need FULL written content
  const sectionPrompts = chapterTemplate.sections.map((section, index) => {
    return `Section ${index + 1}: ${section.title}
   Write 300-500 words of FULL CONTENT here. ${section.placeholder}
   Include: detailed explanations, examples, stories, and actionable advice.
   Write in complete paragraphs - NOT bullet points or outlines.`
  }).join("\n\n")

  const prompt = `You are writing a COMPLETE, FULLY-WRITTEN chapter for a book. This is NOT an outline - write actual paragraphs, full sentences, and complete thoughts.

${context}

Chapter: ${chapterTemplate.title}
Description: ${chapterTemplate.description}

CRITICAL: Write FULL CONTENT for each section below. Do NOT write bullet points, outlines, or placeholders. Write complete paragraphs with full explanations, examples, and actionable advice.

This chapter must include the following sections - write FULL CONTENT for each:

${sectionPrompts}

MANDATORY REQUIREMENTS:
1. Write COMPLETE PARAGRAPHS (minimum 300-500 words per section) - NOT outlines or bullet points
2. Each section must have multiple full paragraphs explaining the concept in detail
3. Include specific examples, stories, case studies, or scenarios that illustrate your points
4. Use the user's answers (${answers.targetReader}, ${answers.highTicketOffer}, ${answers.transformation}) to personalize EVERY section
5. Write in a ${answers.tone || "professional and engaging"} tone throughout
6. Make content actionable - give readers specific steps, strategies, or frameworks they can use
7. Connect sections logically with transitional sentences
8. Write as if you're teaching the reader, not just listing topics

FORMATTING:
- Start with: # ${chapterTemplate.title}
- For each section, use: ## ${chapterTemplate.sections.map(s => s.title).join('\n- ## ')}
- Write full paragraphs under each heading (3-5 paragraphs minimum per section)
- Use proper markdown: **bold** for emphasis, lists where appropriate, but primarily use paragraphs

EXAMPLE OF WHAT TO WRITE (not what to avoid):
✅ GOOD: "When implementing this framework, you'll notice immediate changes in how you approach your daily tasks. The key is to start with small, manageable steps that build momentum. For example, if your goal is to increase revenue by 10x, begin by identifying your highest-value activities..."

❌ BAD: "1. Start with small steps\n2. Build momentum\n3. Identify high-value activities"

Now write the COMPLETE, FULLY-WRITTEN chapter with actual paragraphs and full content:`

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
