import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/user - Get current user
export async function GET(request: NextRequest) {
  try {
    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// PUT /api/user - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, avatar, preferences } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (avatar !== undefined) updateData.avatar = avatar
    if (preferences !== undefined) {
      // Store preferences as JSON string
      updateData.preferences = typeof preferences === "string" 
        ? preferences 
        : JSON.stringify(preferences)
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

