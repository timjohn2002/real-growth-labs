"use client"

import { usePathname } from "next/navigation"
import { NavBar } from "@/components/NavBar"
import { Footer } from "@/components/Footer"
import { useEffect } from "react"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

  // Force light mode on landing pages
  useEffect(() => {
    if (!isDashboard && typeof window !== "undefined") {
      const html = document.documentElement
      html.classList.remove("dark")
      html.classList.add("light")
    }
  }, [isDashboard])

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <div className="bg-white dark:bg-white">
      <NavBar />
      <main className="min-h-screen bg-white dark:bg-white">{children}</main>
      <Footer />
    </div>
  )
}

