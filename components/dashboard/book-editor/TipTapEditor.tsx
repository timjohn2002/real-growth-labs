"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Image from "@tiptap/extension-image"
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Sparkles, Undo2, Redo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const BRAND_COLOR = "#a6261c"

interface TipTapEditorProps {
  content: string
  placeholder?: string
  onUpdate: (content: string) => void
  onWordCountChange?: (count: number) => void
  onSelectionChange?: (selectedText: string) => void
  insertContent?: string | null
  onInsertComplete?: () => void
}

export function TipTapEditor({
  content,
  placeholder = "Start writing...",
  onUpdate,
  onWordCountChange,
  onSelectionChange,
  insertContent,
  onInsertComplete,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Image.configure({
        inline: false, // Set to false so images are block-level elements
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate(html)
      const text = editor.getText()
      const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length
      onWordCountChange?.(wordCount)
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, " ")
        onSelectionChange?.(selectedText)
      } else {
        onSelectionChange?.("")
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
  })

  useEffect(() => {
    if (editor) {
      const currentHTML = editor.getHTML()
      // Only update if content actually changed (avoid unnecessary updates)
      if (content !== currentHTML) {
        // Use setContent with emitUpdate set to false to avoid triggering updates
        // TipTap setContent accepts: setContent(content: string | JSONContent, options?: SetContentOptions)
        editor.commands.setContent(content, { emitUpdate: false })
        // Scroll to top when content changes (e.g., when switching chapters)
        setTimeout(() => {
          const editorElement = editor.view.dom.closest('.flex-1.overflow-y-auto')
          if (editorElement) {
            editorElement.scrollTop = 0
          }
        }, 0)
      }
    }
  }, [content, editor])

  // Handle content insertion
  useEffect(() => {
    if (editor && insertContent) {
      const trimmedContent = insertContent.trim()
      
      // Check if content is an image markdown: ![alt](url)
      // Handle both single-line and multi-line base64 URLs
      // More flexible regex that handles whitespace and very long base64 strings
      // Pattern: ![alt text](url) - with optional whitespace
      const imageMarkdownRegex = /^!\s*\[\s*([^\]]*?)\s*\]\s*\(\s*([\s\S]+?)\s*\)\s*$/m
      const imageMatch = trimmedContent.match(imageMarkdownRegex)
      
      if (imageMatch) {
        // It's an image - extract alt text and URL
        const altText = (imageMatch[1] || "Image").trim()
        // Clean up the URL (remove any whitespace/newlines from base64, but preserve the data URI)
        let imageUrl = imageMatch[2].trim()
        
        // If it's a base64 data URI, ensure it's properly formatted
        if (imageUrl.startsWith("data:")) {
          // Remove any whitespace/newlines from the base64 data portion
          // Keep the data:image/...;base64, prefix intact
          const dataUriMatch = imageUrl.match(/^(data:[^;]+;base64,)([\s\S]+)$/)
          if (dataUriMatch) {
            const prefix = dataUriMatch[1]
            const base64Data = dataUriMatch[2].replace(/\s+/g, "")
            imageUrl = prefix + base64Data
          } else {
            // Fallback: just remove all whitespace
            imageUrl = imageUrl.replace(/\s+/g, "")
          }
        }
        
        console.log("Inserting image:", { 
          altText, 
          urlLength: imageUrl.length, 
          urlPreview: imageUrl.substring(0, 100) + "...",
          isBase64: imageUrl.startsWith("data:"),
          originalContent: trimmedContent.substring(0, 200) + "..."
        })
        
        // Ensure editor is focused and ready
        editor.chain().focus()
        
        try {
          // Insert as image node using TipTap's image extension
          const success = editor.chain().focus().setImage({ 
            src: imageUrl, 
            alt: altText 
          }).run()
          
          if (success) {
            console.log("Image inserted successfully via setImage")
            // Scroll to show the inserted image after a brief delay
            setTimeout(() => {
              const editorScrollContainer = editor.view.dom.closest('.flex-1.overflow-y-auto') || 
                                           editor.view.dom.closest('[class*="overflow"]')
              if (editorScrollContainer) {
                // Find the inserted image and scroll to it
                const images = editorScrollContainer.querySelectorAll('img')
                if (images.length > 0) {
                  const lastImage = images[images.length - 1]
                  lastImage.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              }
            }, 100)
          } else {
            console.warn("setImage returned false, trying HTML fallback")
            // Fallback: try inserting as HTML img tag
            editor.commands.insertContent(`<img src="${imageUrl.replace(/"/g, '&quot;')}" alt="${altText.replace(/"/g, '&quot;')}" class="max-w-full h-auto" />`)
          }
        } catch (error) {
          console.error("Error inserting image:", error)
          // Fallback: try inserting as HTML img tag
          try {
            editor.commands.insertContent(`<img src="${imageUrl.replace(/"/g, '&quot;')}" alt="${altText.replace(/"/g, '&quot;')}" class="max-w-full h-auto" />`)
            console.log("Image inserted via HTML fallback")
          } catch (htmlError) {
            console.error("HTML fallback also failed:", htmlError)
            // Last resort: insert as plain text (shouldn't happen)
            editor.commands.insertContent(`<p>Image: ${altText}</p>`)
          }
        }
      } else {
        // Check if it's already an HTML img tag
        const imgTagMatch = trimmedContent.match(/^<img[^>]+src=["']([^"']+)["'][^>]*>/i)
        if (imgTagMatch) {
          const imageUrl = imgTagMatch[1]
          const altMatch = trimmedContent.match(/alt=["']([^"']*)["']/i)
          const altText = altMatch ? altMatch[1] : "Image"
          
          try {
            editor.chain().focus().setImage({ 
              src: imageUrl, 
              alt: altText 
            }).run()
            console.log("Image inserted from HTML tag")
          } catch (error) {
            console.error("Error inserting image from HTML:", error)
            // Fallback: insert as HTML
            editor.commands.insertContent(trimmedContent)
          }
        } else {
          // Check if content starts with markdown image but regex didn't match (debug)
          if (trimmedContent.startsWith("![")) {
            console.warn("Content looks like image markdown but regex didn't match:", trimmedContent.substring(0, 200))
          }
          
          // Regular text content - insert as HTML
          const text = insertContent.replace(/\n/g, "<br>")
          editor.commands.insertContent(`<p>${text}</p>`)
        }
      }
      
      onInsertComplete?.()
    }
  }, [insertContent, editor, onInsertComplete])

  if (!editor) {
    return null
  }

  const wordCount = editor.storage.characterCount.words()
  const readingTime = Math.ceil(wordCount / 200) // Average reading speed

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-border bg-muted px-4 py-2 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className={`h-4 w-4 ${editor.can().undo() ? "" : "opacity-50"}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className={`h-4 w-4 ${editor.can().redo() ? "" : "opacity-50"}`} />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-background" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-background" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-background" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-background" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-background" : ""}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-background" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-background" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-background" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className="text-[#a6261c]"
          onClick={() => {
            // Trigger AI action from selection
            const { from, to } = editor.state.selection
            const selectedText = editor.state.doc.textBetween(from, to, " ")
            console.log("AI action on:", selectedText)
          }}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          AI
        </Button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto bg-background min-h-0">
        <style jsx global>{`
          .ProseMirror {
            min-height: 100%;
            padding: 1.5rem 2rem;
          }
          .ProseMirror img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1rem 0;
            border-radius: 0.5rem;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

