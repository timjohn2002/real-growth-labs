"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Trophy, Square, ArrowRight, ChevronUp } from "lucide-react"
import Link from "next/link"

const BRAND_COLOR = "#a6261c"

const proFeatures = [
  "Unlimited projects",
  "Full Sharing",
  "Decks & Documents",
  "Book Covers",
  "Ai Assistant™",
  "PDF Export",
  "PNG Export",
  "PPT Export",
]

const basicFeatures = [
  "35 projects",
  "Full Sharing",
  "5M Unsplash Image Library",
  "Ai Assistant™",
  "PDF Export only",
]

export function PricingHeroSection() {
  const [isBasicSelected, setIsBasicSelected] = useState(false)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
              95% Less Than You're Currently Spending on Funnels
            </h1>
          </motion.div>

          {/* Sub-headlines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-8 space-y-3"
          >
            <p className="text-lg md:text-xl text-black">
              No writing. No design. No tech headaches. Just upload your content and watch the
              magic happen.
            </p>
            <p className="text-lg md:text-xl text-black">
              Your online business grows when you capture more leads -which means Real Growth Labs
              is a no-brainier for you.
            </p>
          </motion.div>


          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* PRO Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card
                className="h-full border-0 shadow-lg"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <CardContent className="p-8">
                  <div className="text-white">
                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-4xl font-bold mb-1">$97/month</div>
                      <div className="text-sm opacity-90">Billed monthly</div>
                    </div>

                    {/* Plan Name */}
                    <div className="flex items-center gap-2 mb-6">
                      <Trophy className="h-6 w-6" />
                      <span className="text-2xl font-bold">PRO</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {proFeatures.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className="w-full bg-white text-black hover:bg-gray-100 rounded-lg py-3 flex items-center justify-center gap-2"
                      style={{ color: BRAND_COLOR }}
                    >
                      <span>Start designing</span>
                      <ArrowRight className="h-4 w-4" style={{ color: BRAND_COLOR }} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* BASIC Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-gray-200 shadow-sm">
                <CardContent className="p-8">
                  <div className="text-black">
                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-4xl font-bold mb-1">$27/month</div>
                      <div className="text-sm text-gray-600">Billed yearly</div>
                    </div>

                    {/* Plan Name */}
                    <div className="flex items-center gap-2 mb-6">
                      <button
                        onClick={() => setIsBasicSelected(!isBasicSelected)}
                        className="flex items-center justify-center w-6 h-6 border-2 rounded transition-all hover:opacity-80"
                        style={{ 
                          borderColor: BRAND_COLOR,
                          backgroundColor: isBasicSelected ? BRAND_COLOR : "transparent"
                        }}
                      >
                        {isBasicSelected && (
                          <Check className="h-4 w-4 text-white" strokeWidth={3} />
                        )}
                      </button>
                      <span className="text-2xl font-bold">BASIC</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {basicFeatures.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-5 w-5 flex-shrink-0 text-black" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Money-Back Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <Check className="h-5 w-5" style={{ color: BRAND_COLOR }} />
            <p className="text-black">
              30-Day Money-Back Guarantee. No questions asked.
            </p>
          </motion.div>

          {/* Back to Top Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-6 py-2 rounded-lg border-2 flex items-center gap-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}
            >
              <ChevronUp className="h-4 w-4" />
              <span>Back to top</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

