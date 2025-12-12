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
    createdAt?: string
    updatedAt?: string
  }>({
    name: "",
    email: "",
    avatar: undefined,
  })
  const [isLoading, setIsLoading] = useState(true)

  const [theme] = useState<"light" | "dark">("light")
  const [autosaveFrequency, setAutosaveFrequency] = useState("5")
  const [notifications, setNotifications] = useState({
    audiobookReady: true,
    bookReviewReady: true,
    weeklyProgress: false,
  })


  useEffect(() => {
    // Load user data from API
    const loadUser = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user", {
          credentials: "include",
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser({
              name: data.user.name || data.user.email?.split("@")[0] || "User",
              email: data.user.email || "",
              avatar: data.user.avatar || undefined,
              createdAt: data.user.createdAt,
              updatedAt: data.user.updatedAt,
            })
            
            // Load preferences
            if (data.user.preferences) {
              let prefs: any
              try {
                prefs = typeof data.user.preferences === "string" 
                  ? JSON.parse(data.user.preferences) 
                  : data.user.preferences
              } catch (e) {
                console.error("Failed to parse preferences:", e)
                prefs = {}
              }
              
              if (prefs.autosaveFrequency) setAutosaveFrequency(prefs.autosaveFrequency)
              if (prefs.notifications) {
                setNotifications({
                  audiobookReady: prefs.notifications.audiobookReady ?? true,
                  bookReviewReady: prefs.notifications.bookReviewReady ?? true,
                  weeklyProgress: prefs.notifications.weeklyProgress ?? false,
                })
              }
            }
          }
        } else if (response.status === 401) {
          // Not authenticated, redirect to login
          window.location.href = "/login"
          return
        } else {
          console.error("Failed to load user data:", response.status)
          // Fallback to localStorage
          if (typeof window !== "undefined") {
            try {
              const userData = localStorage.getItem("user")
              if (userData) {
                const parsed = JSON.parse(userData)
                if (parsed.email) {
                  setUser((prev) => ({
                    ...prev,
                    email: parsed.email,
                    name: parsed.name || parsed.email.split("@")[0] || prev.name,
                  }))
                }
              }
            } catch (err) {
              console.error("Error loading from localStorage:", err)
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        // Fallback to localStorage
        if (typeof window !== "undefined") {
          try {
            const userData = localStorage.getItem("user")
            if (userData) {
              const parsed = JSON.parse(userData)
              if (parsed.email) {
                setUser((prev) => ({
                  ...prev,
                  email: parsed.email,
                  name: parsed.name || parsed.email.split("@")[0] || prev.name,
                }))
              }
            }
          } catch (err) {
            console.error("Error loading from localStorage:", err)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleUserUpdate = async (updates: { name?: string; email?: string; avatar?: string }) => {
    setUser((prev) => ({ ...prev, ...updates }))
    
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser((prev) => ({
            ...prev,
            ...updates,
            updatedAt: data.user.updatedAt,
          }))
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to update user:", errorData)
        alert(errorData.error || "Failed to update profile. Please try again.")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      alert("An error occurred while updating your profile. Please try again.")
    }
  }


  const handleAutosaveChange = async (newFrequency: string) => {
    setAutosaveFrequency(newFrequency)
    await savePreferences(newFrequency, notifications)
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)
    await savePreferences(autosaveFrequency, updatedNotifications)
  }

  const savePreferences = async (
    autosaveValue: string,
    notificationsValue: typeof notifications
  ) => {
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            autosaveFrequency: autosaveValue,
            notifications: notificationsValue,
          },
        }),
      })
    } catch (error) {
      console.error("Failed to update preferences:", error)
    }
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your profile, preferences, and subscription.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading profile...</div>
          </div>
        ) : (
          <>
            {/* Personal Information */}
            <ProfileSection user={user} onUpdate={handleUserUpdate} />

        {/* Account Settings */}
        <AccountPreferences
          autosaveFrequency={autosaveFrequency}
          notifications={notifications}
          onAutosaveChange={handleAutosaveChange}
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
          </>
        )}
      </div>
    </div>
  )
}
