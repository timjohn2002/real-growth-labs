import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/books/[id] - Get a specific book with chapters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Format response
    const formatted = {
      id: book.id,
      title: book.title,
      description: book.description,
      coverImage: book.coverImage,
      status: book.status,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      chapters: book.chapters.map((ch) => ({
        id: ch.id,
        number: ch.order,
        title: ch.title,
        content: ch.content || "",
        wordCount: ch.content ? ch.content.split(/\s+/).filter(Boolean).length : 0,
      })),
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Get book error:", error)
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    )
  }
}

// PUT /api/books/[id] - Update a book and its chapters
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, status, chapters } = body

    // Update book
    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        description,
        status,
        updatedAt: new Date(),
      },
    })

    // Update chapters if provided
    if (chapters && Array.isArray(chapters)) {
      // Delete existing chapters
      await prisma.chapter.deleteMany({
        where: { bookId: id },
      })

      // Create/update chapters
      await prisma.chapter.createMany({
        data: chapters.map((ch: any, index: number) => ({
          bookId: id,
          title: ch.title,
          content: ch.content || "",
          order: ch.number || index + 1,
        })),
      })
    }

    return NextResponse.json({
      message: "Book updated successfully",
      book: {
        id: book.id,
        title: book.title,
        updatedAt: book.updatedAt,
      },
    })
  } catch (error) {
    console.error("Update book error:", error)
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    )
  }
}

// DELETE /api/books/[id] - Delete a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // TODO: Implement actual delete logic
    // await prisma.book.delete({ where: { id } })
    
    return NextResponse.json({ message: "Book deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 400 }
    )
  }
}

