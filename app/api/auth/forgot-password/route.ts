import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    // TODO: Send email with reset link
    // For now, we'll log it (in production, use email service like Resend)
    console.log(`Password reset link for ${email}: ${resetUrl}`)

    // In development, you can check the console for the reset link
    // In production, this should send an email via Resend or similar service

    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
      // Only include this in development
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

