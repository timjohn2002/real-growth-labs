"use client"

import { useState, useEffect, useCallback } from "react"
import { EditorTopBar } from "@/components/dashboard/book-editor/EditorTopBar"
import { ChaptersSidebar } from "@/components/dashboard/book-editor/ChaptersSidebar"
import { ChapterEditor } from "@/components/dashboard/book-editor/ChapterEditor"
import { AIToolsPanel } from "@/components/dashboard/book-editor/AIToolsPanel"
import { StatusBar } from "@/components/dashboard/book-editor/StatusBar"
import { ExportModal } from "@/components/dashboard/book-editor/ExportModal"
import { AudiobookModal } from "@/components/dashboard/audiobook/AudiobookModal"
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
  const [bookTitle, setBookTitle] = useState("My First Book")
  const [bookStatus, setBookStatus] = useState<"draft" | "published">("draft")
  const [lastUpdated, setLastUpdated] = useState("just now")
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">("saved")
  const [activeChapterId, setActiveChapterId] = useState<string | null>("1")
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isAudiobookModalOpen, setIsAudiobookModalOpen] = useState(false)
  const [totalWordCount, setTotalWordCount] = useState(18304)

  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "1",
      number: 1,
      title: "The Big Promise",
      content: "<p>This is the opening chapter that sets up the entire book...</p>",
      wordCount: 1850,
    },
    {
      id: "2",
      number: 2,
      title: "Your Story",
      content: "<p>Share your personal journey and how you discovered this method...</p>",
      wordCount: 2200,
    },
    {
      id: "3",
      number: 3,
      title: "Framework Overview",
      content: "<p>Here's the core framework that will transform your reader's life...</p>",
      wordCount: 3100,
    },
    {
      id: "4",
      number: 4,
      title: "Case Studies",
      content: "<p>Real examples of how this framework has worked for others...</p>",
      wordCount: 2800,
    },
    {
      id: "5",
      number: 5,
      title: "Implementation Plan",
      content: "<p>Step-by-step guide to implementing what you've learned...</p>",
      wordCount: 3254,
    },
  ])

  const activeChapter = chapters.find((ch) => ch.id === activeChapterId)

  // Auto-save logic
  const autoSave = useCallback(async () => {
    setSaveStatus("saving")
    setLastUpdated("just now")

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaveStatus("saved")
      const now = new Date()
      const minutes = now.getMinutes()
      setLastUpdated(`${minutes} minutes ago`)
    } catch (error) {
      setSaveStatus("error")
    }
  }, [])

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
        const total = updated.reduce((sum, ch) => sum + ch.wordCount, 0)
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
      id: `${chapters.length + 1}`,
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

  const handleAIAction = (action: string, params?: any) => {
    console.log("AI Action:", action, params)
    // TODO: Implement AI actions with inline suggestions
  }

  const handlePreview = () => {
    console.log("Preview book")
    // TODO: Open preview modal/page
  }

  const handleExport = (format: string, scope: string) => {
    console.log("Export:", format, scope)
    // TODO: Implement export logic
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <EditorTopBar
        bookTitle={bookTitle}
        status={bookStatus}
        lastUpdated={lastUpdated}
        onTitleChange={setBookTitle}
        onPreview={handlePreview}
        onExport={() => setIsExportModalOpen(true)}
        onGenerateAudiobook={() => setIsAudiobookModalOpen(true)}
        onRunBookReview={() => router.push("/dashboard/book-review")}
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
        />

        {/* Right: AI Tools */}
        <AIToolsPanel onAction={handleAIAction} />
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
        bookTitle={bookTitle}
      />
    </div>
  )
}
