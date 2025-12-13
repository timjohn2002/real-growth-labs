"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface ProficiencyMetric {
  label: string
  score: number
  suggestion: string
}

interface ProficiencyBreakdownProps {
  metrics: ProficiencyMetric[]
}

export function ProficiencyBreakdown({ metrics }: ProficiencyBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Proficiency Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric, index) => {
              const percentage = metric.score
              const color = percentage >= 80 ? "#a6261c" : percentage >= 60 ? "#f59e0b" : "#6b7280"
              return (
                <div key={metric.label} className="text-center">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
                    <div className="relative w-24 h-24 mx-auto">
                      <svg width={96} height={96} className="transform -rotate-90">
                        <circle
                          cx={48}
                          cy={48}
                          r={40}
                          stroke="#e5e7eb"
                          strokeWidth={8}
                          fill="none"
                        />
                        <motion.circle
                          cx={48}
                          cy={48}
                          r={40}
                          stroke={color}
                          strokeWidth={8}
                          fill="none"
                          strokeLinecap="round"
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (percentage / 100) * 251.2 }}
                          transition={{ duration: 1.5, delay: 0.7 + index * 0.1 }}
                          strokeDasharray={251.2}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">{metric.score}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{metric.suggestion}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

