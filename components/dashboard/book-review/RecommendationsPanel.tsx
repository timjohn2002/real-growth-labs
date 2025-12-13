"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

const BRAND_COLOR = "#a6261c"

interface Recommendation {
  id: string
  text: string
  chapter?: string
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[]
  onApplyFix: (id: string) => void
}

export function RecommendationsPanel({
  recommendations,
  onApplyFix,
}: RecommendationsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-[#a6261c]" />
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {rec.chapter && (
                      <span className="text-xs text-gray-500 mb-1 block">{rec.chapter}</span>
                    )}
                    <p className="text-sm text-gray-700">{rec.text}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApplyFix(rec.id)}
                    className="flex-shrink-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

