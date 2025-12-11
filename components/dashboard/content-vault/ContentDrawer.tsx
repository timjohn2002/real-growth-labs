"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, MoreVertical, RefreshCw, Sparkles, BookOpen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const BRAND_COLOR = "#a6261c"

interface ContentItem {
  id: string
  title: string
  type: "podcast" | "video" | "audio" | "url" | "text"
  wordCount?: number
  status: "pending" | "processing" | "ready" | "error"
  summary?: string
  transcript?: string
  source?: string
  duration?: string
  tags?: string[]
  error?: string
  uploadedAt: string
}

interface ContentDrawerProps {
  item: ContentItem | null
  isOpen: boolean
  onClose: () => void
  onReprocess: (id: string) => void
  onImproveSummary: (id: string) => void
  onAddToBook: (id: string) => void
  onDelete: (id: string) => void
}

export function ContentDrawer({
  item,
  isOpen,
  onClose,
  onReprocess,
  onImproveSummary,
  onAddToBook,
  onDelete,
}: ContentDrawerProps) {
  if (!item) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Summary Section */}
                  {item.summary && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.summary}</p>
                    </div>
                  )}

                  {/* Transcript Section */}
                  {item.transcript && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Transcript</h3>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {item.transcript}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metadata Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Metadata</h3>
                    <div className="space-y-2">
                      {item.source && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Source:</span>
                          <span className="text-gray-900">{item.source}</span>
                        </div>
                      )}
                      {item.duration && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="text-gray-900">{item.duration}</span>
                        </div>
                      )}
                      {item.wordCount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Word Count:</span>
                          <span className="text-gray-900">{item.wordCount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`capitalize ${item.status === "error" ? "text-red-600 font-semibold" : "text-gray-900"}`}>
                          {item.status}
                        </span>
                      </div>
                      {item.error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-semibold text-red-800 mb-1">Error Details:</p>
                          <p className="text-sm text-red-700">{item.error}</p>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Uploaded:</span>
                        <span className="text-gray-900">{item.uploadedAt}</span>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-gray-600">Tags:</span>
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Actions Footer */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReprocess(item.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reprocess
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onImproveSummary(item.id)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Improve Summary
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    style={{ backgroundColor: BRAND_COLOR }}
                    onClick={() => onAddToBook(item.id)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Add to Book Wizard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDelete(item.id)
                      onClose()
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

