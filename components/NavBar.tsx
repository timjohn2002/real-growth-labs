"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const BRAND_COLOR = "#a6261c"

export function NavBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const productItems = [
    { name: "Features", href: "/features" },
    { name: "Book Builder", href: "/builder" },
    { name: "Audiobook Generator", href: "/features#audiobook" },
    { name: "Analytics", href: "/features#analytics" },
  ]

  const createItems = [
    { name: "New Book", href: "/builder" },
    { name: "From Template", href: "/builder?template=true" },
    { name: "Import Content", href: "/builder?import=true" },
  ]

  const resourcesItems = [
    { name: "Documentation", href: "/docs" },
    { name: "Tutorials", href: "/tutorials" },
    { name: "Blog", href: "/blog" },
    { name: "Support", href: "/contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating Navbar Container */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#a6261c] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold text-black">Real</span>
                <span className="text-xl font-bold" style={{ color: BRAND_COLOR }}>
                  Growth Labs
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <DropdownMenu
                trigger={
                  <button className="flex items-center space-x-1 text-black hover:opacity-70 transition-opacity text-sm font-medium">
                    <span>Product</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                }
              >
                {productItems.map((item) => (
                  <DropdownMenuItem key={item.name} href={item.href}>
                    {item.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>

              <DropdownMenu
                trigger={
                  <button className="flex items-center space-x-1 text-black hover:opacity-70 transition-opacity text-sm font-medium">
                    <span>Create</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                }
              >
                {createItems.map((item) => (
                  <DropdownMenuItem key={item.name} href={item.href}>
                    {item.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>

              <DropdownMenu
                trigger={
                  <button className="flex items-center space-x-1 text-black hover:opacity-70 transition-opacity text-sm font-medium">
                    <span>Resources</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                }
              >
                {resourcesItems.map((item) => (
                  <DropdownMenuItem key={item.name} href={item.href}>
                    {item.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>

              <Link
                href="/pricing"
                className="text-black hover:opacity-70 transition-opacity text-sm font-medium"
              >
                Pricing
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link href="/signup">
                <Button
                  className={cn(
                    "rounded-lg text-white text-sm font-medium px-4 py-2 flex items-center space-x-2",
                    "hover:opacity-90 transition-opacity"
                  )}
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  <span>Start Designing</span>
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="rounded-lg border border-black text-black bg-white hover:bg-gray-50 text-sm font-medium px-4 py-2"
                >
                  Login
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-gray-100 mt-2 pt-4 pb-4"
              >
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">Product</div>
                    <div className="space-y-1 pl-4">
                      {productItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block py-2 text-sm text-gray-600 hover:text-black"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">Create</div>
                    <div className="space-y-1 pl-4">
                      {createItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block py-2 text-sm text-gray-600 hover:text-black"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">Resources</div>
                    <div className="space-y-1 pl-4">
                      {resourcesItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block py-2 text-sm text-gray-600 hover:text-black"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className="block py-2 text-sm font-medium text-gray-900"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Pricing
                  </Link>
                  <div className="pt-4 space-y-2">
                    <Link href="/signup" onClick={() => setIsMobileOpen(false)}>
                      <Button
                        className="w-full rounded-lg text-white text-sm font-medium py-2 flex items-center justify-center space-x-2"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        <span>Start Designing</span>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login" onClick={() => setIsMobileOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full rounded-lg border border-black text-black bg-white"
                      >
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}
