import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// DELETE /api/user/delete - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "user-1"
    const body = await request.json()
    const { password, confirmText } = body

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete account" },
        { status: 400 }
      )
    }

    if (confirmText !== "DELETE") {
      return NextResponse.json(
        { error: "Please type DELETE to confirm" },
        { status: 400 }
      )
    }

    // Get user and verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verify password
    if (user.passwordHash) {
      const bcrypt = require("bcryptjs")
      const isValid = await bcrypt.compare(password, user.passwordHash)
      if (!isValid) {
        return NextResponse.json(
          { error: "Password is incorrect" },
          { status: 401 }
        )
      }
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}

