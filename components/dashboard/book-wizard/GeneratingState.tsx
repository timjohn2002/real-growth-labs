"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

const BRAND_COLOR = "#a6261c"

const statusMessages = [
  "Analyzing your answers…",
  "Designing book structure…",
  "Writing Chapter 1…",
  "Writing Chapter 2…",
  "Writing Chapter 3…",
  "Writing Chapter 4…",
  "Writing Chapter 5…",
  "Writing Chapter 6…",
  "Writing Chapter 7…",
  "Writing Chapter 8…",
  "Writing Chapter 9…",
  "Writing Introduction…",
  "Writing Conclusion…",
  "Finalizing your book…",
]

export function GeneratingState() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % statusMessages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-6"
      >
        <Loader2 className="h-12 w-12" style={{ color: BRAND_COLOR }} />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentMessageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-lg text-foreground"
        >
          {statusMessages[currentMessageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

