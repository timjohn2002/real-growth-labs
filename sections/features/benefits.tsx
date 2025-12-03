"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  PenTool, 
  Hourglass, 
  TrendingUp, 
  Users, 
  Sparkles,
  Zap,
  Share2,
  RefreshCw
} from "lucide-react"

const BRAND_COLOR = "#a6261c"

// Custom SVG Icons
const HourglassIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8V16M24 32V40M16 16L24 24L32 16M16 32L24 24L32 32" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="16" y="16" width="16" height="8" stroke={BRAND_COLOR} strokeWidth="2" fill="none"/>
    <rect x="16" y="24" width="16" height="8" stroke={BRAND_COLOR} strokeWidth="2" fill="none"/>
  </svg>
)

const TrendingUpIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 32L18 22L28 28L40 16" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 16H32V24" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CollaborationIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top Left */}
    <circle cx="16" cy="16" r="4" stroke={BRAND_COLOR} strokeWidth="2" fill="none"/>
    <path d="M12 20C12 18 13 16 16 16C19 16 20 18 20 20" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round"/>
    {/* Top Right */}
    <circle cx="32" cy="16" r="4" stroke={BRAND_COLOR} strokeWidth="2" fill="none"/>
    <path d="M28 20C28 18 29 16 32 16C35 16 36 18 36 20" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round"/>
    {/* Bottom Left */}
    <circle cx="16" cy="32" r="4" stroke={BRAND_COLOR} strokeWidth="2" fill="none"/>
    <path d="M12 36C12 34 13 32 16 32C19 32 20 34 20 36" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round"/>
    {/* Bottom Right */}
    <circle cx="32" cy="32" r="4" stroke={BRAND_COLOR} strokeWidth="2" fill="none"/>
    <path d="M28 36C28 34 29 32 32 32C35 32 36 34 36 36" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const StarIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8L27 18L37 18L29 24L32 34L24 28L16 34L19 24L11 18L21 18L24 8Z" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="36" cy="12" r="2" fill={BRAND_COLOR}/>
    <circle cx="38" cy="14" r="1.5" fill={BRAND_COLOR}/>
  </svg>
)

const SignatureIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 32C16 28 20 24 24 24C28 24 32 28 32 32C32 36 28 40 24 40C20 40 16 36 16 32Z" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M32 32L40 24L48 32" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 48L16 40L24 48" stroke={BRAND_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const benefits = [
  {
    title: "Look Like a Pro. Impress Everyone.",
    description: "Turn your book into a complete lead-gen funnel with landing pages, opt-ins, and email scripts.",
    icon: SignatureIcon,
    isLarge: true,
  },
  {
    title: "Save Time & Money",
    description: "Get 15+ hours back each week",
    icon: HourglassIcon,
    isLarge: false,
  },
  {
    title: "10X Your Audience",
    description: "Instant analysis of clarity, value, storytelling, and conversion strength.",
    icon: TrendingUpIcon,
    isLarge: false,
  },
  {
    title: "Real-time Collaboration",
    description: "Convert your finished book into a studio-quality audio-book in one click.",
    icon: CollaborationIcon,
    isLarge: false,
  },
  {
    title: "Build An AI-Powered Business",
    description: "Save drafts, track progress, and manage all your book projects in one place.",
    icon: StarIcon,
    isLarge: false,
  },
]

const ctaButtons = [
  { text: "Create 10X Faster", icon: Zap },
  { text: "Export & Share", icon: Share2 },
  { text: "Remix & More!", icon: RefreshCw },
]

export function Benefits() {
  const largeBenefit = benefits.find((b) => b.isLarge)
  const smallBenefits = benefits.filter((b) => !b.isLarge)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">
              What Real Growth Labs Gives You...
            </h2>
          </motion.div>

          {/* Large Feature Box */}
          {largeBenefit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Card className="border-gray-300 shadow-sm">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col items-center text-center">
                    {/* Signature Icon */}
                    <div className="mb-6 flex items-center justify-center">
                      {largeBenefit.icon && React.createElement(largeBenefit.icon)}
                    </div>

                    {/* Headline */}
                    <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
                      {largeBenefit.title}
                    </h3>

                    {/* Description */}
                    <p className="text-lg text-gray-700 max-w-2xl">
                      {largeBenefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Two Rows of Feature Boxes */}
          <div className="space-y-6 mb-12">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {smallBenefits.slice(0, 2).map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="h-full border-gray-300 shadow-sm">
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-center">
                          <Icon />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-700 text-sm">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {smallBenefits.slice(2, 4).map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  >
                    <Card className="h-full border-gray-300 shadow-sm">
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-center">
                          <Icon />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-700 text-sm">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {ctaButtons.map((button, index) => {
              const Icon = button.icon
              return (
                <Button
                  key={button.text}
                  className="rounded-lg text-white text-base font-medium px-6 py-3 flex items-center space-x-2 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  <span>{button.text}</span>
                  <Icon className="h-4 w-4" />
                </Button>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

