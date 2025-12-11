"use client"

import { Button } from "@/components/ui/button"
import {
  RefreshCw,
  Minus,
  Plus,
  FolderOpen,
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
}

export function AIToolsPanel({ onAction, onOpenContentVault }: AIToolsPanelProps) {
  return (
    <div className="w-64 bg-card border-l border-border h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">AI Tools</h3>

        {/* Quick Actions */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
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
      </div>
    </div>
  )
}

