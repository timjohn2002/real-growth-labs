import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"
import { REAL_GROWTH_BOOK_TEMPLATE, ChapterTemplate, SectionTemplate } from "@/lib/book-templates"
import { prisma } from "@/lib/prisma"

// Set maximum duration for Vercel
// Longer chapters (5+ sections) need more time, so we use 60s to be safe
export const maxDuration = 60 // 60 seconds per chapter - allows for longer chapters with more sections
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

    const sectionCount = chapterTemplate.sections.length
    const estimatedWords = sectionCount * 175 // Average 175 words per section
    const isLongChapter = sectionCount >= 5 // Chapters with 5+ sections need special handling
    const generationStartTime = Date.now()
    
    console.log(`[GenerateSingleChapter] Generating: ${chapterTemplate.title} (${sectionCount} sections, ~${estimatedWords} words, longChapter: ${isLongChapter})`)

    // Build the prompt
    const chapterPrompt = buildChapterPrompt(chapterTemplate, answers, bookTitle, bookSubtitle)

    // Generate chapter content
    // For long chapters (5+ sections), use a more efficient approach
    let chapterContent: string
    
    try {
      // For long chapters, reduce per-section word requirement slightly to speed up generation
      const maxTokens = isLongChapter ? 3500 : (sectionCount > 4 ? 4000 : 3000)
      const systemPrompt = isLongChapter
        ? `You are an expert book writer. Write COMPLETE, FULLY-DEVELOPED paragraphs (NOT outlines or bullet points). Each section needs 2 FULL PARAGRAPHS (120-150 words each minimum). Write complete thoughts with examples - NO bullet points, NO lists, NO placeholders. Be concise but thorough.`
        : `You are an expert book writer. Write COMPLETE, FULLY-DEVELOPED paragraphs (NOT outlines or bullet points). Each section needs 2-3 FULL PARAGRAPHS (150-200 words each). Write complete thoughts with examples - NO bullet points, NO lists, NO placeholders.`
      
      chapterContent = await callGPT(chapterPrompt, {
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens,
        systemPrompt,
      })
      
      const generationTime = Date.now() - generationStartTime
      console.log(`[GenerateSingleChapter] ✅ Initial generation completed in ${Math.round(generationTime/1000)}s`)
    } catch (modelError) {
      const generationTime = Date.now() - generationStartTime
      console.warn(`[GenerateSingleChapter] gpt-4o failed after ${Math.round(generationTime/1000)}s, trying gpt-4:`, modelError)
      
      const maxTokens = isLongChapter ? 3500 : (sectionCount > 4 ? 4000 : 3000)
      const systemPrompt = isLongChapter
        ? `You are an expert book writer. Write COMPLETE, FULLY-DEVELOPED paragraphs (NOT outlines or bullet points). Each section needs 2 FULL PARAGRAPHS (120-150 words each minimum). Write complete thoughts with examples - NO bullet points, NO lists, NO placeholders. Be concise but thorough.`
        : `You are an expert book writer. Write COMPLETE, FULLY-DEVELOPED paragraphs (NOT outlines or bullet points). Each section needs 2-3 FULL PARAGRAPHS (150-200 words each). Write complete thoughts with examples - NO bullet points, NO lists, NO placeholders.`
      
      chapterContent = await callGPT(chapterPrompt, {
        model: "gpt-4",
        temperature: 0.7,
        maxTokens,
        systemPrompt,
      })
      
      const totalTime = Date.now() - generationStartTime
      console.log(`[GenerateSingleChapter] ✅ Fallback generation completed in ${Math.round(totalTime/1000)}s`)
    }

    // Format content
    let formattedContent = formatChapterContent(chapterTemplate, chapterContent)
    
    // Validate content - check if it's actually an outline
    const wordCount = formattedContent.split(/\s+/).filter(Boolean).length
    const headingCount = (formattedContent.match(/^#+\s/gm) || []).length
    const bulletPointCount = (formattedContent.match(/^[-*+]\s/gm) || []).length
    const numberedListCount = (formattedContent.match(/^\d+\.\s/gm) || []).length
    const paragraphCount = formattedContent.split(/\n\n/).filter(p => {
      const trimmed = p.trim()
      return trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.match(/^[-*+]\s/) && !trimmed.match(/^\d+\.\s/)
    }).length
    
    // For long chapters, use slightly lower minimum (120 words per section instead of 150)
    const minRequiredWords = isLongChapter 
      ? chapterTemplate.sections.length * 120 
      : chapterTemplate.sections.length * 150
    const isOutline = wordCount < minRequiredWords || 
                      bulletPointCount > 3 || 
                      numberedListCount > 3 ||
                      paragraphCount < chapterTemplate.sections.length ||
                      (headingCount > 0 && paragraphCount < headingCount)
    
    const elapsedTime = Date.now() - generationStartTime
    const timeRemaining = 55000 - elapsedTime // Leave 5s buffer
    
    console.log(`[GenerateSingleChapter] Validation: ${wordCount} words (min: ${minRequiredWords}), ${paragraphCount} paragraphs, ${bulletPointCount} bullets, ${timeRemaining}s remaining, isOutline: ${isOutline}`)
    
    // ALWAYS expand if it looks like an outline - this is critical
    // But for longer chapters, we need to be more efficient to avoid timeout
    if (isOutline) {
      console.warn(`[GenerateSingleChapter] Content is an outline (${wordCount} words, ${paragraphCount} paragraphs). FORCING expansion to full content...`)
      
      // For long chapters OR if time is running low, use faster expansion
      if (isLongChapter || timeRemaining < 25000) {
        console.warn(`[GenerateSingleChapter] ⏰ Using fast expansion (longChapter: ${isLongChapter}, timeRemaining: ${Math.round(timeRemaining/1000)}s)`)
        // For long chapters or low time, use efficient expansion
        formattedContent = ensureMinimumContent(formattedContent, chapterTemplate, answers, minRequiredWords)
      } else {
        const expansionPrompt = `CRITICAL: The following is an OUTLINE with bullet points or headings only. You MUST convert it into a FULLY WRITTEN chapter with complete paragraphs.

Current Content (OUTLINE - MUST EXPAND):
${formattedContent}

Context:
Book Title: ${bookTitle || "Your Book"}
Book Subtitle: ${bookSubtitle || ""}
Target Reader: ${answers.targetReader || "General audience"}
High-Ticket Offer: ${answers.highTicketOffer || ""}
Offer Details: ${answers.offerDetails || ""}
Transformation: ${answers.transformation || ""}
Tone: ${answers.tone || "Professional and engaging"}

MANDATORY EXPANSION REQUIREMENTS:
1. Convert EVERY bullet point, numbered item, or heading into 2-3 FULL PARAGRAPHS
2. Each section heading (##) must have 2-3 complete paragraphs underneath (150-200 words each)
3. Write detailed explanations, not summaries
4. Include specific examples, stories, case studies in paragraph form
5. Add transitional sentences between sections
6. Minimum ${minRequiredWords}+ words total for the entire chapter
7. Write as if teaching a reader - use full sentences and complete thoughts
8. Personalize using the context above

EXAMPLE - What you should write:
✅ CORRECT FORMAT:
## Section Title
This is a complete paragraph with full sentences explaining the concept in detail. It provides context and background information that helps the reader understand the framework. For example, when working with ${answers.targetReader || "your target audience"}, you'll discover that this approach transforms how they think about their goals.

This second paragraph goes deeper, providing specific examples and actionable advice. Consider someone who implemented this framework and experienced ${answers.transformation || "significant transformation"}. They started by understanding their core values and then systematically applied the principles outlined in this chapter.

✅ WRONG FORMAT (DO NOT DO THIS):
## Section Title
- Point 1
- Point 2
- Point 3

Now expand the outline above into a COMPLETE, FULLY-WRITTEN chapter with actual paragraphs (${minRequiredWords}+ words):`
      
      try {
        // Use lower maxTokens for long chapters to speed up expansion
        const expansionMaxTokens = isLongChapter ? 3000 : 4000
        const expansionSystemPrompt = isLongChapter
          ? `You are an expert book writer. You MUST expand outlines into fully-written chapters with complete paragraphs. 

CRITICAL RULES:
- Convert ALL bullet points, numbered lists, and headings into FULL PARAGRAPHS
- Each section needs 2 paragraphs (120-150 words each) - be concise but thorough
- Write complete thoughts with examples - NO bullet points, NO lists, NO placeholders
- Write actual content that teaches the reader with detailed explanations`
          : `You are an expert book writer. You MUST expand outlines into fully-written chapters with complete paragraphs. 

CRITICAL RULES:
- Convert ALL bullet points, numbered lists, and headings into FULL PARAGRAPHS
- Each section needs 2-3 paragraphs (150-200 words each)
- Write complete thoughts with examples - NO bullet points, NO lists, NO placeholders
- Write actual content that teaches the reader with detailed explanations`
        
        const expandedContent = await callGPT(expansionPrompt, {
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: expansionMaxTokens,
          systemPrompt: expansionSystemPrompt,
        })
        formattedContent = formatChapterContent(chapterTemplate, expandedContent)
        
        // Validate expansion worked
        const expandedWordCount = formattedContent.split(/\s+/).filter(Boolean).length
        const expandedParagraphCount = formattedContent.split(/\n\n/).filter(p => {
          const trimmed = p.trim()
          return trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.match(/^[-*+]\s/) && !trimmed.match(/^\d+\.\s/)
        }).length
        
        console.log(`[GenerateSingleChapter] ✅ Expanded to ${expandedWordCount} words, ${expandedParagraphCount} paragraphs`)
        
        // If still looks like outline, log warning
        if (expandedWordCount < minRequiredWords || expandedParagraphCount < chapterTemplate.sections.length) {
          console.warn(`[GenerateSingleChapter] ⚠️ Content still short after expansion. May need manual editing.`)
        }
      } catch (expandError) {
        console.error(`[GenerateSingleChapter] Expansion failed:`, expandError)
        // If expansion fails, at least try to convert bullet points to paragraphs manually
        formattedContent = convertBulletsToParagraphs(formattedContent, chapterTemplate, answers)
      }
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

  const prompt = `You are writing a COMPLETE, FULLY-WRITTEN book chapter. This is NOT an outline, NOT a list, NOT bullet points. You MUST write actual paragraphs with full sentences and complete thoughts.

${context}

Chapter: ${chapterTemplate.title}
Description: ${chapterTemplate.description}

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. Write a FULLY WRITTEN BOOK CHAPTER with actual paragraphs - NOT an outline
2. Each section MUST have 2-3 FULL PARAGRAPHS (150-200 words per section minimum)
3. Each paragraph MUST be 3-5 complete sentences with detailed explanations
4. ABSOLUTELY NO bullet points (-, *, +)
5. ABSOLUTELY NO numbered lists (1., 2., 3.)
6. ABSOLUTELY NO placeholders like "Describe..." or "Explain..."
7. Write complete thoughts with detailed explanations and examples
8. Include specific examples, stories, or case studies in paragraph form
9. Personalize using: Target Reader: ${answers.targetReader}, Offer: ${answers.highTicketOffer}, Transformation: ${answers.transformation}
10. Write in ${answers.tone || "professional and engaging"} tone
11. Minimum ${chapterTemplate.sections.length * 150} words total (${chapterTemplate.sections.length * 150}+ words)

FORMATTING:
- Start with: # ${chapterTemplate.title}
- Use ## for each section heading
- Write FULL PARAGRAPHS under each heading (NOT lists, NOT bullets, NOT numbered items)

EXAMPLE OF CORRECT FORMAT:
## Section Title
This is a complete paragraph with full sentences explaining the concept in detail. It provides context and background information that helps the reader understand the framework. For example, when working with ${answers.targetReader || "your target audience"}, you'll discover that this approach transforms how they think about their goals.

This second paragraph goes deeper, providing specific examples and actionable advice. Consider someone who implemented this framework and experienced ${answers.transformation || "significant transformation"}. They started by understanding their core values and then systematically applied the principles outlined in this chapter.

This third paragraph provides additional insights and practical steps. By following these guidelines, you'll be able to apply these concepts in your own situation and see tangible results.

EXAMPLE OF WRONG FORMAT (DO NOT DO THIS):
## Section Title
- Point 1
- Point 2
- Point 3

OR:
## Section Title
1. First point
2. Second point
3. Third point

This chapter must include the following sections. Write FULL CONTENT (2-3 paragraphs each) for each:

${sectionPrompts}

Now write the COMPLETE, FULLY-WRITTEN chapter with actual paragraphs (${chapterTemplate.sections.length * 150}+ words total):`

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

// Fallback function to convert bullet points to paragraphs if AI expansion fails
function convertBulletsToParagraphs(content: string, chapterTemplate: ChapterTemplate, answers: any): string {
  let converted = content
  
  // Convert bullet points to paragraphs
  const bulletPattern = /^[-*+]\s+(.+)$/gm
  converted = converted.replace(bulletPattern, (match, text) => {
    // Convert bullet point to a paragraph
    return `${text.trim()} This is an important concept that requires detailed explanation. When working with ${answers.targetReader || "your target audience"}, understanding this principle becomes crucial for achieving ${answers.transformation || "your goals"}. By implementing this approach, you'll discover how it transforms your perspective and opens up new possibilities.`
  })
  
  // Convert numbered lists to paragraphs
  const numberedPattern = /^\d+\.\s+(.+)$/gm
  converted = converted.replace(numberedPattern, (match, text) => {
    return `${text.trim()} This step is essential in the process. It involves careful consideration and strategic implementation. Many people overlook this aspect, but those who pay attention to it see significant improvements in their results.`
  })
  
  return converted
}

// Fast fallback to ensure minimum content when time is running low
function ensureMinimumContent(content: string, chapterTemplate: ChapterTemplate, answers: any, minWords: number): string {
  const currentWords = content.split(/\s+/).filter(Boolean).length
  
  // First, convert any bullet points to paragraphs
  let enhanced = convertBulletsToParagraphs(content, chapterTemplate, answers)
  
  if (currentWords >= minWords * 0.7) {
    // Already has reasonable content after bullet conversion
    return enhanced
  }
  
  // Add minimum content for each section that's missing
  chapterTemplate.sections.forEach((section) => {
    const sectionHeading = `## ${section.title}`
    const headingRegex = new RegExp(`##\\s+${section.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
    
    if (!headingRegex.test(enhanced)) {
      // Section heading doesn't exist, add it with content
      enhanced += `\n\n${sectionHeading}\n\n`
      enhanced += generateSectionContent(section, answers)
    } else {
      // Section exists, check if it has enough content
      const sectionMatch = enhanced.match(new RegExp(`${sectionHeading}[^#]*`, 'is'))
      if (sectionMatch) {
        const sectionContent = sectionMatch[0].replace(sectionHeading, '').trim()
        const sectionWords = sectionContent.split(/\s+/).filter(Boolean).length
        
        if (sectionWords < 100) {
          // Not enough content, add more
          enhanced = enhanced.replace(
            sectionMatch[0],
            `${sectionHeading}\n\n${sectionContent}\n\n${generateSectionContent(section, answers)}`
          )
        }
      }
    }
  })
  
  return enhanced
}

// Generate basic content for a section
function generateSectionContent(section: SectionTemplate, answers: any): string {
  return `This section explores ${section.title.toLowerCase()}. For ${answers.targetReader || "your target audience"}, this aspect of ${answers.highTicketOffer || "the framework"} is crucial for achieving ${answers.transformation || "your goals"}. By understanding and applying these principles, you'll see significant improvements in your results. The framework provides a structured approach that makes this process more manageable and effective.

When implementing ${section.title.toLowerCase()}, you'll discover how it transforms your perspective and opens up new possibilities. Many people overlook this aspect, but those who pay attention to it see significant improvements in their results. This is an important concept that requires detailed explanation and careful consideration.`
}
