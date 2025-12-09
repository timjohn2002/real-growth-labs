"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/DashboardSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load sidebar state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed")
      if (saved === "true") {
        setIsCollapsed(true)
      }
    }
  }, [])

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(newState))
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}

