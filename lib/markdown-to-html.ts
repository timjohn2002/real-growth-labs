/**
 * Convert markdown-style content to HTML for TipTap editor
 * Preserves the Real Growth Book template structure
 */
export function markdownToHTML(markdown: string): string {
  if (!markdown) return ""

  let html = markdown

  // Convert headings
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>")
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>")
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>")

  // Convert horizontal rules (---) to paragraph breaks
  html = html.replace(/^---$/gim, "</p><p>")

  // Convert line breaks to <br> tags
  html = html.replace(/\n\n/g, "</p><p>")
  html = html.replace(/\n/g, "<br>")

  // Wrap in paragraph tags if not already wrapped
  if (!html.startsWith("<")) {
    html = `<p>${html}</p>`
  }

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, "")
  html = html.replace(/<p>\s*<\/p>/g, "")

  // Ensure proper structure
  html = html.replace(/<p>(<h[1-3]>)/g, "$1")
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, "$1")
  html = html.replace(/(<\/h[1-3]>)<p>/g, "$1<p>")

  return html
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

