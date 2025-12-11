"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle2, AlertCircle, XCircle } from "lucide-react"

interface StructureSection {
  name: string
  status: "strong" | "good" | "weak"
  feedback: string
}

interface StructureFlowGraphProps {
  sections: StructureSection[]
}

const statusConfig = {
  strong: { color: "#10b981", icon: CheckCircle2, label: "Strong" },
  good: { color: "#f59e0b", icon: AlertCircle, label: "Good" },
  weak: { color: "#6b7280", icon: XCircle, label: "Needs work" },
}

export function StructureFlowGraph({ sections = [] }: StructureFlowGraphProps) {
  if (!sections || sections.length === 0) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Structure Analysis</h3>
          <p className="text-sm text-gray-500">No structure data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Structure Analysis</h3>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 overflow-x-auto pb-4">
            {sections.map((section, index) => {
              const config = statusConfig[section.status]
              const Icon = config.icon
              const percentage = section.status === "strong" ? 100 : section.status === "good" ? 60 : 30

              return (
                <div key={section.name} className="flex items-center min-w-[140px]">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="text-sm font-medium text-gray-900 text-center">
                      {section.name}
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Icon className="h-3 w-3" style={{ color: config.color }} />
                      <span style={{ color: config.color }}>{config.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">{section.feedback}</p>
                  </div>
                  {index < sections.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-gray-400 mx-2 flex-shrink-0 hidden md:block" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

