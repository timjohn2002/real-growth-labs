"use client"

import { motion } from "framer-motion"
import { FileText, Gift, Mail, BookOpen } from "lucide-react"

const BRAND_COLOR = "#a6261c"

interface FunnelPage {
  id: string
  type: "opt-in" | "thank-you" | "email" | "ctas"
  name: string
  icon: typeof FileText
}

const pages: FunnelPage[] = [
  { id: "opt-in", type: "opt-in", name: "Opt-in Page", icon: FileText },
  { id: "thank-you", type: "thank-you", name: "Thank-You / Offer Page", icon: Gift },
  { id: "email", type: "email", name: "Delivery Email", icon: Mail },
  { id: "ctas", type: "ctas", name: "Book CTAs", icon: BookOpen },
]

interface FunnelPagesSidebarProps {
  activePageId: string | null
  onSelectPage: (pageId: string) => void
}

export function FunnelPagesSidebar({ activePageId, onSelectPage }: FunnelPagesSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Pages</h3>
        <div className="space-y-1">
          {pages.map((page) => {
            const Icon = page.icon
            const isActive = page.id === activePageId
            return (
              <motion.button
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-red-50 text-gray-900 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                whileHover={{ x: 2 }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{page.name}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

