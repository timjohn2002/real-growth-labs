"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  BookOpen, 
  Database, 
  Headphones,
  Zap,
  Workflow
} from "lucide-react"
import { FEATURES } from "@/lib/constants"

const iconMap = {
  Funnel: Workflow,
  Book: BookOpen,
  Database: Database,
  BarChart: BarChart3,
  Headphones: Headphones,
  Zap: Zap,
}

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {FEATURES.map((feature, index) => {
        const Icon = iconMap[feature.icon as keyof typeof iconMap] || BookOpen
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow border-gray-100">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(166, 38, 28, 0.1)" }}>
                  <Icon className="h-6 w-6 text-[#a6261c]" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

