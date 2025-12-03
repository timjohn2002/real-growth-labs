"use client"

import { useState } from "react"
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
  const [outline, setOutline] = useState<string[]>([
    "Introduction – Why this matters",
    "Your Story",
    "Framework Overview",
    "Implementation Guide",
    "Case Studies",
    "Conclusion & Next Steps",
  ])
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "1",
      number: 1,
      title: "Introduction – Why this matters",
      content: "This is the introduction chapter content. Edit freely to customize your book.",
    },
    {
      id: "2",
      number: 2,
      title: "Your Story",
      content: "Share your personal story and journey here.",
    },
    {
      id: "3",
      number: 3,
      title: "Framework Overview",
      content: "Explain your framework and methodology.",
    },
  ])
  const [activeChapterId, setActiveChapterId] = useState<string | null>("1")

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleContinue = () => {
    if (selectedTemplate) {
      setCurrentStep("questions")
    }
  }

  const handleGenerate = (answers: QuestionAnswers) => {
    setQuestionAnswers(answers)
    setCurrentStep("generating")
    // Simulate generation process
    setTimeout(() => {
      setCurrentStep("draft")
    }, 5000)
  }

  const handleBack = () => {
    setCurrentStep("template")
  }

  const handleChapterSelect = (chapterId: string) => {
    setActiveChapterId(chapterId)
  }

  const handleContentChange = (content: string) => {
    if (activeChapterId) {
      setChapters((prev) =>
        prev.map((ch) => (ch.id === activeChapterId ? { ...ch, content } : ch))
      )
    }
  }

  const handleAIAction = (action: string, params?: any) => {
    console.log("AI Action:", action, params)
    // TODO: Implement AI actions
  }

  const handleAddChapter = () => {
    const newChapter: Chapter = {
      id: `${chapters.length + 1}`,
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
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Wizard</h1>
          <p className="text-gray-600">
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
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="p-6 overflow-y-auto">
                  <BookOverview
                    title={bookTitle}
                    subtitle={bookSubtitle}
                    outline={outline}
                    onTitleChange={setBookTitle}
                    onSubtitleChange={setBookSubtitle}
                    onRegenerateOutline={handleRegenerateOutline}
                  />
                </div>
                <BookEditor
                  chapter={activeChapter || null}
                  bookTitle={bookTitle}
                  bookSubtitle={bookSubtitle}
                  onTitleChange={setBookTitle}
                  onSubtitleChange={setBookSubtitle}
                  onContentChange={handleContentChange}
                />
                {/* Bottom Actions */}
                <div className="border-t border-gray-200 p-6 bg-white">
                  <div className="flex items-center justify-end gap-4">
                    <Link href="/dashboard/book-editor">
                      <Button variant="ghost" size="sm">
                        Save and exit
                      </Button>
                    </Link>
                    <Link href="/dashboard/book-editor">
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
              <AIToolsPanel onAction={handleAIAction} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
