/**
 * OpenAI API Utilities
 * Centralized functions for all OpenAI API calls
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = "https://api.openai.com/v1"

if (!OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY not configured. Some features will not work.")
}

/**
 * Call OpenAI GPT API for text generation
 */
export async function callGPT(
  prompt: string,
  options: {
    model?: "gpt-4" | "gpt-3.5-turbo" | "gpt-4-turbo" | "gpt-4o"
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const {
    model = "gpt-3.5-turbo",
    temperature = 0.7,
    maxTokens = 2000,
    systemPrompt,
  } = options

  try {
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = []

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt })
    }

    messages.push({ role: "user", content: prompt })

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ""
  } catch (error) {
    console.error("GPT API error:", error)
    throw error
  }
}

/**
 * Transcribe audio/video using Whisper API
 */
/**
 * Transcribe audio from a Buffer (for local files)
 * Works in Node.js environment
 */
export async function transcribeAudioFromBuffer(
  audioBuffer: Buffer,
  filename: string = "audio.mp3",
  options: {
    language?: string
    prompt?: string
  } = {}
): Promise<{
  text: string
  language: string
  duration?: number
}> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const { language = "en", prompt } = options

  try {
    // Determine proper content type based on file extension
    let contentType = "audio/mpeg" // default
    if (filename.endsWith('.mp4')) {
      contentType = "video/mp4"
    } else if (filename.endsWith('.webm')) {
      contentType = "video/webm"
    } else if (filename.endsWith('.m4a')) {
      contentType = "audio/mp4"
    } else if (filename.endsWith('.wav')) {
      contentType = "audio/wav"
    } else if (filename.endsWith('.mp3') || filename.endsWith('.mpeg') || filename.endsWith('.mpga')) {
      contentType = "audio/mpeg"
    }
    
    // Convert Buffer to ArrayBuffer for Blob compatibility
    // Create a new ArrayBuffer to avoid SharedArrayBuffer type issues
    const arrayBuffer = audioBuffer.buffer.slice(
      audioBuffer.byteOffset,
      audioBuffer.byteOffset + audioBuffer.byteLength
    ) as ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: contentType })
    
    // Use native FormData (available in Node.js 18+)
    const formDataNative = new FormData()
    // FormData.append accepts Blob with filename option
    formDataNative.append("file", blob, filename)
    formDataNative.append("model", "whisper-1")
    formDataNative.append("language", language)
    if (prompt) {
      formDataNative.append("prompt", prompt)
    }

    const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        // Don't set Content-Type - fetch will set it with boundary automatically
      },
      body: formDataNative,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    return {
      text: data.text,
      language: data.language || language,
      duration: undefined, // Whisper API doesn't return duration
    }
  } catch (error) {
    console.error("Transcription error:", error)
    throw error
  }
}

/**
 * Extract text from image using OpenAI Vision API
 */
export async function extractTextFromImage(
  imageBuffer: Buffer,
  filename: string = "image.jpg"
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64")
    
    // Determine content type from filename
    const contentType = filename.endsWith(".png") 
      ? "image/png" 
      : filename.endsWith(".gif")
      ? "image/gif"
      : filename.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg"

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // GPT-4o has vision capabilities
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this image. If there's no text, describe what you see in the image. Return only the extracted text or description, no additional commentary.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${contentType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI Vision API error: ${error}`)
    }

    const data = await response.json()
    const extractedText = data.choices[0]?.message?.content || ""
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("No text could be extracted from the image")
    }

    return extractedText.trim()
  } catch (error) {
    console.error("Image text extraction error:", error)
    throw error
  }
}

export async function transcribeAudio(
  fileUrl: string,
  options: {
    language?: string
    prompt?: string
  } = {}
): Promise<{
  text: string
  language: string
  duration?: number
}> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const { language = "en", prompt } = options

  try {
    // Fetch the file
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error("Failed to fetch file")
    }

    const formData = new FormData()
    const blob = await fileResponse.blob()
    formData.append("file", blob, "audio.mp3")
    formData.append("model", "whisper-1")
    formData.append("language", language)
    if (prompt) {
      formData.append("prompt", prompt)
    }

    const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    return {
      text: data.text,
      language: data.language || language,
      duration: data.duration,
    }
  } catch (error) {
    console.error("Whisper API error:", error)
    throw error
  }
}

