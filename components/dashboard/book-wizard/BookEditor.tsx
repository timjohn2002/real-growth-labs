"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import dynamic from "next/dynamic"

// Use dynamic import with SSR disabled to match Full Book Editor implementation exactly
const TipTapEditor = dynamic(() => import("@/components/dashboard/book-editor/TipTapEditor").then((mod) => ({ default: mod.TipTapEditor })), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading editor...</p></div>,
})

const BRAND_COLOR = "#a6261c"

interface Chapter {
  id: string
  number: number
  title: string
  content: string
}

interface BookEditorProps {
  chapter: Chapter | null
  bookTitle: string
  bookSubtitle: string
  onTitleChange: (title: string) => void
  onSubtitleChange: (subtitle: string) => void
  onContentChange: (content: string) => void
  onSelectionChange?: (selectedText: string) => void
  insertContent?: string | null
  onInsertComplete?: () => void
}

export function BookEditor({
  chapter,
  bookTitle,
  bookSubtitle,
  onTitleChange,
  onSubtitleChange,
  onContentChange,
  onSelectionChange,
  insertContent,
  onInsertComplete,
}: BookEditorProps) {
  // Match ChapterEditor: directly use chapter.content, no local state
  // The TipTapEditor will handle its own internal state
  
  if (!chapter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Select a chapter to start editing</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header - Match ChapterEditor structure */}
      <div className="border-b border-border px-8 py-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-foreground">
          {chapter.title}
        </h2>
      </div>

      {/* Info Bar (first time) */}
      <div className="px-8 pt-6 pb-4 flex-shrink-0">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Draft generated from your template + content vault. Edit freely — you won&apos;t break
            the structure.
          </p>
        </div>
      </div>

      {/* Book Title & Subtitle (if first chapter) */}
      {chapter?.number === 1 && (
        <div className="px-8 pb-4 flex-shrink-0 space-y-4">
          <div>
            <Input
              value={bookTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-3xl font-bold border-none shadow-none p-0 mb-2 focus-visible:ring-0"
              placeholder="Book Title"
            />
            <Input
              value={bookSubtitle}
              onChange={(e) => onSubtitleChange(e.target.value)}
              className="text-xl text-muted-foreground border-none shadow-none p-0 focus-visible:ring-0"
              placeholder="Book Subtitle"
            />
          </div>
        </div>
      )}

      {/* Editor - Match ChapterEditor structure exactly */}
      <div className="flex-1 overflow-hidden">
        <TipTapEditor
          content={chapter.content}
          placeholder="Start writing your chapter..."
          onUpdate={onContentChange}
          onSelectionChange={onSelectionChange}
          insertContent={insertContent}
          onInsertComplete={onInsertComplete}
        />
      </div>
    </div>
  )
}

