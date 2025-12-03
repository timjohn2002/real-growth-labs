"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  Target,
  Database,
  Globe,
  Lock,
  Bell,
  Settings,
  FileText
} from "lucide-react"

const allFeatures = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Get deep insights into your business performance with real-time analytics and comprehensive reporting.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Performance",
    description: "Experience blazing-fast performance with our optimized platform built for speed and efficiency.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your data is protected with enterprise-grade security, encryption, and 99.9% uptime guarantee.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work seamlessly with your team using our collaborative tools, shared workspaces, and real-time updates.",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracking",
    description: "Track your growth metrics and see your progress over time with detailed charts and visualizations.",
  },
  {
    icon: Target,
    title: "Goal Setting & Tracking",
    description: "Set and achieve your business goals with our intelligent goal tracking and milestone system.",
  },
  {
    icon: Database,
    title: "Data Management",
    description: "Organize and manage your business data with powerful database tools and integrations.",
  },
  {
    icon: Globe,
    title: "Multi-Platform Support",
    description: "Access your dashboard from anywhere with our web, mobile, and desktop applications.",
  },
  {
    icon: Lock,
    title: "Privacy Controls",
    description: "Control who sees what with granular privacy settings and permission management.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Stay informed with customizable notifications and alerts for important updates.",
  },
  {
    icon: Settings,
    title: "Customizable Dashboard",
    description: "Personalize your workspace with customizable dashboards and widget configurations.",
  },
  {
    icon: FileText,
    title: "Comprehensive Reports",
    description: "Generate detailed reports and export your data in multiple formats for analysis.",
  },
]

export function FeaturesList() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(166, 38, 28, 0.1)" }}>
                      <Icon className="h-6 w-6" style={{ color: "#a6261c" }} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

