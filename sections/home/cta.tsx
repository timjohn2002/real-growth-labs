"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20" style={{ backgroundColor: "#a6261c" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Ready to grow your business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg leading-8"
            style={{ color: "rgba(255, 255, 255, 0.9)" }}
          >
            Join thousands of businesses already using Real Growth Labs to achieve their goals.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white" style={{ "--hover-color": "#a6261c" } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.color = "#a6261c"} onMouseLeave={(e) => e.currentTarget.style.color = "white"}>
                View Pricing
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

