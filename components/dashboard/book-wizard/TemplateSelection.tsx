"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"

const BRAND_COLOR = "#a6261c"

const templates = [
  {
    id: "authority",
    title: "Authority Book",
    subtitle: "Establish yourself as the go-to expert.",
    bullets: [
      "Ideal for: coaches, consultants",
      "Structure: frameworks + insights",
    ],
    popular: true,
  },
  {
    id: "lead-magnet",
    title: "Lead Magnet Book",
    subtitle: "Short, punchy book that drives inbound leads.",
    bullets: [
      "Ideal for: list building",
      "Structure: quick wins + CTA",
    ],
    popular: false,
  },
  {
    id: "case-study",
    title: "Case Study Book",
    subtitle: "Stories of client transformations and proof.",
    bullets: [
      "Ideal for: showcasing results",
      "Structure: stories + outcomes",
    ],
    popular: false,
  },
  {
    id: "personal-story",
    title: "Personal Story Book",
    subtitle: "Tell your story and embed your method.",
    bullets: [
      "Ideal for: personal brands",
      "Structure: narrative + framework",
    ],
    popular: false,
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">1. Choose a book template</h2>
        <p className="text-gray-600">Pick the structure that best matches the outcome you want.</p>
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
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() => onSelectTemplate(template.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{template.title}</h3>
                      <p className="text-gray-600 mb-4">{template.subtitle}</p>
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
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-[#a6261c]/10 text-[#a6261c] rounded-full mb-3">
                      Most popular
                    </span>
                  )}
                  <ul className="space-y-1">
                    {template.bullets.map((bullet, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
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

