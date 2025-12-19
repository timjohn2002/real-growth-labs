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
            systemPrompt: `You are an expert book writer. You MUST write FULLY DEVELOPED paragraphs with actual content. 

CRITICAL RULES:
- Write at least 2-3 FULL PARAGRAPHS per section (minimum 150-200 words per section)
- Each paragraph must be 3-5 sentences minimum
- NO bullet points, NO numbered lists, NO placeholders
- Write complete thoughts with examples and explanations
- If a chapter has 3 sections, write at least 450-600 words total
- Write as if teaching a real person - use full sentences and detailed explanations`,
          })
        } catch (modelError) {
          // Fallback to gpt-4 if gpt-4o is not available
          console.warn(`[GenerateChapters] gpt-4o failed, trying gpt-4:`, modelError)
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
- If a chapter has 3 sections, write at least 450-600 words total
- Write as if teaching a real person - use full sentences and detailed explanations`,
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
        const minRequiredWords = chapterTemplate.sections.length * 150 // At least 150 words per section
        
        console.log(`[GenerateChapters] Chapter ${chapterTemplate.title}: ${wordCount} words (min: ${minRequiredWords}), ${paragraphCount} paragraphs`)
        
        // ALWAYS expand if content is too short - this is critical for quality
        const timeRemaining = maxTime - (Date.now() - startTime)
        if ((wordCount < minRequiredWords || hasOnlyHeadings || hasBulletPoints || paragraphCount < chapterTemplate.sections.length) && timeRemaining > 15000) {
          console.warn(`[GenerateChapters] ⚠️ Chapter looks like outline. Expanding... (${Math.round(timeRemaining/1000)}s remaining)`)
          
          const expansionPrompt = `CRITICAL: This content is too short or incomplete. You MUST expand it into a FULLY WRITTEN chapter.

Current Content (INCOMPLETE - needs expansion):
${formattedContent}

Context: ${context}

MANDATORY EXPANSION:
- Write at least ${minRequiredWords}+ words total
- Each section needs 2-3 FULL PARAGRAPHS (150-200 words each)
- Convert ALL bullet points, lists, or short phrases into complete paragraphs
- Add detailed explanations, examples, and actionable advice
- Write as if teaching a reader - use full sentences and complete thoughts
- Personalize using: ${answers.targetReader || "target reader"}, ${answers.highTicketOffer || "offer"}, ${answers.transformation || "transformation"}

Write the COMPLETE expanded chapter with actual paragraphs now:`
          
          try {
            const expandedContent = await callGPT(expansionPrompt, {
              model: "gpt-4",
              temperature: 0.7,
              maxTokens: 4000,
              systemPrompt: `You are an expert book writer. You MUST write FULLY DEVELOPED paragraphs. Each section needs 2-3 paragraphs (150-200 words). Write complete thoughts with examples - NO bullet points, NO lists, NO placeholders. Write actual content that teaches the reader.`,
            })
            
            formattedContent = formatChapterContent(chapterTemplate, expandedContent)
            const expandedWordCount = formattedContent.split(/\s+/).filter(Boolean).length
            console.log(`[GenerateChapters] ✅ Expanded to ${expandedWordCount} words`)
          } catch (expandError) {
            console.error(`[GenerateChapters] Expansion failed, using original content:`, expandError)
          }
        }
        
        // Final validation - ensure we have minimum content
        const finalWordCount = formattedContent.split(/\s+/).filter(Boolean).length
        const finalParagraphCount = formattedContent.split(/\n\n/).filter(p => p.trim().length > 0 && !p.trim().startsWith('#')).length
        
        if (finalWordCount < 100) {
          console.warn(`[GenerateChapters] ⚠️ WARNING: Chapter ${chapterTemplate.title} has very little content (${finalWordCount} words). Adding fallback content.`)
          // Add a basic paragraph as fallback
          formattedContent += `\n\n${chapterTemplate.description}\n\nThis chapter explores ${chapterTemplate.title.toLowerCase()}. Through detailed explanations and practical examples, you'll learn how to apply these concepts to achieve your goals. Each section provides actionable insights that you can implement immediately.`
        }
        
        // Add chapter to results
        generatedChapters.push({
          id: chapterTemplate.id,
          number: chapterTemplate.number,
          title: chapterTemplate.title,
          content: formattedContent,
        })
        
        const chapterElapsed = Date.now() - startTime
        const finalCheckWordCount = formattedContent.split(/\s+/).filter(Boolean).length
        console.log(`[GenerateChapters] ✅ Completed chapter ${i + 1}/${totalChapters}: ${finalCheckWordCount} words, ${finalParagraphCount} paragraphs (total elapsed: ${Math.round(chapterElapsed/1000)}s)`)
        
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

MANDATORY: Write at least 2-3 FULL PARAGRAPHS (150-200 words minimum) for this section. Each paragraph must:
- Be 3-5 complete sentences
- Explain concepts in detail with examples
- Include specific advice or actionable steps
- Reference: ${answers.targetReader || "the target reader"}, ${answers.highTicketOffer || "the offer"}, ${answers.transformation || "the transformation"}
- Use real scenarios and case studies in paragraph form (not lists)`
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

MANDATORY REQUIREMENTS (YOU MUST FOLLOW THESE):
1. Each section MUST have at least 2-3 FULL PARAGRAPHS (minimum 150-200 words per section)
2. Each paragraph MUST be 3-5 complete sentences (no single-sentence paragraphs)
3. Write complete thoughts with detailed explanations - don't summarize, explain fully
4. Include specific examples, stories, or case studies in paragraph form (not lists)
5. Personalize content using: Target Reader: ${answers.targetReader}, Offer: ${answers.highTicketOffer}, Transformation: ${answers.transformation}
6. Write in ${answers.tone || "professional and engaging"} tone
7. Make it actionable - give readers specific steps they can take (in paragraph form)
8. Connect sections with transitional sentences
9. MINIMUM WORD COUNT: If chapter has ${chapterTemplate.sections.length} sections, write at least ${chapterTemplate.sections.length * 150} words total (${chapterTemplate.sections.length * 150}+ words minimum)
10. DO NOT write just headings - you MUST write full paragraphs under each heading

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
