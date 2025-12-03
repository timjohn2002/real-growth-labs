import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Mail } from "lucide-react"

const BRAND_COLOR = "#8B3A2F"

const resources = [
  { name: "Blog", href: "/blog" },
  { name: "eBook Templates", href: "/templates" },
  { name: "AI eBook Generator", href: "/generator" },
  { name: "AI Report Generator", href: "/report-generator" },
  { name: "How to create an eBook", href: "/how-to" },
]

const useCases = [
  { name: "eBooks", href: "/use-cases/ebooks" },
  { name: "Audio Books", href: "/use-cases/audiobooks" },
  { name: "Funnels", href: "/use-cases/funnels" },
  { name: "Social Media", href: "/use-cases/social-media" },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Get started with Real Growth Labs
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/signup">
                <Button
                  className="rounded-lg text-white text-base font-medium px-6 py-3 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  className="rounded-lg border-2 border-black text-black bg-white hover:bg-gray-50 text-base font-medium px-6 py-3"
                >
                  See Pricing
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Argentina</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:support@rgrowth.com"
                  className="text-sm hover:underline"
                >
                  support@rgrowth.com
                </a>
              </div>
            </div>
          </div>
          <div className="border-l border-gray-200 pl-8">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-l border-gray-200 pl-8">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Use Cases</h4>
            <ul className="space-y-2">
              {useCases.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              ©2025 Real Growth Labs All Rights Reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/cookie-settings"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cookie Settings
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
