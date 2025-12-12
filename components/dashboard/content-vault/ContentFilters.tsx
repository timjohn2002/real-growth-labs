"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const filters = [
  { id: "all", label: "All Content" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "links", label: "Links" },
  { id: "text", label: "Text" },
  { id: "image", label: "Images" },
  { id: "processed", label: "Processed" },
  { id: "pending", label: "Pending" },
]

interface ContentFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function ContentFilters({ activeFilter, onFilterChange }: ContentFiltersProps) {
  return (
    <div className="flex gap-6 border-b border-border pb-4 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors pb-1"
        >
          {filter.label}
          {activeFilter === filter.id && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a6261c]"
              layoutId="activeFilter"
            />
          )}
        </button>
      ))}
    </div>
  )
}

