"use client"

import { useState, useEffect } from "react"
import { ReviewHeader } from "@/components/dashboard/book-review/ReviewHeader"
import { ScoreGaugesRow } from "@/components/dashboard/book-review/ScoreGaugesRow"
import { ReadTimeCard } from "@/components/dashboard/book-review/ReadTimeCard"
import { ComplexityCard } from "@/components/dashboard/book-review/ComplexityCard"
import { StructureFlowGraph } from "@/components/dashboard/book-review/StructureFlowGraph"
import { OfferAlignmentCard } from "@/components/dashboard/book-review/OfferAlignmentCard"
import { ProficiencyBreakdown } from "@/components/dashboard/book-review/ProficiencyBreakdown"
import { ValueBreakdown } from "@/components/dashboard/book-review/ValueBreakdown"
import { RecommendationsPanel } from "@/components/dashboard/book-review/RecommendationsPanel"
import { ActionFooter } from "@/components/dashboard/book-review/ActionFooter"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const BRAND_COLOR = "#a6261c"

interface ReviewData {
  scores: {
    proficiency: number
    value: number
    offerAlignment: number
    structure: number
    leadMagnet: number
  }
  readTime: number | null
  wordCount: number | null
  complexity: string | null
  structure: {
    sections: Array<{
      name: string
      status: "strong" | "good" | "weak"
      feedback: string
    }>
  }
  offerAlignment: {
    overallScore: number
    metrics: Array<{
      label: string
      value: string
      score: number
    }>
    recommendation: string
  }
  proficiency: {
    metrics: Array<{
      label: string
      score: number
      suggestion: string
    }>
  }
  value: {
    metrics: Array<{
      label: string
      value: number | string
      level: "High" | "Medium" | "Low"
    }>
  }
  recommendations: Array<{
    id: string
    text: string
    chapter?: string
  }>
}

