"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GripVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const BRAND_COLOR = "#a6261c"

interface Chapter {
  id: string
  number: number
  title: string
  content: string
  wordCount: number
}

interface ChapterListItemProps {
  chapter: Chapter
  isActive: boolean
  onSelect: (id: string) => void
}

function ChapterListItem({ chapter, isActive, onSelect }: ChapterListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: isActive ? BRAND_COLOR : "transparent",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all group ${
        isActive ? "bg-[#a6261c]/10 dark:bg-[#a6261c]/20 border-l-4" : "hover:bg-muted"
      }`}
      onClick={() => onSelect(chapter.id)}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {String(chapter.number).padStart(2, "0")}
          </span>
          <span
            className={`text-sm font-medium truncate ${
              isActive ? "text-foreground" : "text-foreground"
            }`}
          >
            {chapter.title}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">~ {chapter.wordCount.toLocaleString()} words</p>
      </div>
    </motion.div>
  )
}

interface ChaptersSidebarProps {
  chapters: Chapter[]
  activeChapterId: string | null
  onSelectChapter: (id: string) => void
  onReorderChapters: (chapters: Chapter[]) => void
  onAddChapter: () => void
  onAddSection: () => void
}

export function ChaptersSidebar({
  chapters,
  activeChapterId,
  onSelectChapter,
  onReorderChapters,
  onAddChapter,
  onAddSection,
}: ChaptersSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = chapters.findIndex((ch) => ch.id === active.id)
      const newIndex = chapters.findIndex((ch) => ch.id === over.id)

      const newChapters = arrayMove(chapters, oldIndex, newIndex).map((ch, index) => ({
        ...ch,
        number: index + 1,
      }))

      onReorderChapters(newChapters)
    }
  }

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Chapters</h3>
          <Button variant="ghost" size="sm" onClick={onAddChapter}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={onAddChapter}>
          <Plus className="h-3 w-3 mr-2" />
          New Chapter
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={chapters.map((ch) => ch.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {chapters.map((chapter) => (
                <ChapterListItem
                  key={chapter.id}
                  chapter={chapter}
                  isActive={chapter.id === activeChapterId}
                  onSelect={onSelectChapter}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={onAddSection}>
          <Plus className="h-3 w-3 mr-2" />
          Add Section
        </Button>
      </div>
    </div>
  )
}

