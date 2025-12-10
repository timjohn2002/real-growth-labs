"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Zap, Shield, Users, TrendingUp, Target } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Get deep insights into your business performance with real-time analytics and reporting.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Experience blazing-fast performance with our optimized platform built for speed.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is protected with enterprise-grade security and 99.9% uptime guarantee.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work seamlessly with your team using our collaborative tools and features.",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracking",
    description: "Track your growth metrics and see your progress over time with detailed charts.",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set and achieve your business goals with our intelligent goal tracking system.",
  },
]

export function Features() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to grow
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Powerful features designed to help your business succeed.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow bg-white dark:bg-white">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(166, 38, 28, 0.1)" }}>
                      <Icon className="h-6 w-6" style={{ color: "#a6261c" }} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

