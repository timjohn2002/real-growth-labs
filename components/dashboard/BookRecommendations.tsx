"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function BookRecommendations() {
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user's books
      const booksResponse = await fetch("/api/books", { credentials: "include" })
      
      if (booksResponse.ok) {
        const booksData = await booksResponse.json()
        const books = booksData.books || []
        
        // Generate recommendations based on actual user data
        const generatedRecommendations: string[] = []

        if (books.length === 0) {
          generatedRecommendations.push("Create your first book to get started!")
          generatedRecommendations.push("Start by adding content to your Content Vault.")
        } else {
          const draftBooks = books.filter((b: any) => b.status === "draft")
          const publishedBooks = books.filter((b: any) => b.status === "published")
          
          // Book-specific recommendations
          if (draftBooks.length > 0) {
            const book = draftBooks[0]
            
            if (book.chapterCount === 0) {
              generatedRecommendations.push(
                `Add your first chapter to "${book.title}" to get started.`
              )
            } else if (book.chapterCount < 3) {
              generatedRecommendations.push(
                `Consider adding more chapters to "${book.title}" for better structure.`
              )
            } else if (book.wordCount < 5000) {
              generatedRecommendations.push(
                `Your "${book.title}" could benefit from more content. Consider expanding chapters.`
              )
            } else if (book.wordCount >= 5000 && book.status === "draft") {
              generatedRecommendations.push(
                `Your "${book.title}" is looking good! Consider reviewing and publishing.`
              )
            }
            
            if (book.chapterCount >= 4) {
              generatedRecommendations.push(
                `Consider adding a case study to Chapter 4 of "${book.title}".`
              )
            }
            
            if (book.wordCount > 1000 && book.wordCount < 3000) {
              generatedRecommendations.push(
                `Your "${book.title}" intro could be more concise — want to tighten it?`
              )
            }
          }

          // General recommendations
          if (publishedBooks.length === 0 && draftBooks.length > 0) {
            generatedRecommendations.push(
              "You have draft books ready. Consider publishing one!"
            )
          }

          if (books.length > 0) {
            const bookWithMostWords = books.reduce((max: any, book: any) => 
              (book.wordCount || 0) > (max.wordCount || 0) ? book : max
            )
            
            if (bookWithMostWords.wordCount > 3000) {
              generatedRecommendations.push(
                `Your "${bookWithMostWords.title}" is ready for an audiobook. Generate it now!`
              )
            }
          }

          // Content recommendations
          if (books.length > 0) {
            generatedRecommendations.push(
              "Add more content to your Content Vault to enrich your books."
            )
          }
        }

        // If no recommendations generated, show default
        if (generatedRecommendations.length === 0) {
          generatedRecommendations.push("Keep creating to get personalized recommendations!")
        }

        setRecommendations(generatedRecommendations)
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
      setRecommendations(["Unable to load recommendations at this time."])
    } finally {
      setIsLoading(false)
    }
  }

  const next = () => {
    if (recommendations.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % recommendations.length)
    }
  }

  const prev = () => {
    if (recommendations.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#a6261c]" />
              <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
            </div>
          </div>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-[#a6261c]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#a6261c]" />
              <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">No recommendations available yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#a6261c]" />
            <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
          </div>
          {recommendations.length > 1 && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={prev}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={next}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-foreground"
          >
            {recommendations[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

