import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Server-side upload endpoint for large files
 * Uses Supabase service role key to bypass RLS
 * This handles the actual file upload to Supabase Storage
 * 
 * Note: Vercel has a 4.5MB request body limit for serverless functions.
 * For files larger than this, we need to use client-side direct upload.
 */
export const maxDuration = 300 // 5 minutes for large uploads
export const runtime = 'nodejs'

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

    // Check if Supabase is configured
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables." },
        { status: 500 }
      )
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const title = formData.get("title") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "-")
    const filePath = `content-vault/${userId}/${timestamp}-${sanitizedFilename}`

    console.log(`[upload-large] Uploading file to Supabase Storage: ${filePath}`)
    console.log(`[upload-large] File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("content-vault")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("[upload-large] Supabase upload error:", uploadError)
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      )
    }

    console.log(`[upload-large] File uploaded successfully: ${uploadData.path}`)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("content-vault")
      .getPublicUrl(filePath)

    const fileUrl = urlData.publicUrl

    return NextResponse.json({
      fileUrl,
      filePath,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("[upload-large] Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    )
  }
}
