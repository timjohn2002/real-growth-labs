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

  // Initialize theme from current document state to preserve theme across navigation
  const getInitialTheme = (): "light" | "dark" | "system" => {
    if (typeof window === "undefined") return "light"
    
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    if (storedTheme) {
      return storedTheme
    }
    
    // Check current HTML class
    const html = document.documentElement
    if (html.classList.contains("dark")) {
      return "dark"
    }
    if (html.classList.contains("light")) {
      return "light"
    }
    
    // Default to system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    return prefersDark ? "dark" : "light"
  }

  const [theme, setTheme] = useState<"light" | "dark" | "system">(getInitialTheme)
  const [autosaveFrequency, setAutosaveFrequency] = useState("5")
  const [notifications, setNotifications] = useState({
    audiobookReady: true,
    bookReviewReady: true,
    weeklyProgress: false,
  })

  // Apply theme immediately on mount to prevent flash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const html = document.documentElement
      const currentTheme = getInitialTheme()
      
      html.classList.remove("light", "dark")
      if (currentTheme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        html.classList.add(prefersDark ? "dark" : "light")
      } else {
        html.classList.add(currentTheme)
      }
    }
  }, [])

  useEffect(() => {
    // Load user data from API
    const loadUser = async () => {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser({
              name: data.user.name || data.user.email.split("@")[0] || "User",
              email: data.user.email,
              avatar: data.user.avatar,
            })
            
            // Load preferences
            if (data.user.preferences) {
              const prefs = data.user.preferences as any
              if (prefs.theme) {
                setTheme(prefs.theme)
                // Apply theme immediately
                if (typeof window !== "undefined") {
                  const html = document.documentElement
                  html.classList.remove("light", "dark")
                  if (prefs.theme === "system") {
                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
                    html.classList.add(prefersDark ? "dark" : "light")
                  } else {
                    html.classList.add(prefs.theme)
                  }
                  // Store in localStorage for persistence
                  localStorage.setItem("theme", prefs.theme)
                }
              }
              if (prefs.autosaveFrequency) setAutosaveFrequency(prefs.autosaveFrequency)
              if (prefs.notifications) setNotifications(prefs.notifications)
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
                  name: parsed.email.split("@")[0] || prev.name,
                }))
              }
            }
          } catch (err) {
            console.error("Error loading from localStorage:", err)
          }
        }
      }
    }

    loadUser()
  }, [])

  const handleUserUpdate = async (updates: { name?: string; email?: string; avatar?: string }) => {
    setUser((prev) => ({ ...prev, ...updates }))
    
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    
    // Apply theme to document immediately
    if (typeof window !== "undefined") {
      const html = document.documentElement
      html.classList.remove("light", "dark")
      
      if (newTheme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        html.classList.add(prefersDark ? "dark" : "light")
      } else {
        html.classList.add(newTheme)
      }
      
      // Store in localStorage for persistence across navigation
      localStorage.setItem("theme", newTheme)
    }
    
    // Save to database
    await savePreferences(newTheme, autosaveFrequency, notifications)
  }

  // Apply theme when theme state changes (from API load)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const html = document.documentElement
      html.classList.remove("light", "dark")
      
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        html.classList.add(prefersDark ? "dark" : "light")
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const handleChange = (e: MediaQueryListEvent) => {
          html.classList.remove("light", "dark")
          html.classList.add(e.matches ? "dark" : "light")
        }
        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
      } else {
        html.classList.add(theme)
      }
      
      // Store in localStorage for persistence
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  const handleAutosaveChange = async (newFrequency: string) => {
    setAutosaveFrequency(newFrequency)
    await savePreferences(theme, newFrequency, notifications)
  }

  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)
    await savePreferences(theme, autosaveFrequency, updatedNotifications)
  }

  const savePreferences = async (
    themeValue: "light" | "dark" | "system",
    autosaveValue: string,
    notificationsValue: typeof notifications
  ) => {
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            theme: themeValue,
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
        {/* Personal Information */}
        <ProfileSection user={user} onUpdate={handleUserUpdate} />

        {/* Account Settings */}
        <AccountPreferences
          theme={theme}
          autosaveFrequency={autosaveFrequency}
          notifications={notifications}
          onThemeChange={handleThemeChange}
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
      </div>
    </div>
  )
}
