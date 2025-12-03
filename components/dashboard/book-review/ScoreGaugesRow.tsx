"use client"

import { ScoreGauge } from "./ScoreGauge"

interface Score {
  label: string
  value: number
}

interface ScoreGaugesRowProps {
  scores: Score[]
}

export function ScoreGaugesRow({ scores }: ScoreGaugesRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
      {scores.map((score, index) => (
        <ScoreGauge key={score.label} score={score.value} label={score.label} />
      ))}
    </div>
  )
}

