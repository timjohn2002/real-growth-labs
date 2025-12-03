"use client"

import { Button } from "@/components/ui/button"
import {
  RefreshCw,
  Minus,
  Plus,
  MessageSquare,
  FileText,
  Users,
  Lightbulb,
  Heading,
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
    <div className="w-64 bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">AI Tools</h3>

        {/* Quick Actions */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Quick Actions
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
            <div className="pt-2">
              <Select onValueChange={(value) => onAction("changeTone", { tone: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Change tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="punchy">Punchy</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Story & Examples */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Story & Examples
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

        {/* Structure */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Structure
          </h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("suggestHeading")}
            >
              <Heading className="h-4 w-4 mr-2" />
              Suggest better heading
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onAction("suggestCTA")}
            >
              <Target className="h-4 w-4 mr-2" />
              Suggest CTA for this chapter
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

