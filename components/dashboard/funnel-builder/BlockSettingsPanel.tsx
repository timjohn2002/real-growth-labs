"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Block, BlockType } from "./FunnelCanvas"

interface BlockSettingsPanelProps {
  selectedBlock: Block | null
  onUpdateBlock: (blockId: string, data: any) => void
}

export function BlockSettingsPanel({ selectedBlock, onUpdateBlock }: BlockSettingsPanelProps) {
  if (!selectedBlock) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 h-full flex items-center justify-center">
        <p className="text-sm text-gray-500 text-center px-4">
          Select a block to edit its settings
        </p>
      </div>
    )
  }

  const handleUpdate = (field: string, value: any) => {
    onUpdateBlock(selectedBlock.id, {
      ...selectedBlock.data,
      [field]: value,
    })
  }

  const renderSettings = () => {
    switch (selectedBlock.type) {
      case "headline":
        return (
          <div className="space-y-4">
            <div>
              <Label>Headline Text</Label>
              <Input
                value={selectedBlock.data.text || ""}
                onChange={(e) => handleUpdate("text", e.target.value)}
              />
            </div>
            <div>
              <Label>Font Size</Label>
              <input
                type="range"
                min="24"
                max="72"
                value={selectedBlock.data.fontSize || 48}
                onChange={(e) => handleUpdate("fontSize", parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedBlock.data.fontSize || 48}px
              </p>
            </div>
            <div>
              <Label>Alignment</Label>
              <div className="flex gap-2 mt-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => handleUpdate("alignment", align)}
                    className={`px-3 py-1 rounded text-sm ${
                      (selectedBlock.data.alignment || "center") === align
                        ? "bg-[#a6261c] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {(["black", "red", "white"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleUpdate("color", color)}
                    className={`px-3 py-1 rounded text-sm ${
                      (selectedBlock.data.color || "black") === color
                        ? "bg-[#a6261c] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case "subheadline":
        return (
          <div className="space-y-4">
            <div>
              <Label>Subheadline Text</Label>
              <Textarea
                value={selectedBlock.data.text || ""}
                onChange={(e) => handleUpdate("text", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>Alignment</Label>
              <div className="flex gap-2 mt-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => handleUpdate("alignment", align)}
                    className={`px-3 py-1 rounded text-sm ${
                      (selectedBlock.data.alignment || "center") === align
                        ? "bg-[#a6261c] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case "book-cover":
        return (
          <div className="space-y-4">
            <div>
              <Label>Book Cover Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = URL.createObjectURL(file)
                    handleUpdate("imageUrl", url)
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showShadow"
                checked={selectedBlock.data.showShadow !== false}
                onChange={(e) => handleUpdate("showShadow", e.target.checked)}
              />
              <Label htmlFor="showShadow">Show shadow</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="roundedCorners"
                checked={selectedBlock.data.roundedCorners === true}
                onChange={(e) => handleUpdate("roundedCorners", e.target.checked)}
              />
              <Label htmlFor="roundedCorners">Rounded corners</Label>
            </div>
          </div>
        )

      case "lead-form":
        return (
          <div className="space-y-4">
            <div>
              <Label>Button Text</Label>
              <Input
                value={selectedBlock.data.buttonText || "Get the free book"}
                onChange={(e) => handleUpdate("buttonText", e.target.value)}
              />
            </div>
            <div>
              <Label>Button Color</Label>
              <Input
                type="color"
                value={selectedBlock.data.buttonColor || "#a6261c"}
                onChange={(e) => handleUpdate("buttonColor", e.target.value)}
              />
            </div>
            <div>
              <Label>Success Redirect</Label>
              <Select
                value={selectedBlock.data.redirect || "thank-you"}
                onValueChange={(value) => handleUpdate("redirect", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thank-you">Thank-You Page</SelectItem>
                  <SelectItem value="custom">Custom URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "testimonial":
        return (
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={selectedBlock.data.name || ""}
                onChange={(e) => handleUpdate("name", e.target.value)}
              />
            </div>
            <div>
              <Label>Quote</Label>
              <Textarea
                value={selectedBlock.data.quote || ""}
                onChange={(e) => handleUpdate("quote", e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label>Photo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = URL.createObjectURL(file)
                    handleUpdate("photoUrl", url)
                  }
                }}
              />
            </div>
            <div>
              <Label>Company / Role</Label>
              <Input
                value={selectedBlock.data.company || ""}
                onChange={(e) => handleUpdate("company", e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div>
              <Input
                value={selectedBlock.data.role || ""}
                onChange={(e) => handleUpdate("role", e.target.value)}
                placeholder="Role"
                className="mt-2"
              />
            </div>
          </div>
        )

      case "cta":
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={selectedBlock.data.title || ""}
                onChange={(e) => handleUpdate("title", e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={selectedBlock.data.description || ""}
                onChange={(e) => handleUpdate("description", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input
                value={selectedBlock.data.buttonText || "Download Now"}
                onChange={(e) => handleUpdate("buttonText", e.target.value)}
              />
            </div>
            <div>
              <Label>Button URL / Calendar Link</Label>
              <Input
                value={selectedBlock.data.buttonUrl || ""}
                onChange={(e) => handleUpdate("buttonUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Button Color</Label>
              <Input
                type="color"
                value={selectedBlock.data.buttonColor || "#a6261c"}
                onChange={(e) => handleUpdate("buttonColor", e.target.value)}
              />
            </div>
          </div>
        )

      case "video":
        return (
          <div className="space-y-4">
            <div>
              <Label>Video URL (YouTube/Vimeo)</Label>
              <Input
                value={selectedBlock.data.videoUrl || ""}
                onChange={(e) => handleUpdate("videoUrl", e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoplay"
                checked={selectedBlock.data.autoplay === true}
                onChange={(e) => handleUpdate("autoplay", e.target.checked)}
              />
              <Label htmlFor="autoplay">Autoplay</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="muted"
                checked={selectedBlock.data.muted === true}
                onChange={(e) => handleUpdate("muted", e.target.checked)}
              />
              <Label htmlFor="muted">Muted</Label>
            </div>
          </div>
        )

      default:
        return <p className="text-sm text-gray-500">No settings available</p>
    }
  }

  return (
    <div className="w-64 bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Block Settings</h3>
        {renderSettings()}
      </div>
    </div>
  )
}

