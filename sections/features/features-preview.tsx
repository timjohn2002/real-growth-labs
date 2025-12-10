"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Zap, DollarSign, HelpCircle, Check } from "lucide-react"

const BRAND_COLOR = "#a6261c"

const problemSolutions = [
  {
    icon: Clock,
    problemTitle: "It Takes Too Long",
    problemDescription:
      "When you have to design everything yourself in Canva & Photoshop, it takes hours to design just one piece of content",
    solution: "Get a first draft made by AI instantly, then edit it to perfection. No more cold starts.",
  },
  {
    icon: Zap,
    problemTitle: "It's Not Fun",
    problemDescription:
      "Using old-school design tools just isn't fun. Constantly dragging things around, messing up and starting over is a drag",
    solution: "Use our simple funnel builder inside the software to turn your book into a business asset.",
  },
  {
    icon: DollarSign,
    problemTitle: "It's Too Expensive",
    problemDescription:
      "It takes $100 every time you want a new ebook, audio book, lead magnet or funnel designed.",
    solution: "Create a lead magnet book that funnels directly into your high-ticket offer.",
  },
  {
    icon: HelpCircle,
    problemTitle: "You Can't Find Anything",
    problemDescription:
      "Ever spent hours looking for stuff in Dropbox, Notes, Figma, Notion, Google Docs, or Files?",
    solution: "Feed the AI with podcasts, videos, and notes so it knows exactly what to write.",
  },
]

export function FeaturesPreview() {
  return (
    <section className="py-20 bg-white dark:bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-black leading-tight">
              Everything You Need to Build a <span style={{ color: BRAND_COLOR }}>High-Impact Book</span> That Grows Your Business.
            </h2>
          </motion.div>

          {/* Problem-Solution Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problemSolutions.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.problemTitle}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-white">
                    <CardContent className="p-6">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: BRAND_COLOR }}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Problem Title */}
                      <h3 className="text-xl font-bold text-black dark:text-black mb-3">{item.problemTitle}</h3>

                      {/* Problem Description */}
                      <p className="text-gray-700 dark:text-gray-700 text-sm mb-4 leading-relaxed">
                        {item.problemDescription}
                      </p>

                      {/* Solution */}
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 dark:text-gray-700 text-sm leading-relaxed">{item.solution}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
