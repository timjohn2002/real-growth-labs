/**
 * Audio utilities for concatenating MP3 files
 * Uses fluent-ffmpeg for proper MP3 concatenation
 */

import ffmpeg from "fluent-ffmpeg"
import { Readable } from "stream"
import { writeFileSync, unlinkSync, readFileSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

/**
 * Concatenate multiple MP3 audio buffers into a single MP3 file
 * @param audioBuffers Array of MP3 audio buffers to concatenate
 * @returns Combined MP3 buffer
 */
export async function concatenateMP3Buffers(
  audioBuffers: Buffer[]
): Promise<Buffer> {
  if (audioBuffers.length === 0) {
    throw new Error("No audio buffers provided")
  }

  if (audioBuffers.length === 1) {
    return audioBuffers[0]
  }

  // For serverless environments (Vercel), we need a different approach
  // Since ffmpeg might not be available, we'll use a fallback method
  if (process.env.VERCEL || !isFFmpegAvailable()) {
    return concatenateMP3BuffersSimple(audioBuffers)
  }

  // Use ffmpeg for proper concatenation (requires ffmpeg binary)
  return concatenateMP3BuffersWithFFmpeg(audioBuffers)
}

/**
 * Simple concatenation method (works but may have issues with MP3 headers)
 * This is a fallback for environments without ffmpeg
 */
function concatenateMP3BuffersSimple(audioBuffers: Buffer[]): Buffer {
  // Remove ID3 tags from all but the first buffer
  // This is a simplified approach - proper MP3 concatenation requires frame-level handling
  const buffers = audioBuffers.map((buffer, index) => {
    if (index === 0) {
      return buffer
    }
    // Try to skip ID3 tag if present (simplified - doesn't handle all cases)
    // MP3 files start with frame sync (0xFF 0xFB or 0xFF 0xFA)
    let startIndex = 0
    if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
      // ID3v2 tag detected, skip it
      const tagSize = (buffer[6] << 21) | (buffer[7] << 14) | (buffer[8] << 7) | buffer[9]
      startIndex = 10 + tagSize
    }
    return buffer.slice(startIndex)
  })

  return Buffer.concat(buffers)
}

/**
 * Proper concatenation using ffmpeg (requires ffmpeg binary)
 */
async function concatenateMP3BuffersWithFFmpeg(
  audioBuffers: Buffer[]
): Promise<Buffer> {
  const tempDir = tmpdir()
  const tempFiles: string[] = []
  const concatListFile = join(tempDir, `concat-${Date.now()}.txt`)

  try {
    // Write each buffer to a temporary file
    for (let i = 0; i < audioBuffers.length; i++) {
      const tempFile = join(tempDir, `audio-${Date.now()}-${i}.mp3`)
      writeFileSync(tempFile, audioBuffers[i])
      tempFiles.push(tempFile)
    }

    // Create concat list file for ffmpeg
    const concatList = tempFiles.map((file) => `file '${file}'`).join("\n")
    writeFileSync(concatListFile, concatList)

    // Use ffmpeg to concatenate
    const outputFile = join(tempDir, `output-${Date.now()}.mp3`)
    
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(concatListFile)
        .inputOptions(["-f", "concat", "-safe", "0"])
        .outputOptions(["-c", "copy"]) // Copy codec (no re-encoding for speed)
        .output(outputFile)
        .on("end", resolve)
        .on("error", reject)
        .run()
    })

    // Read the concatenated file
    const result = readFileSync(outputFile)

    // Cleanup
    tempFiles.forEach((file) => {
      try {
        unlinkSync(file)
      } catch (e) {
        // Ignore cleanup errors
      }
    })
    try {
      unlinkSync(concatListFile)
      unlinkSync(outputFile)
    } catch (e) {
      // Ignore cleanup errors
    }

    return result
  } catch (error) {
    // Cleanup on error
    tempFiles.forEach((file) => {
      try {
        unlinkSync(file)
      } catch (e) {
        // Ignore cleanup errors
      }
    })
    try {
      unlinkSync(concatListFile)
    } catch (e) {
      // Ignore cleanup errors
    }

    // Fallback to simple concatenation
    console.warn("FFmpeg concatenation failed, using simple method:", error)
    return concatenateMP3BuffersSimple(audioBuffers)
  }
}

/**
 * Check if ffmpeg is available
 */
function isFFmpegAvailable(): boolean {
  try {
    // Try to get ffmpeg version (this will throw if not available)
    const { execSync } = require("child_process")
    execSync("ffmpeg -version", { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}
