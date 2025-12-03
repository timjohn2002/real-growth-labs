"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProfileSection } from "@/components/dashboard/profile/ProfileSection"
import { AccountPreferences } from "@/components/dashboard/profile/AccountPreferences"
import { BillingSection } from "@/components/dashboard/profile/BillingSection"
import { DangerZone } from "@/components/dashboard/profile/DangerZone"

export default function ProfilePage() {
  const [user, setUser] = useState<{
    name: string
    email: string
    avatar: string | undefined
  }>({
    name: "Evgeny Timofeev",
    email: "evgeny@example.com",
    avatar: undefined,
  })

  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const [autosaveFrequency, setAutosaveFrequency] = useState("5")
  const [notifications, setNotifications] = useState({
    audiobookReady: true,
    bookReviewReady: true,
    weeklyProgress: false,
  })

  useEffect(() => {
    // Load user data from localStorage or API
    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const parsed = JSON.parse(userData)
          if (parsed.email) {
            setUser((prev) => ({
              ...prev,
              email: parsed.email,
              name: parsed.email.split("@")[0] || prev.name,
            }))
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }
  }, [])

  const handleUserUpdate = (updates: { name?: string; email?: string; avatar?: string }) => {
    setUser((prev) => ({ ...prev, ...updates }))
    // TODO: Save to API
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    // TODO: Save to API
  }

  const handleManageBilling = () => {
    // TODO: Open Stripe Customer Portal
    console.log("Open billing portal")
  }

  const handleUpdatePayment = () => {
    // TODO: Open payment method update modal
    console.log("Update payment method")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your profile, preferences, and subscription.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Personal Information */}
        <ProfileSection user={user} onUpdate={handleUserUpdate} />

        {/* Account Settings */}
        <AccountPreferences
          theme={theme}
          autosaveFrequency={autosaveFrequency}
          notifications={notifications}
          onThemeChange={setTheme}
          onAutosaveChange={setAutosaveFrequency}
          onNotificationChange={handleNotificationChange}
        />

        {/* Billing & Subscription */}
        <BillingSection
          plan={{
            name: "Pro",
            price: 97,
            interval: "month",
          }}
          usage={{
            books: "Unlimited",
            uploads: "Unlimited",
            aiActions: "Standard limits",
          }}
          paymentMethod={{
            type: "Visa",
            last4: "4242",
          }}
          billingHistory={[
            {
              date: "Dec 2025",
              amount: 97,
              status: "Paid",
              invoiceId: "inv_123",
            },
            {
              date: "Nov 2025",
              amount: 97,
              status: "Paid",
              invoiceId: "inv_122",
            },
          ]}
          onManageBilling={handleManageBilling}
          onUpdatePayment={handleUpdatePayment}
        />

        {/* Danger Zone */}
        <DangerZone />
      </div>
    </div>
  )
}
