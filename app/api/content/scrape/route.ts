import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isYouTubeUrl, getYouTubeVideoInfo, extractYouTubeVideoId } from "@/lib/youtube"
import { transcribeYouTubeUrl, isAssemblyAIConfigured } from "@/lib/assemblyai"
import YTDlpWrap from "yt-dlp-wrap"
import { transcribeAudioFromBuffer } from "@/lib/openai"
import fs from "fs/promises"
import path from "path"
import os from "os"

// Scrape content from URLs
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

    const { url, title } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Check if it's a YouTube URL or any video URL
    const isYouTube = isYouTubeUrl(url)
    
    if (isYouTube) {
      // Get YouTube video info
      const videoInfo = await getYouTubeVideoInfo(url)
      
      if (!videoInfo) {
        return NextResponse.json(
          { error: "Failed to fetch YouTube video information. Please check the URL is valid." },
          { status: 400 }
        )
      }
      
      // Process YouTube video for transcription
      const contentItem = await prisma.contentItem.create({
        data: {
          userId,
          title: title || videoInfo.title || "YouTube Video",
          type: "video",
          status: "processing",
          source: url,
          thumbnail: videoInfo.thumbnail || null,
          metadata: JSON.stringify({ 
            url, 
            platform: "youtube",
            videoId: videoInfo.videoId,
            channelName: videoInfo.channelName,
          }),
          tags: "[]",
        },
      })

      // Try to use job queue if available, otherwise process directly
      const { getYouTubeQueue, isRedisAvailable } = await import("@/lib/queue")
      
      if (isRedisAvailable()) {
        const youtubeQueue = getYouTubeQueue()
        if (youtubeQueue) {
          try {
            const job = await youtubeQueue.add(
              `youtube-${contentItem.id}`,
              {
                contentItemId: contentItem.id,
                url,
              },
              {
                jobId: `youtube-${contentItem.id}`,
                priority: 1,
              }
            )
            
            // Update content item with job ID
            await prisma.contentItem.update({
              where: { id: contentItem.id },
              data: {
                metadata: JSON.stringify({
                  jobId: job.id,
                  processingStage: "Queued",
                  processingProgress: 5,
                }),
              },
            })
            
            return NextResponse.json({
              id: contentItem.id,
              status: "processing",
              message: "YouTube video processing queued",
              jobId: job.id,
            })
          } catch (queueError) {
            console.error("Failed to queue YouTube job, falling back to direct execution:", queueError)
            // Fall through to direct execution
          }
        }
      }
      
      // Fallback: Start processing in background (may timeout in serverless)
      // This will work in environments with longer timeouts or dedicated workers
      processYouTubeVideo(contentItem.id, url).catch((error) => {
        console.error("YouTube processing error:", error)
        // Update status to error
        prisma.contentItem.update({
          where: { id: contentItem.id },
          data: {
            status: "error",
            error: error instanceof Error ? error.message : "Processing failed",
          },
        }).catch((dbError) => {
          console.error("Failed to update error status:", dbError)
        })
      })

      return NextResponse.json({
        id: contentItem.id,
        status: "processing",
        message: "YouTube video processing started",
        warning: "Processing may take several minutes. If it fails, check the error status.",
      })
    }

    // Create content item
    const contentItem = await prisma.contentItem.create({
      data: {
        userId,
        title: title || url,
        type: "url",
        status: "processing",
        source: url,
        metadata: JSON.stringify({ url }),
        tags: "[]",
      },
    })

    // Start scraping
    scrapeUrl(contentItem.id, url).catch((error) => {
      console.error("Scraping error:", error)
      // Error is already handled in scrapeUrl function
    })

    return NextResponse.json({
      id: contentItem.id,
      status: "processing",
      message: "Scraping started",
    })
  } catch (error) {
    console.error("Scrape error:", error)
    return NextResponse.json(
      { error: "Failed to start scraping" },
      { status: 500 }
    )
  }
}

