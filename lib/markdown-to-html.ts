/**
 * Convert markdown-style content to HTML for TipTap editor
 * Preserves the Real Growth Book template structure
 */
export function markdownToHTML(markdown: string): string {
  if (!markdown) return ""

  // Split by lines to process more carefully
  const lines = markdown.split("\n")
  const htmlLines: string[] = []
  let inParagraph = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : ""

    // Check for headings
    if (line.startsWith("# ")) {
      if (inParagraph) {
        htmlLines.push("</p>")
        inParagraph = false
      }
      htmlLines.push(`<h1>${line.substring(2)}</h1>`)
      continue
    } else if (line.startsWith("## ")) {
      if (inParagraph) {
        htmlLines.push("</p>")
        inParagraph = false
      }
      htmlLines.push(`<h2>${line.substring(3)}</h2>`)
      continue
    } else if (line.startsWith("### ")) {
      if (inParagraph) {
        htmlLines.push("</p>")
        inParagraph = false
      }
      htmlLines.push(`<h3>${line.substring(4)}</h3>`)
      continue
    }

    // Check for horizontal rule (---)
    if (line === "---") {
      if (inParagraph) {
        htmlLines.push("</p>")
        inParagraph = false
      }
      htmlLines.push('<hr class="my-6" />')
      continue
    }

    // Handle empty lines
    if (line === "") {
      if (inParagraph && nextLine !== "" && !nextLine.startsWith("#") && nextLine !== "---") {
        htmlLines.push("<br />")
      } else if (inParagraph) {
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
    
    // Add the line content
    htmlLines.push(line)
    
    // Add line break if next line is not empty and not a heading
    if (nextLine !== "" && !nextLine.startsWith("#") && nextLine !== "---") {
      htmlLines.push("<br />")
    }
  }

  // Close any open paragraph
  if (inParagraph) {
    htmlLines.push("</p>")
  }

  let html = htmlLines.join("")

  // Clean up empty paragraphs and excessive breaks
  html = html.replace(/<p>\s*<\/p>/g, "")
  html = html.replace(/<br \/>\s*<br \/>/g, "<br />")

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

