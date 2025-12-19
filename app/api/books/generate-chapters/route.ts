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
        // Build context for this chapter (used in both initial generation and expansion)
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
        let formattedContent = formatChapterContent(chapterTemplate, chapterContent)
        
        // Validate that we got actual content, not just an outline
        const wordCount = formattedContent.split(/\s+/).filter(Boolean).length
        const hasOnlyHeadings = (formattedContent.match(/^#+\s/gm) || []).length > formattedContent.split(/\n\n/).length * 0.5
        
        // If content looks like an outline (too short or mostly headings), expand it
        if (wordCount < 500 || hasOnlyHeadings) {
          console.warn(`[GenerateChapters] ⚠️ Chapter ${chapterTemplate.title} looks like an outline (${wordCount} words). Expanding to full content...`)
          
          const expansionPrompt = `The following is an outline for a chapter. Expand it into a FULLY WRITTEN chapter with complete paragraphs, detailed explanations, examples, and actionable advice. Write 1000+ words of actual content, not just headings or bullet points.

Chapter Outline:
${formattedContent}

Context:
${context}

Expand this into a complete, fully-written chapter with:
- Full paragraphs (not bullet points) for each section
- Detailed explanations and examples
- Stories, case studies, or scenarios
- Actionable advice and steps
- Minimum 1000 words total
- Use markdown with ## for section headings, but write full paragraphs under each

Write the complete expanded chapter now:`
          
          try {
            const expandedContent = await callGPT(expansionPrompt, {
              model: "gpt-4",
              temperature: 0.7,
              maxTokens: 6000,
              systemPrompt: `You are an expert book writer. Expand outlines into fully-written chapters with complete paragraphs, examples, and detailed explanations. Write actual content, not bullet points or lists.`,
            })
            
            formattedContent = formatChapterContent(chapterTemplate, expandedContent)
            const expandedWordCount = formattedContent.split(/\s+/).filter(Boolean).length
            console.log(`[GenerateChapters] ✅ Expanded chapter to ${expandedWordCount} words`)
          } catch (expandError) {
            console.error(`[GenerateChapters] Failed to expand chapter:`, expandError)
            // Use original content even if expansion fails
          }
        }
        
        generatedChapters.push({
          id: chapterTemplate.id,
          number: chapterTemplate.number,
          title: chapterTemplate.title,
          content: formattedContent,
        })

        const finalWordCount = formattedContent.split(/\s+/).filter(Boolean).length
        console.log(`[GenerateChapters] ✅ Generated chapter ${i + 1}/${totalChapters}: ${chapterTemplate.title} (${formattedContent.length} chars, ${finalWordCount} words)`)
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
    return `## ${section.title}
${section.placeholder}

For this section, write 300-500 words of FULL CONTENT including:
- Multiple complete paragraphs (not bullet points)
- Detailed explanations and reasoning
- Real examples, stories, or case studies
- Actionable advice and specific steps
- Personalization based on: ${answers.targetReader || "the target reader"}, ${answers.highTicketOffer || "the offer"}, and ${answers.transformation || "the transformation"}`
  }).join("\n\n")

  const prompt = `Write a COMPLETE, FULLY-WRITTEN chapter for a book. This is NOT an outline - you must write actual paragraphs with full sentences and complete thoughts.

${context}

Chapter: ${chapterTemplate.title}
Description: ${chapterTemplate.description}

CRITICAL INSTRUCTIONS - READ CAREFULLY:
- You are writing a FULLY WRITTEN BOOK CHAPTER, not an outline
- Write COMPLETE PARAGRAPHS (minimum 300-500 words per section)
- Do NOT write bullet points, numbered lists, or outlines
- Do NOT write placeholders like "Describe..." or "Explain..."
- Write actual content as if you're teaching a reader

This chapter must include the following sections. Write FULL CONTENT for each:

${sectionPrompts}

MANDATORY REQUIREMENTS:
1. Each section must have 3-5 FULL PARAGRAPHS (not bullet points)
2. Write complete sentences and detailed explanations
3. Include specific examples, stories, or case studies in paragraph form
4. Personalize content using: Target Reader: ${answers.targetReader}, Offer: ${answers.highTicketOffer}, Transformation: ${answers.transformation}
5. Write in ${answers.tone || "professional and engaging"} tone
6. Make it actionable - give readers specific steps they can take
7. Connect sections with transitional sentences
8. Minimum 1000+ words total for the entire chapter

FORMATTING:
- Start with: # ${chapterTemplate.title}
- Use ## for each section heading
- Write FULL PARAGRAPHS under each heading (not lists or bullet points)
- Use markdown properly: **bold** for emphasis, but write in paragraphs

EXAMPLE - This is what you should write:
✅ CORRECT FORMAT:
## Section Title
This is a complete paragraph explaining the concept in detail. It provides context and sets up the reader's understanding. For example, when working with ${answers.targetReader || "your target audience"}, you'll find that...

This second paragraph goes deeper into the concept, providing specific examples and actionable advice. Consider the case of someone who implemented this framework and saw results like ${answers.transformation || "significant transformation"}...

✅ WRONG FORMAT (DO NOT DO THIS):
## Section Title
- Point 1
- Point 2
- Point 3

Now write the COMPLETE, FULLY-WRITTEN chapter with actual paragraphs:`

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
