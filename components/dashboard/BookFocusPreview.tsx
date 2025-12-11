"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Target } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const BRAND_COLOR = "#a6261c"

interface BookFocusPreviewProps {
  bookId?: string
  bookTitle?: string
}

export function BookFocusPreview({ bookId, bookTitle }: BookFocusPreviewProps) {
  if (!bookId || !bookTitle) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-[#a6261c] shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-5 w-5 text-[#a6261c]" />
            <h3 className="text-sm font-semibold text-foreground">Book Focus Mode</h3>
          </div>
          <p className="text-sm text-foreground mb-4">
            You are closest to completing: <span className="font-semibold text-[#a6261c]">{bookTitle}</span>
          </p>
          <Link href={`/dashboard/book-editor?id=${bookId}`}>
            <Button
              className="w-full bg-[#a6261c] hover:bg-[#8e1e16] text-white"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Continue Writing
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

