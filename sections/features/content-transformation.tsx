"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function ContentTransformation() {
  return (
    <section className="py-20 bg-white dark:bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-black leading-tight">
              Turn Your Thoughts Into Books, Funnels, & Leads (Instantly)
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <p className="text-lg md:text-xl text-black dark:text-black">
              With one click...your ebook becomes 1,000+ new pieces of content you can share
              everywhere.
            </p>
          </motion.div>

          {/* Image with Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-lg overflow-hidden"
          >
            {/* Main Image */}
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
              <Image
                src="/content-transformation.jpg"
                alt="I have met many coaches just like you..."
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

