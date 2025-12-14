/**
 * AssemblyAI API Utilities
 * For transcribing YouTube videos and audio files
 */

import { AssemblyAI } from "assemblyai"

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY

if (!ASSEMBLYAI_API_KEY) {
  console.warn("⚠️ ASSEMBLYAI_API_KEY not configured. YouTube video transcription will not work.")
}

let assemblyAIClient: AssemblyAI | null = null

function getAssemblyAIClient(): AssemblyAI {
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error("ASSEMBLYAI_API_KEY is not configured. Please set it in your environment variables.")
  }

  if (!assemblyAIClient) {
    assemblyAIClient = new AssemblyAI({
      apiKey: ASSEMBLYAI_API_KEY,
    })
  }

  return assemblyAIClient
}

export interface TranscriptionResult {
  text: string
  words?: Array<{
    text: string
    start: number
    end: number
    confidence: number
  }>
  confidence?: number
  language?: string
}

/**
 * Transcribe a YouTube URL using AssemblyAI
 * Note: AssemblyAI doesn't accept YouTube URLs directly, so we need to download the audio first
 * and then upload it to AssemblyAI. This function expects the audio buffer to be provided.
 */
export async function transcribeYouTubeUrl(
  audioBuffer: Buffer,
  filename: string,
  options: {
    language?: string
    speakerLabels?: boolean
  } = {}
): Promise<TranscriptionResult> {
  const client = getAssemblyAIClient()

  try {
    console.log(`[AssemblyAI] Starting transcription for audio file: ${filename}`)
    console.log(`[AssemblyAI] Audio buffer size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`)

    // Upload audio file to AssemblyAI
    const uploadUrl = await client.files.upload(audioBuffer)
    console.log(`[AssemblyAI] Audio uploaded. URL: ${uploadUrl}`)

    // Submit transcription job with full transcript settings
    const transcript = await client.transcripts.submit({
      audio: uploadUrl, // Use the uploaded file URL
      language_code: options.language || "en",
      speaker_labels: options.speakerLabels || false,
      // Ensure we get the full transcript - no filtering
      punctuate: true, // Add punctuation for better readability
      format_text: true, // Format text properly
      // Don't filter out any content - get everything
    })

    console.log(`[AssemblyAI] Transcription job submitted. ID: ${transcript.id}`)
    console.log(`[AssemblyAI] Status: ${transcript.status}`)

    // Poll for completion
    let polledTranscript = transcript
    const maxWaitTime = 30 * 60 * 1000 // 30 minutes max
    const startTime = Date.now()
    const pollInterval = 3000 // Poll every 3 seconds

    while (polledTranscript.status !== "completed" && polledTranscript.status !== "error") {
      // Check timeout
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error("Transcription timeout after 30 minutes. The video may be too long.")
      }

      // Wait before polling
      await new Promise((resolve) => setTimeout(resolve, pollInterval))

      // Poll for status
      polledTranscript = await client.transcripts.get(polledTranscript.id)
      console.log(`[AssemblyAI] Polling... Status: ${polledTranscript.status}`)

      if (polledTranscript.status === "error") {
        throw new Error(
          `Transcription failed: ${polledTranscript.error || "Unknown error"}`
        )
      }
    }

    // Get the full transcript text - ensure we're getting everything
    const transcriptText = polledTranscript.text || ""
    
    if (!transcriptText || transcriptText.trim().length === 0) {
      throw new Error("Transcription completed but no text was returned.")
    }

    // Log full transcript details for debugging and verification
    const wordCount = transcriptText.split(/\s+/).filter(Boolean).length
    const audioDuration = (polledTranscript as any).audio_duration || 0
    const durationMinutes = audioDuration / 60
    
    console.log(`[AssemblyAI] Transcription completed. Text length: ${transcriptText.length} characters`)
    console.log(`[AssemblyAI] Word count: ${wordCount} words`)
    if (audioDuration > 0) {
      console.log(`[AssemblyAI] Audio duration: ${audioDuration} seconds (${durationMinutes.toFixed(2)} minutes)`)
      
      // Validate transcript length - typical speaking rate is 150-160 words per minute
      const expectedMinWords = Math.floor(durationMinutes * 100) // Conservative: 100 words/min
      const expectedMaxWords = Math.ceil(durationMinutes * 200) // Upper bound: 200 words/min
      
      if (wordCount < expectedMinWords) {
        console.warn(`[AssemblyAI] WARNING: Transcript has ${wordCount} words for ${durationMinutes.toFixed(1)}-minute audio. Expected at least ${expectedMinWords} words. This might indicate incomplete transcription.`)
      } else if (wordCount > expectedMaxWords) {
        console.warn(`[AssemblyAI] WARNING: Transcript has ${wordCount} words for ${durationMinutes.toFixed(1)}-minute audio. Expected at most ${expectedMaxWords} words. This might indicate an issue.`)
      } else {
        console.log(`[AssemblyAI] Transcript length looks reasonable: ${wordCount} words for ${durationMinutes.toFixed(1)} minutes (~${Math.round(wordCount / durationMinutes)} words/min)`)
      }
    }
    
    console.log(`[AssemblyAI] First 300 chars: ${transcriptText.substring(0, 300)}...`)
    console.log(`[AssemblyAI] Last 300 chars: ...${transcriptText.substring(Math.max(0, transcriptText.length - 300))}`)

    return {
      text: transcriptText,
      words: polledTranscript.words?.map((w) => ({
        text: w.text,
        start: w.start,
        end: w.end,
        confidence: w.confidence || 0,
      })),
      confidence: polledTranscript.confidence ?? undefined,
      language: polledTranscript.language_code,
    }
  } catch (error) {
    console.error("[AssemblyAI] Transcription error:", error)
    throw error instanceof Error
      ? error
      : new Error(`Failed to transcribe YouTube video: ${String(error)}`)
  }
}

