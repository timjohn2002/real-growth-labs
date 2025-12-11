"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
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
        // TipTap setContent accepts: setContent(content: string | JSONContent, emitUpdate?: boolean)
        editor.commands.setContent(content, false)
      }
    }
  }, [content, editor])

  // Handle content insertion
  useEffect(() => {
    if (editor && insertContent) {
      // Insert content at cursor position
      const text = insertContent.replace(/\n/g, "<br>")
      editor.commands.insertContent(`<p>${text}</p>`)
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
      <div className="flex-1 overflow-y-auto bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

