"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, X, BookOpen, Upload, FileText, Workflow, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const BRAND_COLOR = "#a6261c"

const actions = [
  { name: "New Book", icon: BookOpen, href: "/dashboard/book-wizard" },
  { name: "Ingest Content", icon: Upload, href: "/dashboard/content-vault" },
  { name: "Generate Chapter", icon: FileText, href: "/dashboard/book-editor" },
  { name: "Create Funnel", icon: Workflow, href: "/dashboard/funnel-builder" },
  { name: "Create Audiobook", icon: Headphones, href: "/dashboard/audiobook" },
]

export function QuickActionsLauncher() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50"
        style={{ backgroundColor: BRAND_COLOR }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Zap className="h-6 w-6 text-white" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            {/* Panel */}
            <motion.div
              className="fixed bottom-8 right-8 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {actions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Link key={index} href={action.href} onClick={() => setIsOpen(false)}>
                      <motion.div
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <Icon className="h-4 w-4 text-[#a6261c]" />
                        <span className="text-sm text-gray-900">{action.name}</span>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

