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
    setCurrentTask("Preparing chapters...")

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
        throw new Error("Failed to start audiobook generation")
      }

      const data = await response.json()
      const audiobookId = data.audiobookId

      // Simulate generation process (in production, this would poll the API)
      const tasks = [
        { task: "Preparing chapters...", progress: 10 },
        { task: "Converting to speech...", progress: 30 },
        { task: "Rendering Chapter 1...", progress: 50 },
        { task: "Rendering Chapter 2...", progress: 65 },
        { task: "Stitching audio files...", progress: 80 },
        { task: "Adding intro/outro...", progress: 90 },
        { task: "Finalizing file...", progress: 100 },
      ]

      for (const { task, progress: prog } of tasks) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setCurrentTask(task)
        setProgress(prog)
      }

      // Fetch the completed audiobook
      const audiobookResponse = await fetch(`/api/audiobook/${audiobookId}`)
      if (audiobookResponse.ok) {
        const audiobook = await audiobookResponse.json()
        setAudioUrl(audiobook.audioUrl || "/placeholder-audio.mp3")
        setAudioDuration(audiobook.duration || 0)
      } else {
        // Fallback for now
        setAudioUrl("/placeholder-audio.mp3")
        setAudioDuration(2609)
      }

      setCurrentStep("completed")
    } catch (error) {
      console.error("Audiobook generation error:", error)
      // TODO: Show error state
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

