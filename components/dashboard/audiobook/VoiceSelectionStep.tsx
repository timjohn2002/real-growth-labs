"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const BRAND_COLOR = "#a6261c"

const voices = [
  {
    id: "default",
    name: "Real Growth Labs Default",
    description: "Neutral male voice",
  },
  {
    id: "premium-female",
    name: "Premium Female Narrator",
    description: "Professional female voice",
  },
  {
    id: "deep-authority",
    name: "Deep Authority Voice",
    description: "Confident and authoritative",
  },
  {
    id: "conversational",
    name: "Conversational Friendly Voice",
    description: "Warm and approachable",
  },
]

interface VoiceSelectionStepProps {
  onGenerate: (voice: string, options: { addIntro: boolean; addOutro: boolean }) => void
  options: { addIntro: boolean; addOutro: boolean }
  onOptionsChange: (options: { addIntro: boolean; addOutro: boolean }) => void
}

export function VoiceSelectionStep({
  onGenerate,
  options,
  onOptionsChange,
}: VoiceSelectionStepProps) {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null)

  const handleGenerate = () => {
    if (selectedVoice) {
      onGenerate(selectedVoice, options)
    }
  }

  return (
    <div className="space-y-6">
      {/* Voice Selection */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Voice Selection</h3>
        <div className="space-y-3">
          {voices.map((voice, index) => {
            const isSelected = selectedVoice === voice.id
            return (
              <motion.button
                key={voice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedVoice(voice.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-[#a6261c] bg-red-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-[#a6261c] bg-[#a6261c]"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{voice.name}</p>
                      <p className="text-sm text-gray-500">{voice.description}</p>
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Options */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Options</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.addIntro}
              onChange={(e) =>
                onOptionsChange({ ...options, addIntro: e.target.checked })
              }
              className="w-5 h-5 text-[#a6261c] border-gray-300 rounded focus:ring-[#a6261c]"
            />
            <span className="text-sm text-gray-700">Add short intro</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.addOutro}
              onChange={(e) =>
                onOptionsChange({ ...options, addOutro: e.target.checked })
              }
              className="w-5 h-5 text-[#a6261c] border-gray-300 rounded focus:ring-[#a6261c]"
            />
            <span className="text-sm text-gray-700">Add outro CTA</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={() => {}}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={!selectedVoice}
          className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Generate
        </Button>
      </div>
    </div>
  )
}

