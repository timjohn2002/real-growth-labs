"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface HeroProps {
  title: string | React.ReactNode
  subtitle?: string
  primaryCTA?: { text: string; href: string }
  secondaryCTA?: { text: string; href: string }
}

export function Hero({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg leading-8 text-gray-600"
            >
              {subtitle}
            </motion.p>
          )}
          {(primaryCTA || secondaryCTA) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              {primaryCTA && (
                <Link href={primaryCTA.href}>
                  <Button size="lg" className="bg-[#a6261c] hover:bg-[#8e1e16] group">
                    {primaryCTA.text}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}
              {secondaryCTA && (
                <Link href={secondaryCTA.href}>
                  <Button variant="outline" size="lg">
                    {secondaryCTA.text}
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