/**
 * Generate text-to-speech audio using OpenAI TTS
 */
export async function generateTTS(
  text: string,
  options: {
    voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | "ash" | "sage" | "coral"
    model?: "tts-1" | "tts-1-hd"
    speed?: number
  } = {}
): Promise<Buffer> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const {
    voice = "alloy",
    model = "tts-1",
    speed = 1.0,
  } = options

  try {
    const response = await fetch(`${OPENAI_API_URL}/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        speed,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI TTS API error: ${error}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error("TTS API error:", error)
    throw error
  }
}

/**
 * Generate a summary using GPT
 */
export async function generateSummary(text: string, maxLength: number = 200): Promise<string> {
  if (!OPENAI_API_KEY) {
    // Fallback to simple summary if API key not configured
    const sentences = text.split(/[.!?]+/).filter(Boolean)
    return sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "")
  }

  try {
    const prompt = `Summarize the following text in ${maxLength} characters or less. Focus on the main points and key information:\n\n${text.substring(0, 5000)}`

    const summary = await callGPT(prompt, {
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      maxTokens: 200,
      systemPrompt: "You are a helpful assistant that creates concise summaries.",
    })

    return summary.trim()
  } catch (error) {
    console.error("Summary generation error:", error)
    // Fallback to simple summary
    const sentences = text.split(/[.!?]+/).filter(Boolean)
    return sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "")
  }
}

/**
 * Analyze book content for review
 */
export async function analyzeBookWithAI(book: {
  title: string
  chapters: Array<{ title: string; content: string | null }>
}): Promise<{
  scores: {
    proficiency: number
    value: number
    offerAlignment: number
    structure: number
    leadMagnet: number
  }
  complexity: "Beginner-friendly" | "Intermediate" | "Advanced"
  structure: {
    sections: Array<{ name: string; status: "strong" | "good" | "weak"; feedback: string }>
  }
  offerAlignment: {
    overallScore: number
    metrics: Array<{ label: string; value: "High" | "Medium" | "Weak"; score: number }>
    recommendation: string
  }
  proficiency: {
    metrics: Array<{ label: string; score: number; suggestion: string }>
  }
  value: {
    metrics: Array<{ label: string; value: string | number; level: "High" | "Medium" | "Low" }>
  }
  recommendations: Array<{ id: string; text: string; chapter: string }>
}> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const allContent = book.chapters
    .map((ch) => ch.content?.replace(/<[^>]*>/g, "") || "")
    .join("\n\n")

  const wordCount = allContent.split(/\s+/).filter((w) => w.length > 0).length

  const prompt = `Analyze this book for quality, structure, and marketing effectiveness:

Title: ${book.title}
Word Count: ${wordCount}
Chapters: ${book.chapters.length}

Content:
${allContent.substring(0, 15000)}

Provide a JSON response with:
1. scores: { proficiency, value, offerAlignment, structure, leadMagnet } (0-100)
2. complexity: "Beginner-friendly" | "Intermediate" | "Advanced"
3. structure: { sections: [{ name, status: "strong"|"good"|"weak", feedback }] }
4. offerAlignment: { overallScore, metrics: [{ label, value: "High"|"Medium"|"Weak", score }], recommendation }
5. proficiency: { metrics: [{ label, score, suggestion }] }
6. value: { metrics: [{ label, value, level: "High"|"Medium"|"Low" }] }
7. recommendations: [{ id, text, chapter }]

Focus on:
- Writing quality and clarity
- Value provided to readers
- Alignment with high-ticket offers
- Structure and flow
- Lead magnet readiness`

  try {
    const analysis = await callGPT(prompt, {
      model: "gpt-4",
      temperature: 0.3,
      maxTokens: 2000,
      systemPrompt: "You are an expert book editor and marketing strategist. Provide detailed, actionable analysis in valid JSON format.",
    })

    // Parse JSON from response (might have markdown code blocks)
    const jsonMatch = analysis.match(/```json\s*([\s\S]*?)\s*```/) || analysis.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysis
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error("Book analysis error:", error)
    throw error
  }
}

