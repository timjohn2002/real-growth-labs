"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddContentModal } from "@/components/dashboard/content-vault/AddContentModal"
import { ContentCard } from "@/components/dashboard/content-vault/ContentCard"
import { ContentDrawer } from "@/components/dashboard/content-vault/ContentDrawer"
import { ContentFilters } from "@/components/dashboard/content-vault/ContentFilters"
import { EmptyState } from "@/components/dashboard/content-vault/EmptyState"
import { UploadForm } from "@/components/dashboard/content-vault/UploadForm"

const BRAND_COLOR = "#a6261c"

interface ContentItem {
  id: string
  title: string
  type: "podcast" | "video" | "audio" | "url" | "text" | "image"
  wordCount?: number
  status: "pending" | "processing" | "ready" | "error"
  summary?: string
  transcript?: string
  thumbnail?: string
  source?: string
  duration?: string
  tags?: string[]
  uploadedAt: string
  metadata?: {
    processingStage?: string
    processingProgress?: number
    [key: string]: any
  }
}

export default function ContentVaultPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadType, setUploadType] = useState<"podcast" | "video" | "audio" | "url" | "text" | "image" | null>(null)
  const [improvingSummaryId, setImprovingSummaryId] = useState<string | null>(null)
  
  // TODO: Get userId from auth context/session
  const userId = "user-1" // Placeholder - replace with actual auth

  // Fetch content items
  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/content?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setContentItems(data.items || [])
      }
    } catch (error) {
      console.error("Failed to fetch content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
    
    // Poll for updates on processing items
    const interval = setInterval(() => {
      const hasProcessing = contentItems.some(
        (item) => item.status === "processing" || item.status === "pending"
      )
      if (hasProcessing) {
        fetchContent()
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Update polling when contentItems change
  useEffect(() => {
    const hasProcessing = contentItems.some(
      (item) => item.status === "processing" || item.status === "pending"
    )
    if (hasProcessing) {
      const interval = setInterval(() => {
        fetchContent()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [contentItems.length])

  const handleAddContent = (type: string) => {
    setIsModalOpen(false)
    // Map modal type names to our type system
    const typeMap: Record<string, "podcast" | "video" | "audio" | "url" | "text" | "image"> = {
      "Podcast Link": "podcast",
      "Video Upload": "video",
      "Audio Upload": "audio",
      "Paste URL": "url",
      "Paste Text / Notes": "text",
      "Images": "image",
    }
    setUploadType(typeMap[type] || "text")
  }

  const handleView = (item: ContentItem) => {
    setSelectedItem(item)
    setIsDrawerOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      // Confirm deletion
      if (!confirm("Are you sure you want to delete this content item? This action cannot be undone.")) {
        return
      }

      const response = await fetch(`/api/content/${id}`, {
        method: "DELETE",
        credentials: "include", // Include cookies for authentication
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to delete" }))
        throw new Error(data.error || `Failed to delete content (${response.status})`)
      }

      // Remove from local state only after successful deletion
      setContentItems((prev) => prev.filter((item) => item.id !== id))
      
      // Close drawer if the deleted item was selected
      if (selectedItem?.id === id) {
        setIsDrawerOpen(false)
        setSelectedItem(null)
      }

      console.log("Content item deleted successfully")
    } catch (error) {
      console.error("Failed to delete content:", error)
      alert(error instanceof Error ? error.message : "Failed to delete content item")
    }
  }


  const handleReprocess = async (id: string) => {
    try {
      const item = contentItems.find((i) => i.id === id)
      if (!item) return

      // Reset status to processing
      setContentItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "processing" as const, error: undefined } : i
        )
      )

      // Reprocess based on type
      if (item.type === "video" && item.source) {
        // Check if it's a YouTube URL
        const isYouTube = item.source.includes("youtube.com") || item.source.includes("youtu.be")
        if (isYouTube) {
          // Reprocess YouTube video
          await fetch("/api/content/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              url: item.source,
              title: item.title,
            }),
          })
        } else {
          // Regular video file transcription
          await fetch("/api/content/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ contentItemId: id }),
          })
        }
      } else if (item.type === "audio") {
        await fetch("/api/content/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ contentItemId: id }),
        })
      } else if (item.type === "url" && item.source) {
        await fetch("/api/content/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            url: item.source,
            title: item.title,
          }),
        })
      }

      // Refresh content after a short delay
      setTimeout(() => {
        fetchContent()
      }, 1000)
    } catch (error) {
      console.error("Failed to reprocess:", error)
      alert(error instanceof Error ? error.message : "Failed to reprocess content")
      // Refresh to show updated status
      fetchContent()
    }
  }

  const handleImproveSummary = async (id: string) => {
    if (improvingSummaryId) return // Already processing
    
    try {
      console.log("Starting to improve summary for:", id)
      setImprovingSummaryId(id)
      
      const response = await fetch("/api/content/improve-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ contentItemId: id }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("API error:", data)
        throw new Error(data.error || `Failed to improve summary (${response.status})`)
      }

      const data = await response.json()
      console.log("Summary improved successfully:", data)
      
      // Update the local state with the improved summary
      setContentItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, summary: data.summary }
            : item
        )
      )

      // Update selected item if it's the one being improved
      if (selectedItem?.id === id) {
        setSelectedItem({ ...selectedItem, summary: data.summary })
      }

      // Show success message
      console.log("Summary improved successfully")
    } catch (error) {
      console.error("Failed to improve summary:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to improve summary"
      alert(errorMessage)
    } finally {
      setImprovingSummaryId(null)
    }
  }

  // Filter content based on active filter
  const filteredContent = contentItems.filter((item) => {
    if (activeFilter === "all") return true
    if (activeFilter === "audio") return item.type === "podcast" || item.type === "audio"
    if (activeFilter === "video") return item.type === "video"
    if (activeFilter === "links") return item.type === "url"
    if (activeFilter === "text") return item.type === "text"
    if (activeFilter === "image") return item.type === "image"
    if (activeFilter === "processed") return item.status === "ready"
    if (activeFilter === "pending") return item.status === "pending" || item.status === "processing"
    return true
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Content Vault</h1>
          <p className="text-muted-foreground">
            Your central repository for podcasts, videos, notes, and links.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </div>

      {/* Filters */}
      <ContentFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Content Grid or Empty State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading content...</div>
        </div>
      ) : filteredContent.length === 0 ? (
        <EmptyState onAddContent={() => setIsModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item, index) => (
            <ContentCard
              key={item.id}
              item={item}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Content Modal */}
      <AddContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectType={handleAddContent}
      />

      {/* Upload Forms */}
      {uploadType && (
        <UploadForm
          type={uploadType}
          isOpen={!!uploadType}
          onClose={() => setUploadType(null)}
          onSuccess={() => {
            fetchContent()
            setUploadType(null)
          }}
          userId={userId}
        />
      )}

      {/* Content Drawer */}
      <ContentDrawer
        item={selectedItem}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedItem(null)
        }}
        onReprocess={handleReprocess}
        onImproveSummary={handleImproveSummary}
        onDelete={handleDelete}
        isImprovingSummary={improvingSummaryId === selectedItem?.id}
      />
    </div>
  )
}
