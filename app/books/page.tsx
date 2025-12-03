"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Download, Plus } from "lucide-react"
import Link from "next/link"

export default function BooksPage() {
  const books = [
    { id: 1, title: "My First Book", status: "Published", createdAt: "2024-01-15", pages: 120 },
    { id: 2, title: "Marketing Guide", status: "Draft", createdAt: "2024-02-20", pages: 85 },
    { id: 3, title: "Business Strategy", status: "In Progress", createdAt: "2024-03-10", pages: 45 },
    { id: 4, title: "Leadership Principles", status: "Published", createdAt: "2024-01-05", pages: 200 },
    { id: 5, title: "Productivity Hacks", status: "Draft", createdAt: "2024-02-28", pages: 90 },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Books Library</h1>
          <p className="text-gray-600 mt-2">Manage all your books in one place.</p>
        </div>
        <Link href="/builder">
          <Button className="bg-[#a6261c] hover:bg-[#8e1e16]">
            <Plus className="mr-2 h-4 w-4" />
            New Book
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card key={book.id} className="border-gray-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Book Cover</span>
              </div>
              <CardTitle>{book.title}</CardTitle>
              <CardDescription>
                {book.status} • {book.pages} pages • {book.createdAt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link href={`/builder?book=${book.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" className="hover:bg-opacity-10" style={{ color: "#a6261c" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#8e1e16"; e.currentTarget.style.backgroundColor = "rgba(166, 38, 28, 0.1)" }} onMouseLeave={(e) => { e.currentTarget.style.color = "#a6261c"; e.currentTarget.style.backgroundColor = "" }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
