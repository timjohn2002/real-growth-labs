"use client"

import { Clock, Mic, Video, FileText, Link as LinkIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const recentContent = [
  { type: "podcast", title: "Marketing Strategies Episode 12", time: "2 hours ago", icon: Mic },
  { type: "youtube", title: "YouTube: Business Growth Tips", time: "1 day ago", icon: Video },
  { type: "voice", title: "Voice Memo - Chapter Ideas", time: "2 days ago", icon: Mic },
  { type: "pdf", title: "PDF Outline - Sales Guide", time: "3 days ago", icon: FileText },
  { type: "link", title: "Article: Content Marketing", time: "4 days ago", icon: LinkIcon },
]

export function ContentIngestionFeed() {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Content</h3>
        <div className="space-y-3">
          {recentContent.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.title}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

