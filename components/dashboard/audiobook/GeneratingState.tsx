"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

const BRAND_COLOR = "#a6261c"

interface GeneratingStateProps {
  progress: number
  currentTask: string
}

const tasks = [
  "Preparing chapters...",
  "Converting to speech...",
  "Rendering Chapter 1...",
  "Rendering Chapter 2...",
  "Stitching audio files...",
  "Adding intro/outro...",
  "Finalizing file...",
]

export function GeneratingState({ progress, currentTask }: GeneratingStateProps) {
  // Map progress percentage to active step index
  // Steps light up progressively as progress increases
  const getActiveStepIndex = (progress: number): number => {
    if (progress < 5) return 0  // Preparing chapters...
    if (progress < 15) return 1  // Converting to speech...
    if (progress < 30) return 2  // Rendering Chapter 1...
    if (progress < 50) return 3  // Rendering Chapter 2...
    if (progress < 70) return 4  // Stitching audio files...
    if (progress < 85) return 5  // Adding intro/outro...
    if (progress < 100) return 6 // Finalizing file...
    return 6 // All complete
  }

  const activeStepIndex = getActiveStepIndex(progress)

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-4"
        >
          <Loader2 className="h-12 w-12" style={{ color: BRAND_COLOR }} />
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating your audiobook...</h3>
        <p className="text-sm text-gray-600">{currentTask || tasks[activeStepIndex] || "Starting..."}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: BRAND_COLOR }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">{progress}%</p>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task, index) => {
          const isActive = index === activeStepIndex
          const isCompleted = index < activeStepIndex
          return (
            <motion.div
              key={task}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                color: isActive ? BRAND_COLOR : isCompleted ? "#6b7280" : "#9ca3af"
              }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                isActive
                  ? "text-[#a6261c] font-semibold"
                  : isCompleted
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              <motion.div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-[#a6261c]"
                    : isCompleted
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
                animate={isActive ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
              />
              <span>{task}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

