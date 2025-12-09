"use client"

import { Button } from "@/components/ui/button"
import {
  RefreshCw,
  Minus,
  Plus,
  FileText,
  Users,
  Lightbulb,
  Heading,
  FileCheck,
  MessageSquare,
  Target,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BRAND_COLOR = "#a6261c"

interface AIToolsPanelProps {
  onAction: (action: string, params?: any) => void
}

export function AIToolsPanel({ onAction }: AIToolsPanelProps) {
  return (
    <div className="w-64 bg-card border-l border-border h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">AI Tools</h3>
        <p className="text-xs text-muted-foreground mb-4">Select text or a section, then choose an action.</p>

        {/* Rewrite & Style */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Rewrite & Style
          </h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("rewrite")}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rewrite
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("shorten")}
            >
              <Minus className="h-4 w-4 mr-2" />
              Shorten
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("expand")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Expand
            </Button>
            <Select onValueChange={(value) => onAction("changeTone", { tone: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Change tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="story-driven">Story-driven</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Enhance & Story */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Enhance & Story
          </h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("addStory")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add story example
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("addCaseStudy")}
            >
              <Users className="h-4 w-4 mr-2" />
              Add client case study
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("addAnalogy")}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Add analogy
            </Button>
          </div>
        </div>

        {/* Structure & Clarity */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Structure & Clarity
          </h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("improveHeading")}
            >
              <Heading className="h-4 w-4 mr-2" />
              Improve heading
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("summarize")}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Summarize section
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("clarify")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Clarify explanation
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("addCTA")}
            >
              <Target className="h-4 w-4 mr-2" />
              Add CTA to this chapter
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

