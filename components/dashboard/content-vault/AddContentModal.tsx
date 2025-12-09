"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Mic, Video, Headphones, Link as LinkIcon, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import * as DialogPrimitive from "@radix-ui/react-dialog"

const BRAND_COLOR = "#a6261c"

const contentTypes = [
  {
    name: "Podcast Link",
    icon: Mic,
    description: "Import from podcast platforms",
    color: "#a6261c",
  },
  {
    name: "Video Upload",
    icon: Video,
    description: "Upload video files",
    color: "#a6261c",
  },
  {
    name: "Audio Upload",
    icon: Headphones,
    description: "Upload audio files",
    color: "#a6261c",
  },
  {
    name: "Paste URL",
    icon: LinkIcon,
    description: "Import from web links",
    color: "#a6261c",
  },
  {
    name: "Paste Text / Notes",
    icon: FileText,
    description: "Add text content",
    color: "#a6261c",
  },
]

interface AddContentModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectType: (type: string) => void
}

export function AddContentModal({ isOpen, onClose, onSelectType }: AddContentModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-8 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl">
          <DialogPrimitive.Title className="sr-only">Choose Content Type</DialogPrimitive.Title>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Choose Content Type</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentTypes.map((type, index) => {
              const Icon = type.icon
              return (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer h-full"
                    onClick={() => onSelectType(type.name)}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${BRAND_COLOR}10` }}
                      >
                        <Icon className="h-8 w-8" style={{ color: BRAND_COLOR }} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
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

