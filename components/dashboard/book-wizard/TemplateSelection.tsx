"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"

const BRAND_COLOR = "#a6261c"

const templates = [
  {
    id: "real-growth-book",
    title: "Real Growth Book",
    subtitle: "The proven framework for turning your expertise into a high-converting lead magnet.",
    bullets: [
      "Ideal for: coaches, consultants, experts",
      "Structure: 10 chapters + conclusion",
      "Includes: Self-assessments, case studies, step-by-step framework",
      "Designed to: Convert readers into high-ticket clients",
    ],
    popular: true,
  },
]

interface TemplateSelectionProps {
  selectedTemplate: string | null
  onSelectTemplate: (templateId: string) => void
}

export function TemplateSelection({ selectedTemplate, onSelectTemplate }: TemplateSelectionProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">1. Choose a book template</h2>
        <p className="text-muted-foreground">Pick the structure that best matches the outcome you want.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {templates.map((template, index) => {
          const isSelected = selectedTemplate === template.id
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <Card
                className={`border-2 cursor-pointer transition-all h-full ${
                  isSelected
                    ? "border-[#a6261c] shadow-md"
                    : "border-border hover:border-[#a6261c]/50 hover:shadow-md"
                }`}
                onClick={() => onSelectTemplate(template.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{template.title}</h3>
                      <p className="text-muted-foreground mb-4">{template.subtitle}</p>
                    </div>
                    {isSelected && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  {template.popular && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-[#a6261c]/10 dark:bg-[#a6261c]/20 text-[#a6261c] rounded-full mb-3">
                      Most popular
                    </span>
                  )}
                  <ul className="space-y-1">
                    {template.bullets.map((bullet, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

