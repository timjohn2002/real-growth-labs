"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const BRAND_COLOR = "#a6261c"

interface ScoreGaugeProps {
  score: number
  label: string
  size?: number
}

export function ScoreGauge({ score, label, size = 120 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const getColor = () => {
    if (score >= 80) return BRAND_COLOR
    if (score >= 60) return "#f59e0b"
    return "#6b7280"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "easeOut" }}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{Math.round(animatedScore)}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2 text-center">{label}</p>
    </motion.div>
  )
}

