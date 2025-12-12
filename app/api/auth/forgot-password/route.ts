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
    console.log("Looking for user with email:", email)
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success (don't reveal if email exists)
    if (!user) {
      console.log("❌ User not found in database. Email will not be sent (security: don't reveal if email exists).")
      return NextResponse.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      })
    }

    console.log("✅ User found in database. Proceeding with password reset email.")

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
    // Prioritize Vercel's automatic URL, then NEXT_PUBLIC_APP_URL, then fallback to localhost
    // VERCEL_URL is automatically set by Vercel and is more reliable
    let baseUrl = "http://localhost:3000"
    
    if (process.env.VERCEL_URL) {
      // Vercel automatically provides this - use it first
      baseUrl = `https://${process.env.VERCEL_URL}`
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      // Only use NEXT_PUBLIC_APP_URL if it looks like a valid app URL (not a database URL)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL
      // Check if it's NOT a Supabase/database URL
      if (!appUrl.includes("supabase") && !appUrl.includes("postgres")) {
        baseUrl = appUrl
      }
    }
    
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`
    console.log("Generated reset URL:", resetUrl)

    // Send email with reset link
    console.log("=".repeat(50))
    console.log("📧 ATTEMPTING TO SEND PASSWORD RESET EMAIL")
    console.log("=".repeat(50))
    console.log("To:", email)
    console.log("Reset URL:", resetUrl)
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
    console.log("RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL || "noreply@labs.realgrowth.art (default)")
    console.log("=".repeat(50))
    
    const emailResult = await sendPasswordResetEmail(email, resetUrl)

    // Log email result
    if (emailResult.success) {
      console.log("✅ Password reset email sent successfully")
      console.log("Email ID:", emailResult.emailId)
    } else {
      console.error("=".repeat(60))
      console.error("❌ FAILED TO SEND PASSWORD RESET EMAIL")
      console.error("=".repeat(60))
      console.error("Error:", emailResult.error)
      if (emailResult.details) {
        console.error("Error details:", emailResult.details)
      }
      console.error("=".repeat(60))
      console.error("TROUBLESHOOTING:")
      console.error("1. Check RESEND_API_KEY is set correctly in Vercel")
      console.error("2. Verify domain 'labs.realgrowth.art' is verified in Resend")
      console.error("3. Check RESEND_FROM_EMAIL matches verified domain")
      console.error("4. Check Resend dashboard for API errors")
      console.error("=".repeat(60))
    }

    // In development mode, also return the reset link for easy testing
    // (even if email was sent successfully)
    const isDevelopment = process.env.NODE_ENV === "development"

    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
      // Include reset link in development mode for testing
      ...(isDevelopment && { resetUrl }),
      // Include email status for debugging (in all environments)
      emailSent: emailResult.success,
      ...(emailResult.success && { emailId: emailResult.data?.id }),
      ...(!emailResult.success && { emailError: emailResult.error }),
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

