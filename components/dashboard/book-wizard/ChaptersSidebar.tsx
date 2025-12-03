"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const BRAND_COLOR = "#a6261c"

interface Chapter {
  id: string
  number: number
  title: string
  progress?: number
}

interface ChaptersSidebarProps {
  chapters: Chapter[]
  activeChapterId: string | null
  onSelectChapter: (chapterId: string) => void
  onAddChapter: () => void
}

export function ChaptersSidebar({
  chapters,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
}: ChaptersSidebarProps) {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Chapters</h3>
        <div className="space-y-1">
          {chapters.map((chapter) => {
            const isActive = chapter.id === activeChapterId
            return (
              <motion.button
                key={chapter.id}
                onClick={() => onSelectChapter(chapter.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-white shadow-sm border border-gray-200"
                    : "hover:bg-white/50"
                }`}
                whileHover={{ x: 2 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">{chapter.number}.</span>
                  <span className={`text-sm ${isActive ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {chapter.title}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 justify-start"
          onClick={onAddChapter}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>
    </div>
  )
}

