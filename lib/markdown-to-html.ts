/**
 * Convert markdown-style content to HTML for TipTap editor
 * Preserves the Real Growth Book template structure
 */
export function markdownToHTML(markdown: string): string {
  if (!markdown) return ""

  // Check if content is already HTML (starts with <)
  if (markdown.trim().startsWith("<")) {
    return markdown
  }

  // Split by lines to process more carefully
  const lines = markdown.split("\n")
  const htmlLines: string[] = []
  let inParagraph = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : ""

    // Check for headings (must be at start of line)
    if (trimmedLine.startsWith("# ")) {
      if (inParagraph) {
        htmlLines.push("</p>")
        inParagraph = false
      }
      htmlLines.push(`<h1>${trimmedLine.substring(2).trim()}</h1>`)
      continue
    } else if (trimmedLine.startsWith("## ")) {
      if (inParagraph) {
        htmlLines.push("</p>")
        inParagraph = false
      }
      htmlLines.push(`<h2>${trimmedLine.substring(3).trim()}</h2>`)
      continue
    } else if (trimmedLine.startsWith("### ")) {
      if (inParagraph) {
        htmlLines.push("</p>")
        inParagraph = false
      }
      htmlLines.push(`<h3>${trimmedLine.substring(4).trim()}</h3>`)
      continue
    }

    // Check for horizontal rule (---) - TipTap StarterKit includes horizontalRule
    if (trimmedLine === "---") {
      if (inParagraph) {
        htmlLines.push("</p>")
        inParagraph = false
      }
      // Use horizontal rule (TipTap StarterKit supports this)
      htmlLines.push("<hr>")
      continue
    }

    // Handle empty lines
    if (trimmedLine === "") {
      if (inParagraph) {
        htmlLines.push("</p>")
        inParagraph = false
      }
      continue
    }

    // Regular text line
    if (!inParagraph) {
      htmlLines.push("<p>")
      inParagraph = true
    }
    
    // Add the line content (preserve original line, not trimmed)
    htmlLines.push(line)
    
    // If next line is empty or a heading/separator, close paragraph
    if (nextLine === "" || nextLine.startsWith("#") || nextLine === "---") {
      htmlLines.push("</p>")
      inParagraph = false
    } else {
      // Add line break for continuation
      htmlLines.push("<br>")
    }
  }

  // Close any open paragraph
  if (inParagraph) {
    htmlLines.push("</p>")
  }

  let html = htmlLines.join("")

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "")
  html = html.replace(/<p><\/p>/g, "")
  
  // Clean up excessive breaks
  html = html.replace(/(<br>\s*){3,}/g, "<br><br>")

  // Ensure proper spacing around headings
  html = html.replace(/(<\/h[1-3]>)(<p>)/g, "$1<p>")
  html = html.replace(/(<\/p>)(<h[1-3]>)/g, "$1$2")

  return html || "<p></p>"
}

/**
 * Convert HTML back to markdown (for saving from TipTap)
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return ""

  let markdown = html

  // Convert headings
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")

  // Convert paragraphs to line breaks
  markdown = markdown.replace(/<p>/gi, "")
  markdown = markdown.replace(/<\/p>/gi, "\n\n")
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n")

  // Clean up HTML entities
  markdown = markdown.replace(/&nbsp;/g, " ")
  markdown = markdown.replace(/&amp;/g, "&")
  markdown = markdown.replace(/&lt;/g, "<")
  markdown = markdown.replace(/&gt;/g, ">")
  markdown = markdown.replace(/&quot;/g, '"')
  markdown = markdown.replace(/&#39;/g, "'")

  // Remove any remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, "")

  // Clean up excessive line breaks
  markdown = markdown.replace(/\n{3,}/g, "\n\n")
  markdown = markdown.trim()

  return markdown
}

