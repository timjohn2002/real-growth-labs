"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { WizardStepper } from "@/components/dashboard/book-wizard/WizardStepper"
import { TemplateSelection } from "@/components/dashboard/book-wizard/TemplateSelection"
import { GuidedQuestions, QuestionAnswers } from "@/components/dashboard/book-wizard/GuidedQuestions"
import { GeneratingState } from "@/components/dashboard/book-wizard/GeneratingState"
import { ChaptersSidebar } from "@/components/dashboard/book-wizard/ChaptersSidebar"
import { BookEditor } from "@/components/dashboard/book-wizard/BookEditor"
import { AIToolsPanel } from "@/components/dashboard/book-wizard/AIToolsPanel"
import { BookOverview } from "@/components/dashboard/book-wizard/BookOverview"
import { ContentVaultModal } from "@/components/dashboard/book-editor/ContentVaultModal"
import { generateAllChapters, REAL_GROWTH_BOOK_TEMPLATE } from "@/lib/book-templates"
import { markdownToHTML } from "@/lib/markdown-to-html"
import Link from "next/link"

const BRAND_COLOR = "#a6261c"

type WizardStep = "template" | "questions" | "generating" | "draft"

interface Chapter {
  id: string
  number: number
  title: string
  content: string
}

export default function BookWizardPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("template")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswers | null>(null)
  const [bookTitle, setBookTitle] = useState("Your Book Title")
  const [bookSubtitle, setBookSubtitle] = useState("Your Book Subtitle")
  const [outline, setOutline] = useState<string[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState("")
  const [isContentVaultOpen, setIsContentVaultOpen] = useState(false)
  const [contentToInsert, setContentToInsert] = useState<string | null>(null)
  const [insertTarget, setInsertTarget] = useState<"outline" | "editor">("editor")

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleContinue = () => {
    if (selectedTemplate) {
      setCurrentStep("questions")
    }
  }

  const [bookId, setBookId] = useState<string | null>(null)
  const userId = "user-1" // TODO: Get from auth context

  const handleGenerate = async (answers: QuestionAnswers) => {
    setQuestionAnswers(answers)
    setCurrentStep("generating")
    
    // Generate book title and subtitle from answers
    if (answers.transformation) {
      setBookTitle(answers.transformation.split(".")[0] || "Your Book Title")
    }
    if (answers.highTicketOffer) {
      setBookSubtitle(`The Complete Guide to ${answers.highTicketOffer}`)
    }
    
    // Generate chapters from Real Growth Book template
    // TODO: In production, call AI API to generate content based on answers
    // For now, generate template structure
    setTimeout(async () => {
      const generatedChapters = generateAllChapters(answers)
      
      // Log to verify each chapter has unique content
      console.log("[BookWizard] Generated chapters:", generatedChapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        contentLength: ch.content.length,
        contentPreview: ch.content.substring(0, 100)
      })))
      
      // Convert markdown content to HTML for TipTap editor
      const chaptersWithHTML = generatedChapters.map((ch) => ({
        ...ch,
        content: markdownToHTML(ch.content),
      }))
      
      // Verify HTML conversion worked and content is still unique
      console.log("[BookWizard] Chapters with HTML:", chaptersWithHTML.map(ch => ({
        id: ch.id,
        title: ch.title,
        contentLength: ch.content.length,
        contentPreview: ch.content.substring(0, 100)
      })))
      
      setChapters(chaptersWithHTML)
      
      // Set outline from chapter titles
      setOutline(generatedChapters.map((ch) => ch.title))
      
      // Set first chapter as active
      if (chaptersWithHTML.length > 0) {
        setActiveChapterId(chaptersWithHTML[0].id)
      }
      
      // Create book in database (store markdown version for compatibility)
      try {
        const response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: bookTitle,
            description: bookSubtitle,
            userId,
            chapters: generatedChapters.map((ch) => ({
              number: ch.number,
              title: ch.title,
              content: ch.content, // Store markdown in DB
            })),
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setBookId(data.book.id)
        }
      } catch (error) {
        console.error("Failed to create book:", error)
      }
      
      setCurrentStep("draft")
    }, 3000) // Reduced from 5000 for better UX
  }

  const handleBack = () => {
    setCurrentStep("template")
  }

  const editorRef = useRef<HTMLDivElement>(null)

  const handleChapterSelect = (chapterId: string) => {
    setActiveChapterId(chapterId)
    // Scroll to editor when chapter is selected
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  // Scroll to editor when active chapter changes
  useEffect(() => {
    if (activeChapterId && editorRef.current) {
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }, [activeChapterId])

  const handleContentChange = (content: string) => {
    if (activeChapterId) {
      setChapters((prev) =>
        prev.map((ch) => (ch.id === activeChapterId ? { ...ch, content } : ch))
      )
    }
  }

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!bookId) return // Don't save if no book ID
    
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bookTitle,
          description: bookSubtitle,
          chapters: chapters.map((ch) => ({
            id: ch.id,
            number: ch.number,
            title: ch.title,
            content: ch.content,
          })),
        }),
      })

      if (response.ok) {
        console.log("[BookWizard] Auto-saved successfully")
      } else {
        console.error("[BookWizard] Auto-save failed:", response.status)
      }
    } catch (error) {
      console.error("[BookWizard] Auto-save error:", error)
    }
  }, [bookId, bookTitle, bookSubtitle, chapters])

  // Auto-save on content change (debounced)
  useEffect(() => {
    if (!bookId) return
    
    const timer = setTimeout(() => {
      autoSave()
    }, 2000) // Save 2 seconds after last change

    return () => clearTimeout(timer)
  }, [bookTitle, bookSubtitle, chapters, autoSave, bookId])

  const handleSave = async () => {
    if (!bookId) {
      alert("Book not yet created. Please wait for generation to complete.")
      return
    }

    try {
      await autoSave()
      alert("Book saved successfully!")
    } catch (error) {
      console.error("Save error:", error)
      alert("Failed to save book. Please try again.")
    }
  }

  const handleExport = async () => {
    if (!bookId) {
      alert("Book not yet created. Please wait for generation to complete.")
      return
    }

    // Show export options
    const format = prompt("Choose export format:\n1. PDF (Entire book)\n2. PDF (Page by page)\n3. EPUB\n\nEnter 1, 2, or 3:")
    
    if (!format) return

    let exportFormat = ""
    let scope = "entire"

    if (format === "1") {
      exportFormat = "pdf"
      scope = "entire"
    } else if (format === "2") {
      exportFormat = "pdf"
      scope = "chapter"
    } else if (format === "3") {
      exportFormat = "epub"
      scope = "entire"
    } else {
      alert("Invalid option selected.")
      return
    }

    try {
      const response = await fetch(`/api/books/${bookId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          format: exportFormat,
          scope,
          chapterId: scope === "chapter" && activeChapterId ? activeChapterId : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const data = await response.json()

      if (exportFormat === "pdf") {
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
      } else if (exportFormat === "epub") {
        // For EPUB, create a downloadable file
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

  const handleInsertContentVault = (contentItem: any, contentType?: "summary" | "transcript" | "rawText") => {
    // Check which field has focus to determine insertion target
    const activeElement = document.activeElement
    const isOutlineFocused = activeElement?.tagName === "TEXTAREA" && 
                             (activeElement as HTMLTextAreaElement).className.includes("font-mono")
    
    if (contentItem.type === "image") {
      const imageUrl = contentItem.fileUrl || contentItem.thumbnail || contentItem.source
      if (!imageUrl) {
        alert("This image has no URL available.")
        return
      }
      
      // Images should always go to editor so they display fully
      // Insert as HTML img tag that TipTap can parse directly
      const altText = (contentItem.title || "Image").replace(/"/g, '&quot;')
      const safeUrl = imageUrl.replace(/"/g, '&quot;')
      const imageHtml = `<img src="${safeUrl}" alt="${altText}" class="max-w-full h-auto" />`
      setInsertTarget("editor")
      setContentToInsert(imageHtml)
      return
    }
    
    // Use the specified content type, or fall back to auto-detection
    let content = ""
    if (contentType === "summary") {
      content = contentItem.summary || ""
      if (!content) {
        alert("This content item has no summary available.")
        return
      }
    } else if (contentType === "transcript") {
      content = contentItem.transcript || ""
      if (!content) {
        alert("This content item has no transcript available.")
        return
      }
    } else if (contentType === "rawText") {
      content = contentItem.rawText || ""
    } else {
      // Auto-detect if no type specified
      content = contentItem.summary || contentItem.rawText || contentItem.transcript || ""
    }
    
    if (!content) {
      alert("This content item has no text to insert.")
      return
    }

    // For text content: insert into outline if outline has focus, otherwise editor
    if (isOutlineFocused) {
      setInsertTarget("outline")
    } else {
      setInsertTarget("editor")
    }
    setContentToInsert(content)
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
        // For heading suggestions, we might want to show a modal or update the title
        // For now, just log it
        console.log("Suggested heading:", data.content)
        alert(`Suggested heading: ${data.content}`)
      } else if (action === "suggestCTA" || action === "addCTA") {
        // For CTA suggestions, append to content
        const newContent = content + "\n\n" + data.content
        handleContentChange(newContent)
      } else if (textToUse && content.includes(textToUse)) {
        // If text was selected, replace it
        const newContent = content.replace(textToUse, data.content)
        handleContentChange(newContent)
      } else {
        // Replace entire content
        handleContentChange(data.content)
      }
    } catch (error) {
      console.error("AI action error:", error)
      alert("Failed to process AI action. Please try again.")
    }
  }

  const handleAddChapter = () => {
    // For Real Growth Book template, chapters are fixed
    // But allow adding custom chapters if needed
    const newChapter: Chapter = {
      id: `custom-${Date.now()}`,
      number: chapters.length + 1,
      title: `Chapter ${chapters.length + 1}`,
      content: "",
    }
    setChapters([...chapters, newChapter])
    setActiveChapterId(newChapter.id)
  }

  const handleRegenerateOutline = () => {
    // TODO: Implement outline regeneration
    console.log("Regenerating outline...")
  }

  const getStepNumber = (): number => {
    switch (currentStep) {
      case "template":
        return 1
      case "questions":
        return 2
      case "generating":
      case "draft":
        return 3
      default:
        return 1
    }
  }

  const activeChapter = chapters.find((ch) => ch.id === activeChapterId)

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book Wizard</h1>
          <p className="text-muted-foreground">
            Choose a structure, answer a few questions, and let AI draft your book.
          </p>
        </div>
        {currentStep !== "draft" && <WizardStepper currentStep={getStepNumber()} />}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === "template" && (
            <motion.div
              key="template"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 overflow-y-auto h-full"
            >
              <TemplateSelection
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleTemplateSelect}
              />
              <div className="flex justify-end mt-8">
                <Button
                  onClick={handleContinue}
                  disabled={!selectedTemplate}
                  className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 overflow-y-auto h-full"
            >
              <GuidedQuestions onBack={handleBack} onGenerate={handleGenerate} />
            </motion.div>
          )}

          {currentStep === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <GeneratingState />
            </motion.div>
          )}

          {currentStep === "draft" && (
            <motion.div
              key="draft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full"
            >
              {/* Three-Panel Layout */}
              <ChaptersSidebar
                chapters={chapters}
                activeChapterId={activeChapterId}
                onSelectChapter={handleChapterSelect}
                onAddChapter={handleAddChapter}
              />
              <div className="flex-1 flex flex-col overflow-hidden bg-background">
                <div className="p-6 overflow-y-auto flex-shrink-0 overflow-x-visible">
                  <BookOverview
                    title={bookTitle}
                    subtitle={bookSubtitle}
                    outline={outline}
                    activeChapter={activeChapter || null}
                    onTitleChange={setBookTitle}
                    onSubtitleChange={setBookSubtitle}
                    onOutlineChange={(newOutline) => {
                      // Update the chapter's content structure based on outline changes
                      if (activeChapter) {
                        // Parse the outline and update chapter content structure
                        console.log("[BookWizard] Outline changed for chapter:", activeChapter.id, newOutline)
                      }
                    }}
                    onRegenerateOutline={handleRegenerateOutline}
                    insertContent={insertTarget === "outline" ? contentToInsert : null}
                    onInsertComplete={() => {
                      setContentToInsert(null)
                      setInsertTarget("editor")
                    }}
                  />
                </div>
                {/* Editor container - match Full Book Editor structure */}
                <div ref={editorRef} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <BookEditor
                    chapter={activeChapter || null}
                    bookTitle={bookTitle}
                    bookSubtitle={bookSubtitle}
                    onTitleChange={setBookTitle}
                    onSubtitleChange={setBookSubtitle}
                    onContentChange={handleContentChange}
                    onSelectionChange={setSelectedText}
                    insertContent={insertTarget === "editor" ? contentToInsert : null}
                    onInsertComplete={() => {
                      setContentToInsert(null)
                      setInsertTarget("editor")
                    }}
                  />
                </div>
                {/* Bottom Actions */}
                <div className="border-t border-border p-6 bg-background">
                  <div className="flex items-center justify-end gap-4">
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm">
                        Save and exit
                      </Button>
                    </Link>
                    <Link href={bookId ? `/dashboard/book-editor?id=${bookId}` : "/dashboard/book-editor"}>
                      <Button
                        className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        Continue Editing in Full Book Editor
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <AIToolsPanel 
                onAction={handleAIAction}
                onOpenContentVault={() => setIsContentVaultOpen(true)}
                onSave={handleSave}
                onExport={handleExport}
              />
              <ContentVaultModal
                isOpen={isContentVaultOpen}
                onClose={() => setIsContentVaultOpen(false)}
                onSelect={handleInsertContentVault}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
