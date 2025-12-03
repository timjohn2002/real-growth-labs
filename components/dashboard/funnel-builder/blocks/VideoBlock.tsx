"use client"

import { Play } from "lucide-react"

interface VideoBlockProps {
  videoUrl?: string
  thumbnailUrl?: string
  autoplay?: boolean
  muted?: boolean
}

export function VideoBlock({
  videoUrl,
  thumbnailUrl,
  autoplay = false,
  muted = false,
}: VideoBlockProps) {
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
      {videoUrl ? (
        <iframe
          src={`${videoUrl}${autoplay ? "?autoplay=1" : ""}${muted ? "&mute=1" : ""}`}
          className="w-full h-full"
          allow="autoplay"
        />
      ) : (
        <div className="text-center">
          <Play className="h-16 w-16 text-white mx-auto mb-4" />
          <p className="text-white">Video Preview</p>
        </div>
      )}
    </div>
  )
}

