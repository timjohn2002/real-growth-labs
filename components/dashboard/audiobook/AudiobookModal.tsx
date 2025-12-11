"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { VoiceSelectionStep } from "./VoiceSelectionStep"
import { GeneratingState } from "./GeneratingState"
import { CompletedState } from "./CompletedState"

const BRAND_COLOR = "#a6261c"

type ModalStep = "voice-selection" | "generating" | "completed"

interface AudiobookModalProps {
  isOpen: boolean
  onClose: () => void
  bookId?: string | null
  bookTitle?: string
}

export function AudiobookModal({ isOpen, onClose, bookId, bookTitle = "Your Book" }: AudiobookModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>("voice-selection")
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null)
  const [options, setOptions] = useState({
    addIntro: true,
    addOutro: true,
  })
  const [progress, setProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState("")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)

  const handleGenerate = async (voice: string, opts: typeof options) => {
    if (!bookId) {
      console.error("Book ID is required to generate audiobook")
      return
    }

    setSelectedVoice(voice)
    setOptions(opts)
    setCurrentStep("generating")
    setProgress(0)
    setCurrentTask("Starting generation...")

    try {
      // Create audiobook record in database
      const response = await fetch("/api/audiobook/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          voice,
          options: opts,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to start audiobook generation")
      }

      const data = await response.json()
      const audiobookId = data.audiobookId

      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/audiobook/${audiobookId}`)
          if (!statusResponse.ok) {
            throw new Error("Failed to fetch audiobook status")
          }

          const statusData = await statusResponse.json()
          const audiobook = statusData.audiobook

          // Parse options to get progress and current task
          let progress = 0
          let currentTask = "Processing..."
          
          if (audiobook.options) {
            try {
              const parsedOptions = JSON.parse(audiobook.options)
              progress = parsedOptions.progress || 0
              currentTask = parsedOptions.currentTask || "Processing..."
            } catch (e) {
              // If parsing fails, use defaults
            }
          }

          // Update UI with real progress
          setProgress(progress)
          setCurrentTask(currentTask)

          // Check if generation is complete or failed
          if (audiobook.status === "completed") {
            clearInterval(pollInterval)
            setAudioUrl(audiobook.audioUrl || "/placeholder-audio.mp3")
            setAudioDuration(audiobook.duration || 0)
            setProgress(100)
            setCurrentTask("Completed!")
            setCurrentStep("completed")
          } else if (audiobook.status === "failed") {
            clearInterval(pollInterval)
            throw new Error(audiobook.error || "Audiobook generation failed")
          }
        } catch (error) {
          clearInterval(pollInterval)
          console.error("Error polling audiobook status:", error)
          alert(`Failed to check generation status: ${error instanceof Error ? error.message : "Unknown error"}`)
          setCurrentStep("voice-selection")
        }
      }, 2000) // Poll every 2 seconds

      // Set a timeout to stop polling after 30 minutes (safety measure)
      setTimeout(() => {
        clearInterval(pollInterval)
      }, 30 * 60 * 1000)
    } catch (error) {
      console.error("Audiobook generation error:", error)
      // Show error state
      alert(`Failed to generate audiobook: ${error instanceof Error ? error.message : "Unknown error"}`)
      setCurrentStep("voice-selection")
    }
  }

  const handleRegenerate = () => {
    setCurrentStep("voice-selection")
    setAudioUrl(null)
    setProgress(0)
    setCurrentTask("")
  }

  const handleClose = () => {
    setCurrentStep("voice-selection")
    setSelectedVoice(null)
    setAudioUrl(null)
    setProgress(0)
    setCurrentTask("")
    onClose()
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-8 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg">
          <DialogPrimitive.Title className="sr-only">Generate Audiobook</DialogPrimitive.Title>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generate Audiobook</h2>
              <p className="text-sm text-gray-600 mt-1">
                Convert your book into a professional MP3 narration.
              </p>
            </div>
            {currentStep !== "generating" && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {currentStep === "voice-selection" && (
              <motion.div
                key="voice-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VoiceSelectionStep
                  onGenerate={handleGenerate}
                  options={options}
                  onOptionsChange={setOptions}
                />
              </motion.div>
            )}

            {currentStep === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GeneratingState progress={progress} currentTask={currentTask} />
              </motion.div>
            )}

            {currentStep === "completed" && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <CompletedState
                  audioUrl={audioUrl}
                  duration={audioDuration}
                  voice={selectedVoice || ""}
                  onRegenerate={handleRegenerate}
                  onClose={handleClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