async function scrapeUrl(contentItemId: string, url: string) {
  try {
    // Stage 1: Initializing (10%)
    await updateProgress(contentItemId, "Initializing...", 10)
    
    // Check if it's a YouTube URL (double-check)
    const parsedUrl = new URL(url)
    const isYouTube = parsedUrl.hostname.includes("youtube.com") || parsedUrl.hostname.includes("youtu.be")
    
    if (isYouTube) {
      throw new Error("YouTube URLs cannot be scraped directly. Please use a different method to extract content.")
    }

    // Stage 2: Fetching URL (20-40%)
    await updateProgress(contentItemId, "Fetching webpage...", 20)
    
    // Fetch the URL with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    let response: Response
    try {
      response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      await updateProgress(contentItemId, "Downloading content...", 40)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request timed out. The URL may be unreachable or taking too long to respond.")
      }
      throw new Error(`Failed to fetch URL: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`)
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    // Stage 3: Extracting text (50-60%)
    await updateProgress(contentItemId, "Extracting text content...", 50)
    
    // Extract text content from HTML
    const text = extractTextFromHTML(html)

    if (!text || text.trim().length === 0) {
      throw new Error("No text content found")
    }

    await updateProgress(contentItemId, "Processing content...", 60)
    
    const wordCount = text.split(/\s+/).filter(Boolean).length
    
    // Stage 4: Generating summary (70-90%)
    await updateProgress(contentItemId, "Generating summary with AI...", 70)
    const summary = await generateSummary(text)
    await updateProgress(contentItemId, "Finalizing...", 90)

    // Extract metadata
    const title = extractTitle(html) || url
    const thumbnail = extractThumbnail(html)

    // Stage 5: Saving (95-100%)
    await updateProgress(contentItemId, "Saving to database...", 95)
    
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "ready",
        title,
        rawText: text,
        transcript: text,
        wordCount,
        summary,
        thumbnail,
        processedAt: new Date(),
        metadata: JSON.stringify({
          processingStage: "Complete",
          processingProgress: 100,
        }),
      },
    })
  } catch (error) {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: error instanceof Error ? error.message : "Scraping failed",
        metadata: JSON.stringify({
          processingStage: "Error",
          processingProgress: 0,
        }),
      },
    })
  }
}

function extractTextFromHTML(html: string): string {
  // Remove script, style, and other non-content tags completely
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<math[^>]*>[\s\S]*?<\/math>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
  
  // Try to extract main content from semantic HTML5 tags first
  let extractedText = ""
  
  // Priority 1: Article tag (most common for blog posts)
  const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  if (articleMatch) {
    extractedText = articleMatch[1]
  } else {
    // Priority 2: Main tag
    const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    if (mainMatch) {
      extractedText = mainMatch[1]
    } else {
      // Priority 3: Content divs (common class names)
      const contentDivMatch = text.match(/<div[^>]*(?:class|id)=["'][^"']*(?:content|post|article|entry|main-content|post-content|article-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
      if (contentDivMatch) {
        extractedText = contentDivMatch[1]
      } else {
        // Priority 4: Body tag
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        if (bodyMatch) {
          extractedText = bodyMatch[1]
        } else {
          // Fallback: use entire HTML
          extractedText = text
        }
      }
    }
  }

  // Remove all remaining HTML tags
  extractedText = extractedText.replace(/<[^>]+>/g, " ")
  
  // Decode HTML entities
  extractedText = extractedText
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&[a-z]+;/gi, " ") // Remove any other HTML entities
  
  // Clean up whitespace - multiple spaces, newlines, tabs
  extractedText = extractedText
    .replace(/\s+/g, " ") // Replace all whitespace with single space
    .replace(/\s*[.,!?;:]\s*/g, "$1 ") // Fix spacing around punctuation
    .trim()

  // Remove very short lines and excessive line breaks
  const lines = extractedText.split(/\s+/).filter(line => line.length > 0)
  extractedText = lines.join(" ")

  // Final cleanup
  extractedText = extractedText
    .replace(/\s{2,}/g, " ") // Remove multiple spaces
    .trim()

  return extractedText
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch) {
    return titleMatch[1].trim()
  }

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  if (ogTitleMatch) {
    return ogTitleMatch[1].trim()
  }

  return null
}

function extractThumbnail(html: string): string | null {
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  if (ogImageMatch) {
    return ogImageMatch[1].trim()
  }

  return null
}

async function updateProgress(contentItemId: string, stage: string, progress: number) {
  try {
    const existingMetadata = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      select: { metadata: true },
    })
    
    const metadata = existingMetadata?.metadata ? JSON.parse(existingMetadata.metadata) : {}
    
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        metadata: JSON.stringify({
          ...metadata,
          processingStage: stage,
          processingProgress: progress,
        }),
      },
    })
  } catch (error) {
    console.error("Failed to update progress:", error)
  }
}

