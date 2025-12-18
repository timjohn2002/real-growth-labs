"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BRAND_COLOR = "#a6261c"

interface BookOverviewProps {
  title: string
  subtitle: string
  outline: string[]
  activeChapter?: { id: string; number: number; title: string; content: string } | null
  onTitleChange: (title: string) => void
  onSubtitleChange: (subtitle: string) => void
  onOutlineChange?: (outline: string) => void
  onRegenerateOutline: () => void
}

export function BookOverview({
  title,
  subtitle,
  outline,
  activeChapter,
  onTitleChange,
  onSubtitleChange,
  onOutlineChange,
  onRegenerateOutline,
}: BookOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [titleOptions] = useState([
    title,
    `${title}: The Complete Guide`,
    `Master ${title}`,
  ])
  const [subtitleOptions] = useState([
    subtitle,
    `Transform Your Business with ${title}`,
    `The Ultimate Guide to ${title}`,
  ])
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0)
  const [selectedSubtitleIndex, setSelectedSubtitleIndex] = useState(0)
  
  // Get chapter-specific outline (sections) from the chapter content
  const [chapterOutline, setChapterOutline] = useState("")
  
  useEffect(() => {
    if (activeChapter) {
      // Extract headings from chapter content to show as outline
      // The chapter content is HTML, so we need to extract headings
      if (typeof window !== 'undefined') {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = activeChapter.content || ''
        const headings = Array.from(tempDiv.querySelectorAll('h1, h2, h3'))
        let outlineText = ''
        
        if (headings.length > 0) {
          // Extract headings and create numbered outline
          outlineText = headings
            .map((h, index) => {
              const level = h.tagName.toLowerCase()
              const indent = level === 'h1' ? '' : level === 'h2' ? '  ' : '    '
              return `${indent}${index + 1}. ${h.textContent || ''}`
            })
            .join('\n')
        }
        
        // If no headings found or outline is empty, create a default structure
        if (!outlineText.trim()) {
          // Try to extract from markdown-style content or create default
          outlineText = `1. ${activeChapter.title}\n2. [Add your first section here]\n3. [Add your second section here]`
        }
        
        setChapterOutline(outlineText)
      }
    } else {
      // Show full book outline if no chapter is selected
      setChapterOutline(outline.map((ch, index) => `${index + 1}. ${ch}`).join('\n'))
    }
  }, [activeChapter, outline])

  return (
    <Card className="border-border shadow-sm mb-6 overflow-visible" style={{ margin: '2px' }}>
      <CardContent className="p-6 overflow-visible" style={{ padding: '24px', margin: '2px' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Book Overview</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-visible"
            >
              <div className="space-y-6" style={{ padding: '2px' }}>
                {/* Title */}
                <div className="overflow-visible" style={{ padding: '2px' }}>
                  <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                  <div className="flex gap-2 overflow-visible" style={{ padding: '2px' }}>
                    <Input
                      value={titleOptions[selectedTitleIndex]}
                      onChange={(e) => onTitleChange(e.target.value)}
                      className="flex-1"
                      style={{ boxShadow: 'none' }}
                    />
                    <Select
                      value={selectedTitleIndex.toString()}
                      onValueChange={(value) => {
                        setSelectedTitleIndex(parseInt(value))
                        onTitleChange(titleOptions[parseInt(value)])
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {titleOptions.map((opt, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Option {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="overflow-visible" style={{ padding: '2px' }}>
                  <label className="text-sm font-medium text-foreground mb-2 block">Subtitle</label>
                  <div className="flex gap-2 overflow-visible" style={{ padding: '2px' }}>
                    <Input
                      value={subtitleOptions[selectedSubtitleIndex]}
                      onChange={(e) => onSubtitleChange(e.target.value)}
                      className="flex-1"
                      style={{ boxShadow: 'none' }}
                    />
                    <Select
                      value={selectedSubtitleIndex.toString()}
                      onValueChange={(value) => {
                        setSelectedSubtitleIndex(parseInt(value))
                        onSubtitleChange(subtitleOptions[parseInt(value)])
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subtitleOptions.map((opt, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Option {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Outline - Editable and chapter-specific */}
                <div className="overflow-visible" style={{ padding: '2px' }}>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {activeChapter ? `${activeChapter.title} - Outline` : "Book Outline"}
                  </label>
                  <Textarea
                    value={chapterOutline}
                    onChange={(e) => {
                      setChapterOutline(e.target.value)
                      onOutlineChange?.(e.target.value)
                    }}
                    placeholder={activeChapter 
                      ? "Edit the outline for this chapter. Each line represents a section or heading."
                      : "Edit the book outline. Each line represents a chapter."
                    }
                    className="min-h-[200px] font-mono text-sm mb-4"
                    style={{ boxShadow: 'none' }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRegenerateOutline}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Outline
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

