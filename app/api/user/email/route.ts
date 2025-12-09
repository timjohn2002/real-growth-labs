import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PUT /api/user/email - Change email
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "user-1"
    const body = await request.json()
    const { newEmail, password } = body

    if (!newEmail) {
      return NextResponse.json(
        { error: "New email is required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    })

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      )
    }

    // Verify password if provided
    if (password) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      })

      if (user?.passwordHash) {
        const bcrypt = require("bcryptjs")
        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
          return NextResponse.json(
            { error: "Password is incorrect" },
            { status: 401 }
          )
        }
      }
    }

    // Update email
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: "Email updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Change email error:", error)
    return NextResponse.json(
      { error: "Failed to change email" },
      { status: 500 }
    )
  }
}

