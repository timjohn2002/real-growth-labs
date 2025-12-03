"use client"

import { motion } from "framer-motion"

export function FeaturesHero() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            Powerful Features for{" "}
            <span style={{ color: "#a6261c" }}>Real Growth</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            Discover all the tools and features designed to help your business
            succeed and grow.
          </motion.p>
        </div>
      </div>
    </section>
  )
}

