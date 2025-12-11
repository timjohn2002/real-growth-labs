/**
 * YouTube video processing utilities
 * 
 * For production, you would need to:
 * 1. Install yt-dlp or use a service like AssemblyAI, Deepgram, etc.
 * 2. Download the video/audio
 * 3. Transcribe using Whisper API or similar
 */

export interface YouTubeVideoInfo {
  videoId: string
  title: string
  thumbnail: string | null
  duration: number | null
  channelName: string | null
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Get YouTube video metadata using oEmbed API
 */
export async function getYouTubeVideoInfo(url: string): Promise<YouTubeVideoInfo | null> {
  try {
    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
      return null
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const response = await fetch(oembedUrl)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return {
      videoId,
      title: data.title || "YouTube Video",
      thumbnail: data.thumbnail_url || null,
      duration: null, // oEmbed doesn't provide duration
      channelName: data.author_name || null,
    }
  } catch (error) {
    console.error("Error fetching YouTube video info:", error)
    return null
  }
}

/**
 * Check if URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname.includes("youtube.com") || parsedUrl.hostname.includes("youtu.be")
  } catch {
    return false
  }
}