export async function processYouTubeVideo(contentItemId: string, url: string) {
  let tempDir: string | null = null
  let audioPath: string | null = null

  // Set overall timeout (30 minutes max)
  const overallTimeout = setTimeout(async () => {
    console.error(`Processing timeout for ${contentItemId} after 30 minutes`)
    try {
      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: {
          status: "error",
          error: "Processing timeout - the video may be too long or the transcription failed. Please try a shorter video or check the URL.",
        },
      })
    } catch (e) {
      console.error("Failed to update timeout error:", e)
    }
  }, 30 * 60 * 1000) // 30 minutes

  try {
    // Stage 1: Fetching video info (10%)
    await updateProgress(contentItemId, "Fetching video information...", 10)
    console.log(`[${contentItemId}] Starting YouTube video processing for: ${url}`)
    
    const videoInfo = await getYouTubeVideoInfo(url)
    if (!videoInfo) {
      throw new Error("Failed to fetch YouTube video information. The URL may be invalid or the video may be private/unavailable.")
    }
    
    console.log(`[${contentItemId}] Video info retrieved: ${videoInfo.title}`)

    // Check if AssemblyAI is configured - use it for transcription after downloading audio
    // Note: We still need yt-dlp to download the audio, but AssemblyAI provides better transcription
    if (isAssemblyAIConfigured()) {
      console.log(`[${contentItemId}] Using AssemblyAI for transcription (will download audio first)`)
      return await processYouTubeVideoWithAssemblyAI(contentItemId, url, videoInfo, overallTimeout)
    }

    // Fallback to yt-dlp + OpenAI Whisper if AssemblyAI is not configured
    console.log(`[${contentItemId}] AssemblyAI not configured, using yt-dlp + OpenAI Whisper`)
    return await processYouTubeVideoWithYtDlp(contentItemId, url, videoInfo, overallTimeout)
  } catch (error) {
    // Clear timeout on error
    clearTimeout(overallTimeout)
    
    console.error(`[${contentItemId}] YouTube processing error:`, error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to process YouTube video"

    console.log(`[${contentItemId}] Saving error to database: ${errorMessage}`)

    // Try to update error status with retry logic
    let errorUpdateSuccess = false
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.contentItem.update({
          where: { id: contentItemId },
          data: {
            status: "error",
            error: errorMessage,
            metadata: JSON.stringify({
              processingStage: "Error",
              processingProgress: 0,
              errorDetails: errorMessage,
              failedAt: new Date().toISOString(),
            }),
          },
        })
        errorUpdateSuccess = true
        console.log(`[${contentItemId}] Error status saved successfully`)
        break
      } catch (dbError) {
        console.error(`[${contentItemId}] Failed to update error status (attempt ${attempt}):`, dbError)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        }
      }
    }
    
    if (!errorUpdateSuccess) {
      console.error(`[${contentItemId}] CRITICAL: Could not update error status in database. Error: ${errorMessage}`)
    }
  }
  // Note: Cleanup is handled by processYouTubeVideoWithYtDlp's finally block
  // No cleanup needed here since AssemblyAI doesn't use temp files
}

/**
 * Process YouTube video using AssemblyAI (preferred method)
 * Downloads audio with yt-dlp, then transcribes with AssemblyAI
 */
