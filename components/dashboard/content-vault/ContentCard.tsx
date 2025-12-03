"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Video, Headphones, Link as LinkIcon, FileText, MoreVertical, Eye, Trash2, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const BRAND_COLOR = "#a6261c"

interface ContentItem {
  id: string
  title: string
  type: "podcast" | "video" | "audio" | "url" | "text"
  wordCount?: number
  status: "pending" | "processing" | "ready"
  summary?: string
  thumbnail?: string
  tags?: string[]
  uploadedAt: string
}

interface ContentCardProps {
  item: ContentItem
  onView: (item: ContentItem) => void
  onDelete: (id: string) => void
  onAddToBook: (id: string) => void
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
    default:
      return FileText
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-orange-500"
    case "processing":
      return "bg-yellow-500"
    case "ready":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

export function ContentCard({ item, onView, onDelete, onAddToBook }: ContentCardProps) {
  const [showActions, setShowActions] = useState(false)
  const Icon = getTypeIcon(item.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer h-full">
        <CardContent className="p-6">
          {/* Thumbnail/Icon */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 relative">
              {item.status === "processing" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-8 w-8 text-[#a6261c]" />
                </motion.div>
              ) : item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Icon className="h-8 w-8 text-gray-600" />
              )}
              {item.status === "processing" && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: `${BRAND_COLOR}10` }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Status Dot */}
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowActions(!showActions)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {item.wordCount && (
                <p className="text-sm text-gray-500 mt-1">{item.wordCount.toLocaleString()} words</p>
              )}
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Summary */}
          {item.summary && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.summary}</p>
          )}

          {/* Status Text */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 capitalize">{item.status}</span>
              {item.status === "processing" && (
                <motion.span
                  className="text-xs text-[#a6261c]"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Processing...
                </motion.span>
              )}
            </div>
            <span className="text-xs text-gray-400">{item.uploadedAt}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onView(item)
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onAddToBook(item.id)
              }}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Add to Book
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

