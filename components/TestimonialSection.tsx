"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Creator & Author",
    content: "Real Growth Labs transformed how I create and monetize my content. I've published 3 books in 6 months!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Business Coach",
    content: "The AI book engine is incredible. It helped me turn my podcast episodes into a comprehensive guide.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Content Creator",
    content: "The audiobook generator saved me weeks of work. One click and my book was ready to publish.",
    rating: 5,
  },
]

export function TestimonialSection() {
  return (
    <section className="py-20 bg-white dark:bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            What creators are saying
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of creators turning their knowledge into books and revenue.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-gray-100 bg-white dark:bg-white">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

