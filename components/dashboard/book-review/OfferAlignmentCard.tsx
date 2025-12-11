"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

interface AlignmentMetric {
  label: string
  value: "High" | "Medium" | "Weak"
  score: number
}

interface OfferAlignmentCardProps {
  overallScore: number
  metrics: AlignmentMetric[]
  recommendation: string
}

const valueColors = {
  High: "#10b981",
  Medium: "#f59e0b",
  Weak: "#6b7280",
}

export function OfferAlignmentCard({
  overallScore,
  metrics = [],
  recommendation,
}: OfferAlignmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Offer Alignment Breakdown</h3>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{overallScore}</span>
              <span className="text-sm text-gray-500"> / 100</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {metrics.map((metric, index) => {
              const percentage = metric.value === "High" ? 100 : metric.value === "Medium" ? 60 : 30
              return (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">{metric.label}</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: valueColors[metric.value] }}
                    >
                      {metric.value}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: valueColors[metric.value] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Recommendation</p>
                <p className="text-sm text-blue-800">{recommendation}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

