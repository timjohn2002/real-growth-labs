import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(), // Token not expired
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token. Please request a new one." },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    // Delete all existing sessions (force re-login)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    return NextResponse.json({
      message: "Password reset successfully. You can now login with your new password.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}

