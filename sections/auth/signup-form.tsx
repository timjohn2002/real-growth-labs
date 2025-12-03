"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function SignUpForm() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="terms" className="rounded" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="#" className="hover:underline" style={{ color: "#a6261c" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="hover:underline" style={{ color: "#a6261c" }}>
                  Privacy Policy
                </Link>
              </label>
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="hover:underline" style={{ color: "#a6261c" }}>
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

