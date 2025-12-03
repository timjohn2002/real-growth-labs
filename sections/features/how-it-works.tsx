"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil, Upload, FileText, Workflow, Check } from "lucide-react"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

const BRAND_COLOR = "#a6261c"

const steps = [
  {
    number: "One",
    title: "Feed Your Content Database",
    description:
      "Upload podcasts, videos, voice notes, and links. The AI analyzes your unique voice and expertise to understand exactly what to write about.",
    icon: Upload,
    image: "/step-1-upload.png",
  },
  {
    number: "Two",
    title: "AI Draft & Review",
    description:
      "Receive a first draft made by AI, then edit it to perfection. Use the Book Review feature to analyze proficiency, value provided, and read time.",
    icon: FileText,
    image: "/step-2-ai-draft.png",
  },
  {
    number: "Three",
    title: "Funnel & Audiobook",
    description:
      "Build a simple funnel inside the software to sell your high-ticket offer. Plus, generate an audiobook from your content with a single click.",
    icon: Workflow,
    image: "/step-3-funnel.png",
  },
]

const additionalFeatures = [
  { name: "E-Book Builder" },
  { name: "Lead Magnet" },
  { name: "Book Funnel" },
  { name: "Audio Book" },
  { name: "Funnel Editor" },
  { name: "Book Review" },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
              So What's The Fix?{" "}
              <span style={{ color: BRAND_COLOR }}>Real Growth Labs.</span>
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <p className="text-xl md:text-2xl text-gray-700">
              An AI design tool that automatically writes and designs all your digital content in
              just 3 Easy Steps
            </p>
          </motion.div>

          {/* 3 Easy Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  {/* Step Number Badge */}
                  <div className="mb-4">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Step {step.number}:
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-black mb-4">{step.title}</h3>

                  {/* Description */}
                  <p className="text-gray-700 mb-6 leading-relaxed">{step.description}</p>

                  {/* Step Image */}
                  <div className="bg-white rounded-lg aspect-video overflow-hidden mb-4 relative">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Arrow between steps (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Additional Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-black mb-3">
              What Else Can Real Growth Labs Design For Me?
            </h3>
            <p className="text-lg text-gray-700 mb-8">
              Don't stop at just ebooks. Real Growth Labs can design all your digital content for
              you, in real time.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-center gap-3"
                >
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center"
          >
            <Link href="/signup">
              <Button
                className="rounded-lg text-white text-base font-medium px-6 py-3 flex items-center space-x-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <span>Start designing</span>
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

