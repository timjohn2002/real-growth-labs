"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 5 team members",
      "Basic analytics",
      "Email support",
      "5GB storage",
      "Basic integrations",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "For growing businesses that need more",
    features: [
      "Up to 25 team members",
      "Advanced analytics",
      "Priority support",
      "50GB storage",
      "All integrations",
      "Custom reports",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For large organizations with advanced needs",
    features: [
      "Unlimited team members",
      "Enterprise analytics",
      "24/7 dedicated support",
      "Unlimited storage",
      "Custom integrations",
      "Advanced security",
      "SLA guarantee",
      "Custom onboarding",
    ],
    popular: false,
  },
]

export function PricingPlans() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full relative bg-white dark:bg-white ${plan.popular ? "border-2 shadow-lg" : ""}`} style={plan.popular ? { borderColor: "#a6261c" } : {}}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="text-white px-4 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: "#a6261c" }}>
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" style={{ color: "#a6261c" }} />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

