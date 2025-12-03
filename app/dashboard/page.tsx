"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, BookOpen, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { BookJourneyTimeline } from "@/components/dashboard/BookJourneyTimeline"
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel"
import { ContentIngestionFeed } from "@/components/dashboard/ContentIngestionFeed"
import { ProgressHeatmap } from "@/components/dashboard/ProgressHeatmap"
import { BookRecommendations } from "@/components/dashboard/BookRecommendations"
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview"
import { QuickActionsLauncher } from "@/components/dashboard/QuickActionsLauncher"
import { BookFocusPreview } from "@/components/dashboard/BookFocusPreview"

const BRAND_COLOR = "#a6261c"

export default function DashboardPage() {
  const [userName, setUserName] = useState("Evgeny")

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const user = JSON.parse(userData)
          const name = user.email?.split("@")[0] || user.name || "Evgeny"
          setUserName(name)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  const books = [
    { id: 1, title: "My First Book", status: "Published", progress: 100 },
    { id: 2, title: "Marketing Guide", status: "Draft", progress: 65 },
    { id: 3, title: "Business Strategy", status: "In Progress", progress: 30 },
    { id: 4, title: "Leadership Principles", status: "Draft", progress: 45 },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Welcome Message */}
      <p className="text-lg text-gray-600 mb-8">
        Welcome back, {userName}. Here&apos;s a quick look at your progress.
      </p>

      {/* Book Journey Timeline */}
      <BookJourneyTimeline currentStage={2} bookTitle="Marketing Guide" />

      {/* Book Focus Preview */}
      <div className="mb-8">
        <BookFocusPreview />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Books</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
              </div>
              <BookOpen className="h-8 w-8 text-[#a6261c]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#a6261c]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">4</p>
              </div>
              <Clock className="h-8 w-8 text-[#a6261c]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Books Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Books</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className="border-gray-200 shadow-sm hover:shadow-lg transition-all">
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
                          className="text-lg font-bold text-gray-900 mb-2"
                        >
                          {book.title}
                        </motion.h3>

                        {/* Status text (tiny) */}
                        <p className="text-xs text-gray-500 mb-4">{book.status}</p>

                        {/* Progress bar with animation */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-900 font-medium">{book.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="bg-[#a6261c] h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${book.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                            />
                          </div>
                        </div>

                        {/* Continue button (primary) */}
                        <Link href={`/dashboard/book-editor?book=${book.id}`}>
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
              ))}
            </div>
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
