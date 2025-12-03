"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface ValueMetric {
  label: string
  value: string | number
  level: "High" | "Medium" | "Low"
}

interface ValueBreakdownProps {
  metrics: ValueMetric[]
}

const levelColors = {
  High: "#10b981",
  Medium: "#f59e0b",
  Low: "#6b7280",
}

export function ValueBreakdown({ metrics }: ValueBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Value Score Deep Dive</h3>
          <div className="space-y-4">
            {metrics.map((metric, index) => {
              const percentage =
                metric.level === "High" ? 100 : metric.level === "Medium" ? 60 : 30
              return (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      {typeof metric.value === "number" && (
                        <span className="text-sm font-medium text-gray-900">
                          {metric.value}
                        </span>
                      )}
                      {typeof metric.value === "string" && (
                        <span
                          className="text-sm font-medium"
                          style={{ color: levelColors[metric.level] }}
                        >
                          {metric.value}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: levelColors[metric.level] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

