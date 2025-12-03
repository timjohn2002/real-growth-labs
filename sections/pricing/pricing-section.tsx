"use client"

import { PricingTable } from "@/components/PricingTable"

export function PricingSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the perfect plan for your needs. All plans include a 14-day free trial.
          </p>
        </div>
        <PricingTable />
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">30-day money-back guarantee</span> on all plans
          </p>
        </div>
      </div>
    </section>
  )
}

