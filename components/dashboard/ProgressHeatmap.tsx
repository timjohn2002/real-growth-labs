"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const BRAND_COLOR = "#a6261c"

const getColorIntensity = (level: number) => {
  const colors = [
    "bg-muted",
    "bg-[#a6261c]/20",
    "bg-[#a6261c]/40",
    "bg-[#a6261c]/60",
    "bg-[#a6261c]",
  ]
  return colors[level] || colors[0]
}

// Generate activity heatmap based on actual user activity
const generateHeatmapFromActivity = (books: any[], contentItems: any[]) => {
  const data: number[][] = []
  const today = new Date()
  
  // Create a map of activity by date (last 49 days = 7 weeks)
  const activityMap: { [key: string]: number } = {}
  
  // Count book activity (created/updated)
  books.forEach((book: any) => {
    const createdDate = new Date(book.createdAt)
    const updatedDate = new Date(book.updatedAt)
    
    // Add activity for creation date
    const createdKey = createdDate.toISOString().split('T')[0]
    activityMap[createdKey] = (activityMap[createdKey] || 0) + 2
    
    // Add activity for update date (if different)
    const updatedKey = updatedDate.toISOString().split('T')[0]
    if (updatedKey !== createdKey) {
      activityMap[updatedKey] = (activityMap[updatedKey] || 0) + 1
    }
  })
  
  // Count content activity
  contentItems.forEach((item: any) => {
    const createdDate = new Date(item.createdAt)
    const createdKey = createdDate.toISOString().split('T')[0]
    activityMap[createdKey] = (activityMap[createdKey] || 0) + 1
  })
  
  // Generate 7 weeks of data (7 rows x 7 days)
  for (let week = 0; week < 7; week++) {
    const weekData: number[] = []
    for (let day = 0; day < 7; day++) {
      // Calculate date for this cell (going back from today)
      const daysAgo = (6 - week) * 7 + (6 - day)
      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)
      const dateKey = date.toISOString().split('T')[0]
      
      // Get activity level (0-4) based on activity count
      const activityCount = activityMap[dateKey] || 0
      let level = 0
      if (activityCount >= 5) level = 4
      else if (activityCount >= 3) level = 3
      else if (activityCount >= 2) level = 2
      else if (activityCount >= 1) level = 1
      
      weekData.push(level)
    }
    data.push(weekData)
  }
  
  return data
}

export function ProgressHeatmap() {
  const [heatmapData, setHeatmapData] = useState<number[][]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivityData()
  }, [])

  const fetchActivityData = async () => {
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
        
        // Generate heatmap from actual activity
        const data = generateHeatmapFromActivity(books, contentItems)
        setHeatmapData(data)
      } else {
        // Fallback to empty heatmap
        setHeatmapData(Array(7).fill(null).map(() => Array(7).fill(0)))
      }
    } catch (error) {
      console.error("Failed to fetch activity data:", error)
      // Fallback to empty heatmap
      setHeatmapData(Array(7).fill(null).map(() => Array(7).fill(0)))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Activity Heatmap</h3>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-[#a6261c]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Activity Heatmap</h3>
        <div className="flex gap-1">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  className={`w-3 h-3 rounded ${getColorIntensity(day)}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded ${getColorIntensity(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}

