import { Hero } from "@/components/Hero"
import { FeatureCards } from "@/components/FeatureCards"
import { Workflow, BookOpen, Database, BarChart3, Headphones } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Features",
  description: "Discover all the powerful features Real Growth Labs has to offer for creating books, lead magnets, and audiobooks.",
}

const detailedFeatures = [
  {
    icon: Workflow,
    title: "Funnel Builder",
    description: "Create complete marketing funnels to turn your books into lead magnets and revenue streams. Design landing pages, email sequences, and conversion paths all in one place.",
    details: [
      "Drag-and-drop funnel builder",
      "Pre-built templates",
      "Email automation",
      "A/B testing tools",
      "Conversion tracking",
    ],
  },
  {
    icon: BookOpen,
    title: "AI Book Engine",
    description: "Transform your knowledge into well-structured books using advanced AI technology. Our engine understands context, maintains your voice, and creates professional content.",
    details: [
      "AI-powered content generation",
      "Multi-format support",
      "Smart chapter organization",
      "Style customization",
      "Export to multiple formats",
    ],
  },
  {
    icon: Database,
    title: "Content Knowledge Base",
    description: "Import from podcasts, videos, voice notes, and URLs to build your knowledge repository. All your content in one organized place.",
    details: [
      "Podcast import",
      "YouTube video transcription",
      "Voice note processing",
      "URL content extraction",
      "Smart content organization",
    ],
  },
  {
    icon: BarChart3,
    title: "Book Review Metrics",
    description: "Track engagement, reviews, and performance metrics for all your published books. Understand what resonates with your audience.",
    details: [
      "Real-time analytics",
      "Engagement tracking",
      "Review monitoring",
      "Performance dashboards",
      "Export reports",
    ],
  },
  {
    icon: Headphones,
    title: "1-Click Audiobook Generator",
    description: "Convert your books to professional audiobooks with a single click. High-quality voice synthesis with natural intonation.",
    details: [
      "One-click conversion",
      "Multiple voice options",
      "Professional quality",
      "Multiple format export",
      "Background music options",
    ],
  },
]

export default function FeaturesPage() {
  return (
    <>
      <Hero
        title={
          <>
            Powerful Features for{" "}
            <span className="text-[#a6261c]">Real Growth</span>
          </>
        }
        subtitle="Everything you need to turn your knowledge into books, lead magnets, and audiobooks."
      />
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {detailedFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
                >
                  <div className="flex-1">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(166, 38, 28, 0.1)" }}>
                      <Icon className="h-8 w-8 text-[#a6261c]" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-start">
                          <span className="text-[#a6261c] mr-2">✓</span>
                          <span className="text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
                      <span className="text-gray-400">Feature Screenshot Placeholder</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              All Features at a Glance
            </h2>
          </div>
          <FeatureCards />
        </div>
      </section>
    </>
  )
}
