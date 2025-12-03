"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    content: "hello@realgrowthlabs.com",
    link: "mailto:hello@realgrowthlabs.com",
  },
  {
    icon: Phone,
    title: "Phone",
    content: "+1 (555) 123-4567",
    link: "tel:+15551234567",
  },
  {
    icon: MapPin,
    title: "Address",
    content: "123 Business St, Suite 100\nSan Francisco, CA 94105",
    link: null,
  },
  {
    icon: Clock,
    title: "Business Hours",
    content: "Monday - Friday: 9:00 AM - 6:00 PM PST\nWeekend: Closed",
    link: null,
  },
]

export function ContactInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
        <p className="text-gray-600">
          We're here to help! Reach out to us through any of the channels below,
          and we'll respond as soon as possible.
        </p>
      </div>
      <div className="space-y-4">
        {contactInfo.map((info, index) => {
          const Icon = info.icon
          return (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0" style={{ backgroundColor: "rgba(166, 38, 28, 0.1)" }}>
                      <Icon className="h-6 w-6" style={{ color: "#a6261c" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-gray-600 transition-colors whitespace-pre-line"
                          style={{ "--hover-color": "#a6261c" } as React.CSSProperties}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#a6261c"}
                          onMouseLeave={(e) => e.currentTarget.style.color = ""}
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-gray-600 whitespace-pre-line">{info.content}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

