import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { analyzeBookWithAI } from "@/lib/openai"

// GET /api/book-review - Get reviews for a book
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookId = searchParams.get("bookId")

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId is required" },
        { status: 400 }
      )
    }

    const reviews = await prisma.bookReview.findMany({
      where: { bookId },
      orderBy: { createdAt: "desc" },
      include: {
        book: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Get book reviews error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

// POST /api/book-review - Create a new review (analyze book)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId } = body

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId is required" },
        { status: 400 }
      )
    }

    // Get book with chapters
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      )
    }

    // Analyze book with AI if available, otherwise use basic analysis
    let analysis: any
    try {
      if (process.env.OPENAI_API_KEY) {
        const aiAnalysis = await analyzeBookWithAI(book)
        // Calculate read time and word count
        const wordCount = book.chapters.reduce((total: number, ch: any) => {
          if (!ch.content) return total
          const text = ch.content.replace(/<[^>]*>/g, "")
          return total + text.split(/\s+/).filter((w: string) => w.length > 0).length
        }, 0)
        analysis = {
          ...aiAnalysis,
          readTime: Math.ceil(wordCount / 200),
          wordCount,
        }
      } else {
        analysis = analyzeBook(book)
      }
    } catch (error) {
      console.error("AI analysis failed, falling back to basic analysis:", error)
      analysis = analyzeBook(book)
    }

    // Create review record
    const review = await prisma.bookReview.create({
      data: {
        bookId,
        scores: JSON.stringify(analysis.scores),
        readTime: analysis.readTime,
        wordCount: analysis.wordCount,
        complexity: analysis.complexity,
        structure: JSON.stringify(analysis.structure),
        offerAlignment: JSON.stringify(analysis.offerAlignment),
        proficiency: JSON.stringify(analysis.proficiency),
        value: JSON.stringify(analysis.value),
        recommendations: JSON.stringify(analysis.recommendations),
      },
      include: {
        book: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error("Create book review error:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

// Basic analysis logic (without AI)
function analyzeBook(book: any) {
  const chapters = book.chapters || []
  
  // Calculate word count
  const wordCount = chapters.reduce((total: number, ch: any) => {
    if (!ch.content) return total
    const text = ch.content.replace(/<[^>]*>/g, "") // Remove HTML tags
    return total + text.split(/\s+/).filter((w: string) => w.length > 0).length
  }, 0)

  // Calculate read time (average 200 words per minute)
  const readTime = Math.ceil(wordCount / 200)

  // Analyze structure
  const structureSections = chapters.map((ch: any, index: number) => {
    const content = ch.content?.replace(/<[^>]*>/g, "") || ""
    const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length
    
    let status: "strong" | "good" | "weak" = "good"
    let feedback = "Good"
    
    if (wordCount < 200) {
      status = "weak"
      feedback = "Too short - consider expanding"
    } else if (wordCount > 3000) {
      status = "weak"
      feedback = "Very long - consider breaking into sections"
    } else if (wordCount > 1500) {
      status = "strong"
      feedback = "Excellent length"
    }
    
    // Check for transitions
    const hasTransition = content.match(/however|therefore|furthermore|additionally|moreover|consequently/i)
    if (!hasTransition && index > 0) {
      if (status === "good") status = "weak"
      feedback = feedback + (feedback ? ". " : "") + "Needs better transitions"
    }
    
    return {
      name: ch.title,
      status,
      feedback,
    }
  })

  // Calculate structure score (based on section quality)
  const structureScore = Math.round(
    (structureSections.filter((s: any) => s.status === "strong").length / structureSections.length) * 100
  )

  // Analyze offer alignment
  const allContent = chapters.map((ch: any) => ch.content?.replace(/<[^>]*>/g, "") || "").join(" ")
  const offerMentions = (allContent.match(/offer|program|coaching|consulting|service|solution|package/i) || []).length
  const ctaMentions = (allContent.match(/book a call|schedule|sign up|get started|learn more|contact|free/i) || []).length
  
  const offerAlignmentScore = Math.min(100, Math.round(
    (offerMentions * 10) + (ctaMentions * 15)
  ))

  const offerAlignmentMetrics = [
    {
      label: "Mentions of offer",
      value: offerMentions > 5 ? "High" : offerMentions > 2 ? "Medium" : "Low",
      score: Math.min(100, offerMentions * 15),
    },
    {
      label: "Relevance of story to offer",
      value: "Medium",
      score: 65,
    },
    {
      label: "CTA strength",
      value: ctaMentions > 3 ? "High" : ctaMentions > 1 ? "Medium" : "Low",
      score: Math.min(100, ctaMentions * 20),
    },
    {
      label: "Logical bridges from content → offer",
      value: offerMentions > 3 ? "Strong" : offerMentions > 1 ? "Medium" : "Weak",
      score: Math.min(100, offerMentions * 25),
    },
  ]

  // Analyze proficiency
  const clarityScore = Math.min(100, Math.round(80 + (structureSections.filter((s: any) => s.status === "strong").length * 3)))
  const authorityScore = Math.min(100, Math.round(75 + (offerMentions * 2)))
  const accuracyScore = Math.min(100, Math.round(80 + (chapters.length > 5 ? 5 : 0)))

  const proficiencyMetrics = [
    {
      label: "Clarity",
      score: clarityScore,
      suggestion: clarityScore > 85 ? "Good pacing" : "Improve clarity",
    },
    {
      label: "Authority",
      score: authorityScore,
      suggestion: authorityScore > 80 ? "Strong authority" : "Improve tone consistency",
    },
    {
      label: "Accuracy",
      score: accuracyScore,
      suggestion: accuracyScore > 85 ? "Well-structured" : "Add more concrete numbers",
    },
  ]

  const proficiencyScore = Math.round(
    (clarityScore + authorityScore + accuracyScore) / 3
  )

  // Analyze value
  const practicalTips = (allContent.match(/tip|step|action|how to|guide|method|technique|strategy/i) || []).length
  const uniqueInsights = chapters.length > 3 ? "High" : chapters.length > 1 ? "Medium" : "Low"
  
  // Check for repetitiveness (simple heuristic)
  const words = allContent.toLowerCase().split(/\s+/)
  const wordFreq: Record<string, number> = {}
  words.forEach((word: string) => {
    if (word.length > 4) {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    }
  })
  const maxFreq = Math.max(...Object.values(wordFreq))
  const repetitiveness = maxFreq > wordCount * 0.01 ? "Medium" : "Low"
  
  const fluffDetected = wordCount < 5000 ? "Low" : wordCount < 10000 ? "Medium" : "High"

  const valueMetrics = [
    {
      label: "Practical tips count",
      value: practicalTips,
      level: practicalTips > 10 ? "High" : practicalTips > 5 ? "Medium" : "Low",
    },
    {
      label: "Unique insights",
      value: uniqueInsights,
      level: uniqueInsights === "High" ? "High" : uniqueInsights === "Medium" ? "Medium" : "Low",
    },
    {
      label: "Repetitiveness",
      value: repetitiveness,
      level: repetitiveness === "Low" ? "Low" : repetitiveness === "Medium" ? "Medium" : "High",
    },
    {
      label: "Fluff detected",
      value: fluffDetected,
      level: fluffDetected === "Low" ? "Low" : fluffDetected === "Medium" ? "Medium" : "High",
    },
  ]

  const valueScore = Math.round(
    (practicalTips > 10 ? 90 : practicalTips > 5 ? 80 : 70) +
    (uniqueInsights === "High" ? 10 : uniqueInsights === "Medium" ? 5 : 0) +
    (repetitiveness === "Low" ? 10 : repetitiveness === "Medium" ? 5 : 0) -
    (fluffDetected === "High" ? 10 : fluffDetected === "Medium" ? 5 : 0)
  )

  // Generate recommendations
  const recommendations = []
  
  if (structureSections.some((s: any) => s.status === "weak")) {
    const weakSection = structureSections.find((s: any) => s.status === "weak")
    if (weakSection) {
      recommendations.push({
        id: `rec-${recommendations.length + 1}`,
        text: `Improve "${weakSection.name}" section: ${weakSection.feedback}`,
        chapter: weakSection.name,
      })
    }
  }
  
  if (offerMentions < 3) {
    recommendations.push({
      id: `rec-${recommendations.length + 1}`,
      text: "Add more mentions of your high-ticket offer throughout the book.",
      chapter: "Throughout",
    })
  }
  
  if (ctaMentions < 2) {
    recommendations.push({
      id: `rec-${recommendations.length + 1}`,
      text: "Include more calls-to-action to guide readers to your offer.",
      chapter: "Conclusion",
    })
  }
  
  if (chapters.length < 5) {
    recommendations.push({
      id: `rec-${recommendations.length + 1}`,
      text: "Consider adding more chapters to provide more value.",
      chapter: "Structure",
    })
  }

  // Determine complexity
  const avgWordsPerChapter = wordCount / Math.max(chapters.length, 1)
  let complexity = "Beginner-friendly"
  if (avgWordsPerChapter > 2000) {
    complexity = "Advanced"
  } else if (avgWordsPerChapter > 1000) {
    complexity = "Intermediate"
  }

  // Lead magnet readiness score
  const leadMagnetScore = Math.round(
    (proficiencyScore * 0.3) +
    (valueScore * 0.3) +
    (offerAlignmentScore * 0.2) +
    (structureScore * 0.2)
  )

  return {
    scores: {
      proficiency: proficiencyScore,
      value: valueScore,
      offerAlignment: offerAlignmentScore,
      structure: structureScore,
      leadMagnet: leadMagnetScore,
    },
    readTime,
    wordCount,
    complexity,
    structure: {
      sections: structureSections,
    },
    offerAlignment: {
      overallScore: offerAlignmentScore,
      metrics: offerAlignmentMetrics,
      recommendation: offerMentions < 3
        ? "Add stronger transition sentences and more mentions of your high-ticket offer throughout the book."
        : "Consider adding more CTAs to guide readers to your offer.",
    },
    proficiency: {
      metrics: proficiencyMetrics,
    },
    value: {
      metrics: valueMetrics,
    },
    recommendations,
  }
}

