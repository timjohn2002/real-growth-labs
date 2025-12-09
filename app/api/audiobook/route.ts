import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/audiobook - Get all audiobooks for a book
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookId = searchParams.get("bookId")

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId is required" },
        { status: 400 }
      )
    }

    const audiobooks = await prisma.audiobook.findMany({
      where: { bookId },
      orderBy: { createdAt: "desc" },
      include: {
        book: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    })

    return NextResponse.json({ audiobooks })
  } catch (error) {
    console.error("Get audiobooks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch audiobooks" },
      { status: 500 }
    )
  }
}

// POST /api/audiobook - Create a new audiobook (for manual creation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, voice, options } = body

    if (!bookId || !voice) {
      return NextResponse.json(
        { error: "bookId and voice are required" },
        { status: 400 }
      )
    }

    const audiobook = await prisma.audiobook.create({
      data: {
        bookId,
        voice,
        options: options || { addIntro: false, addOutro: false },
        status: "pending",
      },
      include: {
        book: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    })

    return NextResponse.json({ audiobook }, { status: 201 })
  } catch (error) {
    console.error("Create audiobook error:", error)
    return NextResponse.json(
      { error: "Failed to create audiobook" },
      { status: 500 }
    )
  }
}

