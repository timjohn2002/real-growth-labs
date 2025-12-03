"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
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
  onTitleChange: (title: string) => void
  onSubtitleChange: (subtitle: string) => void
  onRegenerateOutline: () => void
}

export function BookOverview({
  title,
  subtitle,
  outline,
  onTitleChange,
  onSubtitleChange,
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

  return (
    <Card className="border-gray-200 shadow-sm mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Book Overview</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
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
              className="overflow-hidden"
            >
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
                  <div className="flex gap-2">
                    <Input
                      value={titleOptions[selectedTitleIndex]}
                      onChange={(e) => onTitleChange(e.target.value)}
                      className="flex-1"
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
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Subtitle</label>
                  <div className="flex gap-2">
                    <Input
                      value={subtitleOptions[selectedSubtitleIndex]}
                      onChange={(e) => onSubtitleChange(e.target.value)}
                      className="flex-1"
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

                {/* Outline */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Outline</label>
                  <ol className="space-y-2 mb-4">
                    {outline.map((chapter, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {index + 1}. {chapter}
                      </li>
                    ))}
                  </ol>
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

