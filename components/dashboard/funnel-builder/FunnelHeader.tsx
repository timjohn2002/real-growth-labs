"use client"

import Link from "next/link"
import { ArrowLeft, Eye, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

const BRAND_COLOR = "#a6261c"

interface FunnelHeaderProps {
  funnelName: string
  onPreview: () => void
  onPublish: () => void
}

export function FunnelHeader({ funnelName, onPreview, onPublish }: FunnelHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Funnel Builder — {funnelName}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Build your opt-in + offer funnel. All changes auto-save.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={onPublish}
            className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>
    </div>
  )
}

