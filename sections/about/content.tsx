"use client"

import { motion } from "framer-motion"

export function AboutContent() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-8">
              At Real Growth Labs, we believe that every business deserves access to
              powerful tools that can help them grow. We've built a platform that
              combines cutting-edge technology with practical insights to help you
              make data-driven decisions and achieve your goals.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2020, Real Growth Labs started as a small team of
              entrepreneurs and developers who were frustrated with the complexity
              of existing business tools. We set out to create something better—a
              platform that's both powerful and easy to use.
            </p>
            <p className="text-gray-600 mb-8">
              Today, we serve thousands of businesses worldwide, from startups to
              enterprise companies. Our commitment to innovation and customer success
              drives everything we do.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Customer-first approach in everything we do</li>
              <li>Transparency and honesty in our communication</li>
              <li>Continuous innovation and improvement</li>
              <li>Empowering businesses to achieve their full potential</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

