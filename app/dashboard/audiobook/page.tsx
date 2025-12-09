"use client"

import { useState, useEffect } from "react"
import { AudiobookPlayer } from "@/components/dashboard/audiobook/AudiobookPlayer"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AudiobookModal } from "@/components/dashboard/audiobook/AudiobookModal"

const BRAND_COLOR = "#a6261c"

interface Audiobook {
  id: string
  bookId: string
  voice: string
  audioUrl: string | null
  duration: number | null
  status: string
  book: {
    title: string
    id: string
    chapters?: Array<{
      id: string
      title: string
      order: number
    }>
  }
}

export default function AudiobookPage() {
  const [bookId, setBookId] = useState<string | null>(null)
  
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([])
  const [selectedAudiobook, setSelectedAudiobook] = useState<Audiobook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [books, setBooks] = useState<Array<{ id: string; title: string }>>([])
  const [isLoadingBooks, setIsLoadingBooks] = useState(false)

  // Get book ID from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("bookId")
      setBookId(id)
    }
  }, [])

  useEffect(() => {
    if (bookId) {
      loadAudiobooks(bookId)
    } else {
      setIsLoading(false)
      loadBooks()
    }
  }, [bookId])

  const loadAudiobooks = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/audiobook?bookId=${id}`)
      if (response.ok) {
        const data = await response.json()
        setAudiobooks(data.audiobooks || [])
        if (data.audiobooks && data.audiobooks.length > 0) {
          setSelectedAudiobook(data.audiobooks[0])
        }
      }
    } catch (error) {
      console.error("Failed to load audiobooks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this audiobook?")) return

    try {
      const response = await fetch(`/api/audiobook/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setAudiobooks((prev) => prev.filter((ab) => ab.id !== id))
        if (selectedAudiobook?.id === id) {
          setSelectedAudiobook(null)
        }
      }
    } catch (error) {
      console.error("Failed to delete audiobook:", error)
    }
  }

  const handleRegenerate = () => {
    if (bookId) {
      setIsModalOpen(true)
    }
  }

  const handleDownload = () => {
    if (selectedAudiobook?.audioUrl) {
      const link = document.createElement("a")
      link.href = selectedAudiobook.audioUrl
      link.download = `${selectedAudiobook.book.title}-audiobook.mp3`
      link.click()
    }
  }
  const formatTime = (seconds: number | null) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const loadBooks = async () => {
    try {
      setIsLoadingBooks(true)
      const response = await fetch("/api/books?userId=user-1") // TODO: Get from auth
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
      }
    } catch (error) {
      console.error("Failed to load books:", error)
    } finally {
      setIsLoadingBooks(false)
    }
  }

  const handleBookSelect = (selectedBookId: string) => {
    setBookId(selectedBookId)
    // Update URL without reload
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/dashboard/audiobook?bookId=${selectedBookId}`)
    }
  }

  if (!bookId) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Audiobook Generator</h1>
            <p className="text-muted-foreground mb-6">Select a book to generate or view its audiobooks.</p>
          </div>

          {isLoadingBooks ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_COLOR }} />
            </div>
          ) : books.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No books found. Create a book first!</p>
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/dashboard/book-wizard"
                    }
                  }}
                  className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Create Your First Book
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => (
                <Card
                  key={book.id}
                  className="border-border hover:border-[#a6261c] cursor-pointer transition-colors"
                  onClick={() => handleBookSelect(book.id)}
                >
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">Click to view or generate audiobook</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (audiobooks.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Audiobook</h1>
            <p className="text-muted-foreground">No audiobooks generated yet.</p>
          </div>
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Generate your first audiobook</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                Generate Audiobook
              </Button>
            </CardContent>
          </Card>
          <AudiobookModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              if (bookId) loadAudiobooks(bookId)
            }}
            bookId={bookId}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Audiobook</h1>
            <p className="text-muted-foreground">Manage and preview your generated audiobooks</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            Generate New
          </Button>
        </div>

        {/* Audiobook Selection */}
        {audiobooks.length > 1 && (
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Select Audiobook:</p>
              <div className="flex gap-2 flex-wrap">
                {audiobooks.map((ab) => (
                  <Button
                    key={ab.id}
                    variant={selectedAudiobook?.id === ab.id ? "default" : "outline"}
                    onClick={() => setSelectedAudiobook(ab)}
                    className={selectedAudiobook?.id === ab.id ? "bg-[#a6261c] hover:bg-[#8e1e16] text-white" : ""}
                  >
                    {ab.voice} ({ab.status})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audiobook Overview */}
        {selectedAudiobook && (
          <>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Audiobook Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Book Title</p>
                        <p className="font-medium text-foreground">{selectedAudiobook.book.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Length</p>
                        <p className="font-medium text-foreground">{formatTime(selectedAudiobook.duration)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Chapters Included</p>
                        <p className="font-medium text-foreground">
                          {selectedAudiobook.book.chapters?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Voice</p>
                        <p className="font-medium text-foreground">{selectedAudiobook.voice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium text-foreground capitalize">{selectedAudiobook.status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Preview Player */}
                  {selectedAudiobook.audioUrl && selectedAudiobook.status === "completed" && (
                    <div className="pt-6 border-t border-border">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Preview</h3>
                      <AudiobookPlayer
                        audioUrl={selectedAudiobook.audioUrl}
                        duration={selectedAudiobook.duration || 0}
                      />
                    </div>
                  )}

                  {selectedAudiobook.status === "generating" && (
                    <div className="pt-6 border-t border-border">
                      <p className="text-sm text-muted-foreground">Audiobook is being generated...</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {selectedAudiobook.audioUrl && selectedAudiobook.status === "completed" && (
                      <Button
                        onClick={handleDownload}
                        className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleRegenerate}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(selectedAudiobook.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chapter List */}
            {selectedAudiobook.book.chapters && selectedAudiobook.book.chapters.length > 0 && (
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Chapters</h3>
                  <div className="space-y-2">
                    {selectedAudiobook.book.chapters.map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            {index + 1}.
                          </span>
                          <span className="text-sm text-foreground">{chapter.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Modal */}
        <AudiobookModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            if (bookId) loadAudiobooks(bookId)
          }}
          bookId={bookId}
          bookTitle={selectedAudiobook?.book.title}
        />
      </div>
    </div>
  )
}
