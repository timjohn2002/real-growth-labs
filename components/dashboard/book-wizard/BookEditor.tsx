"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import { TipTapEditor } from "@/components/dashboard/book-editor/TipTapEditor"

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
  const [content, setContent] = useState(chapter?.content || "")
  const editorContentRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef<number>(-1)
  const [currentInsertContent, setCurrentInsertContent] = useState<string | null>(null)

  // Initialize history when chapter changes
  useEffect(() => {
    if (chapter) {
      const initialContent = chapter.content || ""
      setContent(initialContent)
      historyRef.current = [initialContent]
      historyIndexRef.current = 0
      // Scroll to top when chapter changes
      if (editorContentRef.current) {
        editorContentRef.current.scrollTop = 0
      }
    }
  }, [chapter?.id])

  const handleContentChange = (value: string) => {
    setContent(value)
    onContentChange(value)
  }

  // Handle content insertion - pass to TipTapEditor
  useEffect(() => {
    if (insertContent) {
      setCurrentInsertContent(insertContent)
    }
  }, [insertContent])

  const handleInsertComplete = () => {
    setCurrentInsertContent(null)
    onInsertComplete?.()
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {chapter ? chapter.title : "Book Editor"}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="Version history (coming soon)">
            <History className="h-4 w-4 mr-2" />
            Version
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div ref={editorContentRef} className="flex-1 overflow-y-auto p-8">
        {/* Info Bar (first time) */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Draft generated from your template + content vault. Edit freely — you won&apos;t break
            the structure.
          </p>
        </div>

        {/* Book Title & Subtitle (if first chapter) */}
        {chapter?.number === 1 && (
          <div className="mb-8 space-y-4">
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

        {/* Chapter Content Editor - Use TipTapEditor to support images */}
        <TipTapEditor
          content={content}
          placeholder="Start writing your chapter content..."
          onUpdate={handleContentChange}
          onSelectionChange={onSelectionChange}
          insertContent={currentInsertContent}
          onInsertComplete={handleInsertComplete}
        />
      </div>
    </div>
  )
}

