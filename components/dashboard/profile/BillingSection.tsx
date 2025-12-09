"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CreditCard, Download, ExternalLink } from "lucide-react"

const BRAND_COLOR = "#a6261c"

interface BillingSectionProps {
  plan: {
    name: string
    price: number
    interval: string
  }
  usage: {
    books: string
    uploads: string
    aiActions: string
  }
  paymentMethod: {
    type: string
    last4: string
  }
  billingHistory: Array<{
    date: string
    amount: number
    status: string
    invoiceId: string
  }>
  onManageBilling: () => void
  onUpdatePayment: () => void
}

export function BillingSection({
  plan,
  usage,
  paymentMethod,
  billingHistory,
  onManageBilling,
  onUpdatePayment,
}: BillingSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Billing & Subscription</h3>

          <div className="space-y-6">
            {/* Current Plan */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Current Plan</Label>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {plan.name} — ${plan.price}/{plan.interval}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onManageBilling}
                  className="flex items-center gap-2"
                >
                  Manage Billing
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Usage Overview */}
            <div className="space-y-2 pt-4 border-t border-border">
              <Label className="text-sm font-medium text-foreground">Usage</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Books:</span>
                  <span className="text-foreground font-medium">{usage.books}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploads:</span>
                  <span className="text-foreground font-medium">{usage.uploads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Actions:</span>
                  <span className="text-foreground font-medium">{usage.aiActions}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2 pt-4 border-t border-border">
              <Label className="text-sm font-medium text-foreground">Payment Method</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {paymentMethod.type} ···· {paymentMethod.last4}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={onUpdatePayment}>
                  Update
                </Button>
              </div>
            </div>

            {/* Billing History */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Label className="text-sm font-medium text-foreground">Billing History</Label>
              <div className="space-y-2">
                {billingHistory.map((invoice, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-foreground">{invoice.date}</span>
                      <span className="text-sm text-muted-foreground">${invoice.amount}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === "Paid"
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

