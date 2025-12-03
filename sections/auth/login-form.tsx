"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function LoginForm() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="#" className="text-sm hover:underline" style={{ color: "#a6261c" }}>
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="hover:underline" style={{ color: "#a6261c" }}>
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

