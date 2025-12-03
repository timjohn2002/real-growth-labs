"use client"

import { useState } from "react"
import { ReviewHeader } from "@/components/dashboard/book-review/ReviewHeader"
import { ScoreGaugesRow } from "@/components/dashboard/book-review/ScoreGaugesRow"
import { ReadTimeCard } from "@/components/dashboard/book-review/ReadTimeCard"
import { ComplexityCard } from "@/components/dashboard/book-review/ComplexityCard"
import { StructureFlowGraph } from "@/components/dashboard/book-review/StructureFlowGraph"
import { OfferAlignmentCard } from "@/components/dashboard/book-review/OfferAlignmentCard"
import { ProficiencyBreakdown } from "@/components/dashboard/book-review/ProficiencyBreakdown"
import { ValueBreakdown } from "@/components/dashboard/book-review/ValueBreakdown"
import { RecommendationsPanel } from "@/components/dashboard/book-review/RecommendationsPanel"
import { ActionFooter } from "@/components/dashboard/book-review/ActionFooter"
import { useRouter } from "next/navigation"

export default function BookReviewPage() {
  const router = useRouter()
  const [lastAnalyzed, setLastAnalyzed] = useState("3 minutes ago")

  const scores = [
    { label: "Proficiency Score", value: 84 },
    { label: "Value Score", value: 92 },
    { label: "Offer Alignment", value: 76 },
    { label: "Structure Score", value: 88 },
    { label: "Lead Magnet Readiness", value: 81 },
  ]

  const structureSections = [
    { name: "Intro", status: "strong" as const, feedback: "Strong" },
    { name: "Story", status: "weak" as const, feedback: "Weak transitions" },
    { name: "Framework", status: "strong" as const, feedback: "Excellent" },
    { name: "Steps", status: "good" as const, feedback: "Good" },
    { name: "Case Studies", status: "weak" as const, feedback: "Needs examples" },
    { name: "CTA", status: "strong" as const, feedback: "Strong" },
  ]

  const offerAlignmentMetrics = [
    { label: "Mentions of offer", value: "High" as const, score: 85 },
    { label: "Relevance of story to offer", value: "Medium" as const, score: 65 },
    { label: "CTA strength", value: "Medium" as const, score: 70 },
    { label: "Logical bridges from content → offer", value: "Weak" as const, score: 40 },
  ]

  const proficiencyMetrics = [
    { label: "Clarity", score: 88, suggestion: "Good pacing" },
    { label: "Authority", score: 79, suggestion: "Improve tone consistency" },
    { label: "Accuracy", score: 82, suggestion: "Add more concrete numbers" },
  ]

  const valueMetrics = [
    { label: "Practical tips count", value: 14, level: "High" as const },
    { label: "Unique insights", value: "High", level: "High" as const },
    { label: "Repetitiveness", value: "Low", level: "Low" as const },
    { label: "Fluff detected", value: "Medium", level: "Medium" as const },
  ]

  const recommendations = [
    {
      id: "1",
      text: "Add a case study to Chapter 2.",
      chapter: "Chapter 2: Your Story",
    },
    {
      id: "2",
      text: "Your intro is strong. Consider shortening paragraph 4.",
      chapter: "Introduction",
    },
    {
      id: "3",
      text: "Include a CTA at the end of the framework section.",
      chapter: "Chapter 3: Framework Overview",
    },
    {
      id: "4",
      text: "Simplify jargon in Chapter 5.",
      chapter: "Chapter 5: Implementation Plan",
    },
  ]

  const handleRunAgain = () => {
    setLastAnalyzed("just now")
    // TODO: Trigger new analysis
  }

  const handleApplyFix = (id: string) => {
    console.log("Apply fix:", id)
    // TODO: Navigate to editor and highlight section
    router.push("/dashboard/book-editor")
  }

  const handleOpenEditor = () => {
    router.push("/dashboard/book-editor")
  }

  const handleApplyAllFixes = () => {
    console.log("Apply all fixes")
    // TODO: Apply all recommendations
    router.push("/dashboard/book-editor")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReviewHeader lastAnalyzed={lastAnalyzed} onRunAgain={handleRunAgain} />

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Score Gauges */}
          <ScoreGaugesRow scores={scores} />

          {/* Read Time & Complexity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadTimeCard minutes={43} wordCount={18320} />
            <ComplexityCard level="Beginner-friendly" />
          </div>

          {/* Structure Flow Graph */}
          <StructureFlowGraph sections={structureSections} />

          {/* Offer Alignment */}
          <OfferAlignmentCard
            overallScore={76}
            metrics={offerAlignmentMetrics}
            recommendation="Add stronger transition sentences between Step 3 and Step 4 to position your high-ticket offer as the natural next step."
          />

          {/* Proficiency Breakdown */}
          <ProficiencyBreakdown metrics={proficiencyMetrics} />

          {/* Value Breakdown */}
          <ValueBreakdown metrics={valueMetrics} />

          {/* Recommendations Panel */}
          <RecommendationsPanel
            recommendations={recommendations}
            onApplyFix={handleApplyFix}
          />

          {/* Action Footer */}
          <ActionFooter
            onOpenEditor={handleOpenEditor}
            onApplyAllFixes={handleApplyAllFixes}
          />
        </div>
      </div>
    </div>
  )
}
