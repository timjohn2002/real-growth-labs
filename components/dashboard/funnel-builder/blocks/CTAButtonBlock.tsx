"use client"

import { Button } from "@/components/ui/button"

const BRAND_COLOR = "#a6261c"

interface CTAButtonBlockProps {
  title?: string
  description?: string
  buttonText: string
  buttonUrl?: string
  buttonColor?: string
}

export function CTAButtonBlock({
  title,
  description,
  buttonText = "Download Now",
  buttonUrl = "#",
  buttonColor = BRAND_COLOR,
}: CTAButtonBlockProps) {
  return (
    <div className="text-center space-y-4">
      {title && <h3 className="text-2xl font-bold text-gray-900">{title}</h3>}
      {description && <p className="text-gray-600">{description}</p>}
      <Button
        size="lg"
        className="text-white"
        style={{ backgroundColor: buttonColor }}
        onClick={() => buttonUrl && window.open(buttonUrl, "_blank")}
      >
        {buttonText}
      </Button>
    </div>
  )
}

