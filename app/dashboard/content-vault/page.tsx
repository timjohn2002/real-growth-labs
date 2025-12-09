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
  type: "podcast" | "video" | "audio" | "url" | "text"
  wordCount?: number
  status: "pending" | "processing" | "ready" | "error"
  summary?: string
  transcript?: string
  thumbnail?: string
  source?: string
  duration?: string
  tags?: string[]
  uploadedAt: string
}

export default function ContentVaultPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadType, setUploadType] = useState<"podcast" | "video" | "audio" | "url" | "text" | null>(null)
  
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
    const typeMap: Record<string, "podcast" | "video" | "audio" | "url" | "text"> = {
      "Podcast Link": "podcast",
      "Video Upload": "video",
      "Audio Upload": "audio",
      "Paste URL": "url",
      "Paste Text / Notes": "text",
    }
    setUploadType(typeMap[type] || "text")
  }

  const handleView = (item: ContentItem) => {
    setSelectedItem(item)
    setIsDrawerOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      // TODO: Add DELETE API endpoint
      // await fetch(`/api/content/${id}`, { method: "DELETE" })
      setContentItems((prev) => prev.filter((item) => item.id !== id))
      if (selectedItem?.id === id) {
        setIsDrawerOpen(false)
        setSelectedItem(null)
      }
    } catch (error) {
      console.error("Failed to delete content:", error)
    }
  }

  const handleAddToBook = (id: string) => {
    console.log("Adding content to book:", id)
    // TODO: Implement add to book logic
  }

  const handleReprocess = async (id: string) => {
    try {
      const item = contentItems.find((i) => i.id === id)
      if (!item) return

      // Reprocess based on type
      if (item.type === "audio" || item.type === "video") {
        await fetch("/api/content/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentItemId: id }),
        })
      } else if (item.type === "url" && item.source) {
        await fetch("/api/content/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: item.source,
            title: item.title,
            userId,
          }),
        })
      }

      fetchContent()
    } catch (error) {
      console.error("Failed to reprocess:", error)
    }
  }

  const handleImproveSummary = (id: string) => {
    console.log("Improving summary for:", id)
    // TODO: Implement AI summary improvement
  }

  // Filter content based on active filter
  const filteredContent = contentItems.filter((item) => {
    if (activeFilter === "all") return true
    if (activeFilter === "audio") return item.type === "podcast" || item.type === "audio"
    if (activeFilter === "video") return item.type === "video"
    if (activeFilter === "links") return item.type === "url"
    if (activeFilter === "text") return item.type === "text"
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
              onAddToBook={handleAddToBook}
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
        onAddToBook={handleAddToBook}
        onDelete={handleDelete}
      />
    </div>
  )
}
