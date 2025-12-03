"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const BRAND_COLOR = "#a6261c"

interface LeadFormBlockProps {
  buttonText?: string
  buttonColor?: string
  fields?: string[]
}

export function LeadFormBlock({
  buttonText = "Get the free book",
  buttonColor = BRAND_COLOR,
  fields = ["name", "email"],
}: LeadFormBlockProps) {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="space-y-3">
        {fields.includes("name") && (
          <Input type="text" placeholder="Your Name" className="w-full" />
        )}
        {fields.includes("email") && (
          <Input type="email" placeholder="Your Email" className="w-full" />
        )}
      </div>
      <Button
        className="w-full text-white"
        style={{ backgroundColor: buttonColor }}
      >
        {buttonText}
      </Button>
    </div>
  )
}

