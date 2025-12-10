"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil, Volume2 } from "lucide-react"
import { Typewriter } from "@/components/ui/typewriter"

const BRAND_COLOR = "#a6261c"

export function HomeHero() {
  return (
    <section className="bg-white dark:bg-white py-12 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight flex items-center justify-center gap-4">
              <span className="text-black">Design Awesome</span>
              <span style={{ color: BRAND_COLOR }}>
                <Typewriter
                  text={["Books.", "Funnels.", "Magnets."]}
                  speed={125}
                  deleteSpeed={63}
                  delay={2500}
                  loop={true}
                  cursor=""
                  className="font-bold"
                />
              </span>
              <span className="w-px h-16 bg-gray-300"></span>
            </h1>
          </motion.div>

          {/* Sub-headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-center"
          >
            <p className="text-xl md:text-2xl text-black font-medium">
              ...in Seconds (with AI)
            </p>
          </motion.div>

          {/* Descriptive Paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 text-center"
          >
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              AI-powered book creation, funnel building, and audience growth. Built for creators,
              coaches, and experts who want to attract high-ticket clients effortlessly.
            </p>
          </motion.div>

          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
              {/* Poster Image - Shows before video loads */}
              <img
                src="/video-poster.jpg"
                alt="Real Growth Labs - 1000+ Books A Month"
                className="absolute inset-0 w-full h-full object-cover z-0"
                onError={(e) => {
                  // Hide image if it fails to load, show video instead
                  e.currentTarget.style.display = 'none'
                }}
              />
              
              {/* Video Player */}
              <video
                className="w-full h-full object-cover relative z-10"
                controls
                poster="/video-poster.jpg"
                preload="metadata"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Unmute Overlay */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-black/80 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2">
                  <Volume2 className="h-3 w-3" />
                  Unmute
                </div>
              </div>

            </div>

            {/* Video CTA Text */}
            <p className="text-center text-gray-600 text-sm mt-4">
              (watch this quick 5-min video)
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center mb-16"
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

          {/* Trust Badges / Partner Logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="border-t border-gray-200 pt-12"
          >
            <p className="text-center text-gray-500 text-sm mb-8">
              Trusted by leading companies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              <div className="text-gray-400 font-semibold text-lg">Deloitte.</div>
              <div className="text-gray-400 font-semibold text-lg">CBRE</div>
              <div className="text-gray-400 font-semibold text-lg">amazon</div>
              <div className="text-gray-400 font-semibold text-lg">ORACLE</div>
              <div className="text-gray-400 font-semibold text-lg">SKILLSHARE</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
