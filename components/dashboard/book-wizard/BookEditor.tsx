"use client"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Undo2, Redo2, History } from "lucide-react"

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
}

export function BookEditor({
  chapter,
  bookTitle,
  bookSubtitle,
  onTitleChange,
  onSubtitleChange,
  onContentChange,
  onSelectionChange,
}: BookEditorProps) {
  const [content, setContent] = useState(chapter?.content || "")
  const editorContentRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef<number>(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    
    // Add to history (only if different from last entry)
    const history = historyRef.current
    const index = historyIndexRef.current
    
    if (value !== history[index]) {
      // Remove any future history if we're not at the end
      history.splice(index + 1)
      history.push(value)
      historyIndexRef.current = history.length - 1
      
      // Limit history to 50 entries
      if (history.length > 50) {
        history.shift()
        historyIndexRef.current = history.length - 1
      }
    }
  }

  const handleUndo = () => {
    const history = historyRef.current
    const index = historyIndexRef.current
    
    if (index > 0) {
      historyIndexRef.current = index - 1
      const previousContent = history[index - 1]
      setContent(previousContent)
      onContentChange(previousContent)
    }
  }

  const handleRedo = () => {
    const history = historyRef.current
    const index = historyIndexRef.current
    
    if (index < history.length - 1) {
      historyIndexRef.current = index + 1
      const nextContent = history[index + 1]
      setContent(nextContent)
      onContentChange(nextContent)
    }
  }

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {chapter ? chapter.title : "Book Editor"}
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className={`h-4 w-4 ${canUndo ? "" : "opacity-50"}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className={`h-4 w-4 ${canRedo ? "" : "opacity-50"}`} />
          </Button>
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

        {/* Chapter Content Editor */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onSelect={(e) => {
            const textarea = e.target as HTMLTextAreaElement
            const selected = textarea.value.substring(
              textarea.selectionStart,
              textarea.selectionEnd
            )
            onSelectionChange?.(selected)
          }}
          onKeyDown={(e) => {
            // Handle Ctrl+Z (undo) and Ctrl+Y (redo)
            if (e.ctrlKey || e.metaKey) {
              if (e.key === "z" && !e.shiftKey) {
                e.preventDefault()
                handleUndo()
              } else if ((e.key === "y") || (e.key === "z" && e.shiftKey)) {
                e.preventDefault()
                handleRedo()
              }
            }
          }}
          className="min-h-[500px] border-none shadow-none resize-none text-base leading-relaxed focus-visible:ring-0 p-0"
          placeholder="Start writing your chapter content..."
        />
      </div>
    </div>
  )
}

