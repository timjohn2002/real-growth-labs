"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
}

// Create a context to share the close function with menu items
const DropdownMenuContext = React.createContext<{ close: () => void } | null>(null)

export function DropdownMenu({ trigger, children, align = "left" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const closeMenu = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    console.log("Dropdown trigger clicked, isOpen:", isOpen) // Debug log
    setIsOpen((prev) => {
      console.log("Setting isOpen to:", !prev) // Debug log
      return !prev
    })
  }

  // Handle clicks on the trigger element itself
  React.useEffect(() => {
    const triggerElement = triggerRef.current
    if (!triggerElement) return

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      console.log("Trigger element clicked") // Debug log
      setIsOpen((prev) => !prev)
    }

    // Find the button inside the trigger
    const button = triggerElement.querySelector("button")
    if (button) {
      button.addEventListener("click", handleClick)
      return () => {
        button.removeEventListener("click", handleClick)
      }
    }
  }, [])

  return (
    <DropdownMenuContext.Provider value={{ close: closeMenu }}>
      <div className="relative" ref={menuRef}>
        <div 
          ref={triggerRef} 
          onClick={handleTriggerClick}
          className="cursor-pointer"
        >
          {trigger}
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] z-[100]",
                align === "right" ? "right-0" : "left-0"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DropdownMenuContext.Provider>
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
  const context = React.useContext(DropdownMenuContext)
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      if (href) {
        e.preventDefault()
      }
      onClick()
      // Close the menu after clicking an item
      if (context) {
        context.close()
      }
    }
  }
  
  return (
    <Component
      href={href}
      onClick={handleClick}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center cursor-pointer"
      type={Component === "button" ? "button" : undefined}
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
