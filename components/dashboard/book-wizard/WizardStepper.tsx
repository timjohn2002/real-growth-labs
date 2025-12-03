"use client"

import { Check } from "lucide-react"

const steps = [
  { id: "template", label: "Template" },
  { id: "questions", label: "Questions" },
  { id: "draft", label: "Draft" },
]

interface WizardStepperProps {
  currentStep: number
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <div className="flex items-center justify-center gap-8 mb-12">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-[#a6261c] border-[#a6261c]"
                    : isActive
                    ? "bg-[#a6261c] border-[#a6261c]"
                    : "bg-white border-gray-300"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-gray-400"}`}>
                    {stepNumber}
                  </span>
                )}
              </div>
              <span
                className={`text-sm font-medium mt-2 ${
                  isActive ? "text-gray-900 font-bold" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-4 ${
                  isCompleted ? "bg-[#a6261c]" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

