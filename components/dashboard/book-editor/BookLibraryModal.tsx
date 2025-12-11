"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, BookOpen, Search, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Book {
  id: string
  title: string
  status: string
  chapterCount: number
  wordCount: number
  createdAt: string
  updatedAt: string
}

interface BookLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (bookId: string) => void
}

export function BookLibraryModal({ isOpen, onClose, onSelect }: BookLibraryModalProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchBooks()
    }
  }, [isOpen])

  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/books", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
      }
    } catch (error) {
      console.error("Failed to fetch books:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBooks = books.filter((book) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return book.title.toLowerCase().includes(query) || book.status.toLowerCase().includes(query)
  })

  const handleSelect = (bookId: string) => {
    onSelect(bookId)
    onClose()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Book</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Books List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#a6261c]" />
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No books found matching your search." : "No books in your library yet."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBooks.map((book) => (
                  <Card
                    key={book.id}
                    className="cursor-pointer hover:border-[#a6261c] transition-colors"
                    onClick={() => handleSelect(book.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1 text-[#a6261c]">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{book.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="capitalize">{book.status}</span>
                              <span>•</span>
                              <span>{book.chapterCount} chapters</span>
                              <span>•</span>
                              <span>{book.wordCount.toLocaleString()} words</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Updated {formatDate(book.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(book.id)
                          }}
                        >
                          Import
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