export default function BookReviewPage() {
  const router = useRouter()
  const [bookId, setBookId] = useState<string | null>(null)
  const [review, setReview] = useState<ReviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [books, setBooks] = useState<Array<{ id: string; title: string }>>([])
  const [isLoadingBooks, setIsLoadingBooks] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState<string>("")

  // Get book ID from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("id") || params.get("bookId")
      setBookId(id)
    }
  }, [])

  // Load books if no bookId
  useEffect(() => {
    if (!bookId) {
      loadBooks()
    }
  }, [bookId])

  // Load review when bookId changes
  useEffect(() => {
    if (bookId) {
      loadReview(bookId)
    } else {
      setIsLoading(false)
    }
  }, [bookId])

  const loadBooks = async () => {
    try {
      setIsLoadingBooks(true)
      const response = await fetch("/api/books", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
      }
    } catch (error) {
      console.error("Failed to load books:", error)
    } finally {
      setIsLoadingBooks(false)
    }
  }

  const loadReview = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/book-review?bookId=${id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.reviews && data.reviews.length > 0) {
          // Use the most recent review
          const latestReview = data.reviews[0]
          
          // Parse JSON strings from database with safe defaults
          const safeParseJSON = (value: any, defaultValue: any) => {
            if (!value) return defaultValue
            if (typeof value === "string") {
              try {
                return JSON.parse(value)
              } catch (e) {
                console.error("Failed to parse JSON:", e)
                return defaultValue
              }
            }
            return value || defaultValue
          }

          const parsedReview: ReviewData = {
            scores: safeParseJSON(latestReview.scores, {
              proficiency: 0,
              value: 0,
              offerAlignment: 0,
              structure: 0,
              leadMagnet: 0,
            }),
            readTime: latestReview.readTime || 0,
            wordCount: latestReview.wordCount || 0,
            complexity: latestReview.complexity || "Beginner-friendly",
            structure: safeParseJSON(latestReview.structure, {
              sections: [],
            }),
            offerAlignment: safeParseJSON(latestReview.offerAlignment, {
              overallScore: 0,
              metrics: [],
              recommendation: "No recommendation available",
            }),
            proficiency: safeParseJSON(latestReview.proficiency, {
              metrics: [],
            }),
            value: safeParseJSON(latestReview.value, {
              metrics: [],
            }),
            recommendations: safeParseJSON(latestReview.recommendations, []),
          }
          
          setReview(parsedReview)
          
          // Format last analyzed time
          const reviewedAt = new Date(latestReview.createdAt)
          const now = new Date()
          const diffMinutes = Math.floor((now.getTime() - reviewedAt.getTime()) / 60000)
          if (diffMinutes < 1) {
            setLastAnalyzed("just now")
          } else if (diffMinutes < 60) {
            setLastAnalyzed(`${diffMinutes} minutes ago`)
          } else {
            setLastAnalyzed(`${Math.floor(diffMinutes / 60)} hours ago`)
          }
        } else {
          setReview(null)
          setLastAnalyzed("never")
        }
      }
    } catch (error) {
      console.error("Failed to load review:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunAgain = async () => {
    if (!bookId) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/book-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const reviewData = data.review
        
        // Parse JSON strings from database with safe defaults
        const safeParseJSON = (value: any, defaultValue: any) => {
          if (!value) return defaultValue
          if (typeof value === "string") {
            try {
              return JSON.parse(value)
            } catch (e) {
              console.error("Failed to parse JSON:", e)
              return defaultValue
            }
          }
          return value || defaultValue
        }

        const parsedReview: ReviewData = {
          scores: safeParseJSON(reviewData.scores, {
            proficiency: 0,
            value: 0,
            offerAlignment: 0,
            structure: 0,
            leadMagnet: 0,
          }),
          readTime: reviewData.readTime || 0,
          wordCount: reviewData.wordCount || 0,
          complexity: reviewData.complexity || "Beginner-friendly",
          structure: safeParseJSON(reviewData.structure, {
            sections: [],
          }),
          offerAlignment: safeParseJSON(reviewData.offerAlignment, {
            overallScore: 0,
            metrics: [],
            recommendation: "No recommendation available",
          }),
          proficiency: safeParseJSON(reviewData.proficiency, {
            metrics: [],
          }),
          value: safeParseJSON(reviewData.value, {
            metrics: [],
          }),
          recommendations: safeParseJSON(reviewData.recommendations, []),
        }
        
        setReview(parsedReview)
        setLastAnalyzed("just now")
      }
    } catch (error) {
      console.error("Failed to analyze book:", error)
      alert(`Failed to analyze book: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleBookSelect = (selectedBookId: string) => {
    setBookId(selectedBookId)
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/dashboard/book-review?id=${selectedBookId}`)
    }
  }

  const handleApplyFix = (id: string) => {
    router.push(`/dashboard/book-editor?id=${bookId}`)
  }

  const handleOpenEditor = () => {
    router.push(`/dashboard/book-editor?id=${bookId}`)
  }

  const handleApplyAllFixes = () => {
    router.push(`/dashboard/book-editor?id=${bookId}`)
  }

  // Show book selection if no bookId
  if (!bookId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Book Review</h1>
          <p className="text-sm text-muted-foreground mt-1">Select a book to review</p>
        </div>
        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLoadingBooks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_COLOR }} />
              </div>
            ) : books.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No books found. Create a book first!</p>
                  <Button
                    onClick={() => router.push("/dashboard/book-wizard")}
                    className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    Create Your First Book
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book) => (
                  <Card
                    key={book.id}
                    className="border-border hover:border-[#a6261c] cursor-pointer transition-colors"
                    onClick={() => handleBookSelect(book.id)}
                  >
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">Click to review this book</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_COLOR }} />
      </div>
    )
  }

  // Show "no review" state
  if (!review) {
    return (
      <div className="min-h-screen bg-background">
        <ReviewHeader lastAnalyzed="never" onRunAgain={handleRunAgain} bookId={bookId} />
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No review found for this book.</p>
                <Button
                  onClick={handleRunAgain}
                  disabled={isAnalyzing}
                  className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Run Book Review"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Extract data from review with safe defaults
  const scores = [
    { label: "Proficiency Score", value: review.scores?.proficiency || 0 },
    { label: "Value Score", value: review.scores?.value || 0 },
    { label: "Offer Alignment", value: review.scores?.offerAlignment || 0 },
    { label: "Structure Score", value: review.scores?.structure || 0 },
    { label: "Lead Magnet Readiness", value: review.scores?.leadMagnet || 0 },
  ]

  const structureSections = review.structure?.sections || []
  const offerAlignmentMetrics = (review.offerAlignment?.metrics || []).map((m: any) => ({
    ...m,
    value: (m.value === "Low" ? "Weak" : m.value) as "High" | "Medium" | "Weak"
  }))
  const proficiencyMetrics = review.proficiency?.metrics || []
  const valueMetrics = review.value?.metrics || []
  const recommendations = review.recommendations || []

  return (
    <div className="min-h-screen bg-background">
      <ReviewHeader 
        lastAnalyzed={lastAnalyzed} 
        onRunAgain={handleRunAgain}
        isAnalyzing={isAnalyzing}
        bookId={bookId}
      />

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Score Gauges */}
          <ScoreGaugesRow scores={scores} />

          {/* Read Time & Complexity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadTimeCard 
              minutes={review.readTime || 0} 
              wordCount={review.wordCount || 0} 
            />
            <ComplexityCard level={(review.complexity as "Beginner-friendly" | "Intermediate" | "Advanced") || "Beginner-friendly"} />
          </div>

          {/* Structure Flow Graph */}
          <StructureFlowGraph sections={structureSections} />

          {/* Offer Alignment */}
          <OfferAlignmentCard
            overallScore={review.offerAlignment?.overallScore || 0}
            metrics={offerAlignmentMetrics}
            recommendation={review.offerAlignment?.recommendation || "No recommendation available"}
          />

          {/* Proficiency Breakdown */}
          <ProficiencyBreakdown metrics={proficiencyMetrics} />

          {/* Value Breakdown */}
          <ValueBreakdown metrics={valueMetrics} />

          {/* Recommendations Panel */}
          <RecommendationsPanel
            recommendations={recommendations}
            onApplyFix={handleApplyFix}
          />

          {/* Action Footer */}
          <ActionFooter
            onOpenEditor={handleOpenEditor}
            onApplyAllFixes={handleApplyAllFixes}
          />
        </div>
      </div>
    </div>
  )
}
