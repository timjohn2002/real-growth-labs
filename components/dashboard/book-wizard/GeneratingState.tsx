"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

const BRAND_COLOR = "#a6261c"

interface GeneratingStateProps {
  progress?: {
    current: number
    total: number
    currentChapter: string
  } | null
}

export function GeneratingState({ progress }: GeneratingStateProps) {
  const progressPercent = progress 
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  const displayMessage = progress
    ? `Generating ${progress.currentChapter}... (${progress.current}/${progress.total})`
    : "Starting generation..."

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-6"
      >
        <Loader2 className="h-12 w-12" style={{ color: BRAND_COLOR }} />
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={displayMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-lg text-foreground mb-4">{displayMessage}</p>
          
          {progress && (
            <div className="w-full max-w-md">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <motion.div
                  className="h-2.5 rounded-full"
                  style={{ backgroundColor: BRAND_COLOR }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {progressPercent}% complete
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

