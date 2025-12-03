"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Type, FileText, BookOpen, Users, Target, Video, Gift } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { BlockType } from "./FunnelCanvas"

const BRAND_COLOR = "#a6261c"

const blockTypes: { type: BlockType; name: string; icon: typeof Type; description: string }[] = [
  { type: "headline", name: "Headline", icon: Type, description: "Large heading text" },
  { type: "subheadline", name: "Subheadline", icon: FileText, description: "Supporting text" },
  { type: "book-cover", name: "Book Cover", icon: BookOpen, description: "Book cover image" },
  { type: "lead-form", name: "Lead Form", icon: Users, description: "Email capture form" },
  { type: "testimonial", name: "Testimonial", icon: Users, description: "Customer testimonial" },
  { type: "cta", name: "CTA Button", icon: Target, description: "Call-to-action button" },
  { type: "video", name: "Video", icon: Video, description: "Video embed" },
]

interface AddBlockModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectBlock: (type: BlockType) => void
}

export function AddBlockModal({ isOpen, onClose, onSelectBlock }: AddBlockModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add Block</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {blockTypes.map((blockType, index) => {
              const Icon = blockType.icon
              return (
                <motion.div
                  key={blockType.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className="cursor-pointer hover:border-[#a6261c] transition-colors"
                    onClick={() => {
                      onSelectBlock(blockType.type)
                      onClose()
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${BRAND_COLOR}10` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: BRAND_COLOR }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{blockType.name}</h3>
                          <p className="text-xs text-gray-500">{blockType.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

