import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomUUID()
    const resetTokenExpires = new Date()
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1) // 1 hour expiration

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    // Generate reset URL
    // Try NEXT_PUBLIC_APP_URL first, then Vercel's automatic URL, then fallback to localhost
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    // Send email with reset link
    const emailResult = await sendPasswordResetEmail(email, resetUrl)

    // If email sending failed but we have RESEND_API_KEY, log the error
    if (!emailResult.success && process.env.RESEND_API_KEY) {
      console.error("Failed to send password reset email:", emailResult.error)
    }

    // In development mode, also return the reset link for easy testing
    // (even if email was sent successfully)
    const isDevelopment = process.env.NODE_ENV === "development"

    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
      // Include reset link in development mode for testing
      ...(isDevelopment && { resetUrl }),
      // Include email status in development for debugging
      ...(isDevelopment && { emailSent: emailResult.success }),
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

