"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const recommendations = [
  "Add a case study to Chapter 4",
  "Your intro could be more concise — want to tighten it?",
  "Your audiobook is ready to generate.",
  "Consider adding a visual diagram to Chapter 2",
  "Your funnel needs a stronger CTA on page 3",
]

export function BookRecommendations() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length)
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#a6261c]" />
            <h3 className="text-sm font-semibold text-gray-900">Recommendations</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={prev}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={next}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-gray-700"
          >
            {recommendations[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

