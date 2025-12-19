"use client"

import { useState } from "react"
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
]

const profileItem = {
  name: "Profile",
  href: "/dashboard/profile",
  icon: User,
}

interface DashboardSidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function DashboardSidebar({ isCollapsed = false, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname()
  const ProfileIcon = profileItem.icon
  const isProfileActive = pathname === profileItem.href

  return (
    <aside className={cn(
      "bg-card border-r border-border h-screen sticky top-0 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <div className="p-2 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full h-8 rounded-full hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-foreground" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={cn(isCollapsed ? "p-2" : "p-4")}>
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
                    "flex items-center gap-3 py-3 transition-all relative min-h-[48px]",
                    isCollapsed ? "px-2 justify-center" : "px-4",
                    isActive
                      ? "text-white rounded-lg"
                      : "text-foreground hover:bg-muted rounded-lg"
                  )}
                  style={isActive ? { backgroundColor: BRAND_COLOR } : {}}
                >
                  {/* Left border accent for active item */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-lg" />
                  )}
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-foreground")} />
                  {!isCollapsed && (
                    <span className="font-medium leading-tight">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      
      {/* Profile at the bottom */}
      <div className={cn("border-t border-border", isCollapsed ? "p-2" : "p-4")}>
        <Link
          href={profileItem.href}
          className={cn(
            "flex items-center gap-3 py-3 transition-all relative rounded-lg",
            isCollapsed ? "px-2 justify-center" : "px-4",
            isProfileActive
              ? "text-white"
              : "text-foreground hover:bg-muted"
          )}
          style={isProfileActive ? { backgroundColor: BRAND_COLOR } : {}}
        >
          {/* Left border accent for active item */}
          {isProfileActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-lg" />
          )}
          <ProfileIcon className={cn("h-5 w-5 flex-shrink-0", isProfileActive ? "text-white" : "text-foreground")} />
          {!isCollapsed && (
            <span className="font-medium">{profileItem.name}</span>
          )}
        </Link>
      </div>
    </aside>
  )
}

