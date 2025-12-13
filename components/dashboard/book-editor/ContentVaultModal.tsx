"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, FileText, Video, Headphones, Image as ImageIcon, Link as LinkIcon, Search, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface ContentItem {
  id: string
  title: string
  type: "podcast" | "video" | "audio" | "text" | "url" | "image"
  summary?: string
  rawText?: string
  transcript?: string
  createdAt: string
  status: "pending" | "processing" | "ready" | "error"
  fileUrl?: string
  thumbnail?: string
}

interface ContentVaultModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (content: ContentItem, contentType?: "summary" | "transcript" | "rawText") => void
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "podcast":
      return <Headphones className="h-4 w-4" />
    case "video":
      return <Video className="h-4 w-4" />
    case "audio":
      return <Headphones className="h-4 w-4" />
    case "image":
      return <ImageIcon className="h-4 w-4" />
    case "url":
      return <LinkIcon className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export function ContentVaultModal({ isOpen, onClose, onSelect }: ContentVaultModalProps) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchContentItems()
    }
  }, [isOpen])

  const fetchContentItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/content", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setContentItems(data.items || [])
      }
    } catch (error) {
      console.error("Failed to fetch content items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = contentItems.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.title?.toLowerCase().includes(query) ||
      item.summary?.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    )
  })

  const handleSelect = (item: ContentItem, contentType?: "summary" | "transcript" | "rawText") => {
    onSelect(item, contentType)
    onClose()
  }

  const shouldShowDropdown = (item: ContentItem): boolean => {
    // For video, podcast, and audio types, always show dropdown with both options
    // For other types, only show if both summary and transcript exist
    if (item.type === "video" || item.type === "podcast" || item.type === "audio") {
      return true
    }
    return !!(item.summary && item.transcript)
  }

  const getInsertButton = (item: ContentItem) => {
    // For images, always just insert directly
    if (item.type === "image") {
      return (
        <Button
          size="sm"
          className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
          onClick={(e) => {
            e.stopPropagation()
            handleSelect(item)
          }}
        >
          Insert
        </Button>
      )
    }

    // Show dropdown for video/podcast/audio or if both summary and transcript exist
    if (shouldShowDropdown(item)) {
      return (
        <DropdownMenu
          trigger={
            <Button
              size="sm"
              className="bg-[#a6261c] hover:bg-[#8e1e16] text-white flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              Insert
              <ChevronDown className="h-3 w-3" />
            </Button>
          }
          align="right"
        >
          <DropdownMenuItem
            onClick={() => {
              handleSelect(item, "summary")
            }}
          >
            Import Summary
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              handleSelect(item, "transcript")
            }}
          >
            Import Transcript
          </DropdownMenuItem>
        </DropdownMenu>
      )
    }

    // If only one is available for non-video types, insert directly with auto-detected type
    return (
      <Button
        size="sm"
        className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
        onClick={(e) => {
          e.stopPropagation()
          // Auto-detect content type
          const contentType: "summary" | "transcript" | "rawText" = 
            item.summary ? "summary" : 
            item.transcript ? "transcript" : 
            "rawText"
          handleSelect(item, contentType)
        }}
      >
        Insert
      </Button>
    )
  }

  const getContentPreview = (item: ContentItem): string => {
    // For images, return a special indicator
    if (item.type === "image") {
      return "Image - Click to insert into book"
    }
    // Show summary first (improved/latest version), then fall back to rawText/transcript
    if (item.summary) {
      return item.summary.substring(0, 200) + (item.summary.length > 200 ? "..." : "")
    }
    if (item.rawText) {
      return item.rawText.substring(0, 200) + (item.rawText.length > 200 ? "..." : "")
    }
    if (item.transcript) {
      return item.transcript.substring(0, 200) + (item.transcript.length > 200 ? "..." : "")
    }
    return "No content available"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add From Content Vault</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#a6261c]" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No content found matching your search." : "No content in your vault yet."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const handleCardClick = () => {
                    // For images, always insert directly
                    if (item.type === "image") {
                      handleSelect(item)
                      return
                    }
                    // If dropdown should be shown, don't auto-select on card click
                    // User must use the Insert button dropdown
                    if (shouldShowDropdown(item)) {
                      return
                    }
                    // Otherwise, auto-select the available content
                    const contentType: "summary" | "transcript" | "rawText" = 
                      item.summary ? "summary" : 
                      item.transcript ? "transcript" : 
                      "rawText"
                    handleSelect(item, contentType)
                  }

                  return (
                    <Card
                      key={item.id}
                      className={`${shouldShowDropdown(item) || item.type === "image" ? "" : "cursor-pointer"} hover:border-[#a6261c] transition-colors`}
                      onClick={handleCardClick}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {item.type === "image" && item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="mt-1 text-[#a6261c]">
                              {getTypeIcon(item.type)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {getContentPreview(item)}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{item.type}</span>
                              <span>•</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              {item.status === "ready" && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600">Ready</span>
                                </>
                              )}
                            </div>
                          </div>
                          {getInsertButton(item)}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

