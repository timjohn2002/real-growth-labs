import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Process podcast links
export async function POST(request: NextRequest) {
  try {
    const { url, title, userId } = await request.json()

    if (!url || !userId) {
      return NextResponse.json(
        { error: "URL and userId are required" },
        { status: 400 }
      )
    }

    // Create content item
    const contentItem = await prisma.contentItem.create({
      data: {
        userId,
        title: title || "Podcast Episode",
        type: "podcast",
        status: "processing",
        source: url,
        metadata: JSON.stringify({ url }),
        tags: "[]",
      },
    })

    // Start processing podcast
    processPodcast(contentItem.id, url).catch(console.error)

    return NextResponse.json({
      id: contentItem.id,
      status: "processing",
      message: "Podcast processing started",
    })
  } catch (error) {
    console.error("Podcast error:", error)
    return NextResponse.json(
      { error: "Failed to process podcast" },
      { status: 500 }
    )
  }
}

async function processPodcast(contentItemId: string, url: string) {
  try {
    // Try to fetch RSS feed or episode page
    // Common podcast platforms: Apple Podcasts, Spotify, RSS feeds
    
    let transcript = ""
    let audioUrl = ""
    let metadata: any = {}

    // Check if it's an RSS feed
    if (url.endsWith(".xml") || url.includes("rss") || url.includes("feed")) {
      const feedData = await fetchRSSFeed(url)
      metadata = feedData.metadata
      audioUrl = feedData.audioUrl
    } else {
      // Try to extract podcast info from platform URLs
      // This is simplified - in production, use platform-specific APIs
      metadata = await extractPodcastMetadata(url)
      audioUrl = metadata.audioUrl || ""
    }

    // If we have an audio URL, transcribe it
    if (audioUrl) {
      // Download and transcribe
      // For now, we'll mark it for transcription
      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: {
          metadata: JSON.stringify({
            ...metadata,
            audioUrl,
          }),
        },
      })

      // Queue transcription
      const transcribeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/content/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentItemId, audioUrl }),
      })

      if (!transcribeResponse.ok) {
        throw new Error("Transcription failed")
      }
    } else if (metadata.transcript) {
      // Use existing transcript
      const wordCount = metadata.transcript.split(/\s+/).filter(Boolean).length
      const summary = generateSummary(metadata.transcript)

      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: {
          status: "ready",
          title: metadata.title || "Podcast Episode",
          transcript: metadata.transcript,
          rawText: metadata.transcript,
          wordCount,
          summary,
          thumbnail: metadata.thumbnail,
          duration: metadata.duration,
          processedAt: new Date(),
        },
      })
    } else {
      throw new Error("No transcript or audio URL found")
    }
  } catch (error) {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: "error",
        error: error instanceof Error ? error.message : "Podcast processing failed",
      },
    })
  }
}

async function fetchRSSFeed(url: string) {
  try {
    const response = await fetch(url)
    const xml = await response.text()

    // Simple XML parsing - in production, use a proper XML parser
    const titleMatch = xml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const descriptionMatch = xml.match(/<description[^>]*>([\s\S]*?)<\/description>/i)
    const enclosureMatch = xml.match(/<enclosure[^>]*url=["']([^"']+)["']/i)

    return {
      metadata: {
        title: titleMatch ? titleMatch[1].trim() : "Podcast Episode",
        description: descriptionMatch ? descriptionMatch[1].trim() : "",
      },
      audioUrl: enclosureMatch ? enclosureMatch[1] : "",
    }
  } catch (error) {
    console.error("RSS feed error:", error)
    return { metadata: {}, audioUrl: "" }
  }
}

async function extractPodcastMetadata(url: string) {
  // Simplified - in production, use platform-specific APIs
  // Apple Podcasts, Spotify, etc. have APIs for this
  
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RealGrowthLabs/1.0)",
      },
    })
    const html = await response.text()

    // Try to extract audio URL and metadata
    const audioMatch = html.match(/<audio[^>]*src=["']([^"']+)["']/i) || 
                       html.match(/source[^>]*src=["']([^"']+\.mp3[^"']*)["']/i)
    
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const thumbnailMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)

    return {
      title: titleMatch ? titleMatch[1].trim() : "Podcast Episode",
      audioUrl: audioMatch ? audioMatch[1] : "",
      thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
    }
  } catch (error) {
    console.error("Metadata extraction error:", error)
    return {}
  }
}

function generateSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  return sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "")
}

