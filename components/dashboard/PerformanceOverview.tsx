"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Edit, Clock, Headphones, TrendingUp, Loader2 } from "lucide-react"

interface Metrics {
  wordsWritten: number
  chaptersCount: number
  readingTime: number // in minutes
  audiobookLength: number // in minutes
  contentItemsCount: number
}

export function PerformanceOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setIsLoading(true)
      
      // Fetch books and content in parallel
      const [booksResponse, contentResponse] = await Promise.all([
        fetch("/api/books", { credentials: "include" }),
        fetch("/api/content", { credentials: "include" }),
      ])

      if (booksResponse.ok && contentResponse.ok) {
        const booksData = await booksResponse.json()
        const contentData = await contentResponse.json()
        
        const books = booksData.books || []
        const contentItems = contentData.items || []

        // Calculate metrics
        const wordsWritten = books.reduce((total: number, book: any) => {
          return total + (book.wordCount || 0)
        }, 0)

        const chaptersCount = books.reduce((total: number, book: any) => {
          return total + (book.chapterCount || 0)
        }, 0)

        // Estimate reading time (average 200 words per minute)
        const readingTime = Math.round(wordsWritten / 200)

        // Estimate audiobook length (rough estimate: 1 minute per 150 words)
        // This is a general estimate - actual audiobook length would come from generated audiobooks
        const audiobookLength = Math.round(wordsWritten / 150)

        setMetrics({
          wordsWritten,
          chaptersCount,
          readingTime,
          audiobookLength,
          contentItemsCount: contentItems.length,
        })
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  const displayMetrics = [
    { 
      label: "Words written", 
      value: metrics ? metrics.wordsWritten.toLocaleString() : "0", 
      icon: FileText 
    },
    { 
      label: "Chapters created", 
      value: metrics ? metrics.chaptersCount.toString() : "0", 
      icon: Edit 
    },
    { 
      label: "Reading time", 
      value: metrics ? formatTime(metrics.readingTime) : "0min", 
      icon: Clock 
    },
    { 
      label: "Content items", 
      value: metrics ? metrics.contentItemsCount.toString() : "0", 
      icon: Headphones 
    },
    { 
      label: "Audiobook length", 
      value: metrics ? formatTime(metrics.audiobookLength) : "0min", 
      icon: TrendingUp 
    },
  ]

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Performance Overview</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-[#a6261c]" />
          </div>
        ) : (
          <div className="space-y-3">
            {displayMetrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{metric.value}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

