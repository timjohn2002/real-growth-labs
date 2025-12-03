"use client"

import { useState } from "react"
import { AudiobookPlayer } from "@/components/dashboard/audiobook/AudiobookPlayer"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const BRAND_COLOR = "#a6261c"

// Mock data - replace with actual data from API
const mockAudiobook = {
  id: "1",
  bookTitle: "My First Book",
  duration: 2609, // 43:29 in seconds
  chapterCount: 7,
  voice: "Premium Female Narrator",
  audioUrl: "/placeholder-audio.mp3",
  chapters: [
    { title: "Introduction", timestamp: 252 }, // 4:12
    { title: "Your Story", timestamp: 403 }, // 6:43
    { title: "Framework", timestamp: 470 }, // 7:50
    { title: "Implementation", timestamp: 650 },
    { title: "Case Studies", timestamp: 850 },
    { title: "Conclusion", timestamp: 1100 },
  ],
}

export default function AudiobookPage() {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = mockAudiobook.audioUrl
    link.download = `${mockAudiobook.bookTitle}-audiobook.mp3`
    link.click()
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audiobook</h1>
          <p className="text-gray-600">Manage and preview your generated audiobook</p>
        </div>

        {/* Audiobook Overview */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Audiobook Overview</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Book Title</p>
                    <p className="font-medium text-gray-900">{mockAudiobook.bookTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Length</p>
                    <p className="font-medium text-gray-900">{formatTime(mockAudiobook.duration)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chapters Included</p>
                    <p className="font-medium text-gray-900">{mockAudiobook.chapterCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Voice</p>
                    <p className="font-medium text-gray-900">{mockAudiobook.voice}</p>
                  </div>
                </div>
              </div>

              {/* Preview Player */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Preview</h3>
                <AudiobookPlayer
                  audioUrl={mockAudiobook.audioUrl}
                  duration={mockAudiobook.duration}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleDownload}
                  className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapter Timestamps */}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapters</h3>
            <div className="space-y-2">
              {mockAudiobook.chapters.map((chapter, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-8">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-gray-900">{chapter.title}</span>
                  </div>
                  <span className="text-sm text-gray-600">{formatTime(chapter.timestamp)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
