"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Video, Link as LinkIcon, FileText, Image as ImageIcon, Eye, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const BRAND_COLOR = "#a6261c"

interface ContentItem {
  id: string
  title: string
  type: "video" | "url" | "text" | "image"
  wordCount?: number
  status: "pending" | "processing" | "ready" | "error"
  summary?: string
  thumbnail?: string
  tags?: string[]
  uploadedAt: string
  metadata?: {
    processingStage?: string
    processingProgress?: number
    [key: string]: any
  }
}

interface ContentCardProps {
  item: ContentItem
  onView: (item: ContentItem) => void
  onDelete: (id: string) => void
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return Video
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

export function ContentCard({ item, onView, onDelete }: ContentCardProps) {
  const Icon = getTypeIcon(item.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border shadow-sm hover:shadow-md transition-all cursor-pointer h-full">
        <CardContent className="p-6">
          {/* Thumbnail/Icon */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 relative">
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
                <Icon className="h-8 w-8 text-muted-foreground" />
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
                <h3 className="text-lg font-semibold text-foreground truncate">{item.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Status Dot */}
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                </div>
              </div>
              {item.wordCount && (
                <p className="text-sm text-muted-foreground mt-1">{item.wordCount.toLocaleString()} words</p>
              )}
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Summary */}
          {item.summary && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.summary}</p>
          )}

          {/* Status Text */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground capitalize">{item.status}</span>
              {item.status === "processing" && (
                <>
                  {item.metadata?.processingProgress !== undefined ? (
                    <span className="text-xs text-[#a6261c] font-medium">
                      {item.metadata.processingProgress}%
                    </span>
                  ) : (
                    <motion.span
                      className="text-xs text-[#a6261c]"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Processing...
                    </motion.span>
                  )}
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{item.uploadedAt}</span>
          </div>

          {/* Progress Bar for Processing Items */}
          {item.status === "processing" && item.metadata?.processingProgress !== undefined && (
            <div className="mb-4">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#a6261c]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${item.metadata.processingProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {item.metadata.processingStage && (
                <p className="text-xs text-muted-foreground mt-1">{item.metadata.processingStage}</p>
              )}
            </div>
          )}

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

