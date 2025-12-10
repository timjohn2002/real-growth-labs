/**
 * Authentication Utilities
 * Handles session management and user authentication
 */

import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

/**
 * Get the current user from session token (for server components)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return null
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatar: session.user.avatar,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Get user ID from session token (for API routes)
 * Use this version that accepts NextRequest
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get("session_token")?.value

    if (!token) {
      return null
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return session.user.id
  } catch (error) {
    console.error("Error getting user ID from request:", error)
    return null
  }
}

/**
 * Get user ID from session (for API routes - legacy support)
 * This will try to use cookies() which may not work in all contexts
 */
export async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return null
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return session.user.id
  } catch (error) {
    console.error("Error getting user ID:", error)
    return null
  }
}

/**
 * Create a session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  })
}

