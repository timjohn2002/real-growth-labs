"use client"

import { useState } from "react"
import { FunnelHeader } from "@/components/dashboard/funnel-builder/FunnelHeader"
import { FunnelPagesSidebar } from "@/components/dashboard/funnel-builder/FunnelPagesSidebar"
import { FunnelCanvas, Block, BlockType } from "@/components/dashboard/funnel-builder/FunnelCanvas"
import { BlockSettingsPanel } from "@/components/dashboard/funnel-builder/BlockSettingsPanel"
import { AddBlockModal } from "@/components/dashboard/funnel-builder/AddBlockModal"
import { Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

// Default blocks for opt-in page
const defaultOptInBlocks: Block[] = [
  {
    id: "1",
    type: "headline",
    data: {
      text: "Want more clients? Download your free book.",
      fontSize: 48,
      alignment: "center",
      color: "black",
    },
  },
  {
    id: "2",
    type: "subheadline",
    data: {
      text: "This book reveals the exact system to increase leads using AI.",
      alignment: "center",
    },
  },
  {
    id: "3",
    type: "book-cover",
    data: {
      showShadow: true,
      roundedCorners: true,
    },
  },
  {
    id: "4",
    type: "lead-form",
    data: {
      buttonText: "Get Free Copy",
      buttonColor: "#a6261c",
      fields: ["name", "email"],
    },
  },
  {
    id: "5",
    type: "cta",
    data: {
      buttonText: "Download Now",
      buttonColor: "#a6261c",
    },
  },
]

// Default blocks for thank-you page
const defaultThankYouBlocks: Block[] = [
  {
    id: "ty-1",
    type: "headline",
    data: {
      text: "Your book is on its way!",
      fontSize: 48,
      alignment: "center",
      color: "black",
    },
  },
  {
    id: "ty-2",
    type: "headline",
    data: {
      text: "Want help implementing what's inside the book?",
      fontSize: 36,
      alignment: "center",
      color: "black",
    },
  },
  {
    id: "ty-3",
    type: "video",
    data: {
      autoplay: false,
      muted: false,
    },
  },
  {
    id: "ty-4",
    type: "cta",
    data: {
      title: "Book a Call",
      buttonText: "Schedule Your Free Consultation",
      buttonColor: "#a6261c",
    },
  },
]

export default function FunnelBuilderPage() {
  const [activePageId, setActivePageId] = useState<string>("opt-in")
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false)
  const [pages, setPages] = useState<Record<string, Block[]>>({
    "opt-in": defaultOptInBlocks,
    "thank-you": defaultThankYouBlocks,
    email: [],
    ctas: [],
  })

  const currentBlocks = pages[activePageId] || []

  const handleBlocksChange = (newBlocks: Block[]) => {
    setPages((prev) => ({
      ...prev,
      [activePageId]: newBlocks,
    }))
  }

  const handleSelectBlock = (blockId: string | null) => {
    setSelectedBlockId(blockId)
  }

  const handleUpdateBlock = (blockId: string, data: any) => {
    const newBlocks = currentBlocks.map((block) =>
      block.id === blockId ? { ...block, data: { ...block.data, ...data } } : block
    )
    handleBlocksChange(newBlocks)
  }

  const handleDeleteBlock = (blockId: string) => {
    const newBlocks = currentBlocks.filter((block) => block.id !== blockId)
    handleBlocksChange(newBlocks)
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null)
    }
  }

  const handleAddBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `${Date.now()}`,
      type,
      data: getDefaultBlockData(type),
    }
    handleBlocksChange([...currentBlocks, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  const getDefaultBlockData = (type: BlockType): any => {
    switch (type) {
      case "headline":
        return { text: "New Headline", fontSize: 48, alignment: "center", color: "black" }
      case "subheadline":
        return { text: "New subheadline text", alignment: "center" }
      case "book-cover":
        return { showShadow: true, roundedCorners: false }
      case "lead-form":
        return { buttonText: "Get the free book", buttonColor: "#a6261c", fields: ["name", "email"] }
      case "testimonial":
        return { name: "John Doe", quote: "Amazing book!", company: "", role: "" }
      case "cta":
        return { buttonText: "Click Here", buttonColor: "#a6261c" }
      case "video":
        return { autoplay: false, muted: false }
      default:
        return {}
    }
  }

  const handleEditBlock = (blockId: string) => {
    setSelectedBlockId(blockId)
  }

  const handlePreview = () => {
    console.log("Preview funnel")
    // TODO: Open preview modal
  }

  const handlePublish = () => {
    console.log("Publish funnel")
    // TODO: Implement publish logic
  }

  const selectedBlock = currentBlocks.find((b) => b.id === selectedBlockId) || null

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#a6261c]/10 mb-4">
              <Clock className="w-10 h-10 text-[#a6261c]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Coming Soon</h2>
          <p className="text-lg text-muted-foreground mb-2">
            The Funnel Builder is currently under development.
          </p>
          <p className="text-base text-muted-foreground">
            We're working hard to bring you an amazing funnel building experience. Check back soon!
          </p>
        </div>
      </div>

      {/* Backend Code - Hidden but preserved */}
      <div className="opacity-0 pointer-events-none">
        {/* Top Bar */}
        <FunnelHeader
          funnelName="Your Book Funnel"
          onPreview={handlePreview}
          onPublish={handlePublish}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Pages Sidebar */}
          <FunnelPagesSidebar
            activePageId={activePageId}
            onSelectPage={setActivePageId}
          />

          {/* Center: Canvas */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <FunnelCanvas
                blocks={currentBlocks}
                selectedBlockId={selectedBlockId}
                onBlocksChange={handleBlocksChange}
                onSelectBlock={handleSelectBlock}
                onEditBlock={handleEditBlock}
                onDeleteBlock={handleDeleteBlock}
                onAddBlock={handleAddBlock}
              />
            </div>
            {/* Add Block Button */}
            <div className="border-t border-border p-4 bg-background">
              <Button
                variant="outline"
                onClick={() => setIsAddBlockModalOpen(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Block
              </Button>
            </div>
          </div>

          {/* Right: Settings Panel */}
          <BlockSettingsPanel
            selectedBlock={selectedBlock}
            onUpdateBlock={handleUpdateBlock}
          />
        </div>

        {/* Add Block Modal */}
        <AddBlockModal
          isOpen={isAddBlockModalOpen}
          onClose={() => setIsAddBlockModalOpen(false)}
          onSelectBlock={handleAddBlock}
        />
      </div>
    </div>
  )
}
