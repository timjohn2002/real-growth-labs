"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, Download, MoreVertical, CheckCircle2, Clock, Headphones, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const BRAND_COLOR = "#a6261c"

interface EditorTopBarProps {
  bookTitle: string
  status: "draft" | "published"
  lastUpdated: string
  onTitleChange: (title: string) => void
  onPreview: () => void
  onExport: () => void
  onGenerateAudiobook?: () => void
  onRunBookReview?: () => void
}

export function EditorTopBar({
  bookTitle,
  status,
  lastUpdated,
  onTitleChange,
  onPreview,
  onExport,
  onGenerateAudiobook,
  onRunBookReview,
}: EditorTopBarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(bookTitle)

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    onTitleChange(title)
  }

  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4 flex-1">
          <Link href="/dashboard">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleBlur()
                }
              }}
              className="text-lg font-semibold text-foreground border-none outline-none focus:ring-0 px-2 py-1 -mx-2 -my-1 bg-muted rounded"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-lg font-semibold text-foreground hover:bg-muted px-2 py-1 rounded transition-colors"
            >
              {title || "Untitled Book"}
            </button>
          )}
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              status === "published"
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {status === "published" ? "Published" : "Draft"}
          </span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated {lastUpdated}</span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {onRunBookReview && (
            <Button variant="ghost" size="sm" onClick={onRunBookReview}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Run Book Review
            </Button>
          )}
          {onGenerateAudiobook && (
            <Button variant="ghost" size="sm" onClick={onGenerateAudiobook}>
              <Headphones className="h-4 w-4 mr-2" />
              Generate Audiobook
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="ghost" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            align="right"
          >
            <DropdownMenuItem>Version history</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

