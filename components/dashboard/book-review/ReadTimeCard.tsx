"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ReadTimeCardProps {
  minutes: number
  wordCount: number
}

export function ReadTimeCard({ minutes, wordCount }: ReadTimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <Clock className="h-6 w-6 text-[#a6261c]" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Estimated Read Time</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{minutes} minutes</p>
              <p className="text-xs text-gray-500">
                Based on ~{wordCount.toLocaleString()} words and average reading speed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

