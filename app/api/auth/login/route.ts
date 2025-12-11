import { NextRequest, NextResponse } from "next/server"
import { loginSchema } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(validatedData.password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create session
    const token = await createSession(user.id)

    // Set cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      },
      { status: 200 }
    )

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    
    // Handle Prisma/database errors
    if (error instanceof Error) {
      // Database connection error
      if (error.message.includes("Can't reach database") || error.message.includes("P1001")) {
        console.error("Database connection failed:", error.message)
        return NextResponse.json(
          { error: "Database connection failed. Please try again in a moment." },
          { status: 503 }
        )
      }
      
      // Validation errors
      if (error.message.includes("Invalid") || error.message.includes("ZodError")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }
    
    // Generic error - don't reveal if it's a database issue for security
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    )
  }
}

