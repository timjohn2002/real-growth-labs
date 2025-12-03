"use client"

interface HeadlineBlockProps {
  text: string
  fontSize?: number
  alignment?: "left" | "center" | "right"
  color?: "black" | "red" | "white"
}

export function HeadlineBlock({
  text = "Want More Clients?",
  fontSize = 48,
  alignment = "center",
  color = "black",
}: HeadlineBlockProps) {
  const colorClass = {
    black: "text-gray-900",
    red: "text-[#a6261c]",
    white: "text-white",
  }[color]

  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[alignment]

  return (
    <div className={alignClass}>
      <h1 className={`font-bold ${colorClass}`} style={{ fontSize: `${fontSize}px` }}>
        {text}
      </h1>
    </div>
  )
}

