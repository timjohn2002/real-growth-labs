"use client"

import { motion } from "framer-motion"
import { Gauge } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ComplexityCardProps {
  level: "Beginner-friendly" | "Intermediate" | "Advanced"
}

const levelColors = {
  "Beginner-friendly": "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-700",
}

export function ComplexityCard({ level }: ComplexityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <Gauge className="h-6 w-6 text-[#a6261c]" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Complexity Level</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${levelColors[level]}`}
              >
                {level}
              </span>
              <p className="text-xs text-gray-500">
                AI analyzed sentence density, jargon, and topic depth.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

