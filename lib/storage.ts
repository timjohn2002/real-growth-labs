/**
 * File Storage Utilities
 * 
 * This module handles file storage for audio files and other media.
 * Uses Supabase Storage for production.
 */

import { createClient } from "@supabase/supabase-js"

export interface StorageConfig {
  provider: "local" | "supabase" | "s3" | "cloudinary"
  bucket?: string
  folder?: string
}

/**
 * Upload a file to storage
 * @param file - File to upload (Buffer or File)
 * @param path - Path/filename in storage
 * @param config - Storage configuration
 * @returns URL to the uploaded file
 */
export async function uploadFile(
  file: File | Buffer,
  path: string,
  config?: StorageConfig
): Promise<string> {
  const storageConfig = config || {
    provider: (process.env.STORAGE_PROVIDER as any) || "supabase",
    bucket: process.env.STORAGE_BUCKET || "content-vault",
    folder: process.env.STORAGE_FOLDER || "audiobooks",
  }

  switch (storageConfig.provider) {
    case "supabase":
      // Use Supabase Storage
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Supabase storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      const bucket = storageConfig.bucket || "content-vault"
      const folder = storageConfig.folder || "audiobooks"
      const filePath = `${folder}/${path}`

      // Convert File to Buffer if needed
      let buffer: Buffer
      if (file instanceof Buffer) {
        buffer = file
      } else {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      }

      console.log(`[uploadFile] Uploading to Supabase Storage: ${filePath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType: "audio/mpeg",
          upsert: true, // Allow overwriting
        })

      if (uploadError) {
        console.error("[uploadFile] Supabase upload error:", uploadError)
        throw new Error(`Failed to upload file to Supabase Storage: ${uploadError.message}`)
      }

      console.log(`[uploadFile] File uploaded successfully: ${uploadData.path}`)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      const fileUrl = urlData.publicUrl
      console.log(`[uploadFile] File URL: ${fileUrl}`)

      return fileUrl

    case "local":
      // For local development, save to public/uploads
      // In production, you'd want to use a proper storage service
      return `/uploads/${storageConfig.folder || "audiobooks"}/${path}`

    case "s3":
      // TODO: Implement AWS S3 upload
      throw new Error("S3 storage not implemented yet")

    case "cloudinary":
      // TODO: Implement Cloudinary upload
      throw new Error("Cloudinary storage not implemented yet")

    default:
      throw new Error(`Unsupported storage provider: ${storageConfig.provider}`)
  }
}

/**
 * Delete a file from storage
 * @param path - Path to file in storage
 * @param config - Storage configuration
 */
export async function deleteFile(
  path: string,
  config?: StorageConfig
): Promise<void> {
  const storageConfig = config || {
    provider: (process.env.STORAGE_PROVIDER as any) || "local",
    bucket: process.env.STORAGE_BUCKET,
    folder: process.env.STORAGE_FOLDER || "audiobooks",
  }

  switch (storageConfig.provider) {
    case "local":
      // For local development, files in public/uploads
      // In production, implement proper deletion
      console.log(`Would delete: ${path}`)
      return

    case "supabase":
      // TODO: Implement Supabase Storage deletion
      throw new Error("Supabase storage not implemented yet")

    case "s3":
      // TODO: Implement AWS S3 deletion
      throw new Error("S3 storage not implemented yet")

    case "cloudinary":
      // TODO: Implement Cloudinary deletion
      throw new Error("Cloudinary storage not implemented yet")

    default:
      throw new Error(`Unsupported storage provider: ${storageConfig.provider}`)
  }
}

/**
 * Get a signed URL for temporary access to a file
 * @param path - Path to file in storage
 * @param expiresIn - Expiration time in seconds
 * @param config - Storage configuration
 * @returns Signed URL
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600,
  config?: StorageConfig
): Promise<string> {
  const storageConfig = config || {
    provider: (process.env.STORAGE_PROVIDER as any) || "local",
    bucket: process.env.STORAGE_BUCKET,
    folder: process.env.STORAGE_FOLDER || "audiobooks",
  }

  switch (storageConfig.provider) {
    case "local":
      // For local development, return direct path
      return `/uploads/${storageConfig.folder || "audiobooks"}/${path}`

    case "supabase":
      // TODO: Implement Supabase signed URL
      // const { data } = await supabase.storage
      //   .from(bucket)
      //   .createSignedUrl(`${folder}/${path}`, expiresIn)
      throw new Error("Supabase storage not implemented yet")

    case "s3":
      // TODO: Implement AWS S3 signed URL
      throw new Error("S3 storage not implemented yet")

    case "cloudinary":
      // TODO: Implement Cloudinary signed URL
      throw new Error("Cloudinary storage not implemented yet")

    default:
      throw new Error(`Unsupported storage provider: ${storageConfig.provider}`)
  }
}

/**
 * Generate a unique filename for an audiobook
 * @param bookId - Book ID
 * @param voice - Voice ID
 * @returns Unique filename
 */
export function generateAudiobookFilename(bookId: string, voice: string): string {
  const timestamp = Date.now()
  const sanitizedVoice = voice.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
  return `${bookId}-${sanitizedVoice}-${timestamp}.mp3`
}

