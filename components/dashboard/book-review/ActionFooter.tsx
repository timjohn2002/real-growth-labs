"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileEdit, Sparkles } from "lucide-react"

const BRAND_COLOR = "#a6261c"

interface ActionFooterProps {
  onOpenEditor: () => void
  onApplyAllFixes: () => void
}

export function ActionFooter({ onOpenEditor, onApplyAllFixes }: ActionFooterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="border-t border-gray-200 pt-6 mt-8"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to improve your draft?
        </h3>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={onOpenEditor}
          className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <FileEdit className="h-4 w-4 mr-2" />
          Open in Editor
        </Button>
        <Button variant="outline" size="lg" onClick={onApplyAllFixes}>
          <Sparkles className="h-4 w-4 mr-2" />
          Apply All Suggested Fixes
        </Button>
      </div>
    </motion.div>
  )
}

