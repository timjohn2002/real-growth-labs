"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  useEffect(() => {
    if (insights.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % insights.length)
      }, 5000) // Rotate every 5 seconds

      return () => clearInterval(interval)
    }
  }, [insights])

  const fetchInsights = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user's books and content
      const [booksResponse, contentResponse] = await Promise.all([
        fetch("/api/books", { credentials: "include" }),
        fetch("/api/content", { credentials: "include" }),
      ])

      if (booksResponse.ok && contentResponse.ok) {
        const booksData = await booksResponse.json()
        const contentData = await contentResponse.json()
        
        const books = booksData.books || []
        const contentItems = contentData.items || []
        
        // Generate insights based on actual user data
        const generatedInsights: string[] = []

        // Book-related insights
        const draftBooks = books.filter((b: any) => b.status === "draft")
        const publishedBooks = books.filter((b: any) => b.status === "published")
        
        if (draftBooks.length > 0) {
          const book = draftBooks[0]
          const progress = book.wordCount > 0 
            ? Math.round((book.wordCount / 10000) * 100) // Assuming 10k words = 100%
            : 10
          if (progress < 100) {
            generatedInsights.push(
              `Your "${book.title}" draft is ${Math.min(progress, 95)}% done — continue writing?`
            )
          }
        }

        if (books.length > 0 && books[0].chapterCount > 0) {
          const book = books[0]
          if (book.chapterCount >= 3) {
            generatedInsights.push(
              `Your "${book.title}" has strong chapter flow. Want a rewrite suggestion?`
            )
          }
        }

        // Content-related insights
        const recentContent = contentItems.slice(0, 5)
        if (recentContent.length > 0) {
          const contentCount = recentContent.length
          generatedInsights.push(
            `You've added ${contentCount} new content item${contentCount > 1 ? 's' : ''} recently.`
          )
        }

        // Word count insights
        const totalWords = books.reduce((sum: number, book: any) => sum + (book.wordCount || 0), 0)
        if (totalWords > 0) {
          const wordCountStr = totalWords >= 1000 
            ? `${(totalWords / 1000).toFixed(1)}k` 
            : totalWords.toString()
          generatedInsights.push(
            `You've written ${wordCountStr} words across all your books.`
          )
        }

        // Chapter insights
        const totalChapters = books.reduce((sum: number, book: any) => sum + (book.chapterCount || 0), 0)
        if (totalChapters > 0 && draftBooks.length > 0) {
          generatedInsights.push(
            `Consider adding more chapters to expand your book's depth.`
          )
        }

        // Content processing insights
        const processingContent = contentItems.filter((item: any) => 
          item.status === "processing" || item.status === "pending"
        )
        if (processingContent.length > 0) {
          generatedInsights.push(
            `You have ${processingContent.length} content item${processingContent.length > 1 ? 's' : ''} being processed.`
          )
        }

        // If no insights generated, show default message
        if (generatedInsights.length === 0) {
          generatedInsights.push("Start creating content to get personalized insights!")
        }

        setInsights(generatedInsights)
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error)
      setInsights(["Unable to load insights at this time."])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[#a6261c]" />
            <h3 className="text-sm font-semibold text-foreground">AI Insights for You</h3>
          </div>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-[#a6261c]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[#a6261c]" />
            <h3 className="text-sm font-semibold text-foreground">AI Insights for You</h3>
          </div>
          <p className="text-sm text-muted-foreground">No insights available yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-[#a6261c]" />
          <h3 className="text-sm font-semibold text-foreground">AI Insights for You</h3>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-foreground"
          >
            {insights[currentIndex]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1 mt-3">
          {insights.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index === currentIndex ? "bg-[#a6261c]" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

