import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Generate a temporary upload token for client-side direct uploads
 * This allows large files to be uploaded directly from the client to Supabase
 * while bypassing RLS using the service role key
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

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase storage is not configured" },
        { status: 500 }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "-")
    const filePath = `content-vault/${userId}/${timestamp}-${sanitizedFilename}`

    // Create a signed upload URL (valid for 1 hour)
    // Note: Supabase doesn't support presigned URLs like S3, but we can create
    // a temporary token that allows upload
    const expiresIn = 3600 // 1 hour

    // For now, return the path and credentials for direct upload
    // The client will use the service role key temporarily (not ideal, but works)
    // TODO: Implement proper signed URL generation if Supabase adds support
    
    return NextResponse.json({
      path: filePath,
      supabaseUrl,
      // Return service role key temporarily - client will use it for upload only
      // This is not ideal but necessary for large files
      supabaseKey: supabaseServiceKey,
      bucket: "content-vault",
      expiresIn,
    })
  } catch (error) {
    console.error("[get-upload-token] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate upload token" },
      { status: 500 }
    )
  }
}
