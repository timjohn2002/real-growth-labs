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
    // IMPORTANT: We want the FULL, VERBATIM transcript of the entire video
    const transcript = await client.transcripts.submit({
      audio: uploadUrl, // Use the uploaded file URL
      language_code: options.language || "en",
      speaker_labels: options.speakerLabels || false,
      // Ensure we get the full, verbatim transcript
      punctuate: true, // Add punctuation for better readability
      format_text: true, // Format text properly
      // Get full transcript - no summarization or filtering
      // The 'text' property will contain the complete transcription
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

    // CRITICAL: Get the FULL transcript text
    // AssemblyAI's `text` property is often TRUNCATED for long videos
    // We MUST reconstruct from the `words` array to get EVERY SINGLE WORD
    let transcriptText = ""
    let source = "unknown"
    
    // PRIORITY 1: Always reconstruct from words array if available (most complete)
    if (polledTranscript.words && polledTranscript.words.length > 0) {
      console.log(`[AssemblyAI] 🔄 Reconstructing FULL transcript from ${polledTranscript.words.length} words array...`)
      transcriptText = polledTranscript.words
        .map((w) => w.text)
        .join(" ")
        .trim()
      source = "words_array"
      console.log(`[AssemblyAI] ✓ Reconstructed transcript from words array: ${transcriptText.length} chars`)
    } else {
      // Fallback to text property if words array not available
      transcriptText = polledTranscript.text || ""
      source = "text_property"
      console.log(`[AssemblyAI] ⚠️ Words array not available, using text property`)
    }
    
    // PRIORITY 2: Try paragraphs endpoint as additional verification
    // This can sometimes have more complete formatting
    try {
      const paragraphs = await client.transcripts.paragraphs(polledTranscript.id)
      if (paragraphs && paragraphs.paragraphs && paragraphs.paragraphs.length > 0) {
        const paragraphsText = paragraphs.paragraphs
          .map((p: any) => p.text)
          .join("\n\n")
          .trim()
        const paragraphsWordCount = paragraphsText.split(/\s+/).filter(Boolean).length
        const currentWordCount = transcriptText.split(/\s+/).filter(Boolean).length
        
        console.log(`[AssemblyAI] Paragraphs endpoint: ${paragraphsWordCount} words`)
        console.log(`[AssemblyAI] Current transcript: ${currentWordCount} words`)
        
        // Use paragraphs if it has MORE words (more complete)
        if (paragraphsWordCount > currentWordCount) {
          console.log(`[AssemblyAI] ✓ Paragraphs has MORE words (${paragraphsWordCount} vs ${currentWordCount}). Using paragraphs for FULL transcript.`)
          transcriptText = paragraphsText
          source = "paragraphs_endpoint"
        } else {
          console.log(`[AssemblyAI] Current transcript has same or more words. Keeping current.`)
        }
      }
    } catch (paragraphsError) {
      console.log(`[AssemblyAI] Could not fetch paragraphs (optional): ${paragraphsError}`)
      // Continue with words array - this is fine
    }
    
    // Log comparison with original text property for debugging
    const originalText = polledTranscript.text || ""
    const originalWordCount = originalText.split(/\s+/).filter(Boolean).length
    const finalWordCount = transcriptText.split(/\s+/).filter(Boolean).length
    console.log(`[AssemblyAI] 📊 COMPARISON:`)
    console.log(`[AssemblyAI]   - Text property: ${originalWordCount} words`)
    console.log(`[AssemblyAI]   - Final transcript (${source}): ${finalWordCount} words`)
    console.log(`[AssemblyAI]   - Difference: ${finalWordCount - originalWordCount} words`)
    
    if (finalWordCount < originalWordCount) {
      console.warn(`[AssemblyAI] ⚠️ WARNING: Final transcript has FEWER words than text property! This shouldn't happen.`)
    } else if (finalWordCount > originalWordCount) {
      console.log(`[AssemblyAI] ✓ SUCCESS: Final transcript has ${finalWordCount - originalWordCount} MORE words than text property!`)
    }
    
    if (!transcriptText || transcriptText.trim().length === 0) {
      throw new Error("Transcription completed but no text was returned.")
    }

    // Log full transcript details for debugging and verification
    const wordCount = transcriptText.split(/\s+/).filter(Boolean).length
    const audioDuration = (polledTranscript as any).audio_duration || 0
    const durationMinutes = audioDuration / 60
    
    console.log(`[AssemblyAI] ✅ FULL TRANSCRIPT RETRIEVED`)
    console.log(`[AssemblyAI] Transcription completed. Text length: ${transcriptText.length} characters`)
    console.log(`[AssemblyAI] Word count: ${wordCount} words`)
    if (audioDuration > 0) {
      console.log(`[AssemblyAI] Audio duration: ${audioDuration} seconds (${durationMinutes.toFixed(2)} minutes)`)
      
      // Validate transcript length - typical speaking rate is 150-160 words per minute
      const expectedMinWords = Math.floor(durationMinutes * 100) // Conservative: 100 words/min
      const expectedMaxWords = Math.ceil(durationMinutes * 200) // Upper bound: 200 words/min
      
      if (wordCount < expectedMinWords) {
        console.warn(`[AssemblyAI] ⚠️ WARNING: Transcript has ${wordCount} words for ${durationMinutes.toFixed(1)}-minute audio. Expected at least ${expectedMinWords} words. This might indicate incomplete transcription.`)
      } else if (wordCount > expectedMaxWords) {
        console.warn(`[AssemblyAI] ⚠️ WARNING: Transcript has ${wordCount} words for ${durationMinutes.toFixed(1)}-minute audio. Expected at most ${expectedMaxWords} words. This might indicate an issue.`)
      } else {
        console.log(`[AssemblyAI] ✓ Transcript length looks reasonable: ${wordCount} words for ${durationMinutes.toFixed(1)} minutes (~${Math.round(wordCount / durationMinutes)} words/min)`)
      }
    }
    
    console.log(`[AssemblyAI] First 500 chars: ${transcriptText.substring(0, 500)}...`)
    console.log(`[AssemblyAI] Last 500 chars: ...${transcriptText.substring(Math.max(0, transcriptText.length - 500))}`)

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
