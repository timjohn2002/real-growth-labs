"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddContentModal } from "@/components/dashboard/content-vault/AddContentModal"
import { ContentCard } from "@/components/dashboard/content-vault/ContentCard"
import { ContentDrawer } from "@/components/dashboard/content-vault/ContentDrawer"
import { ContentFilters } from "@/components/dashboard/content-vault/ContentFilters"
import { EmptyState } from "@/components/dashboard/content-vault/EmptyState"

const BRAND_COLOR = "#a6261c"

interface ContentItem {
  id: string
  title: string
  type: "podcast" | "video" | "audio" | "url" | "text"
  wordCount?: number
  status: "pending" | "processing" | "ready"
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
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: "1",
      title: "Marketing Strategies Podcast Episode 12",
      type: "podcast",
      wordCount: 5420,
      status: "ready",
      summary: "Deep dive into modern marketing strategies for growing businesses. Covers social media, email marketing, and content creation.",
      transcript: "Welcome to Marketing Strategies. Today we're discussing...",
      source: "Apple Podcasts",
      duration: "45:30",
      tags: ["marketing", "business", "growth"],
      uploadedAt: "2 hours ago",
    },
    {
      id: "2",
      title: "YouTube: Business Growth Tips",
      type: "video",
      wordCount: 3200,
      status: "ready",
      summary: "Essential tips for scaling your business and increasing revenue through strategic planning.",
      source: "YouTube",
      duration: "28:15",
      tags: ["business", "growth", "strategy"],
      uploadedAt: "1 day ago",
    },
    {
      id: "3",
      title: "Voice Memo - Chapter Ideas",
      type: "audio",
      wordCount: 850,
      status: "processing",
      summary: "Quick voice notes about potential chapter topics for the upcoming book.",
      tags: ["ideas", "notes"],
      uploadedAt: "2 days ago",
    },
    {
      id: "4",
      title: "Article: Content Marketing Best Practices",
      type: "url",
      wordCount: 2100,
      status: "ready",
      summary: "Comprehensive guide to content marketing strategies that drive engagement and conversions.",
      source: "contentmarketing.com",
      tags: ["content", "marketing"],
      uploadedAt: "3 days ago",
    },
    {
      id: "5",
      title: "Sales Funnel Outline Notes",
      type: "text",
      wordCount: 1200,
      status: "ready",
      summary: "Detailed notes on building effective sales funnels for online businesses.",
      transcript: "Sales funnels are essential for converting visitors into customers...",
      tags: ["sales", "funnel", "conversion"],
      uploadedAt: "4 days ago",
    },
  ])

  const handleAddContent = (type: string) => {
    console.log("Adding content type:", type)
    setIsModalOpen(false)
    // TODO: Implement actual content upload logic
  }

  const handleView = (item: ContentItem) => {
    setSelectedItem(item)
    setIsDrawerOpen(true)
  }

  const handleDelete = (id: string) => {
    setContentItems((prev) => prev.filter((item) => item.id !== id))
    if (selectedItem?.id === id) {
      setIsDrawerOpen(false)
      setSelectedItem(null)
    }
  }

  const handleAddToBook = (id: string) => {
    console.log("Adding content to book:", id)
    // TODO: Implement add to book logic
  }

  const handleReprocess = (id: string) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "processing" as const } : item
      )
    )
    // TODO: Implement reprocess logic
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Vault</h1>
          <p className="text-gray-600">
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
      {filteredContent.length === 0 ? (
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
