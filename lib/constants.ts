export const SITE_CONFIG = {
  name: "Real Growth Labs",
  description: "Turn your knowledge into books, lead magnets, and audiobooks using AI",
  url: "https://realgrowthlabs.com",
  ogImage: "/og-image.jpg",
}

export const NAVIGATION = {
  main: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  dashboard: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Books", href: "/books" },
    { name: "Builder", href: "/builder" },
  ],
}

export const PRICING_PLANS = [
  {
    name: "Basic",
    price: 27,
    period: "month",
    billingCycle: "yearly" as const,
    description: "Perfect for getting started",
    features: [
      "1 book project",
      "Basic AI writing tools",
      "PDF export",
      "Email support",
      "5GB storage",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: 97,
    period: "month",
    description: "For serious creators",
    features: [
      "Unlimited books",
      "Advanced AI tools",
      "Audiobook generation",
      "Priority support",
      "50GB storage",
      "Analytics dashboard",
      "Custom branding",
    ],
    popular: true,
  },
] as const

export const FEATURES = [
  {
    title: "Funnel Builder",
    description: "Create complete marketing funnels to turn your books into lead magnets and revenue streams.",
    icon: "Funnel",
  },
  {
    title: "AI Book Engine",
    description: "Transform your knowledge into well-structured books using advanced AI technology.",
    icon: "Book",
  },
  {
    title: "Content Knowledge Base",
    description: "Import from podcasts, videos, voice notes, and URLs to build your knowledge repository.",
    icon: "Database",
  },
  {
    title: "Book Review Metrics",
    description: "Track engagement, reviews, and performance metrics for all your published books.",
    icon: "BarChart",
  },
  {
    title: "1-Click Audiobook Generator",
    description: "Convert your books to professional audiobooks with a single click.",
    icon: "Headphones",
  },
] as const

