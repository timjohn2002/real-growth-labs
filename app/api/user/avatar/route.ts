import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// POST /api/user/avatar - Upload avatar
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "user-1"
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // TODO: Upload to actual storage (Supabase Storage, S3, etc.)
    // For now, convert to base64 data URL (not ideal for production)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Handle placeholder user ID - find or create a default user in development
    let actualUserId: string | null = null
    
    if (userId === "user-1") {
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { error: "Invalid user ID. Please log in again." },
          { status: 401 }
        )
      }
      
      // In development, try to find or create a default user
      // If database is not configured, return avatar without persisting
      try {
        // First try to find existing user
        let defaultUser = await prisma.user.findUnique({
          where: { email: "user@example.com" },
        })
        
        // If not found, create one
        if (!defaultUser) {
          defaultUser = await prisma.user.create({
            data: {
              email: "user@example.com",
              name: "Demo User",
            },
          })
        }
        
        actualUserId = defaultUser.id
      } catch (createError: any) {
        console.error("Database operation failed:", createError)
        
        // If ANY database error occurs (connection, validation, etc.), 
        // return avatar without persisting in development
        const isAnyDatabaseError = 
          createError instanceof Prisma.PrismaClientKnownRequestError ||
          createError instanceof Prisma.PrismaClientValidationError ||
          createError?.message?.includes("prisma") ||
          createError?.message?.includes("database") ||
          createError?.message?.includes("Invalid")
        
        if (isAnyDatabaseError) {
          // Database not configured or error - return avatar without persisting (development only)
          console.warn("Database error detected. Avatar uploaded but not persisted. Set DATABASE_URL to enable persistence.")
          return NextResponse.json({
            message: "Avatar uploaded successfully (not persisted - database not configured)",
            avatar: dataUrl,
            warning: "Database not configured. Avatar will not persist after page refresh. Set DATABASE_URL in .env to enable persistence."
          })
        }
        
        // If it's not a database error, throw it
        throw createError
      }
    } else {
      // Validate that userId looks like a valid cuid (starts with 'c' and is ~25 chars)
      if (userId.length < 20 || !userId.match(/^[a-z]/)) {
        return NextResponse.json(
          { error: "Invalid user ID format. Please log in again." },
          { status: 401 }
        )
      }
      actualUserId = userId
    }

    // Safety check - ensure we have a valid userId before proceeding
    if (!actualUserId || actualUserId === "user-1") {
      return NextResponse.json(
        { error: "Invalid user ID. Please log in again." },
        { status: 401 }
      )
    }

    // Check if user exists
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { id: actualUserId },
      })
    } catch (prismaError: any) {
      console.error("Failed to find user:", prismaError)
      
      // If database error, return avatar without persisting in development
      const isAnyDatabaseError = 
        prismaError instanceof Prisma.PrismaClientKnownRequestError ||
        prismaError instanceof Prisma.PrismaClientValidationError ||
        prismaError?.message?.includes("prisma") ||
        prismaError?.message?.includes("database") ||
        prismaError?.message?.includes("Invalid")
      
      if (isAnyDatabaseError && process.env.NODE_ENV === "development") {
        return NextResponse.json({
          message: "Avatar uploaded successfully (not persisted - database error)",
          avatar: dataUrl,
          warning: "Database error. Avatar will not persist. Check your DATABASE_URL configuration."
        })
      }
      
      // Handle Prisma validation errors
      if (prismaError instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
          { error: "Invalid user ID format. Please log in again." },
          { status: 401 }
        )
      }
      throw prismaError
    }

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 404 }
      )
    }

    // Update user avatar
    try {
      const user = await prisma.user.update({
        where: { id: actualUserId },
        data: { avatar: dataUrl },
        select: {
          id: true,
          avatar: true,
        },
      })

      return NextResponse.json({
        message: "Avatar uploaded successfully",
        avatar: user.avatar,
      })
    } catch (updateError: any) {
      console.error("Failed to update avatar:", updateError)
      
      // If database error in development, return avatar without persisting
      const isAnyDatabaseError = 
        updateError instanceof Prisma.PrismaClientKnownRequestError ||
        updateError instanceof Prisma.PrismaClientValidationError ||
        updateError?.message?.includes("prisma") ||
        updateError?.message?.includes("database") ||
        updateError?.message?.includes("Invalid")
      
      if (isAnyDatabaseError && process.env.NODE_ENV === "development") {
        return NextResponse.json({
          message: "Avatar uploaded successfully (not persisted - database error)",
          avatar: dataUrl,
          warning: "Database error. Avatar will not persist. Check your DATABASE_URL configuration."
        })
      }
      
      throw updateError
    }
  } catch (error) {
    console.error("Upload avatar error:", error)
    
    // Handle Prisma errors more gracefully
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "User not found. Please log in again." },
          { status: 404 }
        )
      }
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A conflict occurred. Please try again." },
          { status: 409 }
        )
      }
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: "Invalid user ID format. Please log in again." },
        { status: 401 }
      )
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Failed to upload avatar: ${errorMessage}` },
      { status: 500 }
    )
  }
}

