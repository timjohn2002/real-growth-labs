import { NextRequest, NextResponse } from "next/server"
import { signupSchema } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
      },
    })

    // Create session
    const token = await createSession(user.id)

    // Set cookie
    const response = NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    
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
      
      // Unique constraint (email already exists)
      if (error.message.includes("Unique constraint") || error.message.includes("P2002")) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
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
    
    // Generic error
    return NextResponse.json(
      { 
        error: "Failed to create account",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}

