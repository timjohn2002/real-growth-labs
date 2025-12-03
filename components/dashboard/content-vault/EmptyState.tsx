"use client"

import { motion } from "framer-motion"
import { Archive } from "lucide-react"
import { Button } from "@/components/ui/button"

const BRAND_COLOR = "#a6261c"

interface EmptyStateProps {
  onAddContent: () => void
}

export function EmptyState({ onAddContent }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6"
      >
        <Archive className="h-12 w-12 text-gray-400" />
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Content Vault is empty</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Upload podcasts, videos, or notes to begin building your book.
      </p>
      <Button
        onClick={onAddContent}
        className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        + Add Content
      </Button>
    </motion.div>
  )
}