/**
 * Transcribe an audio file from a buffer using AssemblyAI
 * Falls back to this if YouTube URL transcription isn't available
 */
export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  filename: string,
  options: {
    language?: string
  } = {}
): Promise<TranscriptionResult> {
  const client = getAssemblyAIClient()

  try {
    console.log(`[AssemblyAI] Starting transcription for audio file: ${filename}`)

    // Upload audio file
    const uploadUrl = await client.files.upload(audioBuffer)
    console.log(`[AssemblyAI] Audio uploaded. URL: ${uploadUrl}`)

    // Submit transcription job
    const transcript = await client.transcripts.submit({
      audio: uploadUrl,
      language_code: options.language || "en",
    })

    console.log(`[AssemblyAI] Transcription job submitted. ID: ${transcript.id}`)

    // Poll for completion
    let polledTranscript = transcript
    const maxWaitTime = 30 * 60 * 1000 // 30 minutes max
    const startTime = Date.now()
    const pollInterval = 3000 // Poll every 3 seconds

    while (polledTranscript.status !== "completed" && polledTranscript.status !== "error") {
      // Check timeout
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error("Transcription timeout after 30 minutes.")
      }

      // Wait before polling
      await new Promise((resolve) => setTimeout(resolve, pollInterval))

      // Poll for status
      polledTranscript = await client.transcripts.get(polledTranscript.id)
      console.log(`[AssemblyAI] Polling... Status: ${polledTranscript.status}`)

      if (polledTranscript.status === "error") {
        throw new Error(
          `Transcription failed: ${polledTranscript.error || "Unknown error"}`
        )
      }
    }

    if (!polledTranscript.text) {
      throw new Error("Transcription completed but no text was returned.")
    }

    console.log(`[AssemblyAI] Transcription completed. Text length: ${polledTranscript.text.length} characters`)

    return {
      text: polledTranscript.text,
      words: polledTranscript.words?.map((w) => ({
        text: w.text,
        start: w.start,
        end: w.end,
        confidence: w.confidence || 0,
      })),
      confidence: polledTranscript.confidence ?? undefined,
      language: polledTranscript.language_code,
    }
  } catch (error) {
    console.error("[AssemblyAI] Transcription error:", error)
    throw error instanceof Error
      ? error
      : new Error(`Failed to transcribe audio: ${String(error)}`)
  }
}

/**
 * Check if AssemblyAI is configured
 */
export function isAssemblyAIConfigured(): boolean {
  return !!ASSEMBLYAI_API_KEY
}
