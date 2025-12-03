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
  const currentTaskIndex = tasks.findIndex((task) => task === currentTask)

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
        <p className="text-sm text-gray-600">{currentTask || "Starting..."}</p>
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
          const isActive = index === currentTaskIndex
          const isCompleted = index < currentTaskIndex
          return (
            <motion.div
              key={task}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 text-sm ${
                isActive
                  ? "text-[#a6261c] font-medium"
                  : isCompleted
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive
                    ? "bg-[#a6261c] animate-pulse"
                    : isCompleted
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <span>{task}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