async function processYouTubeVideoWithAssemblyAI(
  contentItemId: string,
  url: string,
  videoInfo: { title: string; thumbnail: string | null },
  overallTimeout: NodeJS.Timeout
) {
  let tempDir: string | null = null
  let audioPath: string | null = null

  try {
    // Stage 2: Downloading audio (20-40%)
    await updateProgress(contentItemId, "Downloading audio from YouTube...", 20)
    
    // Create temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "youtube-"))
    const outputTemplate = path.join(tempDir, `${contentItemId}.%(ext)s`)

    // Initialize yt-dlp
    let ytDlpPath: string | undefined
    try {
      const { execSync } = await import("child_process")
      ytDlpPath = execSync("which yt-dlp", { encoding: "utf-8" }).trim()
      console.log(`[${contentItemId}] Found yt-dlp at: ${ytDlpPath}`)
    } catch (e) {
      // Try common paths
      const commonPaths = ["/opt/homebrew/bin/yt-dlp", "/usr/local/bin/yt-dlp", "/usr/bin/yt-dlp"]
      for (const commonPath of commonPaths) {
        try {
          await fs.access(commonPath)
          ytDlpPath = commonPath
          break
        } catch {
          // Continue
        }
      }
    }

    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_NAME
    if (isServerless && !ytDlpPath) {
      throw new Error(
        "yt-dlp is required to download YouTube audio. " +
        "AssemblyAI needs the audio file, not the YouTube URL. " +
        "Please use a dedicated worker process with yt-dlp installed."
      )
    }

    const ytDlpWrap = ytDlpPath ? new YTDlpWrap(ytDlpPath) : new YTDlpWrap()

    // Download audio - ensure we get the FULL video
    console.log(`[${contentItemId}] Downloading FULL audio from YouTube: ${url}`)
    await updateProgress(contentItemId, "Downloading audio...", 30)
    
    // CRITICAL: Ensure we download the complete video audio
    // --no-playlist: Don't download playlists, just the single video
    // --audio-quality 0: Best quality
    // --extract-audio: Extract audio only
    // --audio-format mp3: Convert to MP3
    const downloadPromise = ytDlpWrap.exec([
      url,
      "-x", // Extract audio
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0", // Best quality
      "-o",
      outputTemplate,
      "--no-playlist", // Only download the single video, not entire playlists
      "--no-warnings",
      "--no-check-certificate", // Avoid SSL issues
      "--prefer-ffmpeg", // Prefer ffmpeg for conversion
    ])

    const downloadTimeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Download timeout after 10 minutes"))
      }, 10 * 60 * 1000)
    })

    await Promise.race([downloadPromise, downloadTimeout])
    console.log(`[${contentItemId}] Audio download completed`)

    // Find downloaded file
    const possibleExtensions = ["mp3", "m4a", "webm", "opus"]
    let downloadedFile: string | null = null
    
    for (const ext of possibleExtensions) {
      const testPath = path.join(tempDir, `${contentItemId}.${ext}`)
      try {
        await fs.access(testPath)
        downloadedFile = testPath
        audioPath = testPath
        break
      } catch {
        // Continue
      }
    }

    if (!downloadedFile) {
      const files = await fs.readdir(tempDir)
      const audioFile = files.find(f => 
        f.endsWith('.mp3') || f.endsWith('.m4a') || f.endsWith('.webm') || f.endsWith('.opus')
      )
      if (audioFile) {
        downloadedFile = path.join(tempDir, audioFile)
        audioPath = downloadedFile
      }
    }

    if (!downloadedFile || !audioPath) {
      throw new Error("Audio file was not created after download")
    }

    // Read audio file and verify it's complete
    const audioBuffer = await fs.readFile(audioPath)
    const stats = await fs.stat(audioPath)
    const fileSizeMB = stats.size / 1024 / 1024
    console.log(`[${contentItemId}] ✅ Audio file downloaded. Size: ${fileSizeMB.toFixed(2)} MB`)
    
    // Validate file size - a 9-minute video should be at least 5-10 MB of audio
    // If it's suspiciously small, warn
    if (fileSizeMB < 1) {
      console.warn(`[${contentItemId}] ⚠️ WARNING: Audio file is very small (${fileSizeMB.toFixed(2)} MB). This might indicate incomplete download.`)
    }

    // Stage 3: Transcribing with AssemblyAI (40-90%)
    await updateProgress(contentItemId, "Transcribing with AssemblyAI...", 40)
    
    console.log(`[${contentItemId}] Starting AssemblyAI transcription for full video audio...`)
    console.log(`[${contentItemId}] Audio file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
    
    const transcription = await transcribeYouTubeUrl(
      audioBuffer,
      path.basename(audioPath),
      { language: "en" }
    )

    if (!transcription.text || transcription.text.trim().length === 0) {
      throw new Error("Transcription returned empty text. The video may not contain speech or may be unavailable.")
    }

    // Log full transcript details for verification
    // IMPORTANT: transcription.text should contain the FULL, VERBATIM transcript of the entire video
    const transcriptText = transcription.text.trim()
    const wordCount = transcriptText.split(/\s+/).filter(Boolean).length
    console.log(`[${contentItemId}] ✅ FULL TRANSCRIPT RECEIVED`)
    console.log(`[${contentItemId}] Transcription complete. Text length: ${transcriptText.length} characters`)
    console.log(`[${contentItemId}] Word count: ${wordCount} words`)
    console.log(`[${contentItemId}] First 500 chars: ${transcriptText.substring(0, 500)}...`)
    console.log(`[${contentItemId}] Last 500 chars: ...${transcriptText.substring(Math.max(0, transcriptText.length - 500))}`)
    
    // Validate transcript length - typical speaking rate is 150-160 words per minute
    // For a 9-minute video, we'd expect at least 900-1,350 words
    // If we have video duration metadata, use it; otherwise estimate
    const estimatedDurationMinutes = 9 // This should come from video metadata if available
    const expectedMinWords = Math.floor(estimatedDurationMinutes * 100) // Conservative: 100 words/min
    if (wordCount < expectedMinWords) {
      console.warn(`[${contentItemId}] ⚠️ WARNING: Transcript has ${wordCount} words, which seems low for a ${estimatedDurationMinutes}-minute video. Expected at least ${expectedMinWords} words.`)
      console.warn(`[${contentItemId}] This might indicate: 1) Video has long silent segments, 2) Transcription incomplete, 3) Audio quality issues`)
    } else {
      console.log(`[${contentItemId}] ✓ Transcript length looks reasonable: ${wordCount} words for ~${estimatedDurationMinutes} minutes`)
    }

    // Stage 4: Generating summary (90%)
    await updateProgress(contentItemId, "Generating summary...", 90)
    
    const summary = await generateSummary(transcriptText)

    // Stage 5: Saving to database (95%)
    await updateProgress(contentItemId, "Saving to database...", 95)
    
    // Update content item with transcript
    const existingItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      select: { metadata: true },
    })
    const existingMetadata = existingItem?.metadata ? JSON.parse(existingItem.metadata) : {}
    
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "ready",
        transcript: transcriptText, // Use the trimmed but full transcript
        rawText: transcriptText, // Store full transcript in rawText as well
        wordCount,
        summary,
        processedAt: new Date(),
        error: null,
        metadata: JSON.stringify({
          ...existingMetadata,
          processingStage: "Complete",
          processingProgress: 100,
          transcriptionMethod: "assemblyai",
          transcriptLength: transcriptText.length,
          wordCount: wordCount,
        }),
      },
    })

    // Clear timeout on success
    clearTimeout(overallTimeout)

    console.log(`✅ YouTube video processed successfully with AssemblyAI: ${contentItemId}`)
    console.log(`   - Title: ${videoInfo.title}`)
    console.log(`   - Transcript length: ${transcription.text.length} characters`)
    console.log(`   - Word count: ${wordCount}`)
  } catch (error) {
    clearTimeout(overallTimeout)
    throw error
  } finally {
    // Clean up temporary files
    if (audioPath) {
      try {
        await fs.unlink(audioPath)
      } catch (e) {
        console.error(`[${contentItemId}] Failed to delete audio file:`, e)
      }
    }
    if (tempDir) {
      try {
        await fs.rmdir(tempDir)
      } catch (e) {
        console.error(`[${contentItemId}] Failed to delete temp directory:`, e)
      }
    }
  }
}

/**
 * Process YouTube video using yt-dlp (fallback method)
 * Only used if AssemblyAI is not configured
 */
async function processYouTubeVideoWithYtDlp(
  contentItemId: string,
  url: string,
  videoInfo: { title: string; thumbnail: string | null },
  overallTimeout: NodeJS.Timeout
) {
  let tempDir: string | null = null
  let audioPath: string | null = null

  try {

    // Create temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "youtube-"))
    // Use a template for output filename - yt-dlp will add extension
    const outputTemplate = path.join(tempDir, `${contentItemId}.%(ext)s`)

    // Initialize yt-dlp
    // Try to find yt-dlp in common locations
    let ytDlpPath: string | undefined
    let ytDlpAvailable = false
    
    try {
      const { execSync } = await import("child_process")
      ytDlpPath = execSync("which yt-dlp", { encoding: "utf-8" }).trim()
      ytDlpAvailable = true
      console.log(`[${contentItemId}] Found yt-dlp at: ${ytDlpPath}`)
    } catch (e) {
      // Try common installation paths
      const commonPaths = [
        "/opt/homebrew/bin/yt-dlp",
        "/usr/local/bin/yt-dlp",
        "/usr/bin/yt-dlp",
      ]
      for (const commonPath of commonPaths) {
        try {
          await fs.access(commonPath)
          ytDlpPath = commonPath
          ytDlpAvailable = true
          console.log(`[${contentItemId}] Found yt-dlp at: ${ytDlpPath}`)
          break
        } catch {
          // Continue searching
        }
      }
      if (!ytDlpAvailable) {
        console.warn(`[${contentItemId}] yt-dlp not found in standard locations`)
        // Try to use yt-dlp-wrap's auto-detection
        try {
          const testWrap = new YTDlpWrap()
          // Check if yt-dlp-wrap can find it
          ytDlpAvailable = true
          console.log(`[${contentItemId}] yt-dlp-wrap will attempt to locate yt-dlp`)
        } catch (wrapError) {
          console.error(`[${contentItemId}] yt-dlp-wrap initialization failed:`, wrapError)
          ytDlpAvailable = false
        }
      }
    }

    // Check if we're in a serverless environment where yt-dlp won't work
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_NAME
    if (isServerless && !ytDlpAvailable) {
      throw new Error(
        "YouTube video processing is not available in serverless environments. " +
        "yt-dlp is required but not available. Please use a dedicated worker process with yt-dlp installed, " +
        "or use a service that supports YouTube video processing."
      )
    }

    const ytDlpWrap = ytDlpPath ? new YTDlpWrap(ytDlpPath) : new YTDlpWrap()

    // Stage 2: Downloading audio (20%)
    await updateProgress(contentItemId, "Downloading audio from YouTube...", 20)
    
    console.log(`[${contentItemId}] Downloading audio from YouTube: ${url}`)
    console.log(`[${contentItemId}] Output template: ${outputTemplate}`)
    
    // Download audio only (extract audio, format mp3)
    // -x: extract audio
    // --audio-format mp3: convert to mp3
    // -o: output template (yt-dlp will replace %(ext)s with actual extension)
    // Add timeout for download (5 minutes max for serverless, 20 minutes for workers)
    try {
      console.log(`[${contentItemId}] Starting yt-dlp download...`)
      
      // Check if yt-dlp is actually available by testing it
      try {
        const { execSync } = await import("child_process")
        execSync("yt-dlp --version", { encoding: "utf-8", timeout: 5000 })
        console.log(`[${contentItemId}] yt-dlp is available`)
      } catch (testError) {
        console.error(`[${contentItemId}] yt-dlp availability test failed:`, testError)
        throw new Error(
          "yt-dlp is not available in this environment. " +
          "YouTube video processing requires yt-dlp to be installed. " +
          "Please use a dedicated worker process with yt-dlp installed, or use a service that supports YouTube processing."
        )
      }
      
      const downloadPromise = ytDlpWrap.exec([
        url,
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0", // best quality
        "-o",
        outputTemplate,
        "--no-playlist",
        "--no-warnings",
        "--verbose", // Add verbose logging
      ])

      // Shorter timeout for serverless (5 minutes), longer for workers (20 minutes)
      const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_NAME
      const downloadTimeoutMs = isServerless ? 5 * 60 * 1000 : 20 * 60 * 1000 // 5 min for serverless, 20 min for workers
      
      const downloadTimeout = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(
            `Download timeout after ${isServerless ? "5" : "20"} minutes. ` +
            "The video may be too long, unavailable, or yt-dlp may not be working properly. " +
            "Please try a shorter video or use a dedicated worker process."
          ))
        }, downloadTimeoutMs)
      })

      await Promise.race([downloadPromise, downloadTimeout])
      console.log(`[${contentItemId}] Audio download completed successfully`)
      
      // Stage 3: Audio downloaded (40%)
      await updateProgress(contentItemId, "Audio downloaded, preparing for transcription...", 40)
    } catch (execError) {
      console.error(`[${contentItemId}] yt-dlp execution error:`, execError)
      const errorDetails = execError instanceof Error ? execError.message : String(execError)
      
      // Provide more helpful error messages
      let userFriendlyError = `Failed to download audio: ${errorDetails}`
      if (errorDetails.includes("not found") || errorDetails.includes("command not found") || errorDetails.includes("not available")) {
        userFriendlyError = "yt-dlp is not installed or not available. YouTube video processing requires yt-dlp to be installed on the server. Please use a dedicated worker process or a service that supports YouTube processing."
      } else if (errorDetails.includes("Private video") || errorDetails.includes("unavailable") || errorDetails.includes("private")) {
        userFriendlyError = "The YouTube video is private, unavailable, or restricted. Please check the video URL and ensure it's publicly accessible."
      } else if (errorDetails.includes("timeout")) {
        userFriendlyError = `Download timed out. ${errorDetails}`
      } else if (errorDetails.includes("ERROR") || errorDetails.includes("WARNING")) {
        userFriendlyError = `YouTube download failed: ${errorDetails}`
      }
      
      throw new Error(userFriendlyError)
    }

    // Find the actual downloaded file (yt-dlp may have added extension)
    const possibleExtensions = ["mp3", "m4a", "webm", "opus"]
    let downloadedFile: string | null = null
    
    for (const ext of possibleExtensions) {
      const testPath = path.join(tempDir, `${contentItemId}.${ext}`)
      try {
        await fs.access(testPath)
        downloadedFile = testPath
        audioPath = testPath
        console.log(`Found downloaded file: ${downloadedFile}`)
        break
      } catch {
        // Continue searching
      }
    }

    // Also check for files without extension in the temp dir
    if (!downloadedFile) {
      try {
        const files = await fs.readdir(tempDir)
        const audioFile = files.find(f => f.startsWith(contentItemId))
        if (audioFile) {
          downloadedFile = path.join(tempDir, audioFile)
          audioPath = downloadedFile
          console.log(`Found downloaded file: ${downloadedFile}`)
        }
      } catch (e) {
        console.error("Error reading temp directory:", e)
      }
    }

    // Wait a bit and check again if file wasn't found
    if (!downloadedFile) {
      console.log(`[${contentItemId}] File not found immediately, waiting 5 seconds...`)
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      for (const ext of possibleExtensions) {
        const testPath = path.join(tempDir, `${contentItemId}.${ext}`)
        try {
          await fs.access(testPath)
          downloadedFile = testPath
          audioPath = testPath
          console.log(`[${contentItemId}] Found downloaded file after wait: ${downloadedFile}`)
          break
        } catch {
          // Continue searching
        }
      }
      
      // Also check for any files in the temp dir
      if (!downloadedFile) {
        try {
          const files = await fs.readdir(tempDir)
          console.log(`[${contentItemId}] Files in temp dir: ${files.join(", ")}`)
          // Try to find any audio file
          const audioFile = files.find(f => 
            f.endsWith('.mp3') || f.endsWith('.m4a') || f.endsWith('.webm') || f.endsWith('.opus')
          )
          if (audioFile) {
            downloadedFile = path.join(tempDir, audioFile)
            audioPath = downloadedFile
            console.log(`[${contentItemId}] Found audio file: ${downloadedFile}`)
          }
        } catch (e) {
          console.error(`[${contentItemId}] Could not list temp dir files:`, e)
        }
      }
    }
    
    if (!downloadedFile || !audioPath) {
      // List files in temp dir for debugging
      try {
        const files = await fs.readdir(tempDir)
        console.error(`[${contentItemId}] Files in temp dir: ${files.join(", ")}`)
      } catch (e) {
        console.error(`[${contentItemId}] Could not list temp dir files:`, e)
      }
      throw new Error(
        "Audio file was not created after download. " +
        "This usually means yt-dlp failed silently or the video is unavailable. " +
        "Please check: 1) yt-dlp is installed, 2) The video URL is valid and public, 3) Use a dedicated worker process."
      )
    }

    // Read audio file
    console.log(`Reading audio file: ${audioPath}`)
    const stats = await fs.stat(audioPath)
    console.log(`Audio file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
    
    // Check file size limit (Whisper API has 25MB limit)
    if (stats.size > 25 * 1024 * 1024) {
      throw new Error(`Audio file is too large (${(stats.size / 1024 / 1024).toFixed(2)} MB). Maximum size is 25MB. Please use a shorter video or split it.`)
    }

    const audioBuffer = await fs.readFile(audioPath)
    console.log(`Audio buffer size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`)

    // Stage 4: Transcribing (60%)
    await updateProgress(contentItemId, "Transcribing audio with AI...", 60)
    
    // Transcribe using OpenAI Whisper
    console.log(`Transcribing audio with Whisper API...`)
    let transcription
    try {
      transcription = await transcribeAudioFromBuffer(
        audioBuffer,
        path.basename(audioPath),
        { language: "en" }
      )
      console.log(`Transcription complete. Text length: ${transcription.text.length} characters`)
    } catch (transcribeError) {
      console.error("Transcription error:", transcribeError)
      throw new Error(`Failed to transcribe audio: ${transcribeError instanceof Error ? transcribeError.message : "Unknown error"}`)
    }

    if (!transcription.text || transcription.text.trim().length === 0) {
      throw new Error("Transcription returned empty text. The audio may be too quiet or contain no speech.")
    }

    // Log full transcript details for verification
    const transcriptText = transcription.text.trim()
    const wordCount = transcriptText.split(/\s+/).filter(Boolean).length
    console.log(`[${contentItemId}] Transcription complete. Text length: ${transcriptText.length} characters`)
    console.log(`[${contentItemId}] Word count: ${wordCount} words`)
    console.log(`[${contentItemId}] First 300 chars: ${transcriptText.substring(0, 300)}...`)
    console.log(`[${contentItemId}] Last 300 chars: ...${transcriptText.substring(Math.max(0, transcriptText.length - 300))}`)

    // Stage 5: Generating summary (80%)
    await updateProgress(contentItemId, "Generating summary...", 80)
    
    // Generate summary
    console.log(`[${contentItemId}] Generating summary...`)
    let summary: string
    try {
      summary = await generateSummary(transcriptText)
    } catch (summaryError) {
      console.error(`[${contentItemId}] Summary generation error:`, summaryError)
      // Use a simple fallback summary
      const sentences = transcriptText.split(/[.!?]+/).filter(Boolean)
      summary = sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "")
    }

    console.log(`[${contentItemId}] Word count: ${wordCount}`)

    // Stage 6: Saving to database (90%)
    await updateProgress(contentItemId, "Saving to database...", 90)
    
    // Update content item with transcript (with retry logic)
    console.log(`Saving transcript to database...`)
    let updateSuccess = false
    let lastError: Error | null = null
    
    // Get existing metadata
    const existingItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      select: { metadata: true },
    })
    const existingMetadata = existingItem?.metadata ? JSON.parse(existingItem.metadata) : {}
    
    // Retry database update up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.contentItem.update({
          where: { id: contentItemId },
          data: {
            status: "ready",
            transcript: transcriptText, // Use the trimmed but full transcript
            rawText: transcriptText, // Store full transcript in rawText as well
            wordCount,
            summary,
            processedAt: new Date(),
            error: null, // Clear any previous errors
            metadata: JSON.stringify({
              ...existingMetadata,
              processingStage: "Complete",
              processingProgress: 100,
              transcriptionMethod: "yt-dlp",
              transcriptLength: transcriptText.length,
              wordCount: wordCount,
            }),
          },
        })
        updateSuccess = true
        break
      } catch (dbError) {
        lastError = dbError instanceof Error ? dbError : new Error(String(dbError))
        console.error(`Database update attempt ${attempt} failed:`, lastError.message)
        
        if (attempt < 3) {
          // Wait before retrying (exponential backoff)
          const waitTime = attempt * 1000 // 1s, 2s, 3s
          console.log(`Retrying database update in ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }
    
    if (!updateSuccess) {
      throw new Error(`Failed to save transcript to database after 3 attempts: ${lastError?.message || "Unknown error"}`)
    }

    // Clear timeout on success
    clearTimeout(overallTimeout)

    console.log(`✅ YouTube video processed successfully with yt-dlp: ${contentItemId}`)
    console.log(`   - Title: ${videoInfo.title}`)
    console.log(`   - Transcript length: ${transcription.text.length} characters`)
    console.log(`   - Word count: ${wordCount}`)
  } catch (error) {
    clearTimeout(overallTimeout)
    throw error
  } finally {
    // Clean up temporary files
    if (audioPath) {
      try {
        await fs.unlink(audioPath)
      } catch (e) {
        console.error(`[${contentItemId}] Failed to delete audio file:`, e)
      }
    }
    if (tempDir) {
      try {
        await fs.rmdir(tempDir)
      } catch (e) {
        console.error(`[${contentItemId}] Failed to delete temp directory:`, e)
      }
    }
  }
}

async function generateSummary(text: string): Promise<string> {
  // Use AI-generated summary if available
  try {
    const { generateSummary } = await import("@/lib/openai")
    return await generateSummary(text)
  } catch (error) {
    // Fallback to simple summary
    const sentences = text.split(/[.!?]+/).filter(Boolean)
    return sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "")
  }
}

