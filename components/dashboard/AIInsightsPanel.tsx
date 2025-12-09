"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const insights = [
  "Your Marketing Guide draft is 65% done — continue writing?",
  "You added 12 minutes of new content this week.",
  "Your Business Strategy book has strong chapter flow. Want a rewrite suggestion?",
  "Your book funnel conversion could increase by adding a CTA in chapter 3.",
  "Your audiobook is ready to generate.",
  "Chapter 2 could benefit from a case study example.",
]

export function AIInsightsPanel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length)
    }, 5000) // Rotate every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-[#a6261c]" />
          <h3 className="text-sm font-semibold text-foreground">AI Insights for You</h3>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-foreground"
          >
            {insights[currentIndex]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1 mt-3">
          {insights.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index === currentIndex ? "bg-[#a6261c]" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

