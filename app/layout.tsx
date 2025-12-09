import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { ConditionalLayout } from "@/components/ConditionalLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Real Growth Labs - Turn Your Knowledge Into Books",
    template: "%s | Real Growth Labs",
  },
  description: "Turn your knowledge into books, lead magnets, and audiobooks using AI. Create, publish, and monetize your expertise with Real Growth Labs.",
  keywords: ["AI books", "book creation", "audiobook generator", "lead magnets", "knowledge base", "content creation"],
  authors: [{ name: "Real Growth Labs" }],
  creator: "Real Growth Labs",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://realgrowthlabs.com",
    siteName: "Real Growth Labs",
    title: "Real Growth Labs - Turn Your Knowledge Into Books",
    description: "Turn your knowledge into books, lead magnets, and audiobooks using AI.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Real Growth Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Growth Labs - Turn Your Knowledge Into Books",
    description: "Turn your knowledge into books, lead magnets, and audiobooks using AI.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  )
}

