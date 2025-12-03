"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { 
  Wand2, 
  RefreshCw, 
  FileText, 
  Headphones,
  Save,
  Plus
} from "lucide-react"

export default function BuilderPage() {
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [content, setContent] = useState("")

  const chapters = [
    { id: 1, title: "Introduction", wordCount: 450 },
    { id: 2, title: "Chapter 1: Getting Started", wordCount: 1200 },
    { id: 3, title: "Chapter 2: Advanced Concepts", wordCount: 0 },
    { id: 4, title: "Chapter 3: Best Practices", wordCount: 0 },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Builder</h1>
          <p className="text-gray-600 mt-1">Create and edit your book chapters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button className="bg-[#a6261c] hover:bg-[#8e1e16]">
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chapter List */}
        <div className="lg:col-span-1">
          <Card className="border-gray-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chapters</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => setSelectedChapter(chapter.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedChapter === chapter.id
                        ? "border-2 border-[#a6261c]"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                    style={selectedChapter === chapter.id ? { backgroundColor: "rgba(166, 38, 28, 0.1)" } : {}}
                  >
                    <div className="font-medium text-gray-900">{chapter.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {chapter.wordCount} words
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: AI Editor */}
        <div className="lg:col-span-2">
          <Card className="border-gray-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {chapters.find((c) => c.id === selectedChapter)?.title || "Chapter"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Draft
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Rewrite
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Summarize
                  </Button>
                  <Button variant="outline" size="sm">
                    <Headphones className="mr-2 h-4 w-4" />
                    Convert to Audiobook
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your chapter here, or use AI tools to generate content..."
                className="min-h-[500px] font-mono text-sm"
              />
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                <span>Auto-saving...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
