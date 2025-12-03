"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

const team = [
  {
    name: "John Smith",
    role: "CEO & Founder",
    bio: "Visionary leader with 15+ years of experience in business growth.",
  },
  {
    name: "Sarah Johnson",
    role: "CTO",
    bio: "Tech enthusiast passionate about building scalable solutions.",
  },
  {
    name: "Michael Chen",
    role: "Head of Product",
    bio: "Product strategist focused on user experience and innovation.",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Customer Success",
    bio: "Dedicated to helping customers achieve their business goals.",
  },
]

export function Team() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Meet Our Team
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            The passionate people behind Real Growth Labs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="font-medium mb-2" style={{ color: "#a6261c" }}>{member.role}</p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

