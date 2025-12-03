"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderOpen,
  Wand2,
  FileEdit,
  Workflow,
  Headphones,
  BarChart3,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

const BRAND_COLOR = "#a6261c"

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Content Vault",
    href: "/dashboard/content-vault",
    icon: FolderOpen,
  },
  {
    name: "Book Wizard",
    href: "/dashboard/book-wizard",
    icon: Wand2,
  },
  {
    name: "Full Book Editor",
    href: "/dashboard/book-editor",
    icon: FileEdit,
  },
  {
    name: "Funnel Builder",
    href: "/dashboard/funnel-builder",
    icon: Workflow,
  },
  {
    name: "Audiobook Generator",
    href: "/dashboard/audiobook",
    icon: Headphones,
  },
  {
    name: "Book Review",
    href: "/dashboard/book-review",
    icon: BarChart3,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            // Highlight if pathname exactly matches the item href
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-all",
                  isActive
                    ? "text-white rounded-l-lg"
                    : "text-black hover:bg-gray-50 rounded-lg"
                )}
                style={isActive ? { backgroundColor: BRAND_COLOR } : {}}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-black")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

