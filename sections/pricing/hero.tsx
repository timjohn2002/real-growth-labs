"use client"

import { motion } from "framer-motion"

export function PricingHero() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            Simple, Transparent{" "}
            <span style={{ color: "#a6261c" }}>Pricing</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            Choose the perfect plan for your business. All plans include a 14-day
            free trial.
          </motion.p>
        </div>
      </div>
    </section>
  )
}

