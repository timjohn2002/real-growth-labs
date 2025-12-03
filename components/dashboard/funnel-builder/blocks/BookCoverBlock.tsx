"use client"

import Image from "next/image"

interface BookCoverBlockProps {
  imageUrl?: string
  showShadow?: boolean
  roundedCorners?: boolean
}

export function BookCoverBlock({
  imageUrl,
  showShadow = true,
  roundedCorners = false,
}: BookCoverBlockProps) {
  return (
    <div className="flex justify-center">
      <div
        className={`relative w-48 h-64 ${showShadow ? "shadow-xl" : ""} ${
          roundedCorners ? "rounded-lg" : ""
        }`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Book Cover"
            fill
            className={`object-cover ${roundedCorners ? "rounded-lg" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#a6261c] to-[#d43a2e] flex items-center justify-center text-white font-bold text-xl">
            Book Cover
          </div>
        )}
      </div>
    </div>
  )
}

