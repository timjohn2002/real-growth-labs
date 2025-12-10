"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Sparkles, 
  BarChart3, 
  Database, 
  Workflow,
  Headphones,
  FolderKanban,
  Search
} from "lucide-react"
import { AnimatedCard, CardVisual, Visual3 } from "@/components/ui/book-review-visualization"
import { PromptInputBox } from "@/components/ui/prompt-input-box"

const BRAND_COLOR = "#a6261c"

const featureSets = [
  // First 2x2 Grid
  [
    {
      title: "AI First Drafts",
      description:
        "First draft made by AI, then made editable by the user. Just type your topic, click, and watch the magic happen. Real Growth Labs's CoAuthor will outline and write your content for you so you're never stuck staring at a blank page.",
      icon: Sparkles,
      hasIllustration: true,
    },
    {
      title: "Book Review Metrics",
      description:
        "Breaks down the book created by metrics like proficiency, value provided, and read time.",
      icon: BarChart3,
      hasVisualization: true,
    },
    {
      title: "Content Database",
      description: "Train the AI with your podcasts, videos, voice notes, and links.",
      icon: Database,
      hasIcons: true,
    },
    {
      title: "Funnel Builder",
      description: "Simple funnel builder inside the book software to capture leads.",
      icon: Workflow,
    },
  ],
  // Second 2x2 Grid
  [
    {
      title: "One-Click Audiobook",
      description: "Instantly translate your created book into an audiobook.",
      icon: Headphones,
    },
    {
      title: "Organize Your Projects",
      description: "Effortlessly manage and access your projects whenever you need.",
      icon: FolderKanban,
      hasIcons: true,
    },
  ],
  // Two Cards Row
  [
    {
      title: "Built-in Search",
      description:
        "Built-in search to help you locate files, projects, and more—effortlessly.",
      icon: Search,
    },
  ],
]

export function AllFeatures() {
  return (
    <section className="py-20 bg-white dark:bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-tight"
              style={{ color: BRAND_COLOR }}
            >
              Everything You Need in One Place
            </h2>
          </motion.div>

          {/* Feature Grids */}
          <div className="space-y-12">
            {/* First 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureSets[0].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-white">
                      <CardContent className="p-6">
                        {feature.hasIllustration ? (
                          <div className="mb-4">
                            <PromptInputBox
                              placeholder="Write your prompt here..."
                              onSend={(message) => console.log("Message sent:", message)}
                            />
                          </div>
                        ) : feature.hasIcons ? (
                          <div className="mb-4">
                            {/* Icon for Content Database */}
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${BRAND_COLOR}20` }}
                            >
                              <Database className="h-5 w-5" style={{ color: BRAND_COLOR }} />
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${BRAND_COLOR}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color: BRAND_COLOR }} />
                            </div>
                          </div>
                        )}

                        <h3 className="text-xl font-bold text-black dark:text-black mb-3">{feature.title}</h3>
                        <p className="text-gray-700 dark:text-gray-700 text-sm leading-relaxed mb-4">
                          {feature.description}
                        </p>
                        {feature.hasVisualization && (
                          <div className="mt-4">
                            <AnimatedCard>
                              <CardVisual>
                                <Visual3 mainColor={BRAND_COLOR} secondaryColor="#d43a2e" />
                              </CardVisual>
                            </AnimatedCard>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Second Grid - 2 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {featureSets[1].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-white">
                      <CardContent className="p-6">
                        {feature.hasIcons ? (
                          <div className="mb-4">
                            {/* Icon for Organize Your Projects */}
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${BRAND_COLOR}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color: BRAND_COLOR }} />
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${BRAND_COLOR}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color: BRAND_COLOR }} />
                            </div>
                          </div>
                        )}

                        <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Single Card Row */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {featureSets[2].map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="mb-4">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${BRAND_COLOR}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color: BRAND_COLOR }} />
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

