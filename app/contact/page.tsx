"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg">
          We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Your message here..."
                    rows={6}
                  />
                </div>
                <Button type="submit" className="w-full bg-[#a6261c] hover:bg-[#8e1e16]">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-600">
              We&apos;re here to help! Reach out to us through any of the channels below.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Mail, title: "Email", content: "hello@realgrowthlabs.com", link: "mailto:hello@realgrowthlabs.com" },
              { icon: Phone, title: "Phone", content: "+1 (555) 123-4567", link: "tel:+15551234567" },
              { icon: MapPin, title: "Address", content: "123 Business St, Suite 100\nSan Francisco, CA 94105", link: null },
              { icon: Clock, title: "Business Hours", content: "Monday - Friday: 9:00 AM - 6:00 PM PST\nWeekend: Closed", link: null },
            ].map((info, index) => {
              const Icon = info.icon
              return (
                <Card key={info.title} className="border-gray-100">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0" style={{ backgroundColor: "rgba(166, 38, 28, 0.1)" }}>
                        <Icon className="h-6 w-6 text-[#a6261c]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-gray-600 hover:text-[#a6261c] transition-colors whitespace-pre-line"
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
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
