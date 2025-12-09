"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  // Initialize theme on mount to persist across navigation
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check localStorage first
      const storedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
      const html = document.documentElement
      
      if (storedTheme) {
        html.classList.remove("light", "dark")
        if (storedTheme === "system") {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
          html.classList.add(prefersDark ? "dark" : "light")
        } else {
          html.classList.add(storedTheme)
        }
      } else {
        // If no stored theme, check if dark class is already set (from previous session)
        // Otherwise default to light
        if (!html.classList.contains("dark") && !html.classList.contains("light")) {
          html.classList.add("light")
        }
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

