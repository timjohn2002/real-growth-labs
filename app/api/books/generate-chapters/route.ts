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
    // Generate sequentially to avoid timeout - return partial results if needed
    const generatedChapters: Array<{ id: string; number: number; title: string; content: string }> = []
    const totalChapters = REAL_GROWTH_BOOK_TEMPLATE.length
    const startTime = Date.now()
    const maxTime = 50000 // 50 seconds - leave 10s buffer for response
    
    // Generate chapters one at a time (sequential) to maximize how many we can complete
    for (let i = 0; i < REAL_GROWTH_BOOK_TEMPLATE.length; i++) {
      const chapterTemplate = REAL_GROWTH_BOOK_TEMPLATE[i]
      
      // Check if we're running out of time
      const elapsed = Date.now() - startTime
      if (elapsed > maxTime) {
        console.warn(`[GenerateChapters] ⏰ Time limit approaching (${elapsed}ms). Generated ${generatedChapters.length}/${totalChapters} chapters. Returning partial results.`)
        break
      }
      
      console.log(`[GenerateChapters] Generating chapter ${i + 1}/${totalChapters}: ${chapterTemplate.title} (${Math.round(elapsed/1000)}s elapsed)`)
      
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
        // Reduced maxTokens to 4000 to speed up generation while still getting full content
        let chapterContent: string
        try {
          chapterContent = await callGPT(chapterPrompt, {
            model: "gpt-4o",
            temperature: 0.7,
            maxTokens: 4000, // Reduced from 6000 to speed up generation
            systemPrompt: `You are an expert book writer. Write COMPLETE, FULLY-DEVELOPED paragraphs (NOT outlines or bullet points). Each section needs 300-500+ words of actual written content with full sentences, examples, and actionable advice. Write a FULLY WRITTEN BOOK CHAPTER, not an outline.`,
          })
        } catch (modelError) {
          // Fallback to gpt-4 if gpt-4o is not available
          console.warn(`[GenerateChapters] gpt-4o failed, trying gpt-4:`, modelError)
          chapterContent = await callGPT(chapterPrompt, {
            model: "gpt-4",
            temperature: 0.7,
            maxTokens: 4000,
            systemPrompt: `You are an expert book writer. Write COMPLETE, FULLY-DEVELOPED paragraphs (NOT outlines or bullet points). Each section needs 300-500+ words of actual written content with full sentences, examples, and actionable advice. Write a FULLY WRITTEN BOOK CHAPTER, not an outline.`,
          })
        }

        // Format the content with proper headings
        let formattedContent = formatChapterContent(chapterTemplate, chapterContent)
        
        // Validate that we got actual content, not just an outline
        const wordCount = formattedContent.split(/\s+/).filter(Boolean).length
        const headingCount = (formattedContent.match(/^#+\s/gm) || []).length
        const paragraphCount = formattedContent.split(/\n\n/).filter(p => p.trim().length > 0 && !p.trim().startsWith('#')).length
        const hasOnlyHeadings = headingCount > paragraphCount * 0.3
        const hasBulletPoints = (formattedContent.match(/^[-*+]\s/gm) || []).length > 5
        
        console.log(`[GenerateChapters] Chapter ${chapterTemplate.title}: ${wordCount} words, ${paragraphCount} paragraphs`)
        
        // Only expand if content is clearly an outline AND we have time
        const timeRemaining = maxTime - (Date.now() - startTime)
        if ((wordCount < 600 || hasOnlyHeadings || hasBulletPoints) && timeRemaining > 20000) {
          console.warn(`[GenerateChapters] ⚠️ Chapter looks like outline. Expanding... (${Math.round(timeRemaining/1000)}s remaining)`)
          
          const expansionPrompt = `Expand this outline into a FULLY WRITTEN chapter with complete paragraphs (1000+ words). Convert all bullet points to full paragraphs with examples and explanations.

Outline:
${formattedContent}

Context: ${context}

Write the complete expanded chapter now:`
          
          try {
            const expandedContent = await callGPT(expansionPrompt, {
              model: "gpt-4",
              temperature: 0.7,
              maxTokens: 4000,
              systemPrompt: `You are an expert book writer. Expand outlines into fully-written chapters with complete paragraphs. Write actual content, not bullet points.`,
            })
            
            formattedContent = formatChapterContent(chapterTemplate, expandedContent)
            const expandedWordCount = formattedContent.split(/\s+/).filter(Boolean).length
            console.log(`[GenerateChapters] ✅ Expanded to ${expandedWordCount} words`)
          } catch (expandError) {
            console.error(`[GenerateChapters] Expansion failed, using original content:`, expandError)
          }
        }
        
        // Add chapter to results
        generatedChapters.push({
          id: chapterTemplate.id,
          number: chapterTemplate.number,
          title: chapterTemplate.title,
          content: formattedContent,
        })
        
        const chapterElapsed = Date.now() - startTime
        console.log(`[GenerateChapters] ✅ Completed chapter ${i + 1}/${totalChapters} (total elapsed: ${Math.round(chapterElapsed/1000)}s)`)
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error"
        console.error(`[GenerateChapters] ❌ Failed to generate chapter ${chapterTemplate.number}:`, errorMsg)
        
        // If it's an API key error, throw it up so user knows
        if (errorMsg.includes("OPENAI_API_KEY") || errorMsg.includes("not configured")) {
          throw new Error(`OpenAI API key not configured: ${errorMsg}`)
        }
        
        // Fallback to template structure if AI generation fails for this specific chapter
        generatedChapters.push({
          id: chapterTemplate.id,
          number: chapterTemplate.number,
          title: chapterTemplate.title,
          content: `# ${chapterTemplate.title}\n\n${chapterTemplate.description}\n\n[Content generation failed: ${errorMsg}. Please edit manually.]`,
        })
      }
    }

    // Sort all chapters by number to ensure correct order
    generatedChapters.sort((a, b) => a.number - b.number)

    // Validate we got at least some chapters
    if (generatedChapters.length === 0) {
      throw new Error("No chapters were generated. Please check your OpenAI API key and try again.")
    }
    
    // If we didn't generate all chapters, create placeholders for the rest
    if (generatedChapters.length < totalChapters) {
      console.warn(`[GenerateChapters] ⚠️ Only generated ${generatedChapters.length}/${totalChapters} chapters due to time limit. Creating placeholders for remaining chapters.`)
      
      const generatedNumbers = new Set(generatedChapters.map(ch => ch.number))
      for (const template of REAL_GROWTH_BOOK_TEMPLATE) {
        if (!generatedNumbers.has(template.number)) {
          generatedChapters.push({
            id: template.id,
            number: template.number,
            title: template.title,
            content: `# ${template.title}\n\n${template.description}\n\n[This chapter will be generated in a follow-up request. You can edit it manually or regenerate it.]`,
          })
        }
      }
      generatedChapters.sort((a, b) => a.number - b.number)
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
