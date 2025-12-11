import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isYouTubeUrl, getYouTubeVideoInfo, extractYouTubeVideoId } from "@/lib/youtube"
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

      // Start YouTube processing (don't await - process in background)
      processYouTubeVideo(contentItem.id, url).catch((error) => {
        console.error("YouTube processing error:", error)
      })

      return NextResponse.json({
        id: contentItem.id,
        status: "processing",
        message: "YouTube video processing started",
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
    // Check if it's a YouTube URL (double-check)
    const parsedUrl = new URL(url)
    const isYouTube = parsedUrl.hostname.includes("youtube.com") || parsedUrl.hostname.includes("youtu.be")
    
    if (isYouTube) {
      throw new Error("YouTube URLs cannot be scraped directly. Please use a different method to extract content.")
    }

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

    // Extract text content from HTML
    // Simple extraction - in production, use a library like cheerio or puppeteer
    const text = extractTextFromHTML(html)

    if (!text || text.trim().length === 0) {
      throw new Error("No text content found")
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length
    const summary = await generateSummary(text)

    // Extract metadata
    const title = extractTitle(html) || url
    const thumbnail = extractThumbnail(html)

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
      },
    })
  } catch (error) {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: error instanceof Error ? error.message : "Scraping failed",
      },
    })
  }
}

function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
  
  // Extract text from common content tags
  const contentSelectors = [
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<p[^>]*>([\s\S]*?)<\/p>/gi,
  ]

  let extractedText = ""
  for (const selector of contentSelectors) {
    const matches = html.matchAll(selector)
    for (const match of matches) {
      extractedText += match[1] + " "
    }
  }

  // If no content found, extract all text
  if (!extractedText.trim()) {
    text = html.replace(/<[^>]+>/g, " ")
  } else {
    text = extractedText
  }

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim()

  return text
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

async function processYouTubeVideo(contentItemId: string, url: string) {
  let tempDir: string | null = null
  let audioPath: string | null = null

  try {
    const videoInfo = await getYouTubeVideoInfo(url)
    if (!videoInfo) {
      throw new Error("Failed to fetch YouTube video information")
    }

    // Create temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "youtube-"))
    // Use a template for output filename - yt-dlp will add extension
    const outputTemplate = path.join(tempDir, `${contentItemId}.%(ext)s`)

    // Initialize yt-dlp
    // Try to find yt-dlp in common locations
    let ytDlpPath: string | undefined
    try {
      const { execSync } = await import("child_process")
      ytDlpPath = execSync("which yt-dlp", { encoding: "utf-8" }).trim()
      console.log(`Found yt-dlp at: ${ytDlpPath}`)
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
          console.log(`Found yt-dlp at: ${ytDlpPath}`)
          break
        } catch {
          // Continue searching
        }
      }
      if (!ytDlpPath) {
        console.log("yt-dlp not found, yt-dlp-wrap will attempt to locate it")
      }
    }

    const ytDlpWrap = ytDlpPath ? new YTDlpWrap(ytDlpPath) : new YTDlpWrap()

    console.log(`Downloading audio from YouTube: ${url}`)
    console.log(`Output template: ${outputTemplate}`)
    
    // Download audio only (extract audio, format mp3)
    // -x: extract audio
    // --audio-format mp3: convert to mp3
    // -o: output template (yt-dlp will replace %(ext)s with actual extension)
    try {
      await ytDlpWrap.exec([
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
        "--extract-flat",
        "false",
      ])
    } catch (execError) {
      console.error("yt-dlp execution error:", execError)
      const errorDetails = execError instanceof Error ? execError.message : String(execError)
      throw new Error(`Failed to download audio: ${errorDetails}`)
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
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      for (const ext of possibleExtensions) {
        const testPath = path.join(tempDir, `${contentItemId}.${ext}`)
        try {
          await fs.access(testPath)
          downloadedFile = testPath
          audioPath = testPath
          console.log(`Found downloaded file after wait: ${downloadedFile}`)
          break
        } catch {
          // Continue searching
        }
      }
    }
    
    if (!downloadedFile || !audioPath) {
      // List files in temp dir for debugging
      try {
        const files = await fs.readdir(tempDir)
        console.error(`Files in temp dir: ${files.join(", ")}`)
      } catch (e) {
        console.error("Could not list temp dir files:", e)
      }
      throw new Error("Audio file was not created after download. The video may be unavailable, restricted, or the download failed.")
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

    // Generate summary
    console.log(`Generating summary...`)
    let summary: string
    try {
      summary = await generateSummary(transcription.text)
    } catch (summaryError) {
      console.error("Summary generation error:", summaryError)
      // Use a simple fallback summary
      const sentences = transcription.text.split(/[.!?]+/).filter(Boolean)
      summary = sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "")
    }

    const wordCount = transcription.text.split(/\s+/).filter(Boolean).length
    console.log(`Word count: ${wordCount}`)

    // Update content item with transcript
    console.log(`Saving transcript to database...`)
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "ready",
        transcript: transcription.text,
        rawText: transcription.text,
        wordCount,
        summary,
        processedAt: new Date(),
        error: null, // Clear any previous errors
      },
    })

    console.log(`✅ YouTube video processed successfully: ${contentItemId}`)
    console.log(`   - Title: ${videoInfo.title}`)
    console.log(`   - Transcript length: ${transcription.text.length} characters`)
    console.log(`   - Word count: ${wordCount}`)
  } catch (error) {
    console.error("YouTube processing error:", error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to process YouTube video"

    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: errorMessage,
      },
    })
  } finally {
    // Clean up temporary files
    if (audioPath) {
      try {
        await fs.unlink(audioPath)
      } catch (e) {
        console.error("Failed to delete audio file:", e)
      }
    }
    if (tempDir) {
      try {
        await fs.rmdir(tempDir)
      } catch (e) {
        console.error("Failed to delete temp directory:", e)
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

