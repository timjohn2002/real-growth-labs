"use client"

import { useState, useEffect } from "react"
import { Clock, Mic, Video, FileText, Link as LinkIcon, Image as ImageIcon, Headphones, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ContentItem {
  id: string
  title: string
  type: "podcast" | "video" | "audio" | "url" | "text" | "image"
  uploadedAt: string
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "podcast":
      return Mic
    case "video":
      return Video
    case "audio":
      return Headphones
    case "url":
      return LinkIcon
    case "text":
      return FileText
    case "image":
      return ImageIcon
    default:
      return FileText
  }
}

export function ContentIngestionFeed() {
  const [recentContent, setRecentContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecentContent()
  }, [])

  const fetchRecentContent = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/content", { credentials: "include" })
      
      if (response.ok) {
        const data = await response.json()
        // Get the 5 most recent content items
        const items = (data.items || []).slice(0, 5)
        setRecentContent(items)
      }
    } catch (error) {
      console.error("Failed to fetch recent content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Content</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-[#a6261c]" />
          </div>
        ) : recentContent.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No content yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add content to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentContent.map((item) => {
              const Icon = getTypeIcon(item.type)
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{item.uploadedAt}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

