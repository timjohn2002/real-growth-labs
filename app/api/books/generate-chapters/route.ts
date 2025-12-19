import { NextRequest, NextResponse } from "next/server"
import { callGPT } from "@/lib/openai"
import { REAL_GROWTH_BOOK_TEMPLATE, ChapterTemplate } from "@/lib/book-templates"

// Set maximum duration for Vercel
// Hobby: 60s, Pro: 300s (5min), Fluid Compute: 800s (13.3min)
// Using 60s to work on all plans - parallel generation should complete in time
export const maxDuration = 60 // Works on Hobby plan, Pro plan can use up to 300s
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("[GenerateChapters] OPENAI_API_KEY not configured")
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured. Please set it in your environment variables." },
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
    const { answers, bookTitle, bookSubtitle } = body

    if (!answers) {
      return NextResponse.json(
        { error: "answers are required" },
        { status: 400 }
      )
    }

    console.log("[GenerateChapters] Starting generation with:", {
      bookTitle,
      bookSubtitle,
      hasAnswers: !!answers,
      chapterCount: REAL_GROWTH_BOOK_TEMPLATE.length,
    })

    // Generate full content for each chapter using AI
    // Generate in parallel batches to avoid timeout (3 chapters at a time)
    const generatedChapters: Array<{ id: string; number: number; title: string; content: string }> = []
    const totalChapters = REAL_GROWTH_BOOK_TEMPLATE.length
    const batchSize = 2 // Generate 2 chapters in parallel to ensure we complete within 60s timeout

    // Process chapters in batches
    for (let batchStart = 0; batchStart < REAL_GROWTH_BOOK_TEMPLATE.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, REAL_GROWTH_BOOK_TEMPLATE.length)
      const batch = REAL_GROWTH_BOOK_TEMPLATE.slice(batchStart, batchEnd)
      
      console.log(`[GenerateChapters] Processing batch ${Math.floor(batchStart / batchSize) + 1}: chapters ${batchStart + 1}-${batchEnd}`)
      
      // Generate chapters in this batch in parallel
      const batchPromises = batch.map(async (chapterTemplate, batchIndex) => {
        const i = batchStart + batchIndex
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
        // Use gpt-4o for better quality and cost efficiency, fallback to gpt-4
        let chapterContent: string
        try {
          chapterContent = await callGPT(chapterPrompt, {
            model: "gpt-4o",
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
        } catch (modelError) {
          // Fallback to gpt-4 if gpt-4o is not available
          console.warn(`[GenerateChapters] gpt-4o failed, trying gpt-4:`, modelError)
          chapterContent = await callGPT(chapterPrompt, {
            model: "gpt-4",
            temperature: 0.7,
            maxTokens: 6000,
            systemPrompt: `You are an expert book writer specializing in creating high-value, engaging content that helps readers transform their lives. 

CRITICAL INSTRUCTIONS:
- Write COMPLETE, FULLY-DEVELOPED paragraphs - NOT outlines, bullet points, or placeholders
- Each section must have 300-500+ words of actual written content
- Write full sentences, complete thoughts, and detailed explanations
- Include examples, stories, and actionable advice in paragraph form
- Do NOT write lists or bullet points as the main content - use paragraphs
- The user wants a FULLY WRITTEN BOOK, not an outline`,
          })
        }

        // Format the content with proper headings
        let formattedContent = formatChapterContent(chapterTemplate, chapterContent)
        
        // Validate that we got actual content, not just an outline
        const wordCount = formattedContent.split(/\s+/).filter(Boolean).length
        const hasOnlyHeadings = (formattedContent.match(/^#+\s/gm) || []).length > formattedContent.split(/\n\n/).length * 0.5
        
        // If content looks like an outline (too short or mostly headings), expand it
        if (wordCount < 500 || hasOnlyHeadings) {
          console.warn(`[GenerateChapters] ⚠️ Chapter ${chapterTemplate.title} looks like an outline (${wordCount} words). Expanding to full content...`)
          
          const expansionPrompt = `CRITICAL: The following content is an OUTLINE or DRAFT. You MUST expand it into a FULLY WRITTEN chapter with complete paragraphs. DO NOT return an outline - write actual content.

Current Content (OUTLINE - needs expansion):
${formattedContent}

Context:
${context}

MANDATORY EXPANSION REQUIREMENTS:
1. Convert ALL bullet points, numbered lists, and short phrases into FULL PARAGRAPHS
2. Each section heading (##) must have 3-5 complete paragraphs underneath (300-500 words per section)
3. Write detailed explanations, not summaries
4. Include specific examples, stories, case studies in paragraph form
5. Add transitional sentences between sections
6. Minimum 1200+ words total for the entire chapter
7. Write as if teaching a reader - use complete sentences and full thoughts
8. Personalize using: Target Reader: ${answers.targetReader || "general audience"}, Offer: ${answers.highTicketOffer || ""}, Transformation: ${answers.transformation || ""}

FORMAT:
- Start with: # ${chapterTemplate.title}
- Use ## for section headings
- Write FULL PARAGRAPHS (not lists) under each heading
- Use markdown: **bold** for emphasis, but write in paragraphs

EXAMPLE - What you should write:
✅ CORRECT:
## Section Title
This is a complete paragraph with full sentences explaining the concept in detail. It provides context and background information that helps the reader understand the framework. For example, when working with ${answers.targetReader || "your target audience"}, you'll discover that this approach transforms how they think about their goals.

This second paragraph goes deeper, providing specific examples and actionable advice. Consider someone who implemented this framework and experienced ${answers.transformation || "significant transformation"}. They started by understanding their core values and then systematically applied the principles outlined in this chapter.

✅ WRONG (DO NOT DO THIS):
## Section Title
- Point 1
- Point 2
- Point 3

Now expand the outline above into a COMPLETE, FULLY-WRITTEN chapter with actual paragraphs (1200+ words):`
          
          try {
            const expandedContent = await callGPT(expansionPrompt, {
              model: "gpt-4",
              temperature: 0.7,
              maxTokens: 6000,
              systemPrompt: `You are an expert book writer. Expand outlines into fully-written chapters with complete paragraphs, examples, and detailed explanations. Write actual content, not bullet points or lists.`,
            })
            
            formattedContent = formatChapterContent(chapterTemplate, expandedContent)
            const expandedWordCount = formattedContent.split(/\s+/).filter(Boolean).length
            const expandedParagraphCount = formattedContent.split(/\n\n/).filter(p => p.trim().length > 0 && !p.trim().startsWith('#')).length
            console.log(`[GenerateChapters] ✅ Expanded chapter to ${expandedWordCount} words, ${expandedParagraphCount} paragraphs`)
            
            // If still too short after expansion, log warning but proceed
            if (expandedWordCount < 800) {
              console.warn(`[GenerateChapters] ⚠️ Chapter still short after expansion (${expandedWordCount} words). Content may need manual editing.`)
            }
          } catch (expandError) {
            console.error(`[GenerateChapters] Failed to expand chapter:`, expandError)
            // Use original content even if expansion fails, but log the issue
            console.warn(`[GenerateChapters] Using original content (may be outline format)`)
          }
        }
        
        // Final validation - log if content is still suspiciously short
        const finalWordCount = formattedContent.split(/\s+/).filter(Boolean).length
        if (finalWordCount < 500) {
          console.warn(`[GenerateChapters] ⚠️ WARNING: Chapter ${chapterTemplate.title} is very short (${finalWordCount} words). May be an outline.`)
        }
        
          return {
            id: chapterTemplate.id,
            number: chapterTemplate.number,
            title: chapterTemplate.title,
            content: formattedContent,
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error"
          console.error(`[GenerateChapters] ❌ Failed to generate chapter ${chapterTemplate.number}:`, errorMsg)
          
          // If it's an API key error, throw it up so user knows
          if (errorMsg.includes("OPENAI_API_KEY") || errorMsg.includes("not configured")) {
            throw new Error(`OpenAI API key not configured: ${errorMsg}`)
          }
          
          // Fallback to template structure if AI generation fails for this specific chapter
          return {
            id: chapterTemplate.id,
            number: chapterTemplate.number,
            title: chapterTemplate.title,
            content: `# ${chapterTemplate.title}\n\n${chapterTemplate.description}\n\n[Content generation failed: ${errorMsg}. Please edit manually.]`,
          }
        }
      })
      
      // Wait for all chapters in this batch to complete
      const batchResults = await Promise.all(batchPromises)
      
      // Sort results by chapter number to maintain order
      batchResults.sort((a, b) => a.number - b.number)
      generatedChapters.push(...batchResults)
      
      console.log(`[GenerateChapters] ✅ Completed batch ${Math.floor(batchStart / batchSize) + 1}: ${batchResults.length} chapters generated`)
    }

    // Sort all chapters by number to ensure correct order
    generatedChapters.sort((a, b) => a.number - b.number)

    // Validate we got at least some chapters
    if (generatedChapters.length === 0) {
      throw new Error("No chapters were generated. Please check your OpenAI API key and try again.")
    }
    
    // Log summary of generated content
    const totalWords = generatedChapters.reduce((sum, ch) => {
      const words = ch.content.split(/\s+/).filter(Boolean).length
      return sum + words
    }, 0)
    const avgWordsPerChapter = Math.round(totalWords / generatedChapters.length)
    
    console.log(`[GenerateChapters] ✅ Successfully generated ${generatedChapters.length} chapters`)
    console.log(`[GenerateChapters] 📊 Content stats: ${totalWords} total words, ~${avgWordsPerChapter} words per chapter`)
    
    // Log each chapter's word count for debugging
    generatedChapters.forEach(ch => {
      const words = ch.content.split(/\s+/).filter(Boolean).length
      console.log(`[GenerateChapters]   - ${ch.title}: ${words} words`)
    })

    return NextResponse.json({
      chapters: generatedChapters,
      message: "Chapters generated successfully",
      stats: {
        totalChapters: generatedChapters.length,
        totalWords,
        avgWordsPerChapter,
      },
    })
  } catch (error) {
    console.error("Generate chapters error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate chapters"
    
    // Provide more specific error messages
    let userFriendlyError = errorMessage
    if (errorMessage.includes("OPENAI_API_KEY")) {
      userFriendlyError = "OpenAI API key is not configured. Please add OPENAI_API_KEY to your Vercel environment variables."
    } else if (errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
      userFriendlyError = "Authentication failed. Please log in and try again."
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      userFriendlyError = "OpenAI API rate limit exceeded. Please wait a moment and try again."
    }
    
    return NextResponse.json(
      { error: userFriendlyError },
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
