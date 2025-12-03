"use client"

interface SubheadlineBlockProps {
  text: string
  alignment?: "left" | "center" | "right"
}

export function SubheadlineBlock({
  text = "This book reveals the exact system to increase leads using AI.",
  alignment = "center",
}: SubheadlineBlockProps) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[alignment]

  return (
    <div className={alignClass}>
      <p className="text-lg text-gray-600">{text}</p>
    </div>
  )
}

