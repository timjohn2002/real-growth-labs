"use client"

import { useState } from "react"
import dynamic from "next/dynamic"

const TipTapEditor = dynamic(() => import("./TipTapEditor").then((mod) => ({ default: mod.TipTapEditor })), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center"><p className="text-gray-500">Loading editor...</p></div>,
})

interface Chapter {
  id: string
  number: number
  title: string
  content: string
  wordCount: number
}

interface ChapterEditorProps {
  chapter: Chapter | null
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onWordCountChange: (count: number) => void
}

export function ChapterEditor({
  chapter,
  onTitleChange,
  onContentChange,
  onWordCountChange,
}: ChapterEditorProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(chapter?.title || "")

  const readingTime = chapter ? Math.ceil(chapter.wordCount / 200) : 0

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    onTitleChange(title)
  }

  if (!chapter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <p className="text-gray-500">Select a chapter to start editing</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleBlur()
                }
              }}
              className="text-2xl font-bold text-gray-900 border-none outline-none focus:ring-0 px-2 py-1 -mx-2 -my-1 bg-gray-50 rounded"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            >
              {chapter.title}
            </h2>
          )}
        </div>
        <p className="text-sm text-gray-500">
          ~ {chapter.wordCount.toLocaleString()} words · {readingTime} min read
        </p>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <TipTapEditor
          content={chapter.content}
          placeholder="Start writing your chapter..."
          onUpdate={onContentChange}
          onWordCountChange={(count) => {
            onWordCountChange(count)
          }}
        />
      </div>
    </div>
  )
}

