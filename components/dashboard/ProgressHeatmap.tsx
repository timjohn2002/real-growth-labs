"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

const BRAND_COLOR = "#a6261c"

// Generate 7 weeks of data (7 rows x 7 days)
const generateHeatmapData = () => {
  const data: number[][] = []
  for (let week = 0; week < 7; week++) {
    const weekData: number[] = []
    for (let day = 0; day < 7; day++) {
      // Random activity level (0-4)
      weekData.push(Math.floor(Math.random() * 5))
    }
    data.push(weekData)
  }
  return data
}

const heatmapData = generateHeatmapData()

const getColorIntensity = (level: number) => {
  const colors = [
    "bg-muted",
    "bg-[#a6261c]/20",
    "bg-[#a6261c]/40",
    "bg-[#a6261c]/60",
    "bg-[#a6261c]",
  ]
  return colors[level] || colors[0]
}

export function ProgressHeatmap() {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Activity Heatmap</h3>
        <div className="flex gap-1">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  className={`w-3 h-3 rounded ${getColorIntensity(day)}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded ${getColorIntensity(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}

