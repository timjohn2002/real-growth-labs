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
import { BookLibraryModal } from "@/components/dashboard/book-editor/BookLibraryModal"
import { BookCoverModal } from "@/components/dashboard/book-editor/BookCoverModal"
import { markdownToHTML, htmlToMarkdown } from "@/lib/markdown-to-html"
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
  const [isBookLibraryOpen, setIsBookLibraryOpen] = useState(false)
  const [isBookCoverModalOpen, setIsBookCoverModalOpen] = useState(false)
  const [bookCoverImage, setBookCoverImage] = useState<string | null>(null)

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

  const handleImportBook = (selectedBookId: string) => {
    // Update URL with new book ID and reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("id", selectedBookId)
      window.location.href = url.toString()
    }
  }

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
        setBookCoverImage(data.coverImage || null)
        
        // Convert markdown content to HTML for TipTap editor
        const formattedChapters = (data.chapters || []).map((ch: any) => ({
          ...ch,
          content: markdownToHTML(ch.content || ""),
        }))
        
        setChapters(formattedChapters)
        if (formattedChapters.length > 0) {
          setActiveChapterId(formattedChapters[0].id)
        }
        
        // Calculate total word count
        const total = formattedChapters.reduce(
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

  const handleCreateCover = () => {
    setIsBookCoverModalOpen(true)
  }

  const handleCoverGenerated = (coverUrl: string) => {
    setBookCoverImage(coverUrl)
    // Reload book to get updated cover image
    if (bookId) {
      loadBook(bookId)
    }
  }

  const handleManualSave = async () => {
    if (!bookId) {
      alert("No book to save. Please create a book first.")
      return
    }
    await autoSave()
  }

  const handleExport = async (format: string, scope: string) => {
    if (!bookId) {
      alert("No book to export. Please create a book first.")
      return
    }

    try {
      const response = await fetch(`/api/books/${bookId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          format: format.toLowerCase(),
          scope,
          chapterId: scope === "chapter" && activeChapterId ? activeChapterId : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const data = await response.json()

      if (format.toLowerCase() === "pdf") {
        // Create a blob with the HTML content
        const blob = new Blob([data.html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        
        // Open in new window and trigger print (user can save as PDF)
        const printWindow = window.open(url, "_blank")
        if (printWindow) {
          printWindow.addEventListener("load", () => {
            setTimeout(() => {
              printWindow.print()
            }, 500)
          })
        } else {
          // Fallback: download as HTML file
          const a = document.createElement("a")
          a.href = url
          a.download = data.filename.replace(".pdf", ".html")
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      } else if (format.toLowerCase() === "epub") {
        // For EPUB, we'll create a downloadable file
        // In a production environment, you'd generate the actual EPUB file server-side
        const epubContent = generateEPUBFile(data.content)
        const blob = new Blob([epubContent], { type: "application/epub+zip" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = data.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export book. Please try again.")
    }
  }

  const generateEPUBFile = (epubData: any): string => {
    // Generate basic EPUB structure (simplified)
    // In production, use a proper EPUB library
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata>
    <dc:title>${epubData.title}</dc:title>
    <dc:creator>${epubData.author || "Author"}</dc:creator>
    <dc:description>${epubData.description || ""}</dc:description>
    <dc:identifier id="book-id">book-${bookId}</dc:identifier>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${epubData.chapters.map((ch: any, i: number) => 
      `<item id="chapter-${i}" href="chapter-${i}.xhtml" media-type="application/xhtml+xml"/>`
    ).join("\n    ")}
  </manifest>
  <spine toc="nav">
    ${epubData.chapters.map((ch: any, i: number) => 
      `<itemref idref="chapter-${i}"/>`
    ).join("\n    ")}
  </spine>
</package>`
    return content
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
        onCreateCover={handleCreateCover}
        onExport={() => setIsExportModalOpen(true)}
        onGenerateAudiobook={() => setIsAudiobookModalOpen(true)}
        onRunBookReview={() => router.push(`/dashboard/book-review?id=${bookId}`)}
        onImportBook={() => setIsBookLibraryOpen(true)}
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
          onSave={handleManualSave}
          onExport={() => setIsExportModalOpen(true)}
        />
        <ContentVaultModal
          isOpen={isContentVaultOpen}
          onClose={() => setIsContentVaultOpen(false)}
          onSelect={(contentItem, contentType) => {
            // Handle images differently - insert image markdown
            if (contentItem.type === "image" && contentItem.fileUrl) {
              // Insert image markdown: ![alt text](image-url)
              const imageMarkdown = `![${contentItem.title}](${contentItem.fileUrl})`
              setContentToInsert(imageMarkdown)
            } else {
              // Use the specified content type, or fall back to auto-detection
              let contentToInsert = ""
              if (contentType === "summary") {
                contentToInsert = contentItem.summary || ""
                if (!contentToInsert) {
                  alert("This content item has no summary available.")
                  return
                }
              } else if (contentType === "transcript") {
                contentToInsert = contentItem.transcript || ""
                if (!contentToInsert) {
                  alert("This content item has no transcript available.")
                  return
                }
              } else if (contentType === "rawText") {
                contentToInsert = contentItem.rawText || ""
              } else {
                // Auto-detect if no type specified
                contentToInsert = contentItem.summary || contentItem.rawText || contentItem.transcript || ""
              }
              
              if (contentToInsert) {
                setContentToInsert(contentToInsert)
              } else {
                alert("This content item has no text to insert.")
              }
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

      {/* Book Library Modal */}
      <BookLibraryModal
        isOpen={isBookLibraryOpen}
        onClose={() => setIsBookLibraryOpen(false)}
        onSelect={handleImportBook}
      />

      {/* Book Cover Modal */}
      <BookCoverModal
        isOpen={isBookCoverModalOpen}
        onClose={() => setIsBookCoverModalOpen(false)}
        bookId={bookId}
        bookTitle={bookTitle}
        introductionContent={
          chapters.find(
            (ch) =>
              ch.title.toLowerCase().includes("intro") ||
              ch.number === 1
          )?.content
            ? chapters
                .find(
                  (ch) =>
                    ch.title.toLowerCase().includes("intro") ||
                    ch.number === 1
                )
                ?.content.replace(/<[^>]*>/g, "")
                .trim()
            : undefined
        }
        onCoverGenerated={handleCoverGenerated}
      />
    </div>
  )
}
