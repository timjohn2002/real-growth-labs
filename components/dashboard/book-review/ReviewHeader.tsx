"use client"

import Link from "next/link"
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const BRAND_COLOR = "#a6261c"

interface ReviewHeaderProps {
  lastAnalyzed: string
  onRunAgain: () => void
  isAnalyzing?: boolean
}

export function ReviewHeader({ lastAnalyzed, onRunAgain, isAnalyzing = false }: ReviewHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/book-editor">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book Review</h1>
            <p className="text-sm text-gray-600 mt-1">
              Insights and recommendations based on your full draft.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">Last analyzed: {lastAnalyzed}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRunAgain}
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Run Again
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

