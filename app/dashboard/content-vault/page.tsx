"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { AddContentModal } from "@/components/dashboard/content-vault/AddContentModal"
import { ContentCard } from "@/components/dashboard/content-vault/ContentCard"
import { ContentDrawer } from "@/components/dashboard/content-vault/ContentDrawer"
import { ContentFilters } from "@/components/dashboard/content-vault/ContentFilters"
import { EmptyState } from "@/components/dashboard/content-vault/EmptyState"
import { UploadForm } from "@/components/dashboard/content-vault/UploadForm"
import { Toaster } from "sonner"

const BRAND_COLOR = "#a6261c"

interface ContentItem {
  id: string
  title: string
  type: "video" | "url" | "text" | "image"
  wordCount?: number
  status: "pending" | "processing" | "ready" | "error"
  summary?: string
  transcript?: string
  thumbnail?: string
  source?: string
  duration?: string
  tags?: string[]
  uploadedAt: string
  error?: string
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
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [uploadType, setUploadType] = useState<"video" | "url" | "text" | "image" | null>(null)
  const [improvingSummaryId, setImprovingSummaryId] = useState<string | null>(null)
  const previousStatuses = useRef<Map<string, string>>(new Map())
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // TODO: Get userId from auth context/session
  const userId = "user-1" // Placeholder - replace with actual auth

  // Fetch content items (silent background update)
  const fetchContent = async (isInitialLoad = false) => {
    try {
      // Only show loading state on initial load, not during polling
      if (isInitialLoad) {
        setIsInitialLoading(true)
      }
      const response = await fetch(`/api/content?userId=${userId}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        const newItems = data.items || []
        
        // Check for status changes and show notifications
        newItems.forEach((item: ContentItem) => {
          const previousStatus = previousStatuses.current.get(item.id)
          if (previousStatus && previousStatus !== item.status) {
            // Status changed
            if (item.status === "ready" && previousStatus === "processing") {
              // Show success notification
              toast.success("Transcription Complete!", {
                description: `${item.title} has been successfully transcribed.`,
                duration: 5000,
              })
            } else if (item.status === "error" && previousStatus === "processing") {
              // Show error notification
              toast.error("Transcription Failed", {
                description: item.error || "An error occurred during transcription.",
                duration: 5000,
              })
            }
          }
          // Update previous status
          previousStatuses.current.set(item.id, item.status)
        })
        
        setContentItems(newItems)
        
        // Check for stuck processing items (processing for more than 10 minutes at 5% or 25 minutes total)
        const stuckItems = data.items?.filter((item: ContentItem) => {
          if (item.status !== "processing") return false
          
          // Check if stuck at low progress (5% or less) for more than 10 minutes
          const progress = item.metadata?.processingProgress || 0
          if (progress <= 5) {
            // Parse uploadedAt to check time
            const uploadedMatch = item.uploadedAt?.match(/(\d+)\s*(minute|hour|day)/)
            if (uploadedMatch) {
              const value = parseInt(uploadedMatch[1])
              const unit = uploadedMatch[2]
              if (unit === "minute" && value > 10) return true
              if (unit === "hour" || unit === "day") return true
            }
          }
          
          // Also check for items processing for more than 25 minutes regardless of progress
          const uploadedMatch = item.uploadedAt?.match(/(\d+)\s*(minute|hour|day)/)
          if (uploadedMatch) {
            const value = parseInt(uploadedMatch[1])
            const unit = uploadedMatch[2]
            if (unit === "minute" && value > 25) return true
            if (unit === "hour" || unit === "day") return true
          }
          
          return false
        })
        
        // Check status for stuck items
        if (stuckItems && stuckItems.length > 0) {
          for (const stuckItem of stuckItems) {
            try {
              await fetch("/api/content/check-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ contentItemId: stuckItem.id }),
              })
            } catch (e) {
              console.error("Failed to check stuck item status:", e)
            }
          }
          // Refresh after checking (silent background update)
          setTimeout(() => fetchContent(false), 2000)
        }
      }
    } catch (error) {
      console.error("Failed to fetch content:", error)
    } finally {
      if (isInitialLoad) {
        setIsInitialLoading(false)
      }
    }
  }

  useEffect(() => {
    // Initial load
    fetchContent(true)
    
    // Set up polling for processing items - only poll when there are processing items
    const startPolling = () => {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      
      pollingIntervalRef.current = setInterval(() => {
        setContentItems((currentItems) => {
          const hasProcessing = currentItems.some(
            (item) => item.status === "processing" || item.status === "pending"
          )
          
          if (hasProcessing) {
            // Silent background update - don't show loading state
            fetchContent(false).catch(console.error)
          } else {
            // No processing items, stop polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
          }
          
          return currentItems
        })
      }, 2000) // Poll every 2 seconds
    }
    
    // Start polling after initial load completes
    const timeoutId = setTimeout(() => {
      startPolling()
    }, 1000)
    
    return () => {
      clearTimeout(timeoutId)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [])

  // Restart polling when contentItems change and there are processing items
  useEffect(() => {
    const hasProcessing = contentItems.some(
      (item) => item.status === "processing" || item.status === "pending"
    )
    
    if (hasProcessing && !pollingIntervalRef.current) {
      // Start polling if not already running
      pollingIntervalRef.current = setInterval(() => {
        fetchContent(false).catch(console.error)
      }, 2000)
    } else if (!hasProcessing && pollingIntervalRef.current) {
      // Stop polling if no processing items
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [contentItems])

  const handleAddContent = (type: string) => {
    setIsModalOpen(false)
    // Map modal type names to our type system
    const typeMap: Record<string, "video" | "url" | "text" | "image"> = {
      "Video Upload": "video",
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

  const handleRetry = async (id: string) => {
    try {
      const response = await fetch("/api/content/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contentItemId: id }),
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(data.message || "Processing retried successfully")
        // Refresh content (silent background update)
        fetchContent(false)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to retry processing")
      }
    } catch (error) {
      console.error("Failed to retry:", error)
      alert("Failed to retry processing. Please try again.")
    }
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

      // Refresh content after a short delay (silent background update)
      setTimeout(() => {
        fetchContent(false)
      }, 1000)
    } catch (error) {
      console.error("Failed to reprocess:", error)
      alert(error instanceof Error ? error.message : "Failed to reprocess content")
      // Refresh to show updated status (silent background update)
      fetchContent(false)
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
            Your central repository for videos, notes, and links.
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
      {isInitialLoading ? (
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
                    onRetry={handleRetry}
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
            fetchContent(false)
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
      
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  )
}
