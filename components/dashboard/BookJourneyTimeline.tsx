"use client"

import { motion } from "framer-motion"
import { Upload, FileText, Edit, Workflow, Headphones, CheckCircle } from "lucide-react"

const BRAND_COLOR = "#a6261c"

const stages = [
  { name: "Import", icon: Upload },
  { name: "Draft", icon: FileText },
  { name: "Edit", icon: Edit },
  { name: "Funnel", icon: Workflow },
  { name: "Audiobook", icon: Headphones },
  { name: "Publish", icon: CheckCircle },
]

interface BookJourneyTimelineProps {
  currentStage: number // 0-5
  bookTitle?: string
}

export function BookJourneyTimeline({ currentStage = 2, bookTitle = "Marketing Guide" }: BookJourneyTimelineProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Book Journey Timeline</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
          <motion.div
            className="h-full bg-[#a6261c]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isCompleted = index <= currentStage
            const isCurrent = index === currentStage

            return (
              <div key={stage.name} className="flex flex-col items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? "bg-[#a6261c] border-[#a6261c]"
                      : "bg-white border-gray-300"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon
                    className={`h-5 w-5 ${isCompleted ? "text-white" : "text-gray-400"}`}
                  />
                </motion.div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCompleted ? "text-[#a6261c]" : "text-gray-500"
                  }`}
                >
                  {stage.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

