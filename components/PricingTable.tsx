"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { PRICING_PLANS } from "@/lib/constants"

export function PricingTable() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {PRICING_PLANS.map((plan, index) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className={`h-full relative ${plan.popular ? "border-[#a6261c] border-2 shadow-lg" : "border-gray-100"}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#a6261c] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <div>
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                {plan.name === "Basic" && (
                  <div className="text-sm text-gray-600 mt-1">Billed yearly</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-[#a6261c] mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${plan.popular ? "bg-[#a6261c] hover:bg-[#8e1e16]" : ""}`}
                variant={plan.popular ? "default" : "outline"}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

