import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { format, scope } = body

    if (!format || !["pdf", "epub"].includes(format.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid format. Must be 'pdf' or 'epub'" },
        { status: 400 }
      )
    }

    // Get book with chapters
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      )
    }

    if (book.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Filter chapters if scope is "chapter" (for future use)
    let chaptersToExport = book.chapters
    if (scope === "chapter" && body.chapterId) {
      chaptersToExport = book.chapters.filter((ch) => ch.id === body.chapterId)
    }

    // Generate export based on format
    if (format.toLowerCase() === "pdf") {
      return await generatePDF(book, chaptersToExport)
    } else if (format.toLowerCase() === "epub") {
      return await generateEPUB(book, chaptersToExport)
    }

    return NextResponse.json(
      { error: "Unsupported format" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export book" },
      { status: 500 }
    )
  }
}

async function generatePDF(book: any, chapters: any[]) {
  try {
    // Convert HTML content to plain text and format for PDF
    const htmlContent = generateBookHTML(book, chapters)
    
    // For now, return HTML that can be converted to PDF client-side
    // In production, you'd use puppeteer or similar server-side
    return NextResponse.json({
      format: "pdf",
      html: htmlContent,
      filename: `${book.title.replace(/[^a-z0-9]/gi, "_")}.pdf`,
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    throw error
  }
}

async function generateEPUB(book: any, chapters: any[]) {
  try {
    // Generate EPUB structure
    const epubContent = generateEPUBStructure(book, chapters)
    
    return NextResponse.json({
      format: "epub",
      content: epubContent,
      filename: `${book.title.replace(/[^a-z0-9]/gi, "_")}.epub`,
    })
  } catch (error) {
    console.error("EPUB generation error:", error)
    throw error
  }
}

function generateBookHTML(book: any, chapters: any[]): string {
  // Strip HTML tags and format for PDF
  const stripHTML = (html: string) => {
    if (!html) return ""
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${book.title}</title>
  <style>
    @page {
      margin: 2cm;
    }
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 2.5em;
      margin-bottom: 0.5em;
      color: #a6261c;
      border-bottom: 3px solid #a6261c;
      padding-bottom: 0.3em;
    }
    h2 {
      font-size: 1.8em;
      margin-top: 2em;
      margin-bottom: 1em;
      color: #333;
    }
    h3 {
      font-size: 1.4em;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
    }
    p {
      margin-bottom: 1em;
      text-align: justify;
    }
    .chapter {
      page-break-before: always;
      margin-top: 3em;
    }
    .chapter:first-child {
      page-break-before: auto;
    }
    .subtitle {
      font-size: 1.2em;
      color: #666;
      margin-bottom: 2em;
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>${book.title}</h1>
  ${book.description ? `<div class="subtitle">${book.description}</div>` : ""}
`

  chapters.forEach((chapter, index) => {
    const chapterContent = stripHTML(chapter.content || "")
    html += `
  <div class="chapter">
    <h2>${chapter.title || `Chapter ${index + 1}`}</h2>
    <div>${chapterContent.split("\n").map((para: string) => para.trim() ? `<p>${para}</p>` : "").join("")}</div>
  </div>
`
  })

  html += `
</body>
</html>
`

  return html
}

function generateEPUBStructure(book: any, chapters: any[]): any {
  const stripHTML = (html: string) => {
    if (!html) return ""
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }

  return {
    title: book.title,
    author: "Author", // TODO: Get from user profile
    description: book.description || "",
    chapters: chapters.map((chapter, index) => ({
      title: chapter.title || `Chapter ${index + 1}`,
      content: stripHTML(chapter.content || ""),
    })),
  }
}

