"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, BookOpen, TrendingUp, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookJourneyTimeline } from "@/components/dashboard/BookJourneyTimeline"
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel"
import { ContentIngestionFeed } from "@/components/dashboard/ContentIngestionFeed"
import { ProgressHeatmap } from "@/components/dashboard/ProgressHeatmap"
import { BookRecommendations } from "@/components/dashboard/BookRecommendations"
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview"
import { QuickActionsLauncher } from "@/components/dashboard/QuickActionsLauncher"
import { BookFocusPreview } from "@/components/dashboard/BookFocusPreview"

const BRAND_COLOR = "#a6261c"

interface Book {
  id: string
  title: string
  status: string
  chapterCount: number
  wordCount: number
  updatedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState({
    totalBooks: 0,
    published: 0,
    inProgress: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch user's books
      const booksResponse = await fetch("/api/books")
      if (booksResponse.ok) {
        const booksData = await booksResponse.json()
        const userBooks = booksData.books || []
        setBooks(userBooks)

        // Calculate stats
        const totalBooks = userBooks.length
        const published = userBooks.filter((b: Book) => b.status === "published").length
        const inProgress = userBooks.filter((b: Book) => 
          b.status === "draft" || b.status === "in_progress"
        ).length

        setStats({ totalBooks, published, inProgress })

        // Set current book (most recently updated)
        if (userBooks.length > 0) {
          setCurrentBook(userBooks[0])
        }
      } else if (booksResponse.status === 401) {
        // Not authenticated, redirect to login
        router.push("/login")
        return
      } else {
        // Other error - log it
        const errorData = await booksResponse.json().catch(() => ({}))
        console.error("Failed to fetch books:", booksResponse.status, errorData)
      }

      // Get user name from localStorage (set during login)
      if (typeof window !== "undefined") {
        try {
          const userData = localStorage.getItem("user")
          if (userData) {
            const user = JSON.parse(userData)
            const name = user.name || user.email?.split("@")[0] || "User"
            setUserName(name)
          }
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Don't redirect on network errors, just show empty state
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProgress = (book: Book) => {
    // Simple progress calculation based on status
    if (book.status === "published") return 100
    if (book.status === "draft") {
      // Progress based on word count (rough estimate)
      if (book.wordCount > 10000) return 75
      if (book.wordCount > 5000) return 50
      if (book.wordCount > 1000) return 25
      return 10
    }
    return 30
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Welcome Message */}
      <p className="text-lg text-muted-foreground mb-8">
        Welcome back, {userName || "User"}. Here&apos;s a quick look at your progress.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#a6261c]" />
        </div>
      ) : (
        <>
          {/* Book Journey Timeline */}
          {currentBook && (
            <BookJourneyTimeline 
              currentStage={currentBook.status === "published" ? 5 : currentBook.status === "draft" ? 2 : 3} 
              bookTitle={currentBook.title} 
            />
          )}

          {/* Book Focus Preview */}
          {currentBook && (
            <div className="mb-8">
              <BookFocusPreview bookId={currentBook.id} bookTitle={currentBook.title} />
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Books</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalBooks}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-[#a6261c]" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Published</p>
                    <p className="text-3xl font-bold text-foreground">{stats.published}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#a6261c]" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-foreground">{stats.inProgress}</p>
                  </div>
                  <Clock className="h-8 w-8 text-[#a6261c]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Books Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Books</h2>
            {books.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You don't have any books yet.</p>
                  <Link href="/dashboard/book-wizard">
                    <Button className="bg-[#a6261c] hover:bg-[#8e1e16] text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Book
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {books.map((book, index) => {
                  const progress = calculateProgress(book)
                  return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className="border-border shadow-sm hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        {/* Visual Book Cover */}
                        <motion.div
                          className="w-full h-32 rounded-lg mb-4 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #d43a2e 100%)`,
                          }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                              <BookOpen className="h-12 w-12 text-white/80" />
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Title */}
                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          className="text-lg font-bold text-foreground mb-2"
                        >
                          {book.title}
                        </motion.h3>

                        {/* Status text (tiny) */}
                        <p className="text-xs text-muted-foreground mb-2 capitalize">{book.status}</p>
                        <p className="text-xs text-muted-foreground mb-4">
                          {book.chapterCount} chapters • {book.wordCount.toLocaleString()} words
                        </p>

                        {/* Progress bar with animation */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">{progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="bg-[#a6261c] h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                            />
                          </div>
                        </div>

                        {/* Continue button (primary) */}
                        <Link href={`/dashboard/book-editor?id=${book.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              className="w-full bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                              style={{ backgroundColor: BRAND_COLOR }}
                            >
                              Continue
                            </Button>
                          </motion.div>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Content Ingestion Feed */}
          <ContentIngestionFeed />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* AI Insights Panel */}
          <AIInsightsPanel />

          {/* Performance Overview */}
          <PerformanceOverview />

          {/* Progress Heatmap */}
          <ProgressHeatmap />

          {/* Book Recommendations */}
          <BookRecommendations />
        </div>
      </div>

      {/* Quick Actions Launcher */}
      <QuickActionsLauncher />
    </div>
  )
}
