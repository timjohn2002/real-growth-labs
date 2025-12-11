"use client"

import { Button } from "@/components/ui/button"
import {
  RefreshCw,
  Minus,
  Plus,
  FolderOpen,
  Save,
  Download,
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
  onOpenContentVault?: () => void
  onSave?: () => void
  onExport?: () => void
}

export function AIToolsPanel({ onAction, onOpenContentVault, onSave, onExport }: AIToolsPanelProps) {
  return (
    <div className="w-64 bg-card border-l border-border h-full flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
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

        {/* Content Vault */}
        {onOpenContentVault && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-[#a6261c] hover:bg-[#8e1e16] text-white hover:text-white border-[#a6261c]"
              onClick={onOpenContentVault}
            >
              <FolderOpen className="h-4 w-4 mr-2 text-white" />
              Add From Content Vault
            </Button>
          </div>
        )}

        {/* Save and Export Buttons - Fixed at bottom */}
        <div className="mt-auto pt-4 border-t border-border space-y-2">
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-[#a6261c] hover:bg-[#8e1e16] text-white hover:text-white border-[#a6261c]"
              onClick={onSave}
            >
              <Save className="h-4 w-4 mr-2 text-white" />
              Save
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

