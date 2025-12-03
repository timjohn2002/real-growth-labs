"use client"

import { usePathname } from "next/navigation"
import { NavBar } from "@/components/NavBar"
import { Footer } from "@/components/Footer"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

