"use client"

import { motion } from "framer-motion"
import { GripVertical, Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface BlockWrapperProps {
  id: string
  children: React.ReactNode
  onEdit?: () => void
  onDelete?: () => void
  isSelected?: boolean
  onSelect?: () => void
  dragHandleProps?: any
}

export function BlockWrapper({
  id,
  children,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
  dragHandleProps,
}: BlockWrapperProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group border-2 rounded-lg transition-all ${
        isSelected
          ? "border-[#a6261c] bg-red-50/30"
          : "border-transparent hover:border-gray-300 bg-white"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 transition-opacity ${
          isHovered || isSelected ? "opacity-100" : "opacity-0"
        }`}
        {...dragHandleProps}
      >
        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical className="h-5 w-5" />
        </div>
      </div>

      {/* Block Content */}
      <div className="px-12 py-6">{children}</div>

      {/* Actions */}
      {(isHovered || isSelected) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-2 top-2 flex gap-1"
        >
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </motion.div>
      )}

      {/* Add Block Button Above */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="bg-white border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 shadow-sm">
          + Add Block
        </button>
      </div>
    </motion.div>
  )
}

