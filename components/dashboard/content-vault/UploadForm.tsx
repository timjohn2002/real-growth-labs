"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { X, Upload, FileText, Link as LinkIcon, Video, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import * as DialogPrimitive from "@radix-ui/react-dialog"

const BRAND_COLOR = "#a6261c"

interface UploadFormProps {
  type: "video" | "url" | "text" | "image"
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string // TODO: Get from auth context
}

export function UploadForm({ type, isOpen, onClose, onSuccess, userId }: UploadFormProps) {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [tags, setTags] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("") // Clear any previous errors
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsUploading(true)

    try {
      if (type === "url") {
        // Validate URL before submitting
        if (!url.trim()) {
          throw new Error("Please enter a URL")
        }

        try {
          new URL(url)
        } catch {
          throw new Error("Invalid URL format. Please enter a valid URL (e.g., https://example.com)")
        }

        // Scrape URL
        const response = await fetch("/api/content/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: url.trim(),
            title: title || url,
            userId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to scrape URL")
        }

        // Success - YouTube videos will be processed
        if (data.message && data.message.includes("YouTube")) {
          // Show success message for YouTube
          console.log("YouTube video processing started")
        }
      } else if (type === "text") {
        // Create text content
        const response = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || "Untitled Note",
            text,
            userId,
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create text content")
        }
      } else if (file) {
        // Check file size - use Supabase for files > 4.5MB
        const vercelLimit = 4.5 * 1024 * 1024 // 4.5MB
        const useDirectUpload = file.size > vercelLimit

        if (useDirectUpload) {
          // For large files, upload via server-side endpoint (uses service role key)
          console.log("[UploadForm] Starting server-side upload for large file...")
          
          const formData = new FormData()
          formData.append("file", file)
          formData.append("type", type)
          formData.append("title", title || file.name)

          // Step 1: Upload file to Supabase via server (bypasses RLS)
          const uploadResponse = await fetch("/api/content/upload-large", {
            method: "POST",
            body: formData,
            credentials: "include",
          })

          if (!uploadResponse.ok) {
            let errorMessage = "Failed to upload file"
            // Clone response before reading (can only read body once)
            const clonedResponse = uploadResponse.clone()
            try {
              const data = await uploadResponse.json()
              errorMessage = data.error || errorMessage
              console.error("[UploadForm] Upload error response:", data)
            } catch (parseError) {
              // If JSON parsing fails, try reading as text from cloned response
              try {
                const text = await clonedResponse.text()
                errorMessage = text || errorMessage
                console.error("[UploadForm] Failed to parse error response:", text)
              } catch (textError) {
                errorMessage = `Upload failed with status ${uploadResponse.status}`
                console.error("[UploadForm] Could not read error response:", textError)
              }
            }
            throw new Error(errorMessage)
          }

          const { fileUrl, filePath } = await uploadResponse.json()
          console.log("[UploadForm] File uploaded successfully to Supabase Storage")
          console.log("[UploadForm] File URL:", fileUrl)

          // Step 2: Notify our API with the file URL to process it
          console.log("[UploadForm] Calling /api/content/upload-from-url...")
          const response = await fetch("/api/content/upload-from-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              fileUrl,
              filePath,
              type,
              title: title || file.name,
              filename: file.name,
              size: file.size,
              mimeType: file.type,
            }),
          })

          console.log("[UploadForm] Response status:", response.status, response.statusText)

          if (!response.ok) {
            let errorMessage = "Failed to process uploaded file"
            try {
              const data = await response.json()
              errorMessage = data.error || data.details || errorMessage
              console.error("[UploadForm] Upload error response:", data)
            } catch (parseError) {
              const text = await response.text()
              errorMessage = text || errorMessage
              console.error("[UploadForm] Failed to parse error response:", text)
            }
            throw new Error(errorMessage)
          }

          const result = await response.json()
          console.log("[UploadForm] Upload successful:", result)
        } else {
          // For small files, use traditional upload through Vercel
          const formData = new FormData()
          formData.append("file", file)
          formData.append("type", type)
          formData.append("title", title || file.name)
          formData.append("userId", userId)

          const response = await fetch("/api/content/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            let errorMessage = "Failed to upload file"
            try {
              const data = await response.json()
              errorMessage = data.error || errorMessage
            } catch (parseError) {
              // If response is not JSON, try to get text
              try {
                const text = await response.text()
                errorMessage = text || errorMessage
              } catch {
                // Use default error message
              }
            }
            throw new Error(errorMessage)
          }
        }
      } else {
        throw new Error("Please select a file")
      }

      // Reset form
      setTitle("")
      setFile(null)
      setUrl("")
      setText("")
      setTags("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      onSuccess()
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      console.error("Upload error:", err)
      setError(errorMessage)
      // Keep the form open so user can fix the error
    } finally {
      setIsUploading(false)
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case "video":
        return Video
      case "url":
        return LinkIcon
      case "text":
        return FileText
      case "image":
        return ImageIcon
      default:
        return Upload
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case "video":
        return "Video Upload"
      case "url":
        return "Paste URL"
      case "text":
        return "Paste Text / Notes"
      case "image":
        return "Image Upload"
      default:
        return "Upload"
    }
  }

  const Icon = getTypeIcon()

  if (!isOpen) return null

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-8 shadow-xl rounded-2xl">
          <DialogPrimitive.Title className="sr-only">{getTypeLabel()}</DialogPrimitive.Title>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${BRAND_COLOR}10` }}
              >
                <Icon className="h-6 w-6" style={{ color: BRAND_COLOR }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{getTypeLabel()}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this content"
                required
              />
            </div>

            {/* File Upload (Video/Image) */}
            {(type === "video" || type === "image") && (
              <div>
                <Label>File</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                      type === "video"
                        ? "video/mp4,video/webm,video/quicktime"
                        : "image/jpeg,image/png,image/gif,image/webp,image/jpg"
                    }
                    onChange={handleFileSelect}
                    className="hidden"
                    required
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#a6261c] transition-colors"
                  >
                    {file ? (
                      <div>
                        {type === "image" && file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg mb-2"
                          />
                        ) : null}
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload {type === "video" ? "video" : "image"} file
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {type === "video"
                            ? "MP4, WebM, QuickTime (Large files supported via Supabase)"
                            : "JPEG, PNG, GIF, WebP"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* URL Input */}
            {type === "url" && (
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL to scrape content from
                </p>
              </div>
            )}

            {/* Text Input */}
            {type === "text" && (
              <div>
                <Label htmlFor="text">Content</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type your content here..."
                  rows={10}
                  required
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="marketing, business, growth"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                style={{ backgroundColor: BRAND_COLOR }}
                className="text-white"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

