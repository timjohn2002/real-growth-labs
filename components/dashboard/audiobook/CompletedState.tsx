"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AudiobookPlayer } from "./AudiobookPlayer"

const BRAND_COLOR = "#a6261c"

interface CompletedStateProps {
  audioUrl: string | null
  duration: number
  voice: string
  onRegenerate: () => void
  onClose: () => void
}

export function CompletedState({
  audioUrl,
  duration,
  voice,
  onRegenerate,
  onClose,
}: CompletedStateProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleDownload = async () => {
    if (!audioUrl || audioUrl === "/placeholder-audio.mp3") {
      alert("Audio file is not available for download. The audiobook may still be generating.")
      return
    }

    try {
      // Fetch the audio file
      const response = await fetch(audioUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch audio file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `audiobook-${Date.now()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download audiobook. Please try again.")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="text-4xl mb-2">🎧</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Your Audiobook is Ready</h3>
        <p className="text-sm text-gray-600">
          Total length: {formatTime(duration)} • Voice: {voice}
        </p>
      </div>

      {/* Audio Player */}
      <div className="bg-gray-50 rounded-lg p-6">
        <AudiobookPlayer audioUrl={audioUrl || ""} duration={duration} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download MP3
        </Button>
        <span className="text-gray-400">•</span>
        <Button
          variant="ghost"
          onClick={onRegenerate}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate Voice
        </Button>
      </div>
    </motion.div>
  )
}

