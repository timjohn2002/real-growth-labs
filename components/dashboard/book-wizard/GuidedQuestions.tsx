"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BRAND_COLOR = "#a6261c"

interface GuidedQuestionsProps {
  onBack: () => void
  onGenerate: (answers: QuestionAnswers) => void
}

export interface QuestionAnswers {
  targetReader: string
  highTicketOffer: string
  offerDetails: string
  transformation: string
  tone?: string
  additionalContent?: string
}

export function GuidedQuestions({ onBack, onGenerate }: GuidedQuestionsProps) {
  const [answers, setAnswers] = useState<QuestionAnswers>({
    targetReader: "",
    highTicketOffer: "",
    offerDetails: "",
    transformation: "",
    tone: "",
    additionalContent: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(answers)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">2. Answer a few questions</h2>
        <p className="text-muted-foreground">
          These help the AI tailor your book to your voice and audience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Target Reader */}
        <div className="space-y-2">
          <Label htmlFor="targetReader">Who is your target reader?</Label>
          <Textarea
            id="targetReader"
            rows={3}
            placeholder="Describe your ideal reader..."
            value={answers.targetReader}
            onChange={(e) => setAnswers({ ...answers, targetReader: e.target.value })}
            required
            className="resize-none"
          />
        </div>

        {/* High Ticket Offer */}
        <div className="space-y-2">
          <Label htmlFor="highTicketOffer">What high-ticket offer does this book lead into?</Label>
          <Input
            id="highTicketOffer"
            placeholder="e.g., 1-on-1 Coaching Program"
            value={answers.highTicketOffer}
            onChange={(e) => setAnswers({ ...answers, highTicketOffer: e.target.value })}
            required
          />
          <Textarea
            rows={2}
            placeholder="What does this offer include?"
            value={answers.offerDetails}
            onChange={(e) => setAnswers({ ...answers, offerDetails: e.target.value })}
            className="resize-none"
          />
        </div>

        {/* Transformation */}
        <div className="space-y-2">
          <Label htmlFor="transformation">What transformation are you promising?</Label>
          <Textarea
            id="transformation"
            rows={3}
            placeholder="Describe the transformation your reader will experience..."
            value={answers.transformation}
            onChange={(e) => setAnswers({ ...answers, transformation: e.target.value })}
            required
            className="resize-none"
          />
        </div>

        {/* Tone (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="tone">(Optional) What tone or style do you want?</Label>
          <Select
            value={answers.tone}
            onValueChange={(value) => setAnswers({ ...answers, tone: value })}
          >
            <SelectTrigger id="tone">
              <SelectValue placeholder="Select a tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="conversational">Conversational</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="story-driven">Story-driven</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Content (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="additionalContent">
            (Optional) Anything you definitely want included?
          </Label>
          <Textarea
            id="additionalContent"
            rows={3}
            placeholder="Specific topics, frameworks, or ideas to include..."
            value={answers.additionalContent}
            onChange={(e) => setAnswers({ ...answers, additionalContent: e.target.value })}
            className="resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button
            type="submit"
            className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
            style={{ backgroundColor: BRAND_COLOR }}
            disabled={!answers.targetReader || !answers.highTicketOffer || !answers.transformation}
          >
            Generate Outline & Draft
          </Button>
        </div>
      </form>
    </div>
  )
}

