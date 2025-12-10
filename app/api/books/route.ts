import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { bookSchema } from "@/lib/validations"

// GET /api/books - Get all books for the user
export async function GET(request: NextRequest) {
  try {
    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const books = await prisma.book.findMany({
      where: { userId },
      include: {
        chapters: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const formatted = books.map((book) => ({
      id: book.id,
      title: book.title,
      description: book.description,
      coverImage: book.coverImage,
      status: book.status,
      chapterCount: book.chapters.length,
      wordCount: book.chapters.reduce(
        (sum, ch) => sum + (ch.content ? ch.content.split(/\s+/).filter(Boolean).length : 0),
        0
      ),
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    }))

    return NextResponse.json({ books: formatted })
  } catch (error) {
    console.error("Get books error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      { 
        error: "Failed to fetch books",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    )
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const { getUserIdFromRequest } = await import("@/lib/auth")
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, coverImage, chapters } = body

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      )
    }

    // Create book
    const book = await prisma.book.create({
      data: {
        title,
        description,
        coverImage,
        userId,
        status: "draft",
        chapters: chapters
          ? {
              create: chapters.map((ch: any, index: number) => ({
                title: ch.title || `Chapter ${index + 1}`,
                content: ch.content || "",
                order: ch.number || index + 1,
              })),
            }
          : undefined,
      },
      include: {
        chapters: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(
      {
        message: "Book created successfully",
        book: {
          id: book.id,
          title: book.title,
          chapters: book.chapters.map((ch) => ({
            id: ch.id,
            number: ch.order,
            title: ch.title,
            content: ch.content,
          })),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create book error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      { 
        error: "Failed to create book",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    )
  }
}

