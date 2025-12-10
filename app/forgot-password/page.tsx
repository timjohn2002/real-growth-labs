"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // In development, show the reset link
        if (data.resetUrl && typeof window !== "undefined") {
          console.log("Reset link:", data.resetUrl)
          // Store it so user can copy it
          localStorage.setItem("resetLink", data.resetUrl)
        }
      } else {
        setError(data.error || "Failed to send reset email. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Forgot password error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-gray-100">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/login">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your email to receive a password reset link
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {typeof window !== "undefined" && localStorage.getItem("resetLink") 
                      ? "Reset Link Generated" 
                      : "Check your email"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {typeof window !== "undefined" && localStorage.getItem("resetLink")
                      ? "Click the link below to reset your password:"
                      : `We've sent a password reset link to ${email}`}
                  </p>
                  {typeof window !== "undefined" && localStorage.getItem("resetLink") && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-800 mb-2">Development Mode - Reset Link:</p>
                      <a
                        href={localStorage.getItem("resetLink") || ""}
                        className="text-xs text-blue-600 hover:underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {localStorage.getItem("resetLink")}
                      </a>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    The link will expire in 1 hour.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#a6261c] hover:bg-[#8e1e16]"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link href="/login" className="text-[#a6261c] hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

