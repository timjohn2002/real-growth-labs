"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, FileText, Video, Headphones, Image as ImageIcon, Link as LinkIcon, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ContentItem {
  id: string
  title: string
  type: "podcast" | "video" | "audio" | "text" | "url" | "image"
  summary?: string
  rawText?: string
  transcript?: string
  createdAt: string
  status: "pending" | "processing" | "ready" | "error"
}

interface ContentVaultModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (content: ContentItem) => void
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

  const handleSelect = (item: ContentItem) => {
    onSelect(item)
    onClose()
  }

  const getContentPreview = (item: ContentItem): string => {
    if (item.rawText) {
      return item.rawText.substring(0, 200) + (item.rawText.length > 200 ? "..." : "")
    }
    if (item.transcript) {
      return item.transcript.substring(0, 200) + (item.transcript.length > 200 ? "..." : "")
    }
    if (item.summary) {
      return item.summary
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
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:border-[#a6261c] transition-colors"
                    onClick={() => handleSelect(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-[#a6261c]">
                          {getTypeIcon(item.type)}
                        </div>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

