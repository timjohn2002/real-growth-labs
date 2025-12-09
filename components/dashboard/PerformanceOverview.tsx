"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Edit, Clock, Headphones, TrendingUp } from "lucide-react"

const metrics = [
  { label: "Words written", value: "12,450", icon: FileText, color: "#a6261c" },
  { label: "Chapters improved", value: "8", icon: Edit, color: "#a6261c" },
  { label: "Reading time", value: "2.5h", icon: Clock, color: "#a6261c" },
  { label: "Audiobook length", value: "45min", icon: Headphones, color: "#a6261c" },
  { label: "Funnel conversion", value: "12%", icon: TrendingUp, color: "#a6261c" },
]

export function PerformanceOverview() {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Performance Overview</h3>
        <div className="space-y-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{metric.value}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

