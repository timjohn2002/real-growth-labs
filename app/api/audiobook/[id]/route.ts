import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/audiobook/[id] - Get a specific audiobook
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const audiobook = await prisma.audiobook.findUnique({
      where: { id: params.id },
      include: {
        book: {
          select: {
            title: true,
            id: true,
            chapters: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
        },
      },
    })

    if (!audiobook) {
      return NextResponse.json(
        { error: "Audiobook not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ audiobook })
  } catch (error) {
    console.error("Get audiobook error:", error)
    return NextResponse.json(
      { error: "Failed to fetch audiobook" },
      { status: 500 }
    )
  }
}

// PUT /api/audiobook/[id] - Update an audiobook
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { audioUrl, duration, status, fileSize, error } = body

    const audiobook = await prisma.audiobook.update({
      where: { id: params.id },
      data: {
        ...(audioUrl !== undefined && { audioUrl }),
        ...(duration !== undefined && { duration }),
        ...(status !== undefined && { status }),
        ...(fileSize !== undefined && { fileSize }),
        ...(error !== undefined && { error }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ audiobook })
  } catch (error) {
    console.error("Update audiobook error:", error)
    return NextResponse.json(
      { error: "Failed to update audiobook" },
      { status: 500 }
    )
  }
}

// DELETE /api/audiobook/[id] - Delete an audiobook
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.audiobook.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Audiobook deleted successfully" })
  } catch (error) {
    console.error("Delete audiobook error:", error)
    return NextResponse.json(
      { error: "Failed to delete audiobook" },
      { status: 500 }
    )
  }
}

