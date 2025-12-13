"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Check, Image as ImageIcon } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"

const BRAND_COLOR = "#a6261c"

interface BookCoverModalProps {
  isOpen: boolean
  onClose: () => void
  bookId: string | null
  bookTitle: string
  introductionContent?: string
  onCoverGenerated?: (coverUrl: string) => void
}

export function BookCoverModal({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  introductionContent,
  onCoverGenerated,
}: BookCoverModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setIsGenerating(false)
      setCoverImageUrl(null)
      setError(null)
      setProgress(0)
    }
  }, [isOpen])

  const handleGenerate = async () => {
    if (!bookId) {
      setError("No book selected")
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(10)

    try {
      setProgress(30)
      const response = await fetch(`/api/books/${bookId}/cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          introductionContent,
        }),
      })

      setProgress(60)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate cover")
      }

      const data = await response.json()
      setProgress(90)

      if (data.coverImageUrl) {
        setCoverImageUrl(data.coverImageUrl)
        setProgress(100)
        
        // Notify parent component
        if (onCoverGenerated) {
          onCoverGenerated(data.coverImageUrl)
        }
      } else {
        throw new Error("No cover image URL returned")
      }
    } catch (err) {
      console.error("Cover generation error:", err)
      setError(err instanceof Error ? err.message : "Failed to generate cover")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      onClose()
    }
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg flex flex-col overflow-hidden">
          <DialogPrimitive.Title className="sr-only">Create Book Cover</DialogPrimitive.Title>
          
          <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Book Cover</h2>
              <p className="text-sm text-gray-600 mt-1">
                Generate a beautiful, minimal book cover using AI
              </p>
            </div>
            {!isGenerating && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <AnimatePresence mode="wait">
              {!coverImageUrl && !isGenerating && (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      How it works
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#a6261c] mt-0.5 flex-shrink-0" />
                        <span>AI analyzes your introduction chapter content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#a6261c] mt-0.5 flex-shrink-0" />
                        <span>Generates a simple, minimal, and enticing cover design</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#a6261c] mt-0.5 flex-shrink-0" />
                        <span>Cover is automatically added to your book</span>
                      </li>
                    </ul>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button variant="ghost" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      disabled={!bookId}
                      className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate Cover
                    </Button>
                  </div>
                </motion.div>
              )}

              {isGenerating && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-4"
                    >
                      <Loader2 className="h-12 w-12" style={{ color: BRAND_COLOR }} />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Generating your book cover...
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      This may take a few moments
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: BRAND_COLOR }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{progress}%</p>
                  </div>
                </motion.div>
              )}

              {coverImageUrl && !isGenerating && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="mb-4">
                      <Check className="h-12 w-12 text-green-500 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cover Generated Successfully!
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Your book cover has been created and added to your book.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <img
                      src={coverImageUrl}
                      alt={`${bookTitle} cover`}
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={handleClose}
                      className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      Done
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
