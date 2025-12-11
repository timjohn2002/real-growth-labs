"use client"

import { useState, useEffect, useCallback } from "react"
import { EditorTopBar } from "@/components/dashboard/book-editor/EditorTopBar"
import { ChaptersSidebar } from "@/components/dashboard/book-editor/ChaptersSidebar"
import { ChapterEditor } from "@/components/dashboard/book-editor/ChapterEditor"
import { AIToolsPanel } from "@/components/dashboard/book-editor/AIToolsPanel"
import { StatusBar } from "@/components/dashboard/book-editor/StatusBar"
import { ExportModal } from "@/components/dashboard/book-editor/ExportModal"
import { AudiobookModal } from "@/components/dashboard/audiobook/AudiobookModal"
import { ContentVaultModal } from "@/components/dashboard/book-editor/ContentVaultModal"
import { useRouter } from "next/navigation"

interface Chapter {
  id: string
  number: number
  title: string
  content: string
  wordCount: number
}

export default function FullBookEditorPage() {
  const router = useRouter()
  const [bookId, setBookId] = useState<string | null>(null)
  const [bookTitle, setBookTitle] = useState("My First Book")
  const [bookStatus, setBookStatus] = useState<"draft" | "published">("draft")
  const [lastUpdated, setLastUpdated] = useState("just now")
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">("saved")
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isAudiobookModalOpen, setIsAudiobookModalOpen] = useState(false)
  const [totalWordCount, setTotalWordCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [isContentVaultOpen, setIsContentVaultOpen] = useState(false)
  const [contentToInsert, setContentToInsert] = useState<string | null>(null)

  const [chapters, setChapters] = useState<Chapter[]>([])

  const activeChapter = chapters.find((ch) => ch.id === activeChapterId)

  // Get book ID from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("id")
      setBookId(id)
    }
  }, [])

  // Load book data
  useEffect(() => {
    if (bookId) {
      loadBook(bookId)
    } else {
      // If no book ID, initialize with empty state (for new books)
      setChapters([])
      setActiveChapterId(null)
    }
  }, [bookId])

  const loadBook = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/books/${id}`)
      if (response.ok) {
        const data = await response.json()
        setBookTitle(data.title)
        setBookStatus(data.status as "draft" | "published")
        setChapters(data.chapters || [])
        if (data.chapters && data.chapters.length > 0) {
          setActiveChapterId(data.chapters[0].id)
        }
        
        // Calculate total word count
        const total = data.chapters.reduce(
          (sum: number, ch: Chapter) => sum + (ch.wordCount || 0),
          0
        )
        setTotalWordCount(total)
        
        // Format last updated
        const updated = new Date(data.updatedAt)
        const now = new Date()
        const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / 60000)
        if (diffMinutes < 1) {
          setLastUpdated("just now")
        } else if (diffMinutes < 60) {
          setLastUpdated(`${diffMinutes} minutes ago`)
        } else {
          setLastUpdated(`${Math.floor(diffMinutes / 60)} hours ago`)
        }
      }
    } catch (error) {
      console.error("Failed to load book:", error)
      setSaveStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save logic
  const autoSave = useCallback(async () => {
    if (!bookId) return // Don't save if no book ID
    
    setSaveStatus("saving")
    
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bookTitle,
          status: bookStatus,
          chapters: chapters.map((ch) => ({
            id: ch.id,
            number: ch.number,
            title: ch.title,
            content: ch.content,
          })),
        }),
      })

      if (response.ok) {
        setSaveStatus("saved")
        const now = new Date()
        setLastUpdated("just now")
      } else {
        throw new Error("Save failed")
      }
    } catch (error) {
      console.error("Auto-save error:", error)
      setSaveStatus("error")
    }
  }, [bookId, bookTitle, bookStatus, chapters])

  // Auto-save on content change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (saveStatus !== "saving") {
        autoSave()
      }
    }, 2000) // Save 2 seconds after last change

    return () => clearTimeout(timer)
  }, [chapters, bookTitle, autoSave, saveStatus])

  const handleChapterSelect = (id: string) => {
    setActiveChapterId(id)
  }

  const handleChapterTitleChange = (title: string) => {
    if (activeChapterId) {
      setChapters((prev) =>
        prev.map((ch) => (ch.id === activeChapterId ? { ...ch, title } : ch))
      )
    }
  }

  const handleChapterContentChange = (content: string) => {
    if (activeChapterId) {
      setChapters((prev) =>
        prev.map((ch) => (ch.id === activeChapterId ? { ...ch, content } : ch))
      )
    }
  }

  const handleChapterWordCountChange = (count: number) => {
    if (activeChapterId) {
      setChapters((prev) => {
        const updated = prev.map((ch) =>
          ch.id === activeChapterId ? { ...ch, wordCount: count } : ch
        )
        const total = updated.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)
        setTotalWordCount(total)
        return updated
      })
    }
  }

  const handleReorderChapters = (newChapters: Chapter[]) => {
    setChapters(newChapters)
  }

  const handleAddChapter = () => {
    const newChapter: Chapter = {
      id: `temp-${Date.now()}`, // Temporary ID until saved
      number: chapters.length + 1,
      title: `Chapter ${chapters.length + 1}`,
      content: "<p></p>",
      wordCount: 0,
    }
    setChapters([...chapters, newChapter])
    setActiveChapterId(newChapter.id)
  }

  const handleAddSection = () => {
    console.log("Add section")
    // TODO: Implement section addition
  }

  const handleAIAction = async (action: string, params?: any) => {
    if (!activeChapter) {
      console.warn("No active chapter selected")
      return
    }

    try {
      // Get selected text or full content
      const textToUse = selectedText || params?.selectedText || ""
      const content = activeChapter.content || ""
      const textToProcess = textToUse || content

      if (!textToProcess.trim()) {
        console.warn("No content to process")
        return
      }

      // Call AI API
      const response = await fetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content,
          selectedText: textToUse,
          tone: params?.tone,
          context: params?.context,
        }),
      })

      if (!response.ok) {
        throw new Error("AI action failed")
      }

      const data = await response.json()

      // Update chapter content based on action
      if (action === "suggestHeading" || action === "improveHeading") {
        // Update chapter title
        handleChapterTitleChange(data.content.trim())
      } else if (action === "suggestCTA" || action === "addCTA") {
        // Append CTA to content
        const newContent = content + "\n\n" + data.content
        handleChapterContentChange(newContent)
      } else if (textToUse && content.includes(textToUse)) {
        // If text was selected, replace it
        const newContent = content.replace(textToUse, data.content)
        handleChapterContentChange(newContent)
      } else {
        // Replace entire content
        handleChapterContentChange(data.content)
      }
    } catch (error) {
      console.error("AI action error:", error)
      alert("Failed to process AI action. Please try again.")
    }
  }

  const handlePreview = () => {
    console.log("Preview book")
    // TODO: Open preview modal/page
  }

  const handleExport = (format: string, scope: string) => {
    console.log("Export:", format, scope)
    // TODO: Implement export logic
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-muted-foreground mb-2">Loading book...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <EditorTopBar
        bookTitle={bookTitle}
        status={bookStatus}
        lastUpdated={lastUpdated}
        onTitleChange={setBookTitle}
        onPreview={handlePreview}
        onExport={() => setIsExportModalOpen(true)}
        onGenerateAudiobook={() => setIsAudiobookModalOpen(true)}
        onRunBookReview={() => router.push(`/dashboard/book-review?id=${bookId}`)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chapters Sidebar */}
        <ChaptersSidebar
          chapters={chapters}
          activeChapterId={activeChapterId}
          onSelectChapter={handleChapterSelect}
          onReorderChapters={handleReorderChapters}
          onAddChapter={handleAddChapter}
          onAddSection={handleAddSection}
        />

        {/* Center: Editor */}
        <ChapterEditor
          chapter={activeChapter || null}
          onTitleChange={handleChapterTitleChange}
          onContentChange={handleChapterContentChange}
          onWordCountChange={handleChapterWordCountChange}
          onSelectionChange={setSelectedText}
          insertContent={contentToInsert}
          onInsertComplete={() => setContentToInsert(null)}
        />

        {/* Right: AI Tools */}
        <AIToolsPanel 
          onAction={handleAIAction}
          onOpenContentVault={() => setIsContentVaultOpen(true)}
        />
        <ContentVaultModal
          isOpen={isContentVaultOpen}
          onClose={() => setIsContentVaultOpen(false)}
          onSelect={(contentItem) => {
            const contentToInsert = contentItem.rawText || contentItem.transcript || contentItem.summary || ""
            if (contentToInsert) {
              setContentToInsert(contentToInsert)
            } else {
              alert("This content item has no text to insert.")
            }
          }}
        />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        saveStatus={saveStatus}
        wordCount={totalWordCount}
        chapterCount={chapters.length}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />

      {/* Audiobook Modal */}
      <AudiobookModal
        isOpen={isAudiobookModalOpen}
        onClose={() => setIsAudiobookModalOpen(false)}
        bookId={bookId}
        bookTitle={bookTitle}
      />
    </div>
  )
}
