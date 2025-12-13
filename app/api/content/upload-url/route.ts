import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Generate upload path and return Supabase configuration for direct client-side uploads
 * This bypasses Vercel's 4.5MB limit by uploading directly to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { filename, fileType } = await request.json()

    if (!filename || !fileType) {
      return NextResponse.json(
        { error: "Filename and fileType are required" },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase storage is not configured. Please set SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables." },
        { status: 500 }
      )
    }

    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "-")
    const filePath = `content-vault/${userId}/${timestamp}-${sanitizedFilename}`

    return NextResponse.json({
      path: filePath,
      supabaseUrl,
      supabaseAnonKey,
      bucket: "content-vault",
    })
  } catch (error) {
    console.error("Upload URL generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload path" },
      { status: 500 }
    )
  }
}
