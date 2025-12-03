"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
}

export function DropdownMenu({ trigger, children, align = "left" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <div onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
        {trigger}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 min-w-[200px] z-50",
                align === "right" ? "right-0" : "left-0"
              )}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function DropdownMenuItem({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
}) {
  const Component = href ? "a" : "button"
  return (
    <Component
      href={href}
      onClick={onClick}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {children}
    </Component>
  )
}

export function DropdownMenuTrigger({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [key: string]: any }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props)
  }
  return <div {...props}>{children}</div>
}

export function DropdownMenuContent({ children, align = "left", ...props }: { children: React.ReactNode; align?: "left" | "right"; [key: string]: any }) {
  return <div {...props}>{children}</div>
}
