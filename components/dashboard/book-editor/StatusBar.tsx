"use client"

import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface StatusBarProps {
  saveStatus: "saving" | "saved" | "error"
  wordCount: number
  chapterCount: number
}

export function StatusBar({ saveStatus, wordCount, chapterCount }: StatusBarProps) {
  return (
    <div className="border-t border-gray-200 bg-gray-50 px-6 py-2">
      <div className="flex items-center justify-between text-xs text-gray-600">
        {/* Left: Save Status */}
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {saveStatus === "saving" && (
              <motion.div
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                <Clock className="h-3 w-3 animate-spin" />
                <span>Autosaving…</span>
              </motion.div>
            )}
            {saveStatus === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1 text-green-600"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Saved just now</span>
              </motion.div>
            )}
            {saveStatus === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-red-600"
              >
                <AlertCircle className="h-3 w-3" />
                <span>Could not save – retrying</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center: Word Count */}
        <div className="flex items-center gap-1">
          <span>{wordCount.toLocaleString()} words</span>
          <span>·</span>
          <span>{chapterCount} chapters</span>
        </div>

        {/* Right: Empty for now */}
        <div></div>
      </div>
    </div>
  )
}

